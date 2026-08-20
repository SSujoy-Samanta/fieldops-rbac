"use client";

import React from "react";
import type { Role } from "@/types/rbac";
import { SYSTEM_ROLE } from "@/types/rbac";
import { Shield, ShieldAlert, ShieldCheck, Users, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  role: Role;
  totalPermissions: number;
  onSelectRole?: (role: Role) => void;
  isSelected?: boolean;
}

export function RoleCard({
  role,
  totalPermissions,
  onSelectRole,
  isSelected = false,
}: RoleCardProps) {
  const isOwner = role.name === SYSTEM_ROLE.OWNER;

  const roleMeta = {
    [SYSTEM_ROLE.OWNER]: {
      label: "System Superadmin",
      desc: "Full unrestricted access across all operational modules.",
      icon: ShieldAlert,
      themeColor: "from-amber-500/15 via-orange-500/5 to-transparent",
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      accentIcon: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      borderColor: isSelected
        ? "border-amber-500 ring-2 ring-amber-500/30"
        : "border-amber-500/30 hover:border-amber-500/60",
    },
    [SYSTEM_ROLE.MANAGER]: {
      label: "Operations Manager",
      desc: "Supervises team shifts, visits & staff directory.",
      icon: ShieldCheck,
      themeColor: "from-indigo-500/15 via-blue-500/5 to-transparent",
      badgeColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      accentIcon: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      borderColor: isSelected
        ? "border-indigo-500 ring-2 ring-indigo-500/30"
        : "border-indigo-500/30 hover:border-indigo-500/60",
    },
    [SYSTEM_ROLE.FIELD_EMPLOYEE]: {
      label: "Frontline Field Officer",
      desc: "Clock in/out shifts and log customer visits with GPS.",
      icon: Shield,
      themeColor: "from-emerald-500/15 via-teal-500/5 to-transparent",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      accentIcon: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      borderColor: isSelected
        ? "border-emerald-500 ring-2 ring-emerald-500/30"
        : "border-emerald-500/30 hover:border-emerald-500/60",
    },
  }[role.name] || {
    label: role.name,
    desc: role.description || "Custom operational role",
    icon: Shield,
    themeColor: "from-muted/40 to-transparent",
    badgeColor: "bg-muted text-muted-foreground",
    accentIcon: "text-muted-foreground bg-muted",
    borderColor: "border-border",
  };

  const Icon = roleMeta.icon;
  const permissionCount = role.permissionKeys?.length || 0;
  const coveragePercent =
    totalPermissions > 0 ? Math.round((permissionCount / totalPermissions) * 100) : 0;

  return (
    <div
      onClick={() => onSelectRole?.(role)}
      className={cn(
        "relative flex flex-col justify-between p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-xl shadow-xs transition-all duration-300 cursor-pointer group hover:shadow-md",
        roleMeta.themeColor,
        roleMeta.borderColor
      )}
    >
      <div className="space-y-3.5">
        {/* Top bar: Icon, Name & Immutability Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-105",
                roleMeta.accentIcon
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-foreground tracking-tight">
                  {role.name}
                </h3>
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
                {roleMeta.label}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn("text-[10px] uppercase font-bold tracking-wider font-mono", roleMeta.badgeColor)}
          >
            {isOwner ? (
              <span className="flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" />
                Immutable
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                Configurable
              </span>
            )}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground/90 line-clamp-2 min-h-[32px]">
          {role.description || roleMeta.desc}
        </p>
      </div>

      {/* Bottom bar: Coverage & User Count */}
      <div className="pt-4 mt-3 border-t border-border/40 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Users className="h-3.5 w-3.5" />
            <span>
              <strong className="text-foreground">{role.userCount || 0}</strong> staff
            </span>
          </div>
          <span className="font-bold text-foreground">
            {permissionCount} / {totalPermissions}{" "}
            <span className="text-[10px] text-muted-foreground font-normal">
              ({coveragePercent}%)
            </span>
          </span>
        </div>

        <Progress
          value={coveragePercent}
          className="h-1.5 bg-muted/60"
        />
      </div>
    </div>
  );
}

export default RoleCard;
