import type { Request, Response } from "express";
import { oauthService } from "./oauth.service";
import { setAuthCookies } from "@/utils/cookies";
import { sendSuccess } from "@/utils/response";
import { asyncHandler } from "@/utils/asyncHandler";
import { extractAuditActor } from "@/utils/actor";
import type { GoogleCallbackInput } from "./oauth.schemas";

export const oauthController = {
  /**
   * GET /api/auth/oauth/state
   * Generates a CSRF state token and Google Authorization URL
   */
  getState: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const redirectUri = req.query.redirectUri as string | undefined;
    const result = await oauthService.generateState(redirectUri);

    sendSuccess(res, result, "OAuth state generated");
  }),

  /**
   * POST /api/auth/google
   * Exchanges authorization code, verifies identity, and logs in user (sign-in only)
   */
  googleCallback: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const actor = extractAuditActor(req);
    const result = await oauthService.handleGoogleCallback(
      req.body as GoogleCallbackInput,
      actor
    );

    // Set standard triple-token auth cookies
    const csrfToken = setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
        csrfToken,
      },
      "Google login successful"
    );
  }),
};

export default oauthController;
