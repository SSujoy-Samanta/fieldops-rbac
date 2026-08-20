"use client";

import React, { useState, useMemo } from "react";
import type { Role, Permission } from "@/types/rbac";
import { SYSTEM_ROLE, PERMISSION_MODULE, PERMISSION_KEY } from "@/types/rbac";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CalendarCheck,
  MapPin,
  Users,
  ShieldCheck,
  Search,
  Lock,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";

// NIST Floor Constraints (Cannot be removed)
const ROLE_FLOOR_PERMISSIONS: Record<SYSTEM_ROLE, Set<PERMISSION_KEY>> = {
  [SYSTEM_ROLE.OWNER]: new Set(Object.values(PERMISSION_KEY)),
  [SYSTEM_ROLE.MANAGER]: new Set([
    PERMISSION_KEY.CLOCK_IN_OUT,
    PERMISSION_KEY.READ_SELF_ATTENDANCE,
  ]),
  [SYSTEM_ROLE.FIELD_EMPLOYEE]: new Set([
    PERMISSION_KEY.CLOCK_IN_OUT,
    PERMISSION_KEY.READ_SELF_ATTENDANCE,
  ]),
};

// NIST Ceiling Constraints (Allowed subset)
const ROLE_CEILING_PERMISSIONS: Record<SYSTEM_ROLE, Set<PERMISSION_KEY>> = {
  [SYSTEM_ROLE.OWNER]: new Set(Object.values(PERMISSION_KEY)),
  [SYSTEM_ROLE.MANAGER]: new Set([
    PERMISSION_KEY.CLOCK_IN_OUT,
    PERMISSION_KEY.READ_SELF_ATTENDANCE,
    PERMISSION_KEY.READ_ALL_ATTENDANCE,
    PERMISSION_KEY.SAVE_VISIT,
    PERMISSION_KEY.READ_SELF_VISIT,
    PERMISSION_KEY.READ_ALL_VISIT,
    PERMISSION_KEY.MANAGE_USERS,
  ]),
  [SYSTEM_ROLE.FIELD_EMPLOYEE]: new Set([
    PERMISSION_KEY.CLOCK_IN_OUT,
    PERMISSION_KEY.READ_SELF_ATTENDANCE,
    PERMISSION_KEY.SAVE_VISIT,
    PERMISSION_KEY.READ_SELF_VISIT,
  ]),
};

