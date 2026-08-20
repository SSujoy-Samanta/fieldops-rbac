import rateLimit, { type Options as RateLimitOptions } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import ipaddr from "ipaddr.js";
import { redis } from "@/lib/redis";
import { isValidIP, extractRealIP } from "@/utils/getIP";
import type { Request, Response } from "express";

// ─── Types ────────────────────────────────────────────────────────

export interface RateLimitMeta {
  timestamp: string;
  retryAfter?: number;
  endpoint?: string;
}

// ─── Redis Store Factory ──────────────────────────────────────────

export function createRedisStore(prefix: string): RedisStore {
  return new RedisStore({
    sendCommand: (command: string, ...args: string[]): Promise<RedisReply> =>
      redis.call(command, ...args) as Promise<RedisReply>,
    prefix,
  });
}

// ─── IPv6-safe IP Normalization ───────────────────────────────────

export function normalizeIP(ip: string): string {
  try {
    const parsed = ipaddr.parse(ip);
    return parsed.toNormalizedString();
  } catch {
    return ip;
  }
}

// ─── Key Generator (User-aware & IP-aware) ─────────────────────────

export function keyGenerator(req: Request): string {
  const scope = "gateway";

  if (req.user?.id) return `${scope}:user:${req.user.id}`;

  const ip = extractRealIP(req);
  return ip ? `${scope}:ip:${normalizeIP(ip)}` : `${scope}:unknown_ip`;
}

// ─── Shared Handler ───────────────────────────────────────────────

export function makeHandler(message: string) {
  return (req: Request, res: Response): void => {
    const meta: RateLimitMeta = {
      timestamp: new Date().toISOString(),
      endpoint: req.originalUrl || req.path,
    };

    const retryAfter = res.getHeader("Retry-After");
    if (retryAfter) {
      const val = Array.isArray(retryAfter) ? retryAfter[0] : retryAfter;
      const num = typeof val === "number" ? val : parseInt(String(val), 10);
      if (Number.isFinite(num)) meta.retryAfter = num;
    }

    res.status(429).json({
      success: false,
      error: message,
      meta,
    });
  };
}

// ─── Shared Base Options ──────────────────────────────────────────

export const sharedOptions: Partial<RateLimitOptions> = {
  standardHeaders: true, // RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
  legacyHeaders: false, // Don't use deprecated X-RateLimit-* headers
  keyGenerator,
  passOnStoreError: true, // Fail open on Redis errors (don't block traffic if Redis is down)
  skipFailedRequests: true,
};

// ─── Per-Service Rate Limit Factory ───────────────────────────────

export function createServiceRateLimit(serviceName: string, windowMs = 60000, max = 100) {
  return rateLimit({
    ...sharedOptions,
    windowMs,
    max,
    store: createRedisStore(`rl:gateway:service:${serviceName}:`),
    handler: makeHandler(`Too many requests to ${serviceName} service.`),
  });
}

export { isValidIP, extractRealIP };
export * from "./global";
export * from "./auth";
