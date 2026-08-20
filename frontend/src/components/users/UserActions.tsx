"use client";

import React from "react";
import {
  MoreHorizontal,
  Eye,
  ShieldCheck,
  Power,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserListItem } from "@/types/user";
import { SYSTEM_ROLE } from "@/types/rbac";
import { toast } from "sonner";

interface UserActionsProps {
  user: UserListItem;
  currentUserId?: string;
  currentUserRole?: SYSTEM_ROLE;
  onViewDetails: (user: UserListItem) => void;
  onChangeRole: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
}

export function UserActions({
  user,
  currentUserId,
  currentUserRole,
  onViewDetails,
  onChangeRole,
  onToggleStatus,
}: UserActionsProps) {
  const isCurrentUser = user.id === currentUserId;
  const isActorOwner = currentUserRole === SYSTEM_ROLE.OWNER;
  const isActorManager = currentUserRole === SYSTEM_ROLE.MANAGER;
  const isTargetOwner = user.role?.name === SYSTEM_ROLE.OWNER;
  const isTargetManager = user.role?.name === SYSTEM_ROLE.MANAGER;

  // NIST Hierarchical Visibility & Modification Rules:
  // - Owners have full inspection and management privilege across all tiers.
  // - Any user can inspect their own profile.
  // - Managers can ONLY inspect and manage lower roles (FIELD_EMPLOYEE).
  // - Managers CANNOT inspect, reassign, or deactivate Owners or peer Managers.
  const canViewDetails =
    isCurrentUser || isActorOwner || (isActorManager && !isTargetOwner && !isTargetManager);

  const canModifyRole =
    !isCurrentUser && (isActorOwner || (isActorManager && !isTargetOwner && !isTargetManager));

  const canModifyStatus =
    !isCurrentUser && (isActorOwner || (isActorManager && !isTargetOwner && !isTargetManager));

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user.email);
    toast.success("Email copied to clipboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 ml-auto items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
            Workforce Operations
          </DropdownMenuLabel>

          {/* View Details */}
          {canViewDetails && (
            <DropdownMenuItem
              onClick={() => onViewDetails(user)}
              className="cursor-pointer rounded-lg text-xs font-medium py-2 gap-2"
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span>View Profile & RBAC</span>
            </DropdownMenuItem>
          )}

          {/* Copy Email */}
          <DropdownMenuItem
            onClick={handleCopyEmail}
            className="cursor-pointer rounded-lg text-xs font-medium py-2 gap-2"
          >
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Copy Email Address</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {(canModifyRole || canModifyStatus) && <DropdownMenuSeparator />}

        {(canModifyRole || canModifyStatus) && (
          <DropdownMenuGroup>
            {/* Change Role */}
            {canModifyRole && (
              <DropdownMenuItem
                onClick={() => onChangeRole(user)}
                className="cursor-pointer rounded-lg text-xs font-medium py-2 gap-2 text-indigo-600 dark:text-indigo-400 focus:bg-indigo-500/10"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Change Assigned Role</span>
              </DropdownMenuItem>
            )}

            {/* Toggle Status */}
            {canModifyStatus && (
              <DropdownMenuItem
                onClick={() => onToggleStatus(user)}
                className={`cursor-pointer rounded-lg text-xs font-medium py-2 gap-2 ${
                  user.isActive
                    ? "text-rose-600 dark:text-rose-400 focus:bg-rose-500/10"
                    : "text-emerald-600 dark:text-emerald-400 focus:bg-emerald-500/10"
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                <span>{user.isActive ? "Deactivate Account" : "Activate Account"}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserActions;
