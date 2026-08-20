import { SYSTEM_ROLE, PERMISSION_KEY, Permission } from "./rbac";
import { AUTH_METHOD, ApiResponse } from "./auth";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserRoleSummary {
  id: string;
  name: SYSTEM_ROLE;
  description?: string | null;
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  roleId: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string | null;
  lastAuthMethod?: AUTH_METHOD | null;
  createdAt: string;
  updatedAt: string;
  role: UserRoleSummary;
}

export interface UserDetail {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  roleId: string;
  role: UserRoleSummary;
  permissions: Permission[];
  permissionKeys: PERMISSION_KEY[];
  isActive: boolean;
  isVerified: boolean;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  lastAuthMethod?: AUTH_METHOD | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: SYSTEM_ROLE;
  avatar?: string;
}

export interface CreatedUserResponse extends UserListItem {
  temporaryPassword?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  avatar?: string | null;
}

export interface UpdateUserRoleInput {
  role: SYSTEM_ROLE;
}

export interface UpdateUserStatusInput {
  isActive: boolean;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: SYSTEM_ROLE;
  isActive?: boolean;
  sortBy?: "createdAt" | "name" | "email" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
}

export type PaginatedUsersResponse = ApiResponse<UserListItem[]> & {
  pagination?: PaginationMeta;
};
