"use client";

import React from "react";
import {
  Clock,
  CalendarCheck,
  Activity,
  Hourglass,
  Sparkles,
} from "lucide-react";
import type { TodayAttendanceStatus } from "@/types/attendance";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AttendanceStatsProps {
  todayStatus: TodayAttendanceStatus | null;
  totalLogsCount: number;
  isLoading: boolean;
}

export function AttendanceStats({
  todayStatus,
  totalLogsCount,
  isLoading,
}: AttendanceStatsProps) {
  const summary = todayStatus?.todaySummary;
  const isClockedIn = todayStatus?.isClockedIn ?? false;

  const totalMinutes = summary?.totalMinutes ?? 0;
  const totalHours = summary?.totalHours ?? Number((totalMinutes / 60).toFixed(1));
  const sessionsCount = summary?.sessionsCount ?? todayStatus?.todaySessions?.length ?? 0;

  // Calculate percentage of standard 8h operational shift
  const standardShiftHours = 8;
  const shiftProgressPercent = Math.min(100, Math.round((totalHours / standardShiftHours) * 100));

  const stats = [
    {
      id: "today-hours",
      title: "Today's Work Hours",
      value: `${totalHours} hrs`,
      subtext: `${totalMinutes} minutes recorded`,
      badge: `${shiftProgressPercent}% of 8h standard`,
      icon: Clock,
      cardBg:
        "bg-gradient-to-br from-orange-500/[0.08] via-card/90 to-amber-500/[0.03] dark:from-orange-950/35 dark:via-card/85 dark:to-background border-orange-500/20 hover:border-orange-500/40",
      accentGradient: "from-orange-500 via-amber-500 to-orange-400",
      accentColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
      glowBg: "from-orange-500/20 to-transparent",
    },
    {
      id: "today-sessions",
      title: "Today's Sessions",
      value: sessionsCount,
      subtext: isClockedIn ? "1 active session ongoing" : "All shifts logged",
      badge: `${sessionsCount} ${sessionsCount === 1 ? "Session" : "Sessions"}`,
      icon: CalendarCheck,
      cardBg:
        "bg-gradient-to-br from-indigo-500/[0.08] via-card/90 to-sky-500/[0.03] dark:from-indigo-950/35 dark:via-card/85 dark:to-background border-indigo-500/20 hover:border-indigo-500/40",
      accentGradient: "from-indigo-500 via-blue-500 to-sky-400",
      accentColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      glowBg: "from-indigo-500/20 to-transparent",
    },
    {
      id: "shift-state",
      title: "Current Shift State",
      value: isClockedIn ? "On Duty" : "Off Duty",
      subtext: isClockedIn ? "Active timer running" : "Ready for next shift",
      badge: isClockedIn ? "Active" : "Idle",
      icon: isClockedIn ? Activity : Hourglass,
      cardBg: isClockedIn
        ? "bg-gradient-to-br from-emerald-500/[0.08] via-card/90 to-teal-500/[0.03] dark:from-emerald-950/35 dark:via-card/85 dark:to-background border-emerald-500/30 hover:border-emerald-500/50"
        : "bg-gradient-to-br from-slate-500/[0.08] via-card/90 to-zinc-500/[0.03] dark:from-slate-950/35 dark:via-card/85 dark:to-background border-border/70 hover:border-border",
      accentGradient: isClockedIn
        ? "from-emerald-500 via-teal-500 to-emerald-400"
        : "from-slate-500 via-zinc-500 to-slate-400",
      accentColor: isClockedIn
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-muted-foreground",
      iconBg: isClockedIn
        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
        : "bg-muted/40 text-muted-foreground border-border/60",
      glowBg: isClockedIn ? "from-emerald-500/20 to-transparent" : "from-slate-500/10 to-transparent",
    },
    {
      id: "total-history",
      title: "Total Shifts Logged",
      value: totalLogsCount,
      subtext: "Personal shift records archive",
      badge: "Historical Logs",
      icon: Sparkles,
      cardBg:
        "bg-gradient-to-br from-purple-500/[0.08] via-card/90 to-pink-500/[0.03] dark:from-purple-950/35 dark:via-card/85 dark:to-background border-purple-500/20 hover:border-purple-500/40",
      accentGradient: "from-purple-500 via-pink-500 to-purple-400",
      accentColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
      glowBg: "from-purple-500/20 to-transparent",
    },
  ];

  if (isLoading) {
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className={cn(
              "group relative overflow-hidden rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 transition-all duration-300 hover:shadow-lg backdrop-blur-xl flex flex-col justify-between gap-3 sm:gap-4",
              stat.cardBg
            )}
          >
            {/* Top Row: Title + Icon Badge */}
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
                  {stat.title}
                </span>
                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight font-mono">
                    {stat.value}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border shadow-xs transition-transform group-hover:scale-105",
                  stat.iconBg
                )}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>

            {/* Bottom Row: Subtext & Badge Pill */}
            <div className="flex items-center justify-between border-t border-border/40 pt-2 sm:pt-3 text-[10px] sm:text-[11px]">
              <span className="text-muted-foreground truncate max-w-[80px] sm:max-w-[140px]">
                {stat.subtext}
              </span>
              <span className="font-semibold text-foreground/80 px-1.5 sm:px-2 py-0.5 rounded-md bg-background/60 border border-border/40 text-[9px] sm:text-[10px]">
                {stat.badge}
              </span>
            </div>

            {/* Subtle Gradient Accent Line at Bottom */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-50 transition-opacity group-hover:opacity-100",
                stat.accentGradient
              )}
            />
          </div>
        );
      })}
    </div>
  );
}

export default AttendanceStats;
