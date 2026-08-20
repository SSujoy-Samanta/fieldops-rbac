import helmet from "helmet";
import hpp from "hpp";
import type { RequestHandler } from "express";
import { allowedOrigins } from "../config/env";

export const securityHeaders: RequestHandler[] = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'none'"],
        connectSrc: ["'self'", ...(Array.isArray(allowedOrigins) ? allowedOrigins : [])],
        imgSrc: ["'self'", "data:"],
        styleSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "no-referrer" },
    noSniff: true,
    xFrameOptions: { action: "deny" },
    hidePoweredBy: true,
    dnsPrefetchControl: { allow: false },
  }),
  hpp(),
];
