"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user) {
      const returnToParam = searchParams.get("returnTo");
      const returnTo =
        returnToParam &&
        returnToParam.startsWith("/") &&
        !returnToParam.startsWith("//")
          ? returnToParam
          : "/overview";

      router.replace(returnTo);
    }
  }, [user, router, searchParams]);

  // If user is already authenticated, don't flash login UI while redirecting
  if (user) {
    return null;
  }

  return <>{children}</>;
}

export default GuestGuard;
