import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      realIP: string;
    }
  }
}

/**
 * Request Context Middleware:
 * 1. Attaches a unique requestId for distributed tracing in logs.
 * 2. Extracts real client IP (Cloudflare / Load balancer / X-Forwarded-For aware).
 * 3. Echoes X-Request-Id header in response.
 */
export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers["x-request-id"] as string | undefined;
  const requestId = incomingId || randomUUID();

  const forwarded = req.headers["x-forwarded-for"];
  const cfConnectingIp = req.headers["cf-connecting-ip"] as string | undefined;

  let realIP = req.ip || "127.0.0.1";
  if (cfConnectingIp) {
    realIP = cfConnectingIp;
  } else if (typeof forwarded === "string") {
    realIP = forwarded.split(",")[0].trim();
  }

  req.requestId = requestId;
  req.realIP = realIP;

  res.setHeader("X-Request-Id", requestId);

  next();
}
