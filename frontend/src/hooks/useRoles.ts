"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rbacApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  Role,
  PermissionsData,
  UpdateRolePermissionsPayload,
  RbacContext,
} from "@/types/rbac";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

/**
 * Hook to fetch all system roles with assigned permissions and user counts
 */
export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: async (): Promise<Role[]> => {
      const res = await rbacApi.getRoles();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a specific role by ID with minimum floor permissions
 */
export function useRole(id: string) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: async (): Promise<Role | null> => {
      if (!id) return null;
      const res = await rbacApi.getRoleById(id);
      return res.data || null;
    },
    enabled: Boolean(id),
  });
}

/**
 * Hook to fetch all available permissions (flat list and grouped by module)
 */
export function useAllPermissions() {
  return useQuery({
    queryKey: queryKeys.roles.permissions(),
    queryFn: async (): Promise<PermissionsData> => {
      const res = await rbacApi.getPermissions();
      return (
        res.data || {
          permissions: [],
          grouped: {} as PermissionsData["grouped"],
        }
      );
    },
    staleTime: 1000 * 60 * 60, // 1 hour (static system definitions)
  });
}

/**
 * Hook to update a role's permissions with direct cache update + background invalidation
 */
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: UpdateRolePermissionsPayload;
    }): Promise<Role> => {
      const res = await rbacApi.updateRolePermissions(roleId, payload);
      if (!res.data) {
        throw new Error("Failed to update role permissions: No response data");
      }
      return res.data;
    },
    onSuccess: (updatedRole) => {
      toast.success(
        `Role "${updatedRole.name}" permissions updated successfully.`
      );

      // ── 1. Direct Cache Update for Instant Zero-Latency UI Feedback ──
      queryClient.setQueryData(
        queryKeys.roles.list(),
        (old: Role[] | undefined) => {
          if (!old) return [updatedRole];
          return old.map((r) => (r.id === updatedRole.id ? updatedRole : r));
        }
      );

      queryClient.setQueryData(
        queryKeys.roles.detail(updatedRole.id),
        updatedRole
      );

      // ── 2. Instantly update current user RBAC session if their role was modified ──
      queryClient.setQueryData(
        queryKeys.rbac.myPermissions(),
        (old: { rbac?: RbacContext } | RbacContext | null | undefined) => {
          if (!old) return old;
          if ("rbac" in old && old.rbac && old.rbac.roleId === updatedRole.id) {
            return {
              ...old,
              rbac: {
                ...old.rbac,
                permissions: updatedRole.permissionKeys,
              },
            };
          }
          if ("roleId" in old && old.roleId === updatedRole.id) {
            return {
              ...old,
              permissions: updatedRole.permissionKeys,
            };
          }
          return old;
        }
      );

      // ── 3. Background Invalidation for Deterministic Server Sync ──
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.all,
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.rbac.all,
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Failed to update role permissions.";
      toast.error(message);
    },
  });
}
