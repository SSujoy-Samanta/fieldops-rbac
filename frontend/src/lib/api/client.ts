import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// ── Cookie & Token Constants (Matching Backend) ─────────────────────
export const CSRF_COOKIE_NAME = "csrfToken";
export const CSRF_HEADER_NAME = "x-csrf-token";

// ── Custom ApiError Class ───────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly data?: Record<string, unknown>,
    public readonly isHandled: boolean = false
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isHandledApiError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return Boolean(err.isHandled);
  }
  return false;
}

export function getErrorMessage(err: unknown): string {
  if (isHandledApiError(err)) {
    return "";
  }
  if (err instanceof ApiError) {
    const genericMessages: Record<number, string> = {
      400: "Invalid request. Please check your input.",
      401: "Session expired. Please log in again.",
      403: "Access denied. Insufficient permissions.",
      404: "Requested resource not found.",
      409: "A conflict occurred with the current state.",
      422: "Validation error. Please verify your data.",
      429: "Too many requests. Please try again later.",
      500: "Internal server error. Please try again shortly.",
      503: "Service temporarily unavailable.",
    };

    const isGeneric =
      !err.message ||
      err.message === "Request failed" ||
      err.message === "Network Error";
    const fallbackMessage = genericMessages[err.status];
    if (isGeneric && fallbackMessage) {
      return fallbackMessage;
    }

    return err.message;
  }
  if (axios.isCancel(err)) {
    return "Request was cancelled.";
  }
  if (err instanceof AxiosError && !err.response) {
    return "Network error. Please check your connection.";
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "An unexpected error occurred.";
}

// ── Axios Client Configuration ──────────────────────────────────────
export const apiClient = axios.create({
  // '/api' is proxied to the direct backend by Next.js rewrites (see next.config.ts)
  baseURL: "/api",
  withCredentials: true, // Sends HttpOnly session cookies (accessToken, refreshToken, csrfToken)
  xsrfCookieName: CSRF_COOKIE_NAME,
  xsrfHeaderName: CSRF_HEADER_NAME,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

// ── CSRF Request Interceptor (Double Submit Cookie Pattern) ─────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof document !== "undefined") {
    // Read csrfToken from document.cookie and attach x-csrf-token header for non-GET requests
    const match = document.cookie.match(
      new RegExp(`(^|;\\s*)${CSRF_COOKIE_NAME}=([^;]*)`)
    );
    if (match && match[2]) {
      config.headers[CSRF_HEADER_NAME] = decodeURIComponent(match[2]);
    }
  }
  return config;
});

// ── Single-Flight Token Refresh Queue ───────────────────────────────
let isRefreshing = false;
let refreshSubscribers: Array<(success: boolean) => void> = [];

function onRefreshComplete(success: boolean) {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
}

// ── Response Interceptor: Single-Flight Refresh & Standardized Errors ─
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _isRetry?: boolean })
      | undefined;

    // ── 1. Handle 401 Unauthorized with Single-Flight Token Refresh ───
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._isRetry
    ) {
      // Prevent infinite loop if the refresh endpoint itself fails with 401
      if (
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/login")
      ) {
        return Promise.reject(
          new ApiError(401, "Session expired. Please log in again.", "UNAUTHORIZED")
        );
      }

      originalRequest._isRetry = true;

      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((success: boolean) => {
            if (success) {
              resolve(apiClient(originalRequest));
            } else {
              reject(
                new ApiError(401, "Session expired. Please log in again.", "UNAUTHORIZED")
              );
            }
          });
        });
      }

      isRefreshing = true;

      try {
        // Refresh session using apiClient so CSRF header is automatically sent
        await apiClient.post("/auth/refresh", {});

        isRefreshing = false;
        onRefreshComplete(true);

        // Retry original request with freshly set cookies
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshComplete(false);

        // Redirect to login if in browser and session is dead
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (currentPath !== "/login" && currentPath !== "/") {
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = `/login?returnTo=${encodeURIComponent(currentPath)}`;
          }
        }

        const status = axios.isAxiosError(refreshError)
          ? refreshError.response?.status || 401
          : 401;
        throw new ApiError(status, "Session expired. Please log in again.", "SESSION_EXPIRED");
      }
    }

    // ── 2. Standardize Error Extraction ───────────────────────────────
    const status = error.response?.status || 500;
    const data = error.response?.data as
      | {
          error?: string;
          message?: string;
          code?: string;
          details?: Record<string, string[]>;
          [key: string]: unknown;
        }
      | undefined;

    let message =
      data?.error || data?.message || error.message || "Request failed";

    // Extract Zod validation details if present
    if (data?.details && typeof data.details === "object") {
      const firstDetailKey = Object.keys(data.details)[0];
      if (
        firstDetailKey &&
        Array.isArray(data.details[firstDetailKey]) &&
        data.details[firstDetailKey][0]
      ) {
        const detailMsg = data.details[firstDetailKey][0];
        message =
          message === "Validation failed"
            ? detailMsg
            : `${message}: ${detailMsg}`;
      }
    }

    throw new ApiError(status, message, data?.code, data);
  }
);

export { apiClient as api };
export default apiClient;
