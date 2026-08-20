import { Router } from "express";
import { rolesController } from "@/modules/roles/roles.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { requirePermission } from "@/middlewares/rbac.middleware";
import { PERMISSION_KEY } from "@/types/rbac";

export const permissionsRouter: Router = Router();

// ── GET /api/permissions — List all available system permissions (grouped and flat list)
permissionsRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSION_KEY.MANAGE_ROLES),
  rolesController.getPermissions
);

export default permissionsRouter;
