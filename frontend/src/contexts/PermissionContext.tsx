"use client";

import React, { createContext, useContext, useCallback, useMemo, useEffect } from "react";
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
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          return null;
        }
        throw err;
      }
    },
    enabled: Boolean(user),
    retry: false,
    // Only cache active permission payloads. Null / missing permissions are marked stale immediately (0ms).
    staleTime: (query) => (query.state.data ? 1000 * 60 * 5 : 0),
    gcTime: 1000 * 60 * 15,
  });

  // Automatically refetch permissions whenever the active user identity changes (e.g. login / account switch)
  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [user?.id, refetch]);

  const rbac = user ? data || null : null;
  const roleName = rbac?.roleName || null;
  const roleId = rbac?.roleId || null;
  const isOwner = Boolean(rbac?.isOwner || roleName === SYSTEM_ROLE.OWNER);
  const permissionList = useMemo(() => (user ? rbac?.permissions || [] : []), [user, rbac?.permissions]);
  const permissions = useMemo(
    () => new Set<PERMISSION_KEY>(permissionList),
    [permissionList]
  );
  const isLoading = Boolean(user && queryLoading && !data);
  const error = (user ? queryError : null) as Error | null;

  /**
   * can
   * Checks if user has a specific permission.
   * OWNER always bypasses all permission checks per NIST RBAC specification.
   */
  const can = useCallback(
    (permission: PERMISSION_KEY): boolean => {
      if (!user) return false;
      if (isOwner) return true;
      return permissions.has(permission);
    },
    [user, isOwner, permissions]
  );

  /**
   * canAny
   * Checks if user has at least one of the specified permissions.
   */
  const canAny = useCallback(
    (perms: PERMISSION_KEY[]): boolean => {
      if (!user) return false;
      if (isOwner) return true;
      return perms.some((p) => permissions.has(p));
    },
    [user, isOwner, permissions]
  );

  /**
   * canAll
   * Checks if user has all of the specified permissions.
   */
  const canAll = useCallback(
    (perms: PERMISSION_KEY[]): boolean => {
      if (!user) return false;
      if (isOwner) return true;
      return perms.every((p) => permissions.has(p));
    },
    [user, isOwner, permissions]
  );

  /**
   * updateCachedPermissions
   * Immediately mutates the cached permissions in React Query cache without a full refetch.
   */
  const updateCachedPermissions = useCallback(
    (newPermissions: PERMISSION_KEY[]) => {
      queryClient.setQueryData(
        queryKeys.rbac.myPermissions(),
        (old: RbacContext | { rbac?: RbacContext } | undefined) => {
          if (!old) return old;
          if ("permissions" in old) {
            return {
              ...old,
              permissions: newPermissions,
            };
          }
          if ("rbac" in old && old.rbac) {
            return {
              ...old,
              rbac: {
                ...old.rbac,
                permissions: newPermissions,
              },
            };
          }
          return old;
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
      "usePermissions must be used within a PermissionProvider (under UserProvider)"
    );
  }
  return context;
}

export default PermissionContext;
