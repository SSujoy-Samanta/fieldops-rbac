"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import { queryKeys } from "@/lib/query-keys";
import type {
  UserListItem,
  UserDetail,
  CreateUserInput,
  CreatedUserResponse,
  UpdateUserInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UserQueryParams,
  PaginationMeta,
} from "@/types/user";
import type { Role } from "@/types/rbac";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/client";

/**
 * Hook to fetch paginated users list with search, role, and active status filters
 */
export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params as Record<string, unknown>),
    queryFn: async (): Promise<{
      users: UserListItem[];
      pagination?: PaginationMeta;
    }> => {
      const res = await usersApi.getUsers(params);
      const pagination =
        (res as unknown as { meta?: PaginationMeta }).meta || res.pagination;
      return {
        users: res.data || [],
        pagination,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch a single user's detailed profile, assigned role, and permissions
 */
export function useUserDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async (): Promise<UserDetail | null> => {
      if (!id) return null;
      const res = await usersApi.getUserById(id);
      return res.data || null;
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook to create a new user / employee with auto-generated secure password
 * Uses Direct Cache Prepend + Background Invalidation for 0-latency UI insertion
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateUserInput): Promise<CreatedUserResponse> => {
      const res = await usersApi.createUser(payload);
      if (!res.data) {
        throw new Error("Failed to create user: No response data");
      }
      return res.data;
    },
    onSuccess: (newUser) => {
      toast.success(`User "${newUser.name}" created successfully.`);

      // ── 1. Direct Cache Prepend for Instant Zero-Latency UI Insertion ──
      queryClient.setQueriesData(
        { queryKey: queryKeys.users.all },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          if ("users" in old && Array.isArray((old as { users: UserListItem[] }).users)) {
            const data = old as {
              users: UserListItem[];
              pagination?: { total: number; page: number; limit: number; totalPages: number };
            };

            const userItem: UserListItem = {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              avatar: newUser.avatar,
              roleId: newUser.roleId,
              isActive: newUser.isActive,
              isVerified: newUser.isVerified,
              lastLoginAt: null,
              lastAuthMethod: null,
              createdAt: newUser.createdAt,
              updatedAt: newUser.updatedAt,
              role: newUser.role,
            };

            return {
              ...data,
              users: [userItem, ...data.users],
              pagination: data.pagination
                ? {
                    ...data.pagination,
                    total: data.pagination.total + 1,
                    totalPages: Math.ceil((data.pagination.total + 1) / data.pagination.limit),
                  }
                : undefined,
            };
          }
          return old;
        }
      );

      // ── 2. Direct Cache Update for Roles List (User Count Counter) ──
      queryClient.setQueryData(
        queryKeys.roles.list(),
        (oldRoles: Role[] | undefined) => {
          if (!oldRoles || !Array.isArray(oldRoles)) return oldRoles;
          return oldRoles.map((role) =>
            role.name === newUser.role?.name || role.id === newUser.roleId
              ? { ...role, userCount: (role.userCount || 0) + 1 }
              : role
          );
        }
      );

      // ── 3. Active Background Revalidation ──
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to create user account.");
    },
  });
}

