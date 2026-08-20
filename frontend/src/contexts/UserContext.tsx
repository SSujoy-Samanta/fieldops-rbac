"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { authApi } from "@/lib/api";
import type { AuthUser } from "@/types/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface UserContextState {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  setUser: (user: AuthUser | null) => void;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextState | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      try {
        const res = await authApi.getMe();
        return res.data?.user || null;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const setUser = useCallback(
    (user: AuthUser | null) => {
      queryClient.setQueryData(["user", "me"], user);
    },
    [queryClient]
  );

  const value = useMemo(
    () => ({
      user: data || null,
      isLoading,
      error: error as Error | null,
      setUser,
      refetchUser: async () => {
        await refetch();
      },
    }),
    [data, isLoading, error, setUser, refetch]
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
