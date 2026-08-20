"use client";

import {
  Users,
  ShieldCheck,
  UserCheck,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import type { UserListItem } from "@/types/user";
import type { Role } from "@/types/rbac";
import { SYSTEM_ROLE } from "@/types/rbac";
import { cn } from "@/lib/utils";

interface UsersStatsProps {
  users: UserListItem[];
  totalUsers: number;
  roles?: Role[];
  selectedRole?: SYSTEM_ROLE;
  onRoleSelect?: (role?: SYSTEM_ROLE) => void;
  selectedStatus?: boolean;
  onStatusSelect?: (status?: boolean) => void;
}

export function UsersStats({
  users,
  totalUsers,
  roles,
  selectedRole,
  onRoleSelect,
  selectedStatus,
  onStatusSelect,
}: UsersStatsProps) {
  // Count stats from roles query if available, or fall back to current users array
  const managerRole = roles?.find((r) => r.name === SYSTEM_ROLE.MANAGER);
  const employeeRole = roles?.find((r) => r.name === SYSTEM_ROLE.FIELD_EMPLOYEE);
  const ownerRole = roles?.find((r) => r.name === SYSTEM_ROLE.OWNER);

  const managerCount =
    managerRole?.userCount ??
    users.filter((u) => u.role?.name === SYSTEM_ROLE.MANAGER).length;

  const employeeCount =
    employeeRole?.userCount ??
    users.filter((u) => u.role?.name === SYSTEM_ROLE.FIELD_EMPLOYEE).length;

  const ownerCount =
    ownerRole?.userCount ??
    users.filter((u) => u.role?.name === SYSTEM_ROLE.OWNER).length;

  const totalWorkforce =
    totalUsers > 0 ? totalUsers : ownerCount + managerCount + employeeCount;

  const activeCount = users.filter((u) => u.isActive).length;
  const activePercent =
    totalWorkforce > 0
      ? Math.min(100, Math.round((activeCount / totalWorkforce) * 100))
      : 100;

  const stats = [
    {
      id: "total",
      title: "Total Workforce",
      value: totalWorkforce,
      subtext: `${ownerCount} Organization ${ownerCount === 1 ? "Owner" : "Owners"}`,
      badge: "All Tiers",
      icon: Users,
      cardBg:
        "bg-gradient-to-br from-orange-500/[0.08] via-card/90 to-amber-500/[0.03] dark:from-orange-950/35 dark:via-card/85 dark:to-background border-orange-500/20 hover:border-orange-500/40",
      accentGradient: "from-orange-500 via-amber-500 to-orange-400",
      accentColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
      glowBg: "from-orange-500/20 to-transparent",
      activeRing: "ring-2 ring-orange-500/40 border-orange-500/60 shadow-lg shadow-orange-500/10",
      badgeActive: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/40",
      isActive: selectedRole === undefined && selectedStatus === undefined,
      onClick: () => {
        onRoleSelect?.(undefined);
        onStatusSelect?.(undefined);
      },
    },
    {
      id: "managers",
      title: "Operations Managers",
      value: managerCount,
      subtext: "Supervisory & audit tier",
      badge:
        totalWorkforce > 0
          ? `${Math.round((managerCount / totalWorkforce) * 100)}% of team`
          : "Tier 2",
      icon: ShieldCheck,
      cardBg:
        "bg-gradient-to-br from-indigo-500/[0.08] via-card/90 to-sky-500/[0.03] dark:from-indigo-950/35 dark:via-card/85 dark:to-background border-indigo-500/20 hover:border-indigo-500/40",
      accentGradient: "from-indigo-500 via-blue-500 to-sky-400",
      accentColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      glowBg: "from-indigo-500/20 to-transparent",
      activeRing: "ring-2 ring-indigo-500/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10",
      badgeActive: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/40",
      isActive: selectedRole === SYSTEM_ROLE.MANAGER,
      onClick: () => {
        onRoleSelect?.(
          selectedRole === SYSTEM_ROLE.MANAGER ? undefined : SYSTEM_ROLE.MANAGER
        );
      },
    },
    {
      id: "field",
      title: "Field Workforce",
      value: employeeCount,
      subtext: "On-site field operators",
      badge:
        totalWorkforce > 0
          ? `${Math.round((employeeCount / totalWorkforce) * 100)}% of team`
          : "Operators",
      icon: UserCheck,
      cardBg:
        "bg-gradient-to-br from-emerald-500/[0.08] via-card/90 to-teal-500/[0.03] dark:from-emerald-950/35 dark:via-card/85 dark:to-background border-emerald-500/20 hover:border-emerald-500/40",
      accentGradient: "from-emerald-500 via-teal-500 to-green-400",
      accentColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      glowBg: "from-emerald-500/20 to-transparent",
      activeRing: "ring-2 ring-emerald-500/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10",
      badgeActive: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40",
      isActive: selectedRole === SYSTEM_ROLE.FIELD_EMPLOYEE,
      onClick: () => {
        onRoleSelect?.(
          selectedRole === SYSTEM_ROLE.FIELD_EMPLOYEE
            ? undefined
            : SYSTEM_ROLE.FIELD_EMPLOYEE
        );
      },
    },
    {
      id: "active",
      title: "Active Status",
      value: activeCount,
      subtext: `${activePercent}% currently active`,
      badge: "Live Logins",
      icon: Activity,
      cardBg:
        "bg-gradient-to-br from-amber-500/[0.08] via-card/90 to-orange-500/[0.03] dark:from-amber-950/35 dark:via-card/85 dark:to-background border-amber-500/20 hover:border-amber-500/40",
      accentGradient: "from-amber-500 via-orange-500 to-amber-400",
      accentColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      glowBg: "from-amber-500/20 to-transparent",
      activeRing: "ring-2 ring-amber-500/40 border-amber-500/60 shadow-lg shadow-amber-500/10",
      badgeActive: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40",
      isActive: selectedStatus === true,
      onClick: () => {
        onStatusSelect?.(selectedStatus === true ? undefined : true);
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        const isClickable = Boolean(onRoleSelect || onStatusSelect);

        return (
          <div
            key={item.id}
            onClick={isClickable ? item.onClick : undefined}
            className={cn(
              "group relative overflow-hidden rounded-xl sm:rounded-2xl border p-3 sm:p-5 backdrop-blur-xl transition-all duration-300",
              item.cardBg,
              "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/25 hover:-translate-y-0.5 sm:hover:-translate-y-1",
              isClickable && "cursor-pointer select-none",
              item.isActive
                ? cn(item.activeRing, "scale-[1.01]")
                : "opacity-95 hover:opacity-100"
            )}
          >
            {/* Top Glowing Accent Line */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r transition-opacity duration-300",
                item.accentGradient,
                item.isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"
              )}
            />

            {/* Ambient Background Radial Glow Spot */}
            <div
              className={cn(
                "absolute -right-8 -bottom-8 h-24 w-24 sm:h-36 sm:w-36 rounded-full bg-gradient-to-br blur-2xl sm:blur-3xl pointer-events-none transition-all duration-500",
                item.glowBg,
                item.isActive ? "opacity-80 scale-110" : "opacity-30 group-hover:opacity-75 group-hover:scale-110"
              )}
            />

            {/* Large Decorative Watermark Icon in Corner */}
            <Icon
              className={cn(
                "absolute -right-2 -bottom-2 h-14 w-14 sm:h-24 sm:w-24 transition-all duration-500 pointer-events-none stroke-1",
                item.accentColor,
                item.isActive
                  ? "opacity-[0.14] scale-105"
                  : "opacity-[0.06] dark:opacity-[0.08] group-hover:opacity-[0.12] group-hover:scale-110 group-hover:-rotate-3"
              )}
            />

            {/* Card Header: Title + Icon */}
            <div className="relative flex items-center justify-between gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground/90 tracking-wider uppercase truncate">
                {item.title}
              </span>
              <div
                className={cn(
                  "flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border transition-all duration-300 shrink-0 shadow-xs",
                  item.iconBg,
                  "group-hover:scale-110 group-hover:shadow-md"
                )}
              >
                <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5 stroke-[2.2]" />
              </div>
            </div>

            {/* Metric Value & Percentage Badge */}
            <div className="relative mt-2 sm:mt-3.5 flex items-baseline justify-between gap-1.5 sm:gap-2">
              <span
                className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight"
                style={{ fontFamily: "var(--font-righteous), cursive" }}
              >
                {item.value}
              </span>

              <div
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold border transition-colors shrink-0 shadow-2xs",
                  item.isActive
                    ? item.badgeActive
                    : "bg-background/80 text-muted-foreground border-border/50 group-hover:border-border"
                )}
              >
                {item.id === "active" && (
                  <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <span>{item.badge}</span>
              </div>
            </div>

            {/* Subtext with Click Hint */}
            <div className="relative mt-1 sm:mt-2 flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground font-medium">
              <p className="truncate">{item.subtext}</p>
              {isClickable && (
                <div className="flex items-center gap-0.5 opacity-0 -translate-x-1 group-hover:opacity-80 group-hover:translate-x-0 transition-all text-muted-foreground shrink-0 ml-1">
                  <span className="text-[10px] font-semibold hidden sm:group-hover:inline">Filter</span>
                  <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default UsersStats;
