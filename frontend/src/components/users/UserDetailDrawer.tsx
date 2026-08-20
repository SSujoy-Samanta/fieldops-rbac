"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Power,
} from "lucide-react";
import { useUserDetail } from "@/hooks/useUsers";
import type { UserListItem } from "@/types/user";
import { SYSTEM_ROLE } from "@/types/rbac";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserDetailDrawerProps {
  user: UserListItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  currentUserRole?: SYSTEM_ROLE;
  onChangeRole: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
}

export function UserDetailDrawer({
  user,
  isOpen,
  onClose,
  currentUserId,
  currentUserRole,
  onChangeRole,
  onToggleStatus,
}: UserDetailDrawerProps) {
  const { data: detail, isLoading } = useUserDetail(user?.id || "");
  const [copied, setCopied] = React.useState(false);

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const isOwner = user.role?.name === SYSTEM_ROLE.OWNER;
  const isManager = user.role?.name === SYSTEM_ROLE.MANAGER;

  const isCurrentUser = user.id === currentUserId;
  const isActorOwner = currentUserRole === SYSTEM_ROLE.OWNER;
  const isActorManager = currentUserRole === SYSTEM_ROLE.MANAGER;
  const isTargetOwner = user.role?.name === SYSTEM_ROLE.OWNER;
  const isTargetManager = user.role?.name === SYSTEM_ROLE.MANAGER;

  // NIST Rule: Managers cannot modify Owners or other Managers. Only Owners have full privilege.
  const canModifyRole =
    !isCurrentUser && (isActorOwner || (isActorManager && !isTargetOwner && !isTargetManager));
  const canModifyStatus =
    !isCurrentUser && (isActorOwner || (isActorManager && !isTargetOwner && !isTargetManager));

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    toast.success("User ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background border-l border-border/80 overflow-hidden"
      >
        {/* ── Top Brand Gradient Bar ───────────────────────────────── */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500/40 via-orange-500 to-amber-500/40 shrink-0" />

        {/* ── Drawer Header ────────────────────────────────────────────── */}
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/20 flex flex-col gap-4 text-left">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-orange-500/40 shadow-sm shrink-0">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback className="bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {user.isActive && (
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <SheetTitle className="text-lg font-black text-foreground truncate">
                {user.name}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground truncate">
                {user.email}
              </SheetDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider uppercase font-mono",
                    isOwner
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : isManager
                      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  )}
                >
                  {user.role?.name || "FIELD_EMPLOYEE"}
                </Badge>

                {user.isActive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 dark:text-rose-400">
                    <XCircle className="h-3 w-3" />
                    <span>Deactivated</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* ── Drawer Body ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Card */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 flex flex-col gap-3 text-xs">
            <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              Account Metadata
            </span>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">User ID</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center gap-1.5 font-mono text-[11px] text-foreground hover:text-orange-500 transition-colors cursor-pointer"
              >
                <span>{user.id}</span>
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Account Created</span>
              <span className="font-medium text-foreground">
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Session Activity</span>
              <span className="font-medium text-foreground">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Never"}
              </span>
            </div>
          </div>

          {/* Effective Permissions Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                Effective NIST RBAC Permissions
              </span>
              {isLoading ? (
                <Skeleton className="h-5 w-20 rounded" />
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono bg-muted/60 text-muted-foreground border-border/60"
                >
                  {detail?.permissionKeys?.length || 0} Granted
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="rounded-xl border border-border/60 bg-card/40 p-3 divide-y divide-border/30">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-1.5 flex-1">
                      <Skeleton className="h-3.5 w-32 rounded" />
                      <Skeleton className="h-2.5 w-24 rounded" />
                    </div>
                    <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 bg-card/40 p-3 divide-y divide-border/30 max-h-64 overflow-y-auto">
                {detail?.permissions && detail.permissions.length > 0 ? (
                  detail.permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="py-2 flex items-center justify-between gap-2 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground">
                          {perm.name}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {perm.key}
                        </span>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    No active permissions granted.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Drawer Footer Actions ────────────────────────────────────── */}
        {(canModifyRole || canModifyStatus) && (
          <div className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 flex items-center gap-3 shrink-0">
            {canModifyRole && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  onChangeRole(user);
                }}
                className="h-10 flex-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Change Role</span>
              </Button>
            )}

            {canModifyStatus && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  onToggleStatus(user);
                }}
                className={cn(
                  "h-10 flex-1 rounded-lg border font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all",
                  user.isActive
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                )}
              >
                {user.isActive ? (
                  <>
                    <Power className="h-4 w-4 text-rose-500" />
                    <span>Deactivate</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Activate</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default UserDetailDrawer;
