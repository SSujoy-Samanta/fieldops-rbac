import { z } from "zod";
import { PERMISSION_KEY } from "@/types/rbac";

export const roleIdParamSchema = z.object({
  id: z.string().cuid("Invalid role ID format"),
});

export const updateRolePermissionsSchema = z.object({
  permissionKeys: z
    .array(z.nativeEnum(PERMISSION_KEY))
    .min(0)
    .transform((keys) => [...new Set(keys)]) // deduplicate at schema level
    .pipe(
      z.array(z.nativeEnum(PERMISSION_KEY)).min(1, "At least one permission must be assigned")
    ),
  description: z.string().trim().max(255).optional(),
});

export type RoleIdParam = z.infer<typeof roleIdParamSchema>;
export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;
