"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ShieldAlert,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useUpdateUserStatus } from "@/hooks/useUsers";
import type { UserListItem } from "@/types/user";
import { SYSTEM_ROLE } from "@/types/rbac";
import { cn } from "@/lib/utils";

interface UserStatusModalProps {
  user: UserListItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserStatusModal({
  user,
  isOpen,
  onClose,
}: UserStatusModalProps) {
  const { mutateAsync: updateStatus, isPending } = useUpdateUserStatus();

  if (!user) return null;

  const isDeactivating = user.isActive;
  const isOwner = user.role?.name === SYSTEM_ROLE.OWNER;

  const handleConfirm = async () => {
    try {
      await updateStatus({
        userId: user.id,
        payload: { isActive: !user.isActive },
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
          "w-[calc(100%-2rem)] sm:max-w-[480px] rounded-2xl p-0 overflow-hidden gap-0",
          "max-h-[92vh] flex flex-col border border-border/80 shadow-2xl bg-card"
        )}
      >
        {/* ── Top Brand Gradient Bar ───────────────────────────────── */}
        <div
          className={cn(
            "h-1.5 w-full bg-gradient-to-r shrink-0",
            isDeactivating
              ? "from-rose-500/40 via-rose-500 to-amber-500/40"
              : "from-emerald-500/40 via-emerald-500 to-teal-500/40"
          )}
        />

        {/* Live Preview Strip */}
        <div className="flex items-center gap-3 px-6 py-4 shrink-0 bg-muted/30 dark:bg-muted/10 border-b border-border/60">
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg text-white shadow-md shrink-0",
              isDeactivating
                ? "bg-rose-500 shadow-rose-500/30"
                : "bg-emerald-500 shadow-emerald-500/30"
            )}
          >
            {isDeactivating ? (
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              {isDeactivating ? "Account Suspension" : "Account Reactivation"}
            </p>
            <p className="text-sm font-black text-foreground truncate">
              {user.name}
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full border shrink-0",
              isDeactivating
                ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            )}
          >
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full animate-pulse",
                isDeactivating ? "bg-rose-500" : "bg-emerald-500"
              )}
            />
            <span className="text-[10px] font-bold uppercase tracking-tight">
              {isDeactivating ? "Active Now" : "Deactivated"}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          <DialogHeader className="p-0 space-y-1 text-left">
            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {isDeactivating ? (
                <>
                  Suspend <span className="text-rose-500">Access</span>
                </>
              ) : (
                <>
                  Activate <span className="text-emerald-500">Account</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              {isDeactivating
                ? `Are you sure you want to suspend system access for ${user.email}?`
                : `Re-enable workforce platform access for ${user.email}.`}
            </DialogDescription>
          </DialogHeader>

          {isDeactivating && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">Instant Session Invalidation</span>
                <span className="text-[11px] opacity-90 leading-relaxed">
                  Deactivating immediately revokes all active Redis tokens and halts ongoing shifts or scheduled visits.
                </span>
              </div>
            </div>
          )}

          {isOwner && isDeactivating && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
              <strong>Security Rule:</strong> If this is the last remaining active Organization Owner, the backend NIST policy will reject deactivation.
            </div>
          )}
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
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              "h-10 px-5 text-xs font-bold rounded-lg text-white shadow-md cursor-pointer transition-all active:scale-95",
              isDeactivating
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Processing…</span>
              </>
            ) : isDeactivating ? (
              "Confirm Suspension"
            ) : (
              "Confirm Activation"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserStatusModal;
