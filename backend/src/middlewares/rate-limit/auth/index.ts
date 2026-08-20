import rateLimit from "express-rate-limit";
import { createRedisStore, makeHandler, sharedOptions } from "../index";
import { RATE_LIMIT } from "./limit";

/**
 * Standard Auth Rate Limiter
 * Applied to: /api/auth/login, /api/auth/refresh
 */
export const authRateLimit = rateLimit({
  ...sharedOptions,
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX,
  store: createRedisStore("rl:gateway:auth:"),
  handler: makeHandler("Too many login attempts. Please try again in 1 minute."),
});

/**
 * Sensitive Auth Rate Limiter
 * Applied to: /api/auth/forgot-password, /api/auth/reset-password
 */
export const authSensitiveRateLimit = rateLimit({
  ...sharedOptions,
  windowMs: RATE_LIMIT.AUTH_SENSITIVE_WINDOW_MS,
  max: RATE_LIMIT.AUTH_SENSITIVE_MAX,
  store: createRedisStore("rl:gateway:auth:sensitive:"),
  handler: makeHandler("Too many password reset requests. Please try again in 15 minutes."),
});

export { RATE_LIMIT as AUTH_RATE_LIMIT } from "./limit";
