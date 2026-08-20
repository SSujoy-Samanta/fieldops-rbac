"use client";

import React from "react";
import Link from "next/link";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSION_KEY } from "@/types/rbac";
import { LoadingState } from "@/components/shared/LoadingState";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RequirePermissionProps {
  permission?: PERMISSION_KEY;
  anyPermissions?: PERMISSION_KEY[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export function RequirePermission({
  permission,
  anyPermissions,
  children,
  fallback,
  loadingFallback,
}: RequirePermissionProps) {
  const { can, canAny, isLoading } = usePermissions();

  if (isLoading) {
    return (
      loadingFallback || (
        <LoadingState
          text="Evaluating Permissions"
          subtext="Verifying NIST Level 2 access policies…"
          minHeight="min-h-[400px]"
        />
      )
    );
  }

  let hasAccess = true;
  if (permission && !can(permission)) {
    hasAccess = false;
  }
  if (anyPermissions && anyPermissions.length > 0 && !canAny(anyPermissions)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center rounded-3xl border border-destructive/30 bg-destructive/5 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl bg-destructive/10 text-destructive mb-4">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Your assigned role does not possess the required NIST RBAC permission to access this resource.
          </p>
          <Link
            href="/overview"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-6 rounded-xl border-border/80 hover:bg-muted"
            )}
          >
            Return to Overview
          </Link>
        </div>
      )
    );
  }

  return <>{children}</>;
}

export default RequirePermission;
