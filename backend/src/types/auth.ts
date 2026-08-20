import type { AUTH_METHOD } from "@/generated/prisma/client";

export interface JwtPayload {
  sub: string; // userId
  email: string;
  name: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  jti: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  isVerified?: boolean;
  emailVerifiedAt?: Date | null;
  lastLoginAt?: Date | null;
  lastAuthMethod?: AUTH_METHOD | null;
  createdAt: Date;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}
