export const RATE_LIMIT = {
  // Standard Auth (Login, Session Refresh)
  AUTH_WINDOW_MS: 60 * 1000, // 1 minute
  AUTH_MAX: 10, // 10 req/min

  // Sensitive Auth (Forgot Password, Password Reset)
  AUTH_SENSITIVE_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_SENSITIVE_MAX: 5, // 5 attempts per 15 min
} as const;
