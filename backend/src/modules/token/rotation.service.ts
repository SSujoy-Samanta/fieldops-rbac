import createError from "http-errors";
import { TOKEN } from "@/config/constants";
import { redis, keys, authKeys } from "@/lib/redis";
import { sha256, randomToken } from "@/utils/crypto";
import { tokenRepository } from "./token.repository";
import { tokenService } from "./token.service";
import { logger } from "@/lib/logger";
import type { AuditActor } from "@/utils/actor";

export const tokenRotationService = {
  /**
   * Rotates a Refresh Token with Reuse Detection:
   * If a revoked token is presented, an attack is assumed and ALL user tokens are revoked immediately.
   */
  async rotate(
    rawToken: string,
    actor?: AuditActor
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const hash = sha256(rawToken);

    // 1. Check if token exists
    const tokenRecord = await tokenRepository.findByToken(hash);

    if (!tokenRecord) {
      throw createError(401, "Invalid refresh token");
    }

    // 2. REUSE DETECTION: If token was already revoked, someone is replaying it!
    if (tokenRecord.isRevoked) {
      await tokenService.revokeAllUserTokens(tokenRecord.userId);
      logger.warn(
        { userId: tokenRecord.userId, ip: actor?.ip, userAgent: actor?.userAgent },
        "🚨 Security Alert: Refresh token reuse detected. All sessions revoked."
      );
      throw createError(
        401,
        "Session invalidated for security. Please log in again."
      );
    }

    // 3. Expiration Check
    if (tokenRecord.expiresAt < new Date()) {
      throw createError(401, "Refresh token expired. Please log in again.");
    }

    // 4. User Active Check
    if (!tokenRecord.user || !tokenRecord.user.isActive || tokenRecord.user.deletedAt !== null) {
      throw createError(401, "Associated user account is deactivated");
    }

    // 5. Generate New Token Pair
    const newRaw = randomToken(32);
    const newHash = sha256(newRaw);
    const newExpiresAt = new Date(Date.now() + TOKEN.REFRESH_TOKEN_TTL * 1000);
    const deviceInfo = actor?.userAgent ?? "unknown";
    const ipAddress = actor?.ip ?? "127.0.0.1";

    // 6. DB Updates (Atomic Revoke Old + Insert New)
    await tokenRepository.rotateToken({
      oldToken: hash,
      newToken: newHash,
      userId: tokenRecord.userId,
      expiresAt: newExpiresAt,
      deviceInfo,
      ipAddress,
    });

    // 7. Update Redis Cache
    const pipeline = redis.pipeline();
    pipeline.del(keys.auth.refreshToken(tokenRecord.userId, hash));
    pipeline.srem(authKeys.userTokens(tokenRecord.userId), hash);

    pipeline.set(
      keys.auth.refreshToken(tokenRecord.userId, newHash),
      JSON.stringify({
        userId: tokenRecord.userId,
        expiresAt: newExpiresAt.toISOString(),
        deviceInfo,
        ipAddress,
      }),
      "EX",
      TOKEN.REFRESH_TOKEN_TTL
    );
    pipeline.sadd(authKeys.userTokens(tokenRecord.userId), newHash);
    pipeline.expire(authKeys.userTokens(tokenRecord.userId), TOKEN.REFRESH_TOKEN_TTL);
    await pipeline.exec();

    // 8. Issue New Access Token (Identity: sub, email, name)
    const accessToken = tokenService.issueAccessToken(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.name
    );

    return { accessToken, refreshToken: newRaw };
  },
};
