import { Router } from "express";
import { rolesController } from "./roles.controller";
import { authenticate } from "@/middlewares/auth.middleware";

export const rbacRouter: Router = Router();

// ── GET /api/rbac/my-permissions — Bootstrap endpoint returning current user + dynamic RBAC permissions
rbacRouter.get("/my-permissions", authenticate, rolesController.getMyPermissions);

export default rbacRouter;
