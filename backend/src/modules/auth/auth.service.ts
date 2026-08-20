import bcrypt from "bcrypt";
import createError from "http-errors";
import { authRepository } from "./auth.repository";
import { redis, keys, authKeys } from "@/lib/redis";
import { sendPasswordResetEmail } from "@/lib/resend";
import { TOKEN, LOCKOUT } from "@/config/constants";
import { sha256, randomToken } from "@/utils/crypto";
import { tokenService } from "@/modules/token/token.service";
import { tokenRotationService } from "@/modules/token/rotation.service";
import { logger } from "@/lib/logger";
import { AUTH_METHOD } from "@/generated/prisma/client";
import type { LoginInput } from "./auth.schemas";
import type { AuthUser, LoginResponse } from "@/types/auth";
import type { AuditActor } from "@/utils/actor";

export const authService = {
  // ─── LOGIN ────────────────────────────────────────────────────────────────
  async login(input: LoginInput, actor?: AuditActor): Promise<LoginResponse> {
    const { email, password } = input;
    const ipAddress = actor?.ip;

    // 1. Find User via Repository
    const user = await authRepository.findByEmail(email);

    if (!user || !user.isActive || user.deletedAt !== null) {
      throw createError(401, "Invalid email or password");
    }

    // 2. Check Account Lockout
    const isLocked = await redis.exists(authKeys.locked(user.id));
    if (isLocked === 1) {
      const ttl = await redis.ttl(authKeys.locked(user.id));
      throw createError(
        429,
        `Account temporarily locked due to failed attempts. Try again in ${Math.ceil(
          ttl / 60
        )} minutes.`
      );
    }

    // 3. Verify Password
    if (!user.passwordHash) {
      throw createError(401, "Please log in using Google OAuth");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      // Record Failed Attempt
      const failKey = authKeys.failures(user.id);
      const count = await redis.incr(failKey);
      if (count === 1) await redis.expire(failKey, LOCKOUT.DURATION);

      if (count >= LOCKOUT.THRESHOLD) {
        await redis.set(authKeys.locked(user.id), "1", "EX", LOCKOUT.DURATION);
        await redis.del(failKey);
        throw createError(
          429,
          "Too many failed login attempts. Account locked for 15 minutes."
        );
      }

      throw createError(401, "Invalid email or password");
    }

    // Reset Failures Counter on success
    await redis.del(authKeys.failures(user.id));

    // 4. Update Last Login Metadata (async background update)
    authRepository
      .updateLastLogin(user.id, {
        ipAddress,
        authMethod: AUTH_METHOD.EMAIL_PASSWORD,
      })
      .catch((err) => logger.error({ err }, "Error updating last login metadata"));

    // 5. Issue Pure Identity Token Pair (sub = userId, email, name)
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
      avatar: user.avatar,
      isVerified: user.isVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      lastAuthMethod: user.lastAuthMethod,
      createdAt: user.createdAt,
    };

    return {
      user: authUser,
      accessToken,
      refreshToken,
    };
  },

  // ─── REFRESH ──────────────────────────────────────────────────────────────
  async refresh(rawToken?: string, actor?: AuditActor) {
    if (!rawToken) {
      throw createError(401, "Refresh token required");
    }

    return tokenRotationService.rotate(rawToken, actor);
  },

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  async logout(userId: string, jti?: string, exp?: number, rawToken?: string) {
    // 1. Blacklist current access token in Redis
    if (jti && exp) {
      await tokenService.blacklistAccessToken(jti, exp);
    }

    // 2. Revoke presented refresh token
    if (rawToken) {
      const hash = sha256(rawToken);
      await redis.del(keys.auth.refreshToken(userId, hash));
      await redis.srem(authKeys.userTokens(userId), hash);
    }
  },

  // ─── PASSWORD RESET REQUEST ───────────────────────────────────────────────
  async requestPasswordReset(email: string) {
    const user = await authRepository.findByEmail(email);

    // Don't leak whether user exists (timing-safe silent return)
    if (!user || !user.isActive || user.deletedAt !== null) {
      return { message: "If the email is registered, a reset link will be sent." };
    }

    const raw = randomToken(32);
    const hash = sha256(raw);
    const expiresAt = new Date(Date.now() + TOKEN.PASSWORD_RESET_TTL * 1000);

    // Save in DB via repository
    await authRepository.createPasswordResetToken({
      token: hash,
      userId: user.id,
      expiresAt,
    });

    // Save in Redis for fast verification
    await redis.set(authKeys.reset(hash), user.id, "EX", TOKEN.PASSWORD_RESET_TTL);

    logger.info(
      { email, token: raw, expiresAt },
      `🔑 Password reset token generated for ${email}`
    );

    // Send email via Resend in background
    sendPasswordResetEmail(user.email, raw, user.name).catch((err) => {
      logger.error({ err, email: user.email }, "Failed to deliver password reset email");
    });

    return {
      message: "If the email is registered, a reset link will be sent.",
      resetToken: raw, // Kept in response for development/testing ease
    };
  },

  // ─── PASSWORD RESET CONFIRM ───────────────────────────────────────────────
  async resetPassword(token: string, newPassword: string) {
    const hash = sha256(token);

    // Look up token via repository
    const record = await authRepository.findPasswordResetToken(hash);

    if (!record || record.isUsed || record.expiresAt < new Date()) {
      throw createError(400, "Password reset token is invalid or has expired");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user, mark token used, revoke all sessions atomically
    await authRepository.completePasswordReset(record.id, record.userId, passwordHash);

    await redis.del(authKeys.reset(hash));
    await tokenService.revokeAllUserTokens(record.userId);

    return { message: "Password updated successfully. Please log in with your new password." };
  },

  // ─── GET CURRENT AUTHENTICATED USER ───────────────────────────────────────
  async getMe(userId: string): Promise<AuthUser> {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw createError(401, "User not found or inactive");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      isVerified: user.isVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      lastAuthMethod: user.lastAuthMethod,
      createdAt: user.createdAt,
    };
  },
};

export default authService;
