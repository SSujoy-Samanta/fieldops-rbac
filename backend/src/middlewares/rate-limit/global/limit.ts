export const RATE_LIMIT = {
  GLOBAL_WINDOW_MS: 60 * 1000, // 1 minute
  GLOBAL_MAX: 200, // 200 req/min
} as const;
