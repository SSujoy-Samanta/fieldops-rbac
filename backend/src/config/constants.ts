export const TOKEN = {
  ACCESS_TOKEN_TTL: 15 * 60, // 15 minutes (in seconds)
  REFRESH_TOKEN_TTL: 7 * 24 * 60 * 60, // 7 days (in seconds)
  CSRF_TTL: 7 * 24 * 60 * 60, // 7 days (in seconds)
  SESSION_CACHE_TTL: 5 * 60, // 5 minutes (in seconds)
  PASSWORD_RESET_TTL: 15 * 60, // 15 minutes (in seconds)
} as const;

export const COOKIE = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  CSRF_TOKEN: "csrfToken",
} as const;

export const CSRF_TOKEN_LENGTH = 64; // 32 bytes hex = 64 chars

export const CSRF_EXEMPT_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const CSRF_EXEMPT_PATHS = new Set([
  "/",
  "/health",
  "/api/health",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/csrf",
  "/api/auth/google",
  "/api/auth/oauth/state",
  "/api/auth/oauth/google",
]);

export const LOCKOUT = {
  THRESHOLD: 5, // 5 failed attempts
  DURATION: 15 * 60, // 15 minutes lock (in seconds)
} as const;

export const REDIS_TTL = {
  AUTH_SESSION: 5 * 60,
  USER_CACHE: 10 * 60,
  RATE_LIMIT: 60,
  OAUTH_STATE: 10 * 60, // 10 minutes
  RBAC_PERMISSIONS: 5 * 60, // 5 minutes cache with event-driven invalidation
} as const;

export const CACHE_TTL = {
  PERMISSIONS_DATA: 24 * 60 * 60, // 24 hours (static system definitions)
  ROLE_DATA: 60 * 60, // 1 hour
  ROLE_LIST: 60 * 60, // 1 hour
  USER_RBAC: 5 * 60, // 5 minutes
  USER_DATA: 10 * 60, // 10 minutes
  USER_LIST: 5 * 60, // 5 minutes
  ATTENDANCE_DATA: 5 * 60, // 5 minutes
  ATTENDANCE_LIST: 2 * 60, // 2 minutes
  VISIT_DATA: 10 * 60, // 10 minutes
  VISIT_LIST: 5 * 60, // 5 minutes
} as const;
