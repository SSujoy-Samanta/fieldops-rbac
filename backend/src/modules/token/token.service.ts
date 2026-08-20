import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { TOKEN } from "@/config/constants";
import { redis, keys, authKeys } from "@/lib/redis";
import { sha256, randomToken } from "@/utils/crypto";
import { tokenRepository } from "./token.repository";
import type { JwtPayload } from "@/types/auth";
import type { AuditActor } from "@/utils/actor";

export const tokenService = {
  /**
   * Issues both a signed JWT Access Token and an unguessable Refresh Token (stored hashed)
   */
  async issueTokenPair(
    userId: string,
    email: string,
    name: string,
    actor?: AuditActor
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Issue Access Token
    const accessToken = this.issueAccessToken(userId, email, name);

    // 2. Issue Refresh Token
    const raw = randomToken(32);
    const hash = sha256(raw);
    const expiresAt = new Date(Date.now() + TOKEN.REFRESH_TOKEN_TTL * 1000);
    const deviceInfo = actor?.userAgent ?? "unknown";
    const ipAddress = actor?.ip ?? "127.0.0.1";
    const userAgent = actor?.userAgent ?? null;

    // Save in DB
    await tokenRepository.createRefreshToken({
      token: hash,
      userId,
      expiresAt,
      deviceInfo,
      ipAddress,
      userAgent,
    });

    // Save in Redis for fast validation
    const pipeline = redis.pipeline();
    pipeline.set(
      keys.auth.refreshToken(userId, hash),
      JSON.stringify({ userId, expiresAt: expiresAt.toISOString(), deviceInfo, ipAddress }),
      "EX",
      TOKEN.REFRESH_TOKEN_TTL
    );
    pipeline.sadd(authKeys.userTokens(userId), hash);
    pipeline.expire(authKeys.userTokens(userId), TOKEN.REFRESH_TOKEN_TTL);
    await pipeline.exec();

    return { accessToken, refreshToken: raw };
  },

  /**
   * Generates a signed JWT containing user identity (sub, email, name) and jti
   */
  issueAccessToken(userId: string, email: string, name: string): string {
    const jti = randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const payload: JwtPayload = {
      sub: userId,
      email,
      name,
      jti,
      iat: now,
      exp: now + TOKEN.ACCESS_TOKEN_TTL,
    };

    return jwt.sign(payload, env.JWT_SECRET, { algorithm: "HS256" });
  },

  async blacklistAccessToken(jti: string, exp: number): Promise<void> {
    const remaining = exp - Math.floor(Date.now() / 1000);
    if (remaining > 0) {
      await redis.set(keys.auth.blacklist(jti), "1", "EX", remaining);
    }
  },

  async revokeAllUserTokens(userId: string): Promise<void> {
    // Redis revocation
    const hashes = await redis.smembers(authKeys.userTokens(userId));
    if (hashes.length > 0) {
      const pipeline = redis.pipeline();
      for (const hash of hashes) {
        pipeline.del(keys.auth.refreshToken(userId, hash));
      }
      pipeline.del(authKeys.userTokens(userId));
      pipeline.del(keys.auth.session(userId));
      await pipeline.exec();
    }

    // Database revocation
    await tokenRepository.revokeAllUserTokens(userId);
  },
};
