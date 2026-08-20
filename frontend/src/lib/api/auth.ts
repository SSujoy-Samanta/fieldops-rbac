import { apiClient } from "./client";
import type {
  ApiResponse,
  AuthUser,
  LoginInput,
  LoginResponseData,
  RefreshResponseData,
  ForgotPasswordInput,
  ForgotPasswordResponseData,
  ResetPasswordInput,
  GoogleCallbackInput,
  OAuthStateResponseData,
} from "@/types/auth";

/**
 * Returns the exact OAuth callback URL registered with Google
 */
export function getOAuthRedirectUri(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/google/callback`;
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl}/auth/google/callback`;
}

export const authApi = {
  /**
   * GET /api/auth/csrf — Fetches fresh CSRF token and sets cookie
   */
  getCsrf: () =>
    apiClient
      .get<ApiResponse<{ csrfToken: string }>>("/auth/csrf")
      .then((res) => res.data),

  /**
   * POST /api/auth/login — Authenticates with email and password
   */
  login: (body: LoginInput) =>
    apiClient
      .post<ApiResponse<LoginResponseData>>("/auth/login", body)
      .then((res) => res.data),

  /**
   * POST /api/auth/refresh — Rotates JWT access and refresh token pair
   */
  refresh: (body?: { refreshToken?: string }) =>
    apiClient
      .post<ApiResponse<RefreshResponseData>>("/auth/refresh", body ?? {})
      .then((res) => res.data),

  /**
   * POST /api/auth/logout — Blacklists access token and revokes refresh token
   */
  logout: () =>
    apiClient
      .post<ApiResponse<{ message: string }>>("/auth/logout", {})
      .then((res) => res.data),

  /**
   * GET /api/auth/me — Retrieves currently authenticated user profile
   */
  getMe: () =>
    apiClient
      .get<ApiResponse<{ user: AuthUser }>>("/auth/me")
      .then((res) => res.data),

  /**
   * POST /api/auth/forgot-password — Dispatches password reset token via email
   */
  forgotPassword: (body: ForgotPasswordInput) =>
    apiClient
      .post<ApiResponse<ForgotPasswordResponseData>>("/auth/forgot-password", body)
      .then((res) => res.data),

  /**
   * POST /api/auth/reset-password — Sets new password using verification token
   */
  resetPassword: (body: ResetPasswordInput) =>
    apiClient
      .post<ApiResponse<{ message: string }>>("/auth/reset-password", body)
      .then((res) => res.data),

  /**
   * GET /api/auth/oauth/state — Generates Google OAuth authorization URL and state token
   */
  getOAuthState: (redirectUri?: string) =>
    apiClient
      .get<ApiResponse<OAuthStateResponseData>>("/auth/oauth/state", {
        params: redirectUri ? { redirectUri } : undefined,
      })
      .then((res) => res.data),

  /**
   * POST /api/auth/google — Exchanges Google auth code for session
   */
  googleCallback: (body: GoogleCallbackInput) =>
    apiClient
      .post<ApiResponse<LoginResponseData>>("/auth/google", body)
      .then((res) => res.data),
};

export default authApi;
