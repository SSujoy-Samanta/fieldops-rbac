import type { Request, Response } from "express";
import { rolesService } from "./roles.service";
import { sendSuccess } from "@/utils/response";
import { asyncHandler } from "@/utils/asyncHandler";
import type { UpdateRolePermissionsInput } from "./roles.schemas";

export const rolesController = {
  /**
   * GET /api/permissions
   * List all available system permissions (grouped and flat list)
   */
  getPermissions: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const result = await rolesService.getAllPermissions();
    sendSuccess(res, result, "Permissions retrieved successfully");
  }),

  /**
   * GET /api/roles
   * List all system roles with assigned permissions and user counts
   */
  getRoles: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const roles = await rolesService.getAllRoles();
    sendSuccess(res, roles, "Roles retrieved successfully");
  }),

  /**
   * GET /api/roles/:id
   * Get specific role details with assigned permissions
   */
  getRoleById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const roleId = req.params.id as string;
    const role = await rolesService.getRoleById(roleId);
    sendSuccess(res, role, "Role retrieved successfully");
  }),

  /**
   * PUT /api/roles/:id/permissions
   * Update assigned permissions for a role (triggers tag-based cache invalidation)
   */
  updateRolePermissions: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const roleId = req.params.id as string;
    const input = req.body as UpdateRolePermissionsInput;
    const updatedRole = await rolesService.updateRolePermissions(roleId, input);
    sendSuccess(res, updatedRole, "Role permissions updated successfully");
  }),

  /**
   * GET /api/rbac/my-permissions
   * Returns current user dynamic RBAC permissions
   */
  getMyPermissions: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await rolesService.getMyPermissions(req.user!.id);
    sendSuccess(res, result, "User RBAC session retrieved successfully");
  }),
};

export default rolesController;
