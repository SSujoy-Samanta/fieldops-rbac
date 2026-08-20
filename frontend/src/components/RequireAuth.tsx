"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { LoadingState } from "@/components/shared/LoadingState";

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && !user) {
      const queryString = searchParams?.toString();
      const currentPath = queryString ? `${pathname}?${queryString}` : pathname;

      // Preserve return destination for seamless login return
      if (typeof window !== "undefined" && currentPath) {
        sessionStorage.setItem("fieldops_return_to", currentPath);
      }

      const returnTo = encodeURIComponent(currentPath || "/overview");
      router.push(`/login?returnTo=${returnTo}`);
    }
  }, [user, isLoading, error, pathname, searchParams, router]);

  if (isLoading) {
    return (
      fallback || (
        <LoadingState
          text="Authenticating Session"
          subtext="Verifying NIST Level 2 workspace credentials…"
          minHeight="min-h-screen"
        />
      )
    );
  }

  if (!user) {
    return (
      <LoadingState
        text="Redirecting to Login"
        subtext="Workspace authentication required"
        minHeight="min-h-screen"
      />
    );
  }

  return <>{children}</>;
}

export default RequireAuth;
