"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  ShieldCheck,
  User,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import type { UserListItem, PaginationMeta } from "@/types/user";
import { SYSTEM_ROLE } from "@/types/rbac";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { UserRowSkeleton } from "./UsersSkeleton";
import { UserActions } from "./UserActions";
import { cn } from "@/lib/utils";

interface UsersTableProps {
  users: UserListItem[];
  pagination?: PaginationMeta;
  currentPage: number;
  onPageChange: (page: number) => void;
  currentUserId?: string;
  currentUserRole?: SYSTEM_ROLE;
  onViewDetails: (user: UserListItem) => void;
  onChangeRole: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isLoading?: boolean;
}

const ROLE_BADGES: Record<
  SYSTEM_ROLE,
  { label: string; icon: React.ComponentType<{ className?: string }>; style: string }
> = {
  [SYSTEM_ROLE.OWNER]: {
    label: "Owner",
    icon: Crown,
    style:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  [SYSTEM_ROLE.MANAGER]: {
    label: "Manager",
    icon: ShieldCheck,
    style:
      "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  },
  [SYSTEM_ROLE.FIELD_EMPLOYEE]: {
    label: "Field Staff",
    icon: User,
    style:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
};

function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Never";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UsersTable({
  users,
  pagination,
  currentPage,
  onPageChange,
  currentUserId,
  currentUserRole,
  onViewDetails,
  onChangeRole,
  onToggleStatus,
  onClearFilters,
  hasActiveFilters,
  isLoading = false,
}: UsersTableProps) {
  if (!isLoading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl border border-dashed border-border/80 bg-card/40 backdrop-blur-xl text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 mb-4 shadow-sm">
          <Users className="h-8 w-8" />
        </div>
        <h3
          className="text-lg sm:text-xl font-bold text-foreground tracking-tight"
          style={{ fontFamily: "var(--font-righteous), cursive" }}
        >
          No Staff Members Found
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1 mb-6">
          {hasActiveFilters
            ? "No users matched your search and filter criteria. Try broadening your query."
            : "Your organization workforce directory is currently empty."}
        </p>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="rounded-lg text-xs font-semibold cursor-pointer border-border/60 hover:bg-muted"
          >
            Reset Filters
          </Button>
        )}
      </div>
    );
  }

  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || users.length;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden flex flex-col">
      {/* ── Table (Desktop & Tablet) ─────────────────────────────────── */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 border-b border-border/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Staff Member
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Role & Tiers
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Last Activity
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <UserRowSkeleton key={i} />
              ))
            ) : (
              users.map((user) => {
              const initials = user.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "U";

              const roleConfig =
                ROLE_BADGES[user.role?.name as SYSTEM_ROLE] ||
                ROLE_BADGES[SYSTEM_ROLE.FIELD_EMPLOYEE];
              const RoleIcon = roleConfig.icon;
              const isCurrentUser = user.id === currentUserId;

              return (
                <TableRow
                  key={user.id}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  {/* User Profile Info */}
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-orange-500/30 shrink-0">
                          {user.avatar && (
                            <AvatarImage src={user.avatar} alt={user.name} />
                          )}
                          <AvatarFallback className="bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[200px]">
                            {user.name}
                          </span>
                          {isCurrentUser && (
                            <Badge
                              variant="outline"
                              className="text-[9px] font-bold px-1.5 py-0 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 uppercase tracking-wider"
                            >
                              You
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role Badge */}
                  <TableCell className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border tracking-wide uppercase font-mono",
                        roleConfig.style
                      )}
                    >
                      <RoleIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>{roleConfig.label}</span>
                    </Badge>
                  </TableCell>

                  {/* Account Status */}
                  <TableCell className="px-6 py-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 dark:text-rose-400">
                        <XCircle className="h-4 w-4" />
                        <span>Deactivated</span>
                      </span>
                    )}
                  </TableCell>

                  {/* Last Activity */}
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-foreground">
                        {formatRelativeTime(user.lastLoginAt)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Joined {new Date(user.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end">
                      <UserActions
                        user={user}
                        currentUserId={currentUserId}
                        currentUserRole={currentUserRole}
                        onViewDetails={onViewDetails}
                        onChangeRole={onChangeRole}
                        onToggleStatus={onToggleStatus}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            }))}
          </TableBody>
        </Table>
      </div>

      {/* ── Table Footer & Pagination ─────────────────────────────────── */}
      <DataTablePagination
        page={currentPage}
        limit={pagination?.limit || 10}
        total={total}
        totalPages={totalPages}
        onPageChange={onPageChange}
        entityName="workforce member"
      />
    </div>
  );
}

export default UsersTable;
