import { apiClient } from "./client";
import type { ApiResponse } from "@/types/auth";
import type {
  Role,
  RbacContext,
  PermissionsData,
  UpdateRolePermissionsPayload,
} from "@/types/rbac";

export const rbacApi = {
  /**
   * GET /api/rbac/my-permissions
   * Bootstrap endpoint returning current user dynamic permissions
   * Response shape: { success: true, data: { rbac: RbacContext }, message: string }
   */
  getMyPermissions: () =>
    apiClient
      .get<ApiResponse<{ rbac: RbacContext }>>("/rbac/my-permissions")
      .then((res) => res.data),

  /**
   * GET /api/permissions
   * List all system permissions (flat list and grouped by module)
   * Response shape: { success: true, data: { permissions: Permission[], grouped: Record<PERMISSION_MODULE, Permission[]> }, message: string }
   */
  getPermissions: () =>
    apiClient
      .get<ApiResponse<PermissionsData>>("/permissions")
      .then((res) => res.data),

  /**
   * GET /api/roles
   * List all system roles with assigned permissions and active user counts
   * Response shape: { success: true, data: Role[], message: string }
   */
  getRoles: () =>
    apiClient.get<ApiResponse<Role[]>>("/roles").then((res) => res.data),

  /**
   * GET /api/roles/:id
   * Get specific role details with assigned permissions and minimum floor constraints
   * Response shape: { success: true, data: Role, message: string }
   */
  getRoleById: (id: string) =>
    apiClient.get<ApiResponse<Role>>(`/roles/${id}`).then((res) => res.data),

  /**
   * PUT /api/roles/:id/permissions
   * Update role permissions (triggers tag-based cache invalidation)
   * Request body: { permissionKeys: PERMISSION_KEY[], description?: string }
   * Response shape: { success: true, data: Role, message: string }
   */
  updateRolePermissions: (id: string, payload: UpdateRolePermissionsPayload) =>
    apiClient
      .put<ApiResponse<Role>>(`/roles/${id}/permissions`, payload)
      .then((res) => res.data),
};

export default rbacApi;
