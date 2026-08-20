"use client";

import React from "react";
import type { Role, Permission } from "@/types/rbac";
import { SYSTEM_ROLE } from "@/types/rbac";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleDetailsDrawerProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  allPermissions: Permission[];
}

export function RoleDetailsDrawer({
  role,
  isOpen,
  onClose,
  allPermissions,
}: RoleDetailsDrawerProps) {
  if (!role) return null;

  const isOwner = role.name === SYSTEM_ROLE.OWNER;
  const isManager = role.name === SYSTEM_ROLE.MANAGER;

  const roleIcon = isOwner ? ShieldAlert : isManager ? ShieldCheck : Shield;

  const RoleIcon = roleIcon;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-6 overflow-y-auto bg-background/95 backdrop-blur-2xl border-l border-border/80">
        <SheetHeader className="space-y-3 pb-6 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                <RoleIcon className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-xl font-black text-foreground">
                  {role.name}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  NIST Level 2 Role Specification
                </SheetDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-mono font-bold uppercase",
                isOwner
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : isManager
                  ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              )}
            >
              {isOwner ? "Immutable" : "Configurable"}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground/90">
            {role.description || "System operational access control role."}
          </p>
        </SheetHeader>

        {/* ── Metadata Statistics ─────────────────────────────────────── */}
        <div className="py-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Active Staff
              </span>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-lg font-black text-foreground">
                  {role.userCount || 0}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Permissions
              </span>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span className="text-lg font-black text-foreground">
                  {role.permissionKeys.length} / {allPermissions.length}
                </span>
              </div>
            </div>
          </div>

          {/* ── Assigned Permissions List ──────────────────────────────── */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Assigned Permissions ({role.permissionKeys.length})
            </h4>

            <div className="space-y-2">
              {allPermissions
                .filter((p) => role.permissionKeys.includes(p.key))
                .map((perm) => (
                  <div
                    key={perm.id}
                    className="p-3 rounded-xl border border-border/40 bg-card/60 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground">
                        {perm.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {perm.key}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* ── JSON Policy Audit ──────────────────────────────────────── */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              JSON Policy Export
            </h4>
            <pre className="p-3 rounded-xl bg-muted/50 border border-border/60 text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-48">
              {JSON.stringify(
                {
                  id: role.id,
                  name: role.name,
                  isImmutable: isOwner,
                  permissions: role.permissionKeys,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default RoleDetailsDrawer;
