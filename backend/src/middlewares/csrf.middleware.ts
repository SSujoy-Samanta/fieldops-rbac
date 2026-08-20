import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import {
  COOKIE,
  CSRF_TOKEN_LENGTH,
  CSRF_EXEMPT_METHODS,
  CSRF_EXEMPT_PATHS,
} from "@/config/constants";
import { timingSafeEqual } from "@/utils/crypto";
import { logger } from "@/lib/logger";

export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  // 1. Skip safe read-only methods (RFC 7231: GET, HEAD, OPTIONS)
  if (CSRF_EXEMPT_METHODS.has(req.method)) {
    return next();
  }

  // 2. Skip exempt paths (health checks, login, refresh, forgot/reset password, csrf)
  const normalizedPath = req.path === "/" ? "/" : req.path.replace(/\/$/, "");
  if (CSRF_EXEMPT_PATHS.has(normalizedPath)) {
    return next();
  }

  const cookieToken = req.cookies?.[COOKIE.CSRF_TOKEN] as string | undefined;
  const headerToken = (req.headers["x-csrf-token"] || req.headers["x-xsrf-token"]) as
    | string
    | undefined;

  // 3. Reject if either token is missing
  if (!cookieToken || !headerToken) {
    logger.warn(
      {
        event: "csrf_rejected",
        reason: "missing_tokens",
        ip: req.realIP || req.ip,
        path: req.path,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
      "CSRF protection rejected request: missing tokens"
    );
    return next(createError(403, "CSRF token missing"));
  }

  // 4. Reject tokens that are not the exact expected length (64 chars) — fail fast on garbage input
  if (cookieToken.length !== CSRF_TOKEN_LENGTH || headerToken.length !== CSRF_TOKEN_LENGTH) {
    logger.warn(
      {
        event: "csrf_rejected",
        reason: "invalid_token_length",
        ip: req.realIP || req.ip,
        path: req.path,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
      "CSRF protection rejected request: invalid token length"
    );
    return next(createError(403, "CSRF token invalid"));
  }

  // 5. Constant-time comparison (prevents timing attacks)
  if (!timingSafeEqual(cookieToken, headerToken)) {
    logger.warn(
      {
        event: "csrf_rejected",
        reason: "token_mismatch",
        ip: req.realIP || req.ip,
        path: req.path,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
      "CSRF protection rejected request: token mismatch"
    );
    return next(createError(403, "CSRF token invalid"));
  }

  next();
}

export default csrfProtection;
