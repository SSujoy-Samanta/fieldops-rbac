import React from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { RequireAuth } from "@/components/RequireAuth";
import { PermissionProvider } from "@/contexts/PermissionContext";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <PermissionProvider>
        <DashboardShell>{children}</DashboardShell>
      </PermissionProvider>
    </RequireAuth>
  );
}
