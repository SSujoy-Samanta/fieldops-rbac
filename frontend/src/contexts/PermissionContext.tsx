"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { rbacApi, ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useUser } from "@/hooks/useUser";
import { SYSTEM_ROLE, PERMISSION_KEY, type RbacContext } from "@/types/rbac";

interface PermissionContextState {
  rbac: RbacContext | null;
  roleName: SYSTEM_ROLE | null;
  roleId: string | null;
  permissions: Set<PERMISSION_KEY>;
  permissionList: PERMISSION_KEY[];
  isOwner: boolean;
  isLoading: boolean;
  error: Error | null;
  can: (permission: PERMISSION_KEY) => boolean;
  canAny: (permissions: PERMISSION_KEY[]) => boolean;
  canAll: (permissions: PERMISSION_KEY[]) => boolean;
  refetchPermissions: () => Promise<void>;
  updateCachedPermissions: (newPermissions: PERMISSION_KEY[]) => void;
}

const PermissionContext = createContext<PermissionContextState | undefined>(
  undefined
);

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.rbac.myPermissions(),
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await rbacApi.getMyPermissions();
        return res.data?.rbac || null;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          return null;
        }
        throw err;
      }
    },
    enabled: Boolean(user),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15,
  });

  const rbac = data || null;
  const roleName = rbac?.roleName || null;
  const roleId = rbac?.roleId || null;
  const isOwner = Boolean(rbac?.isOwner || roleName === SYSTEM_ROLE.OWNER);
  const permissionList = useMemo(() => rbac?.permissions || [], [rbac?.permissions]);
  const permissions = useMemo(
    () => new Set<PERMISSION_KEY>(permissionList),
    [permissionList]
  );
  const isLoading = Boolean(user && queryLoading);
  const error = queryError as Error | null;

  /**
   * can
   * Checks if user has a specific permission.
   * OWNER always bypasses all permission checks per NIST RBAC specification.
   */
  const can = useCallback(
    (permission: PERMISSION_KEY): boolean => {
      if (isOwner) return true;
      return permissions.has(permission);
    },
    [isOwner, permissions]
  );

  /**
   * canAny
   * Checks if user has at least one of the specified permissions.
   */
  const canAny = useCallback(
    (perms: PERMISSION_KEY[]): boolean => {
      if (isOwner) return true;
      return perms.some((p) => permissions.has(p));
    },
    [isOwner, permissions]
  );

  /**
   * canAll
   * Checks if user has all of the specified permissions.
   */
  const canAll = useCallback(
    (perms: PERMISSION_KEY[]): boolean => {
      if (isOwner) return true;
      return perms.every((p) => permissions.has(p));
    },
    [isOwner, permissions]
  );

  /**
   * updateCachedPermissions
   * Immediately mutates the cached permissions in React Query cache without a full refetch.
   */
  const updateCachedPermissions = useCallback(
    (newPermissions: PERMISSION_KEY[]) => {
      queryClient.setQueryData(
        queryKeys.rbac.myPermissions(),
        (old: { rbac?: RbacContext } | undefined) => {
          if (!old?.rbac) return old;
          return {
            ...old,
            rbac: {
              ...old.rbac,
              permissions: newPermissions,
            },
          };
        }
      );
    },
    [queryClient]
  );

  const value = useMemo<PermissionContextState>(
    () => ({
      rbac,
      roleName,
      roleId,
      permissions,
      permissionList,
      isOwner,
      isLoading,
      error,
      can,
      canAny,
      canAll,
      refetchPermissions: async () => {
        await refetch();
      },
      updateCachedPermissions,
    }),
    [
      rbac,
      roleName,
      roleId,
      permissions,
      permissionList,
      isOwner,
      isLoading,
      error,
      can,
      canAny,
      canAll,
      refetch,
      updateCachedPermissions,
    ]
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextState {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error(
      "usePermissions must be used within a PermissionProvider (under RequireAuth)"
    );
  }
  return context;
}

export default PermissionContext;
