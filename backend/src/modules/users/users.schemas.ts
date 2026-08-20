import { z } from "zod";
import { SYSTEM_ROLE } from "@/types/rbac";

export const userIdParamSchema = z.object({
  id: z.string().cuid("Invalid user ID format"),
});

export const createUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email address format")
    .trim()
    .toLowerCase()
    .max(255, "Email cannot exceed 255 characters"),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(128, "Name cannot exceed 128 characters"),
  role: z.nativeEnum(SYSTEM_ROLE, {
    message: "Role must be one of: OWNER, MANAGER, FIELD_EMPLOYEE",
  }),
  avatar: z.string().url("Avatar must be a valid URL").optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(128, "Name cannot exceed 128 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email address format")
    .trim()
    .toLowerCase()
    .max(255, "Email cannot exceed 255 characters")
    .optional(),
  avatar: z.string().url("Avatar must be a valid URL").nullable().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(SYSTEM_ROLE, {
    message: "Role must be one of: OWNER, MANAGER, FIELD_EMPLOYEE",
  }),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({ message: "isActive boolean status is required" }),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  role: z.nativeEnum(SYSTEM_ROLE).optional(),
  isActive: z
    .preprocess((val) => {
      if (typeof val === "string") {
        if (val.toLowerCase() === "true") return true;
        if (val.toLowerCase() === "false") return false;
      }
      return val;
    }, z.boolean().optional())
    .optional(),
  sortBy: z.enum(["createdAt", "name", "email", "lastLoginAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
