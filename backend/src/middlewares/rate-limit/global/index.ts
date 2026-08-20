import rateLimit from "express-rate-limit";
import type { Request } from "express";
import { createRedisStore, makeHandler, sharedOptions } from "../index";
import { RATE_LIMIT } from "./limit";

/**
 * Global Gateway Rate Limiter
 * Applied to all incoming API traffic
 */
export const globalRateLimit = rateLimit({
  ...sharedOptions,
  windowMs: RATE_LIMIT.GLOBAL_WINDOW_MS,
  max: RATE_LIMIT.GLOBAL_MAX,
  store: createRedisStore("rl:gateway:global:"),
  skip: (req: Request) =>
    req.path === "/health" ||
    req.path === "/api/health" ||
    req.path === "/",
  handler: makeHandler("Too many requests. Please slow down."),
});

export { RATE_LIMIT as GLOBAL_RATE_LIMIT } from "./limit";
