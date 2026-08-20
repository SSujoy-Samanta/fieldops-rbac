import { AUTH_METHOD } from "@/generated/prisma/client";
import createError from "http-errors";
import { env } from "@/config/env";
import { googleOAuthClient } from "@/lib/google";
import { redis, authKeys, REDIS_TTL } from "@/lib/redis";
import { randomToken } from "@/utils/crypto";
import { authRepository } from "@/modules/auth/auth.repository";
import { tokenService } from "@/modules/token/token.service";
import { logger } from "@/lib/logger";
import type { GoogleCallbackInput } from "./oauth.schemas";
import type { AuthUser, LoginResponse } from "@/types/auth";
import type { AuditActor } from "@/utils/actor";

export const oauthService = {
  /**
   * Generates a secure CSRF state token and Google authorization URL using googleOAuthClient singleton
   */
  async generateState(redirectUri?: string): Promise<{ state: string; authUrl: string }> {
    const state = randomToken(32);
    const targetRedirectUri = redirectUri ?? `${env.FRONTEND_URL}/auth/google/callback`;

    // Store state in Redis (10 min expiration)
    await redis.set(
      authKeys.oauthState(state),
      targetRedirectUri,
      "EX",
      REDIS_TTL.OAUTH_STATE
    );

    const authUrl = googleOAuthClient.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      state,
      prompt: "consent",
      redirect_uri: targetRedirectUri,
    });

    return { state, authUrl };
  },

  /**
   * Handles Google OAuth Authorization Code Callback using googleOAuthClient singleton
   * ONLY SIGN-IN IS ALLOWED: Rejects any user who is not already provisioned in the database.
   */
  async handleGoogleCallback(
    input: GoogleCallbackInput,
    actor?: AuditActor
  ): Promise<LoginResponse> {
    const { code, redirectUri, state } = input;

    // 1. Verify and consume OAuth state token
    const savedState = await redis.get(authKeys.oauthState(state));
    if (!savedState) {
      throw createError(400, "Invalid or expired OAuth state parameter. Please try logging in again.");
    }
    await redis.del(authKeys.oauthState(state));

    // 2. Exchange authorization code with Google via googleOAuthClient singleton
    let tokens;
    try {
      const response = await googleOAuthClient.getToken({
        code,
        redirect_uri: redirectUri,
      });
      tokens = response.tokens;
    } catch (err) {
      logger.error({ err, code }, "Google OAuth token exchange failed");
      throw createError(400, "Failed to exchange Google authorization code");
    }

    if (!tokens.id_token) {
      throw createError(400, "Google did not return an ID token");
    }

    // 3. Cryptographically verify Google ID Token
    let payload;
    try {
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      logger.error({ err }, "Google ID token verification failed");
      throw createError(400, "Invalid Google ID token signature");
    }

    if (!payload || !payload.email || !payload.email_verified) {
      throw createError(400, "Google account email is missing or not verified");
    }

    const googleId = payload.sub;
    const email = payload.email;
    const picture = payload.picture ?? null;

    // 4. Resolve User (SIGN-IN ONLY — NO SIGNUP ALLOWED)
    let user = await authRepository.findByGoogleId(googleId);

    if (!user) {
      // Check if user exists by email to link Google account
      user = await authRepository.findByEmail(email);

      if (!user) {
        // User does NOT exist -> REJECT immediately (No signups allowed)
        logger.warn(
          { email, googleId, ip: actor?.ip },
          "⛔ Blocked Google OAuth attempt: User account does not exist (signups disabled)"
        );
        throw createError(
          403,
          "Access Denied: No employee account exists with this Google email. Signups are not permitted. Please contact your administrator."
        );
      }

      // Link Google Account to existing user
      await authRepository.linkGoogleAccount(user.id, {
        googleId,
        avatar: user.avatar || picture || null,
        ipAddress: actor?.ip,
      });

      logger.info(
        { userId: user.id, email: user.email, googleId },
        "🔗 Google OAuth account successfully linked to existing user"
      );
    } else {
      // Update last login metadata
      authRepository
        .updateLastLogin(user.id, {
          ipAddress: actor?.ip,
          authMethod: AUTH_METHOD.GOOGLE_OAUTH,
        })
        .catch((err) => logger.error({ err }, "Error updating Google OAuth login metadata"));
    }

    // 5. Check if user is active
    if (!user.isActive || user.deletedAt !== null) {
      throw createError(401, "Your account is deactivated. Please contact an administrator.");
    }

    // 6. Issue Pure Identity Token Pair
    const { accessToken, refreshToken } = await tokenService.issueTokenPair(
      user.id,
      user.email,
      user.name,
      actor
    );

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || picture || null,
      isVerified: true,
      emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      lastLoginAt: new Date(),
      lastAuthMethod: AUTH_METHOD.GOOGLE_OAUTH,
      createdAt: user.createdAt,
    };

    return {
      user: authUser,
      accessToken,
      refreshToken,
    };
  },
};

export default oauthService;
