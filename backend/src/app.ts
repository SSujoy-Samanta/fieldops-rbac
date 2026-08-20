import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { env } from "@/config/env";
import { httpLogger } from "@/lib/logger";
import { securityHeaders } from "@/middlewares/security.middleware";
import { requestContext } from "@/middlewares/request-context.middleware";
import { corsMiddleware } from "@/middlewares/cors.middleware";
import { globalRateLimit } from "@/middlewares/rate-limit";
import { csrfProtection } from "@/middlewares/csrf.middleware";
import { errorHandler } from "@/middlewares/error.middleware";
import { healthRouter } from "@/modules/health/health.routes";
import { apiRouter } from "@/routes";

/**
 * Express Application Factory
 * Production Middleware Pipeline ordered according to OWASP & Node.js Best Practices
 */
export function createApp(): express.Application {
  const app = express();

  // ── 1. Trust Proxy ──────────────────────────────────────────────────────────
  // MUST be set before any middleware that reads req.ip, req.protocol, or rate limits.
  // Supports Cloudflare, AWS ALB, NGINX reverse proxies.
  app.set("trust proxy", 1);

  // ── 2. Request Context & Correlation ID ─────────────────────────────────────
  // Mounted FIRST to generate req.requestId (X-Request-Id) and resolve req.realIP
  // so all downstream loggers, security filters, and handlers have correlation tracing.
  app.use(requestContext);

  // ── 3. HTTP Request Logging (Pino) ──────────────────────────────────────────
  // Captures 100% of incoming traffic with response duration, status code,
  // client IP, and the correlation requestId.
  app.use(httpLogger);

  // ── 4. Security Headers (Helmet + HPP) ──────────────────────────────────────
  // Sets CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  // and prevents HTTP Parameter Pollution on all responses.
  app.use(securityHeaders);

  // ── 5. CORS & Preflight (OPTIONS) ───────────────────────────────────────────
  // Evaluates Origin headers and answers browser preflight (OPTIONS) requests
  // early, ensuring frontend SPA clients (React/Vite/Next.js) get valid CORS headers.
  app.use(corsMiddleware);

  // ── 6. Cookie Parser ────────────────────────────────────────────────────────
  // Parses httpOnly authentication and session cookies before routes/guards.
  app.use(cookieParser());

  // ── 7. Body Parsing (JSON & URL-Encoded) ────────────────────────────────────
  // Parses incoming JSON payloads and URL-encoded form data with a safe 10MB limit.
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ── 8. Health Check (Fast-Path / Bypass Rate Limit) ─────────────────────────
  // Mounted before global rate limiting to ensure container orchestrators (K8s, ECS),
  // load balancers, and monitoring systems always receive a 200/503 status.
  app.use("/health", healthRouter);

  // ── 9. Global Rate Limiting (Redis-Backed) ──────────────────────────────────
  // Applied to all API traffic. Provides primary DoS and abuse protection (200 req/min per IP).
  app.use(globalRateLimit);

  // ── 10. CSRF Protection (Double-Submit Cookie Verification) ─────────────────
  app.use(csrfProtection);

  // ── 11. Root Discovery / Welcome Endpoint ───────────────────────────────────
  app.get("/", (_req, res) => {
    res.json({
      name: "FieldOps Access Test Backend API",
      service: env.SERVICE_NAME,
      status: "online",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "/health",
        api: "/api",
        csrf: "/api/auth/csrf",
      },
    });
  });

  // ── 12. Root API Router (All feature modules mounted here) ──────────────────
  app.use("/api", apiRouter);

  // ── 13. 404 Route Not Found Handler ─────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        status: 404,
        message: `Route ${req.method} ${req.originalUrl} not found`,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  });

  // ── 14. Centralized Global Error Handler ────────────────────────────────────
  app.use(errorHandler);

  return app;
}

export function createHttpServer() {
  const app = createApp();
  return createServer(app);
}

export const app = createApp();
export default app;
