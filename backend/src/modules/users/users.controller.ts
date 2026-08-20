import type { Request, Response } from "express";
import { usersService } from "./users.service";
import { sendSuccess, sendCreated } from "@/utils/response";
import { asyncHandler } from "@/utils/asyncHandler";
import { extractAuditActor } from "@/utils/actor";
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UserQueryInput,
} from "./users.schemas";

export const usersController = {
  /**
   * GET /api/users
   * Retrieves paginated list of users with search, role, and status filters
   */
  getUsers: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as UserQueryInput;
    const result = await usersService.getUsers(query);
    sendSuccess(res, result.users, "Users retrieved successfully", result.pagination);
  }),

  /**
   * GET /api/users/:id
   * Retrieves detailed user profile with assigned role and permissions
   */
  getUserById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id as string;
    const actor = extractAuditActor(req);
    const user = await usersService.getUserById(userId, actor);
    sendSuccess(res, user, "User retrieved successfully");
  }),

  /**
   * POST /api/users
   * Creates a new employee/manager account and assigns role
   */
  createUser: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const input = req.body as CreateUserInput;
    const actor = extractAuditActor(req);
    const created = await usersService.createUser(input, actor);
    sendCreated(res, created, "User created successfully");
  }),

  /**
   * PATCH /api/users/:id
   * Updates basic profile information (name, email, avatar)
   */
  updateUser: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id as string;
    const input = req.body as UpdateUserInput;
    const updated = await usersService.updateUser(userId, input);
    sendSuccess(res, updated, "User profile updated successfully");
  }),

  /**
   * PATCH /api/users/:id/role
   * Updates user's assigned role with multi-layer cache invalidation
   */
  updateUserRole: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id as string;
    const input = req.body as UpdateUserRoleInput;
    const actor = extractAuditActor(req);
    const updated = await usersService.updateUserRole(userId, input, actor);
    sendSuccess(res, updated, "User role updated successfully");
  }),

  /**
   * PATCH /api/users/:id/status
   * Activates or deactivates user account (deactivation triggers instant session revocation)
   */
  updateUserStatus: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id as string;
    const input = req.body as UpdateUserStatusInput;
    const actor = extractAuditActor(req);
    const updated = await usersService.updateUserStatus(userId, input, actor);
    sendSuccess(
      res,
      updated,
      `User account ${input.isActive ? "activated" : "deactivated"} successfully`
    );
  }),
};

export default usersController;
