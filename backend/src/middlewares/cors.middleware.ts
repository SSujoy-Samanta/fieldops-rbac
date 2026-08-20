import cors, { type CorsOptions } from "cors";
import type { RequestHandler } from "express";
import { allowedOrigins, env } from "../config/env";

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In non-production, allow any localhost/127.0.0.1 port
    if (
      env.NODE_ENV !== "production" &&
      (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS Policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400, // Preflight cache: 24 hours
};

export const corsMiddleware: RequestHandler = cors(corsOptions);
export default corsMiddleware;
