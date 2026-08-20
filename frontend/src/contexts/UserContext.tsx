"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { AuthUser } from "@/types/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface UserContextState {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  setUser: (user: AuthUser | null) => void;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextState | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isOAuthCallback = Boolean(
    pathname?.includes("/auth/google/callback") || pathname?.includes("/callback")
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: async () => {
      try {
        const res = await authApi.getMe();
        return res.data?.user || null;
      } catch (err) {
        // Return null for unauthenticated guests without throwing errors
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          return null;
        }
        return null;
      }
    },
    enabled: !isOAuthCallback, // Do not trigger /auth/me during OAuth handshake!
    retry: false,
    // Only cache authenticated user data for 5 minutes.
    // Unauthenticated (null) state is marked stale immediately (0ms) so login refetches instantly.
    staleTime: (query) => (query.state.data ? 1000 * 60 * 5 : 0),
    gcTime: 1000 * 60 * 15,
  });

  const setUser = useCallback(
    (user: AuthUser | null) => {
      queryClient.setQueryData(queryKeys.auth.session(), user);
      if (user) {
        // Invalidate and refetch RBAC permissions and session-scoped queries immediately
        queryClient.invalidateQueries({ queryKey: queryKeys.rbac.all });
      } else {
        // Completely clear the query cache on logout so no stale role/permissions leak
        queryClient.clear();
      }
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue cleanup even if server is unreachable
    } finally {
      queryClient.setQueryData(queryKeys.auth.session(), null);
      queryClient.clear();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("fieldops_return_to");
      }
    }
  }, [queryClient]);

  const value = useMemo<UserContextState>(
    () => ({
      user: data || null,
      isLoading,
      error: error as Error | null,
      setUser,
      refetchUser: async () => {
        await refetch();
      },
      logout,
    }),
    [data, isLoading, error, setUser, refetch, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export default UserContext;
