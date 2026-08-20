"use client";

import React, { useState, useMemo, useCallback } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import {
  PERMISSION_KEY,
  type Role,
  SYSTEM_ROLE,
  type PERMISSION_MODULE,
  type Permission,
} from "@/types/rbac";
import {
  useRoles,
  useAllPermissions,
  useUpdateRolePermissions,
} from "@/hooks/useRoles";
import { RoleCard } from "@/components/roles/RoleCard";
import { PermissionMatrix } from "@/components/roles/PermissionMatrix";
import { MatrixActionBar } from "@/components/roles/MatrixActionBar";
import { RoleDetailsDrawer } from "@/components/roles/RoleDetailsDrawer";
import { FullRolesPageSkeleton } from "@/components/roles/RolesSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Zap, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";

export function RolesManager() {
  return (
    <RequirePermission permission={PERMISSION_KEY.MANAGE_ROLES}>
      <RolesManagerContent />
    </RequirePermission>
  );
}

function RolesManagerContent() {
  const {
    data: roles = [],
    isLoading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useRoles();

  const {
    data: permissionsData,
    isLoading: permsLoading,
    error: permsError,
    refetch: refetchPerms,
  } = useAllPermissions();

  const updateMutation = useUpdateRolePermissions();

  // Local state for pending edits: roleId -> Set<PERMISSION_KEY>
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, Set<PERMISSION_KEY>>
  >({});
  const [selectedRoleForDrawer, setSelectedRoleForDrawer] =
    useState<Role | null>(null);

  const permissions = permissionsData?.permissions || [];
  const groupedPermissions =
    permissionsData?.grouped ||
    ({} as Record<PERMISSION_MODULE, Permission[]>);

  // Toggle permission handler
  const handleTogglePermission = useCallback(
    (role: Role, permissionKey: PERMISSION_KEY) => {
      if (role.name === SYSTEM_ROLE.OWNER) return; // OWNER is immutable

      setPendingChanges((prev) => {
        const currentSet =
          prev[role.id] !== undefined
            ? new Set(prev[role.id])
            : new Set(role.permissionKeys);

        if (currentSet.has(permissionKey)) {
          currentSet.delete(permissionKey);
        } else {
          currentSet.add(permissionKey);
        }

        return {
          ...prev,
          [role.id]: currentSet,
        };
      });
    },
    []
  );

  // Calculate total diff count across all roles
  const diffCount = useMemo(() => {
    let diffs = 0;
    roles.forEach((role) => {
      const edited = pendingChanges[role.id];
      if (!edited) return;

      const originalSet = new Set(role.permissionKeys);

      // Added permissions
      edited.forEach((p) => {
        if (!originalSet.has(p)) diffs += 1;
      });

      // Removed permissions
      originalSet.forEach((p) => {
        if (!edited.has(p)) diffs += 1;
      });
    });
    return diffs;
  }, [roles, pendingChanges]);

  // Discard all pending changes
  const handleDiscard = useCallback(() => {
    setPendingChanges({});
    toast.info("Unsaved matrix changes discarded.");
  }, []);

  // Save all modified roles
  const handleSave = async () => {
    const rolesToUpdate = roles.filter((role) => {
      const edited = pendingChanges[role.id];
      if (!edited) return false;
      const originalSet = new Set(role.permissionKeys);
      if (edited.size !== originalSet.size) return true;
      for (const p of edited) {
        if (!originalSet.has(p)) return true;
      }
      return false;
    });

    if (rolesToUpdate.length === 0) {
      setPendingChanges({});
      return;
    }

    try {
      for (const role of rolesToUpdate) {
        const newKeys = Array.from(
          pendingChanges[role.id] || role.permissionKeys
        );
        await updateMutation.mutateAsync({
          roleId: role.id,
          payload: {
            permissionKeys: newKeys,
          },
        });
      }
      setPendingChanges({});
    } catch {
      // Error is handled in mutation onError
    }
  };

  // Loading state
  if (rolesLoading || permsLoading) {
    return <FullRolesPageSkeleton />;
  }

  // Error state
  if (rolesError || permsError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-destructive/30 bg-destructive/5 space-y-4 max-w-lg mx-auto mt-8">
        <div className="p-3 rounded-2xl bg-destructive/15 text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">
            Failed to Load Policy Matrix
          </h3>
          <p className="text-xs text-muted-foreground">
            {(rolesError as Error)?.message ||
              (permsError as Error)?.message ||
              "Could not communicate with the NIST RBAC policy service."}
          </p>
        </div>
        <Button
          onClick={() => {
            refetchRoles();
            refetchPerms();
          }}
          className="rounded-xl font-bold text-xs cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20 animate-fade-up">
      {/* ── Page Header Card ───────────────────────────────────────── */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 sm:p-8 rounded-3xl border border-border/70 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-card/70 backdrop-blur-2xl shadow-xs">
        {/* Decorative background ambient glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Security Governance
            </span>
            <Badge
              variant="outline"
              className="text-[10px] font-mono font-bold bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 py-0.5 px-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              NIST Level 2 Constrained RBAC
            </Badge>
          </div>

          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight"
            style={{ fontFamily: "var(--font-righteous), cursive" }}
          >
            Roles & <span className="text-orange-500">Access Policies</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Configure role boundaries, operational floors, and privilege escalation guards.
          </p>
        </div>

        {/* Single clean status badge */}
        <div className="relative z-10 shrink-0 self-start sm:self-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 text-xs font-bold text-orange-600 dark:text-orange-400 shadow-2xs backdrop-blur-md">
            <Zap className="h-4 w-4 text-orange-500 shrink-0" />
            <span>Zero-Stale Cache Invalidation</span>
          </div>
        </div>
      </div>

      {/* ── Role Overview Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            totalPermissions={permissions.length}
            onSelectRole={(r) => setSelectedRoleForDrawer(r)}
            isSelected={selectedRoleForDrawer?.id === role.id}
          />
        ))}
      </div>

      {/* ── Interactive Permission Matrix Grid ──────────────────────── */}
      <PermissionMatrix
        roles={roles}
        permissions={permissions}
        groupedPermissions={groupedPermissions}
        pendingChanges={pendingChanges}
        onTogglePermission={handleTogglePermission}
      />

      {/* ── Floating Matrix Action Bar (when changes are pending) ──── */}
      <MatrixActionBar
        changeCount={diffCount}
        isSaving={updateMutation.isPending}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />

      {/* ── Role Details Drawer ──────────────────────────────────────── */}
      <RoleDetailsDrawer
        role={selectedRoleForDrawer}
        isOpen={Boolean(selectedRoleForDrawer)}
        onClose={() => setSelectedRoleForDrawer(null)}
        allPermissions={permissions}
      />
    </div>
  );
}

export default RolesManager;