const MODULE_CONFIG = {
  [PERMISSION_MODULE.ATTENDANCE]: {
    label: "Attendance & Shifts",
    icon: CalendarCheck,
    badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  [PERMISSION_MODULE.VISITS]: {
    label: "Field Visits & Locations",
    icon: MapPin,
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  [PERMISSION_MODULE.USERS]: {
    label: "Staff & User Directory",
    icon: Users,
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  [PERMISSION_MODULE.ROLES]: {
    label: "RBAC & Security Policies",
    icon: ShieldCheck,
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
};

interface PermissionMatrixProps {
  roles: Role[];
  permissions: Permission[];
  groupedPermissions: Record<PERMISSION_MODULE, Permission[]>;
  pendingChanges: Record<string, Set<PERMISSION_KEY>>; // roleId -> current edited permission keys
  onTogglePermission: (role: Role, permissionKey: PERMISSION_KEY) => void;
}

export function PermissionMatrix({
  roles,
  permissions,
  groupedPermissions,
  pendingChanges,
  onTogglePermission,
}: PermissionMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");

  // Filtered grouped permissions
  const filteredGrouped = useMemo(() => {
    const result: Partial<Record<PERMISSION_MODULE, Permission[]>> = {};

    Object.entries(groupedPermissions).forEach(([modKey, perms]) => {
      const permModule = modKey as PERMISSION_MODULE;

      if (selectedModule !== "ALL" && selectedModule !== permModule) {
        return;
      }

      const matching = perms.filter((p) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.key.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
        );
      });

      if (matching.length > 0) {
        result[permModule] = matching;
      }
    });

    return result;
  }, [groupedPermissions, searchQuery, selectedModule]);

  return (
    <TooltipProvider delay={100}>
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
        {/* ── Filter & Search Toolbar ────────────────────────────────────── */}
        <div className="p-4 sm:p-6 border-b border-border/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2
              className="text-lg sm:text-xl font-black text-foreground tracking-tight"
              style={{ fontFamily: "var(--font-righteous), cursive" }}
            >
              Permission Matrix Grid
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure fine-grained module access with automatic NIST ceiling and floor enforcement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter permissions…"
                className="pl-9 h-9 text-xs rounded-lg bg-background/80 border-border/60"
              />
            </div>

            {/* Module Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/60 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedModule("ALL")}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  selectedModule === "ALL"
                    ? "bg-orange-500 text-white font-bold shadow-sm shadow-orange-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                )}
              >
                All
              </button>
              {Object.keys(groupedPermissions).map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setSelectedModule(mod)}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap",
                    selectedModule === mod
                      ? "bg-orange-500 text-white font-bold shadow-sm shadow-orange-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                  )}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Matrix Table ─────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/60">
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[320px]">
                  Permission Definition
                </TableHead>
                {roles.map((role) => (
                  <TableHead
                    key={role.id}
                    className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[160px]"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-extrabold text-foreground">{role.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {pendingChanges[role.id]
                          ? `${pendingChanges[role.id].size}/${permissions.length}`
                          : `${role.permissionKeys.length}/${permissions.length}`}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {Object.entries(filteredGrouped).map(([modKey, modulePerms]) => {
                const permModule = modKey as PERMISSION_MODULE;
                const modCfg = MODULE_CONFIG[permModule];
                const ModIcon = modCfg?.icon || ShieldCheck;

                return (
                  <React.Fragment key={permModule}>
                    {/* Module Category Row */}
                    <TableRow className="bg-muted/20 hover:bg-muted/30 border-b border-border/40">
                      <TableCell
                        colSpan={roles.length + 1}
                        className="px-6 py-2.5 font-bold text-xs text-foreground"
                      >
                        <div className="flex items-center gap-2">
                          <ModIcon className="h-4 w-4 text-orange-500" />
                          <span>{modCfg?.label || permModule}</span>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] ml-1 font-mono", modCfg?.badgeColor)}
                          >
                            {modulePerms?.length || 0} permissions
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Permission Rows */}
                    {modulePerms?.map((perm) => (
                      <TableRow
                        key={perm.id}
                        className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                      >
                        {/* Permission Description */}
                        <TableCell className="px-6 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-foreground">
                                {perm.name}
                              </span>
                              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {perm.key}
                              </span>
                            </div>
                            {perm.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Role Checkbox Cells */}
                        {roles.map((role) => {
                          const isOwner = role.name === SYSTEM_ROLE.OWNER;
                          const roleFloors = ROLE_FLOOR_PERMISSIONS[role.name] || new Set();
                          const roleCeilings = ROLE_CEILING_PERMISSIONS[role.name] || new Set();

                          const isFloor = roleFloors.has(perm.key);
                          const isCeilingBlocked = !roleCeilings.has(perm.key);

                          // Effective state in current edit session
                          const currentSet =
                            pendingChanges[role.id] || new Set(role.permissionKeys);
                          const isChecked = isOwner || currentSet.has(perm.key);

                          // Was this cell modified in current session?
                          const originalHas = role.permissionKeys.includes(perm.key);
                          const isModified = !isOwner && currentSet.has(perm.key) !== originalHas;

                          return (
                            <TableCell
                              key={role.id}
                              className={cn(
                                "px-6 py-3.5 text-center transition-colors",
                                isModified && "bg-orange-500/10 dark:bg-orange-500/15"
                              )}
                            >
                              <div className="flex items-center justify-center">
                                {isOwner ? (
                                  <Tooltip>
                                    <TooltipTrigger className="cursor-not-allowed flex items-center justify-center gap-1">
                                      <Checkbox checked={true} disabled className="opacity-80 cursor-not-allowed pointer-events-none" />
                                      <Lock className="h-3 w-3 text-amber-500/80 ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-semibold text-xs">
                                        OWNER role is immutable & holds all permissions.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : isFloor ? (
                                  <Tooltip>
                                    <TooltipTrigger className="cursor-not-allowed flex items-center justify-center gap-1">
                                      <Checkbox checked={true} disabled className="opacity-90 cursor-not-allowed pointer-events-none" />
                                      <Lock className="h-3 w-3 text-muted-foreground/80 ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-semibold text-xs">
                                        Operational Minimum Floor: Cannot be removed.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : isCeilingBlocked ? (
                                  <Tooltip>
                                    <TooltipTrigger className="cursor-not-allowed flex items-center justify-center gap-1 opacity-40">
                                      <Checkbox checked={false} disabled className="cursor-not-allowed pointer-events-none" />
                                      <Ban className="h-3 w-3 text-destructive ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-semibold text-xs text-destructive">
                                        Ceiling Restriction: Excluded to prevent privilege escalation.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <div className="relative flex items-center justify-center">
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={() =>
                                        onTogglePermission(role, perm.key)
                                      }
                                      className={cn(
                                        "cursor-pointer transition-all duration-200",
                                        isModified &&
                                          "ring-2 ring-orange-500 ring-offset-2 scale-110"
                                      )}
                                    />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default PermissionMatrix;
