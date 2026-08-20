"use client";

import React from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  UserX,
} from "lucide-react";
import type { TeamAttendanceStats, ATTENDANCE_STATUS } from "@/types/attendance";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TeamAttendanceStatsCardsProps {
  stats: TeamAttendanceStats | null;
  isLoading: boolean;
  selectedStatus?: ATTENDANCE_STATUS;
  onStatusSelect?: (status?: ATTENDANCE_STATUS) => void;
}

export function TeamAttendanceStatsCards({
  stats,
  isLoading,
  selectedStatus,
  onStatusSelect,
}: TeamAttendanceStatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md flex flex-col gap-2.5 sm:gap-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-28 rounded-md" />
              <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl" />
            </div>
            <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 rounded-md mt-1" />
            <Skeleton className="h-2.5 sm:h-3 w-24 sm:w-36 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  const {
    totalActiveEmployees = 0,
    currentlyClockedIn = 0,
    currentlyClockedOut = 0,
    notClockedInToday = 0,
    totalHoursWorked = 0,
    averageHoursPerActiveUser = 0,
  } = stats;

  const activePercent =
    totalActiveEmployees > 0
      ? Math.round((currentlyClockedIn / totalActiveEmployees) * 100)
      : 0;

  const cardItems = [
    {
      id: "active-on-duty",
      title: "Active On Duty",
      value: currentlyClockedIn,
      subtext: `${activePercent}% of ${totalActiveEmployees} staff`,
      badge: "Clocked In",
      icon: Activity,
      cardBg:
        "bg-gradient-to-br from-emerald-500/[0.08] via-card/90 to-teal-500/[0.03] dark:from-emerald-950/35 dark:via-card/85 dark:to-background border-emerald-500/20 hover:border-emerald-500/40",
      accentGradient: "from-emerald-500 via-teal-500 to-emerald-400",
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      pulse: true,
      activeRing: "ring-2 ring-emerald-500/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10",
      badgeActive: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40",
      isActive: selectedStatus === ("CLOCKED_IN" as ATTENDANCE_STATUS),
      onClick: () => {
        onStatusSelect?.(
          selectedStatus === ("CLOCKED_IN" as ATTENDANCE_STATUS)
            ? undefined
            : ("CLOCKED_IN" as ATTENDANCE_STATUS)
        );
      },
    },
    {
      id: "completed-shifts",
      title: "Completed Shifts",
      value: currentlyClockedOut,
      subtext: "Finished today's work",
      badge: "Clocked Out",
      icon: CheckCircle2,
      cardBg:
        "bg-gradient-to-br from-blue-500/[0.08] via-card/90 to-indigo-500/[0.03] dark:from-blue-950/35 dark:via-card/85 dark:to-background border-blue-500/20 hover:border-blue-500/40",
      accentGradient: "from-blue-500 via-indigo-500 to-blue-400",
      iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
      pulse: false,
      activeRing: "ring-2 ring-blue-500/40 border-blue-500/60 shadow-lg shadow-blue-500/10",
      badgeActive: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40",
      isActive: selectedStatus === ("CLOCKED_OUT" as ATTENDANCE_STATUS),
      onClick: () => {
        onStatusSelect?.(
          selectedStatus === ("CLOCKED_OUT" as ATTENDANCE_STATUS)
            ? undefined
            : ("CLOCKED_OUT" as ATTENDANCE_STATUS)
        );
      },
    },
    {
      id: "not-checked-in",
      title: "Not Checked In",
      value: notClockedInToday,
      subtext: "Pending shift start",
      badge: "Off Duty",
      icon: UserX,
      cardBg:
        "bg-gradient-to-br from-amber-500/[0.08] via-card/90 to-orange-500/[0.03] dark:from-amber-950/35 dark:via-card/85 dark:to-background border-amber-500/20 hover:border-amber-500/40",
      accentGradient: "from-amber-500 via-orange-500 to-amber-400",
      iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      pulse: false,
      activeRing: "",
      badgeActive: "",
      isActive: false,
      onClick: undefined,
    },
    {
      id: "total-hours",
      title: "Total Team Hours",
      value: `${totalHoursWorked}h`,
      subtext: `Avg ${averageHoursPerActiveUser}h / employee`,
      badge: "Today's Work",
      icon: Clock,
      cardBg:
        "bg-gradient-to-br from-purple-500/[0.08] via-card/90 to-pink-500/[0.03] dark:from-purple-950/35 dark:via-card/85 dark:to-background border-purple-500/20 hover:border-purple-500/40",
      accentGradient: "from-purple-500 via-pink-500 to-purple-400",
      iconBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
      pulse: false,
      activeRing: "",
      badgeActive: "",
      isActive: false,
      onClick: undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {cardItems.map((item) => {
        const Icon = item.icon;
        const isClickable = Boolean(item.onClick);

        return (
          <div
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "group relative overflow-hidden rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between gap-3 sm:gap-4 text-left",
              item.cardBg,
              isClickable && "cursor-pointer hover:shadow-lg hover:-translate-y-0.5",
              item.isActive && item.activeRing
            )}
          >
            {/* Top Row: Title + Icon Badge */}
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
                  {item.title}
                </span>
                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight font-mono">
                    {item.value}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border shadow-xs transition-transform group-hover:scale-105",
                  item.iconBg
                )}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                {item.pulse && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Row: Subtext & Badge Pill */}
            <div className="flex items-center justify-between border-t border-border/40 pt-2 sm:pt-3 text-[10px] sm:text-[11px]">
              <span className="text-muted-foreground truncate max-w-[80px] sm:max-w-[140px]">
                {item.subtext}
              </span>
              <span
                className={cn(
                  "font-semibold text-foreground/80 px-1.5 sm:px-2 py-0.5 rounded-md bg-background/60 border border-border/40 text-[9px] sm:text-[10px] transition-colors",
                  item.isActive && item.badgeActive
                )}
              >
                {item.badge}
              </span>
            </div>

            {/* Subtle Gradient Accent Line at Bottom */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-50 transition-opacity group-hover:opacity-100",
                item.accentGradient,
                item.isActive && "opacity-100 h-[3px]"
              )}
            />
          </div>
        );
      })}
    </div>
  );
}

export default TeamAttendanceStatsCards;
