import { Router } from "express";
import { rolesController } from "./roles.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { requirePermission } from "@/middlewares/rbac.middleware";
import { validateBody, validateParams } from "@/middlewares/validate.middleware";
import { roleIdParamSchema, updateRolePermissionsSchema } from "./roles.schemas";
import { PERMISSION_KEY } from "@/types/rbac";

export const rolesRouter: Router = Router();

// All role management endpoints require authentication and MANAGE_ROLES permission
rolesRouter.use(authenticate, requirePermission(PERMISSION_KEY.MANAGE_ROLES));

// ── GET /api/roles — List all roles with permissions and user count
rolesRouter.get("/", rolesController.getRoles);

// ── GET /api/roles/:id — Get specific role details
rolesRouter.get("/:id", validateParams(roleIdParamSchema), rolesController.getRoleById);

// ── PUT /api/roles/:id/permissions — Update role permissions & invalidate cache
rolesRouter.put(
  "/:id/permissions",
  validateParams(roleIdParamSchema),
  validateBody(updateRolePermissionsSchema),
  rolesController.updateRolePermissions
);

export default rolesRouter;
