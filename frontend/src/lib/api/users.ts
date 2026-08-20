import { apiClient } from "./client";
import type { ApiResponse } from "@/types/auth";
import type {
  UserListItem,
  UserDetail,
  CreateUserInput,
  CreatedUserResponse,
  UpdateUserInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UserQueryParams,
  PaginatedUsersResponse,
} from "@/types/user";

export const usersApi = {
  /**
   * GET /api/users
   * Retrieves paginated list of users with search, role, and status filters
   * Response shape: { success: true, data: UserListItem[], message: string, pagination: PaginationMeta }
   */
  getUsers: (params?: UserQueryParams) =>
    apiClient
      .get<PaginatedUsersResponse>("/users", { params })
      .then((res) => res.data),

  /**
   * GET /api/users/:id
   * Retrieves detailed user profile with assigned role and effective permissions
   * Response shape: { success: true, data: UserDetail, message: string }
   */
  getUserById: (id: string) =>
    apiClient
      .get<ApiResponse<UserDetail>>(`/users/${id}`)
      .then((res) => res.data),

  /**
   * POST /api/users
   * Creates a new employee/manager account with auto-generated secure password
   * Response shape: { success: true, data: CreatedUserResponse, message: string }
   */
  createUser: (payload: CreateUserInput) =>
    apiClient
      .post<ApiResponse<CreatedUserResponse>>("/users", payload)
      .then((res) => res.data),

  /**
   * PATCH /api/users/:id
   * Updates basic profile information (name, email, avatar)
   * Response shape: { success: true, data: UserListItem, message: string }
   */
  updateUser: (id: string, payload: UpdateUserInput) =>
    apiClient
      .patch<ApiResponse<UserListItem>>(`/users/${id}`, payload)
      .then((res) => res.data),

  /**
   * PATCH /api/users/:id/role
   * Updates user's assigned role with multi-layer cache invalidation
   * Response shape: { success: true, data: UserListItem, message: string }
   */
  updateUserRole: (id: string, payload: UpdateUserRoleInput) =>
    apiClient
      .patch<ApiResponse<UserListItem>>(`/users/${id}/role`, payload)
      .then((res) => res.data),

  /**
   * PATCH /api/users/:id/status
   * Activates or deactivates user account (deactivation triggers instant session revocation)
   * Response shape: { success: true, data: UserListItem, message: string }
   */
  updateUserStatus: (id: string, payload: UpdateUserStatusInput) =>
    apiClient
      .patch<ApiResponse<UserListItem>>(`/users/${id}/status`, payload)
      .then((res) => res.data),
};

export default usersApi;
