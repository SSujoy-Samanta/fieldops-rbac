import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { env } from "@/config/env";
import { redis, keys } from "@/lib/redis";
import type { JwtPayload } from "@/types/auth";

export { type JwtPayload };

/**
 * Authentication Middleware (Stateless & Fast):
 * 1. Extracts Bearer token from Authorization header or accessToken cookie
 * 2. Verifies cryptographic JWT signature (sub, email, name, jti, exp)
 * 3. Checks Redis blacklist (instant O(1) revocation on logout/security events)
 * 4. Attaches req.user directly from validated token claims (zero DB latency)
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Extract Token
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw createError(401, "Authentication required. No token provided.");
    }

    // 2. Cryptographic JWT Verification (CPU-bound, zero DB overhead)
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ["HS256"],
      }) as JwtPayload;
    } catch {
      throw createError(401, "Invalid or expired token");
    }

    // 3. Fast O(1) Redis Blacklist Check (for revoked tokens / logouts)
    const isBlacklisted = await redis.exists(keys.auth.blacklist(payload.jti));
    if (isBlacklisted === 1) {
      throw createError(401, "Session has been invalidated. Please log in again.");
    }

    // 4. Attach Verified Caller Identity
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      jti: payload.jti,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export default authenticate;
