"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Crown,
  ShieldCheck,
  User,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { SYSTEM_ROLE } from "@/types/rbac";
import { useUpdateUserRole } from "@/hooks/useUsers";
import type { UserListItem } from "@/types/user";
import { cn } from "@/lib/utils";

interface UserRoleModalProps {
  user: UserListItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: SYSTEM_ROLE;
}

export function UserRoleModal({
  user,
  isOpen,
  onClose,
  currentUserRole,
}: UserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<SYSTEM_ROLE>(
    SYSTEM_ROLE.FIELD_EMPLOYEE
  );

  const { mutateAsync: updateRole, isPending } = useUpdateUserRole();

  useEffect(() => {
    if (user?.role?.name) {
      setSelectedRole(user.role.name);
    }
  }, [user]);

  if (!user) return null;

  const isOwner = currentUserRole === SYSTEM_ROLE.OWNER;
  const isTargetOwner = user.role?.name === SYSTEM_ROLE.OWNER;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === user.role?.name) {
      onClose();
      return;
    }

    try {
      await updateRole({
        userId: user.id,
        payload: { role: selectedRole },
      });
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "w-[calc(100%-2rem)] sm:max-w-[500px] rounded-2xl p-0 overflow-hidden gap-0",
          "max-h-[92vh] flex flex-col border border-border/80 shadow-2xl bg-card"
        )}
      >
        {/* ── Top Brand Gradient Bar ───────────────────────────────── */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500/40 via-indigo-500 to-sky-500/40 shrink-0" />

        {/* Live Preview Strip */}
        <div className="flex items-center gap-3 px-6 py-4 shrink-0 bg-muted/30 dark:bg-muted/10 border-b border-border/60">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500 text-white shadow-md shadow-indigo-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Role Reassignment
            </p>
            <p className="text-sm font-black text-foreground truncate">
              {user.name}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 shrink-0">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight font-mono">
              {user.role?.name || "FIELD_EMPLOYEE"}
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <DialogHeader className="p-0 space-y-1 text-left">
              <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Change <span className="text-indigo-500">Operational Role</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                Adjust fine-grained NIST RBAC access tiers for {user.email}.
              </DialogDescription>
            </DialogHeader>

            {/* Role Selection Options */}
            <div className="space-y-2.5">
              {/* Field Staff */}
              <button
                type="button"
                onClick={() => setSelectedRole(SYSTEM_ROLE.FIELD_EMPLOYEE)}
                className={cn(
                  "w-full flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all cursor-pointer",
                  selectedRole === SYSTEM_ROLE.FIELD_EMPLOYEE
                    ? "border-emerald-500/80 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-border/60 bg-card/40 hover:bg-muted/40"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500 shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-foreground">
                    Field Staff (Operator)
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Clock-in shifts, log field visits, and capture on-site job telemetry.
                  </span>
                </div>
              </button>

              {/* Operations Manager */}
              <button
                type="button"
                onClick={() => isOwner && setSelectedRole(SYSTEM_ROLE.MANAGER)}
                disabled={!isOwner}
                className={cn(
                  "w-full flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all",
                  isOwner ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                  selectedRole === SYSTEM_ROLE.MANAGER
                    ? "border-indigo-500/80 bg-indigo-500/10 ring-2 ring-indigo-500/20 shadow-xs"
                    : "border-border/60 bg-card/40 hover:bg-muted/40"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-500 shrink-0 mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      Operations Manager
                    </span>
                    {!isOwner && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                        Owner Only
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Supervise attendance records, verify field visits, audit shifts, and inspect reports.
                  </span>
                </div>
              </button>

              {/* Owner */}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setSelectedRole(SYSTEM_ROLE.OWNER)}
                  disabled={isTargetOwner}
                  className={cn(
                    "w-full flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all cursor-pointer",
                    selectedRole === SYSTEM_ROLE.OWNER
                      ? "border-amber-500/80 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-xs"
                      : "border-border/60 bg-card/40 hover:bg-muted/40",
                    isTargetOwner && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 shrink-0 mt-0.5">
                    <Crown className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-foreground">
                      Organization Owner
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Full NIST privilege over users, billing, permission schemas, and organization keys.
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Warning Note */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Role modifications take effect on the user&apos;s next request via JWT permission refresh.
              </p>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-4 sm:p-6 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || selectedRole === user.role?.name}
              className="h-10 px-5 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95 transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  <span>Updating Role…</span>
                </>
              ) : (
                <span>Save Role Assignment</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserRoleModal;
