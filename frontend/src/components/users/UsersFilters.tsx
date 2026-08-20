"use client";

import React from "react";
import {
  Search,
  X,
  UserPlus,
  Filter,
  ShieldCheck,
  Crown,
  User,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SYSTEM_ROLE } from "@/types/rbac";
import { cn } from "@/lib/utils";

interface UsersFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedRole?: SYSTEM_ROLE;
  onRoleChange: (role?: SYSTEM_ROLE) => void;
  selectedStatus?: boolean;
  onStatusChange: (status?: boolean) => void;
  onOpenCreateModal: () => void;
  canCreateUser: boolean;
  isSearching?: boolean;
}

export function UsersFilters({
  search,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onOpenCreateModal,
  canCreateUser,
  isSearching = false,
}: UsersFiltersProps) {
  const activeFiltersCount =
    (selectedRole ? 1 : 0) + (selectedStatus !== undefined ? 1 : 0);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl">
      {/* ── Search Input & Filter Pills ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search staff by name or email…"
            className="pl-9 pr-8 h-10 text-xs sm:text-sm rounded-lg bg-background/80 border-border/60 focus:border-orange-500/50"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isSearching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
            ) : search ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                aria-label="Clear search query"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/60 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => onRoleChange(undefined)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap",
              !selectedRole
                ? "bg-orange-500 text-white font-bold shadow-sm shadow-orange-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
            )}
          >
            All Roles
          </button>
          <button
            type="button"
            onClick={() => onRoleChange(SYSTEM_ROLE.OWNER)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap",
              selectedRole === SYSTEM_ROLE.OWNER
                ? "bg-amber-500 text-white font-bold shadow-sm shadow-amber-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
            )}
          >
            <Crown className="h-3 w-3" />
            <span>Owner</span>
          </button>
          <button
            type="button"
            onClick={() => onRoleChange(SYSTEM_ROLE.MANAGER)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap",
              selectedRole === SYSTEM_ROLE.MANAGER
                ? "bg-indigo-500 text-white font-bold shadow-sm shadow-indigo-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
            )}
          >
            <ShieldCheck className="h-3 w-3" />
            <span>Manager</span>
          </button>
          <button
            type="button"
            onClick={() => onRoleChange(SYSTEM_ROLE.FIELD_EMPLOYEE)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap",
              selectedRole === SYSTEM_ROLE.FIELD_EMPLOYEE
                ? "bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
            )}
          >
            <User className="h-3 w-3" />
            <span>Field Staff</span>
          </button>
        </div>
      </div>

      {/* ── Status Dropdown & Add User CTA ───────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Status Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "inline-flex items-center justify-center gap-1.5 h-10 px-3 text-xs font-semibold rounded-lg border border-border/60 bg-background hover:bg-muted/80 text-foreground cursor-pointer transition-all outline-none",
              selectedStatus !== undefined &&
                "border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>
              {selectedStatus === true
                ? "Active Only"
                : selectedStatus === false
                ? "Deactivated"
                : "All Status"}
            </span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ml-0.5">
                {activeFiltersCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1">
                Account Status
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onStatusChange(undefined)}
                className={cn(
                  "cursor-pointer rounded-lg text-xs font-medium py-2",
                  selectedStatus === undefined && "bg-muted font-bold text-foreground"
                )}
              >
                All Accounts
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(true)}
                className={cn(
                  "cursor-pointer rounded-lg text-xs font-medium py-2 gap-2 text-emerald-600 dark:text-emerald-400",
                  selectedStatus === true && "bg-emerald-500/10 font-bold"
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Active Accounts</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(false)}
                className={cn(
                  "cursor-pointer rounded-lg text-xs font-medium py-2 gap-2 text-rose-600 dark:text-rose-400",
                  selectedStatus === false && "bg-rose-500/10 font-bold"
                )}
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Deactivated Accounts</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Create Member Button */}
        {canCreateUser && (
          <Button
            type="button"
            onClick={onOpenCreateModal}
            className="h-10 px-4 text-xs sm:text-sm font-bold rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 cursor-pointer active:scale-95 transition-all"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            <span>Add Member</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default UsersFilters;
