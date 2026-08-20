import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { isHttpError } from "http-errors";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "../lib/logger";

const { JsonWebTokenError, TokenExpiredError } = jwt;

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  missing?: unknown;
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface CustomHttpError extends Error {
  status: number;
  statusCode: number;
  expose: boolean;
  code?: string;
  missing?: unknown;
  details?: unknown;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const requestId = String(req.requestId || req.headers["x-request-id"] || "unknown");
  const timestamp = new Date().toISOString();
  const meta = { requestId, timestamp };

  // ── 1. HttpError (from createError) ───────────────────────────
  if (isHttpError(err)) {
    const customErr = err as CustomHttpError;
    const body: ErrorResponse = {
      success: false,
      error: customErr.message,
      meta,
    };

    if (customErr.code) body.code = customErr.code;
    if (customErr.missing) body.missing = customErr.missing;
    if (customErr.details !== undefined) {
      body.details = customErr.details;
    }

    res.status(customErr.status || customErr.statusCode || 500).json(body);
    return;
  }

  // ── 2. Zod Validation Error (HTTP 422) ─────────────────────────
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: "Validation failed",
      details: err.flatten().fieldErrors,
      meta,
    } satisfies ErrorResponse);
    return;
  }

  // ── 3. JWT Token Errors (HTTP 401) ────────────────────────────
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      error: "Token expired",
      meta,
    } satisfies ErrorResponse);
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      error: "Invalid token",
      meta,
    } satisfies ErrorResponse);
    return;
  }

  // ── 4. Unhandled Internal Server Errors (HTTP 500) ────────────
  logger.error({
    event: "unhandled_error",
    err,
    requestId,
    method: req.method,
    path: req.originalUrl || req.path,
    ip: req.realIP || req.ip,
  }, "❌ Unhandled server error in Express pipeline");

  res.status(500).json({
    success: false,
    error: "Internal server error",
    ...(env.NODE_ENV !== "production" && err instanceof Error
      ? { details: { message: err.message, stack: err.stack } }
      : {}),
    meta,
  } satisfies ErrorResponse);
}

export default errorHandler;
