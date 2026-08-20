import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { setAuthCookies, clearAuthCookies, setCsrfCookie } from "@/utils/cookies";
import { randomToken } from "@/utils/crypto";
import { sendSuccess } from "@/utils/response";
import { asyncHandler } from "@/utils/asyncHandler";
import { extractAuditActor } from "@/utils/actor";
import { COOKIE } from "@/config/constants";
import type { LoginInput, ForgotPasswordInput, ResetPasswordInput } from "./auth.schemas";

export const authController = {
  login: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const actor = extractAuditActor(req);

    const result = await authService.login(req.body as LoginInput, actor);

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
      "Login successful"
    );
  }),

  refresh: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const rawToken = req.cookies?.[COOKIE.REFRESH_TOKEN] || req.body?.refreshToken;
    const actor = extractAuditActor(req);

    const result = await authService.refresh(rawToken, actor);

    const csrfToken = setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    sendSuccess(
      res,
      {
        accessToken: result.accessToken,
        csrfToken,
      },
      "Token refreshed successfully"
    );
  }),

  logout: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const jti = req.user?.jti;
    const rawToken = req.cookies?.[COOKIE.REFRESH_TOKEN] || req.body?.refreshToken;

    await authService.logout(userId, jti, undefined, rawToken);

    clearAuthCookies(res);
    sendSuccess(res, null, "Logged out successfully");
  }),

  getCsrf: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const token = randomToken(32);
    setCsrfCookie(res, token);
    sendSuccess(res, { csrfToken: token }, "CSRF token issued");
  }),

  requestPasswordReset: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body as ForgotPasswordInput;
    const result = await authService.requestPasswordReset(email);
    sendSuccess(res, result, result.message);
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body as ResetPasswordInput;
    const result = await authService.resetPassword(token, newPassword);
    sendSuccess(res, null, result.message);
  }),

  getMe: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, { user });
  }),
};

export default authController;
