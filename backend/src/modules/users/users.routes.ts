import { Router } from "express";
import { usersController } from "./users.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { requirePermission } from "@/middlewares/rbac.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "@/middlewares/validate.middleware";
import {
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  userIdParamSchema,
  userQuerySchema,
} from "./users.schemas";
import { PERMISSION_KEY } from "@/types/rbac";

export const usersRouter: Router = Router();

// All user management routes require valid session + MANAGE_USERS permission
usersRouter.use(authenticate, requirePermission(PERMISSION_KEY.MANAGE_USERS));

// ── GET /api/users — Paginated users list with search & filter
usersRouter.get(
  "/",
  validateQuery(userQuerySchema),
  usersController.getUsers
);

// ── GET /api/users/:id — User details with assigned role & permissions
usersRouter.get(
  "/:id",
  validateParams(userIdParamSchema),
  usersController.getUserById
);

// ── POST /api/users — Create new user / employee
usersRouter.post(
  "/",
  validateBody(createUserSchema),
  usersController.createUser
);

// ── PATCH /api/users/:id — Update user profile
usersRouter.patch(
  "/:id",
  validateParams(userIdParamSchema),
  validateBody(updateUserSchema),
  usersController.updateUser
);

// ── PATCH /api/users/:id/role — Update user role
usersRouter.patch(
  "/:id/role",
  validateParams(userIdParamSchema),
  validateBody(updateUserRoleSchema),
  usersController.updateUserRole
);

// ── PATCH /api/users/:id/status — Activate / Deactivate user
usersRouter.patch(
  "/:id/status",
  validateParams(userIdParamSchema),
  validateBody(updateUserStatusSchema),
  usersController.updateUserStatus
);

export default usersRouter;
