import pino, { type Logger } from "pino";
import pinoHttp, { type Options as PinoHttpOptions } from "pino-http";
import { env } from "../config/env";

const isDev = env.NODE_ENV === "development";

export const logger: Logger = pino({
  level: env.LOG_LEVEL || (isDev ? "debug" : "info"),
  transport: isDev
    ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    }
    : undefined,
  base: {
    service: env.SERVICE_NAME,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Request logger factory using pino-http
 */
export function createHttpLogger(baseLogger: Logger = logger, options?: PinoHttpOptions) {
  return pinoHttp({
    logger: baseLogger,

    // Custom log level per status code
    customLogLevel(_req, res, err) {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      if (res.statusCode >= 300) {
        // Show redirection logs only in debug/trace mode
        return baseLogger.level === "debug" || baseLogger.level === "trace" ? "info" : "silent";
      }
      return "info";
    },

    // Custom success message
    customSuccessMessage(req, res) {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },

    // Custom error message
    customErrorMessage(req, res, err) {
      return `${req.method} ${req.url} ${res.statusCode} — ${err.message}`;
    },

    customAttributeKeys: {
      req: "request",
      res: "response",
      err: "error",
      responseTime: "duration",
    },

    // Do not log health check endpoints — too noisy for uptime monitors
    autoLogging: {
      ignore(req) {
        return req.url === "/health" || req.url === "/api/health";
      },
    },

    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          remoteAddress: req.remoteAddress,
          userAgent: req.headers?.["user-agent"],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },

    ...options,
  });
}

export const httpLogger = createHttpLogger(logger);

export default logger;