/**
 * Hook to update user profile information (name, email, avatar)
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserInput;
    }): Promise<UserListItem> => {
      const res = await usersApi.updateUser(userId, payload);
      if (!res.data) {
        throw new Error("Failed to update user profile: No response data");
      }
      return res.data;
    },
    onSuccess: (updatedUser) => {
      toast.success(`Profile for "${updatedUser.name}" updated successfully.`);

      // ── Direct cache update for instant UI feedback ──
      queryClient.setQueriesData(
        { queryKey: queryKeys.users.all },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          if ("users" in old && Array.isArray((old as { users: UserListItem[] }).users)) {
            const data = old as { users: UserListItem[] };
            return {
              ...data,
              users: data.users.map((u) =>
                u.id === updatedUser.id ? { ...u, ...updatedUser } : u
              ),
            };
          }
          return old;
        }
      );

      queryClient.setQueryData(
        queryKeys.users.detail(updatedUser.id),
        (old: UserDetail | null | undefined) => {
          if (!old) return old;
          return { ...old, ...updatedUser };
        }
      );

      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to update user profile.");
    },
  });
}

/**
 * Hook to update a user's assigned role (triggers NIST privilege checks & cache cascades)
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserRoleInput;
    }): Promise<UserListItem> => {
      const res = await usersApi.updateUserRole(userId, payload);
      if (!res.data) {
        throw new Error("Failed to update user role: No response data");
      }
      return res.data;
    },
    onSuccess: (updatedUser) => {
      toast.success(
        `User "${updatedUser.name}" role updated to ${updatedUser.role.name}.`
      );

      let prevRoleId: string | undefined;

      // ── 1. Direct cache update on Users List ──
      queryClient.setQueriesData(
        { queryKey: queryKeys.users.all },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          if ("users" in old && Array.isArray((old as { users: UserListItem[] }).users)) {
            const data = old as { users: UserListItem[] };
            const existing = data.users.find((u) => u.id === updatedUser.id);
            if (existing) {
              prevRoleId = existing.roleId || existing.role?.id;
            }
            return {
              ...data,
              users: data.users.map((u) =>
                u.id === updatedUser.id ? { ...u, ...updatedUser } : u
              ),
            };
          }
          return old;
        }
      );

      // ── 2. Direct cache update on User Detail ──
      queryClient.setQueryData(
        queryKeys.users.detail(updatedUser.id),
        (old: UserDetail | null | undefined) => {
          if (!old) return old;
          if (!prevRoleId) {
            prevRoleId = old.roleId || old.role?.id;
          }
          return {
            ...old,
            roleId: updatedUser.roleId,
            role: updatedUser.role,
          };
        }
      );

      // ── 3. Direct Cache Update for Roles List (Adjust counters immediately in 0ms) ──
      queryClient.setQueryData(
        queryKeys.roles.list(),
        (oldRoles: Role[] | undefined) => {
          if (!oldRoles || !Array.isArray(oldRoles)) return oldRoles;
          return oldRoles.map((r) => {
            // Increment new role
            if (r.id === updatedUser.roleId || r.name === updatedUser.role?.name) {
              return { ...r, userCount: (r.userCount || 0) + 1 };
            }
            // Decrement old role
            if (prevRoleId && (r.id === prevRoleId || r.name !== updatedUser.role?.name)) {
              if (r.id === prevRoleId) {
                return { ...r, userCount: Math.max(0, (r.userCount || 0) - 1) };
              }
            }
            return r;
          });
        }
      );

      // ── 4. Active Background Revalidation (Triggers actual network refetch) ──
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to update user role.");
    },
  });
}

/**
 * Hook to activate or deactivate a user account
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserStatusInput;
    }): Promise<UserListItem> => {
      const res = await usersApi.updateUserStatus(userId, payload);
      if (!res.data) {
        throw new Error("Failed to update user status: No response data");
      }
      return res.data;
    },
    onSuccess: (updatedUser) => {
      toast.success(
        `User "${updatedUser.name}" ${
          updatedUser.isActive ? "activated" : "deactivated"
        } successfully.`
      );

      // ── Direct cache update ──
      queryClient.setQueriesData(
        { queryKey: queryKeys.users.all },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          if ("users" in old && Array.isArray((old as { users: UserListItem[] }).users)) {
            const data = old as { users: UserListItem[] };
            return {
              ...data,
              users: data.users.map((u) =>
                u.id === updatedUser.id ? { ...u, ...updatedUser } : u
              ),
            };
          }
          return old;
        }
      );

      queryClient.setQueryData(
        queryKeys.users.detail(updatedUser.id),
        (old: UserDetail | null | undefined) => {
          if (!old) return old;
          return { ...old, isActive: updatedUser.isActive };
        }
      );

      // ── Active Background Revalidation ──
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to update user status.");
    },
  });
}
