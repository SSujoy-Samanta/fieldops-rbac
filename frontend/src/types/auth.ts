import { SYSTEM_ROLE, PERMISSION_KEY } from "./rbac";

export enum AUTH_METHOD {
  EMAIL_PASSWORD = "EMAIL_PASSWORD",
  GOOGLE_OAUTH = "GOOGLE_OAUTH",
  MAGIC_LINK = "MAGIC_LINK",
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  isVerified?: boolean;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  lastAuthMethod?: AUTH_METHOD | null;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface LoginResponseData {
  user: AuthUser;
  accessToken: string;
  csrfToken?: string;
}

export interface RefreshResponseData {
  accessToken: string;
  csrfToken?: string;
}

export interface ForgotPasswordResponseData {
  message: string;
  resetToken?: string;
}

export interface UserBootstrapData {
  user: AuthUser;
  rbac: {
    roleId: string;
    roleName: SYSTEM_ROLE;
    permissions: PERMISSION_KEY[];
    isOwner: boolean;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface GoogleCallbackInput {
  code: string;
  state: string;
  redirectUri?: string;
}

export interface OAuthStateResponseData {
  state: string;
  authUrl: string;
}
