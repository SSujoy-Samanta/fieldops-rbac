"use client";

import React from "react";
import {
  MapPin,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Visit } from "@/types/visit";
import { VISIT_OUTCOME } from "@/types/visit";

interface VisitsStatsProps {
  visits?: Visit[];
  totalVisits?: number;
  isLoading?: boolean;
}

export function VisitsStats({
  visits = [],
  totalVisits = 0,
  isLoading = false,
}: VisitsStatsProps) {
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

  // Calculate quick metrics from loaded visits or totals
  const dealsClosedCount = visits.filter(
    (v) => v.outcome === VISIT_OUTCOME.DEAL_CLOSED
  ).length;
  const completedCount = visits.filter(
    (v) => v.outcome === VISIT_OUTCOME.COMPLETED
  ).length;
  const followUpCount = visits.filter(
    (v) => v.outcome === VISIT_OUTCOME.FOLLOW_UP_REQUIRED
  ).length;

  const totalLoaded = visits.length;
  const successRate =
    totalLoaded > 0
      ? Math.round(((dealsClosedCount + completedCount) / totalLoaded) * 100)
      : 0;

  const statCards = [
    {
      id: "total",
      title: "Total Visits",
      value: totalVisits || totalLoaded,
      subtext: "Logged customer visits",
      badge: "Lifetime Logs",
      icon: MapPin,
      cardBg:
        "bg-gradient-to-br from-orange-500/[0.08] via-card/90 to-amber-500/[0.03] dark:from-orange-950/35 dark:via-card/85 dark:to-background border-orange-500/20 hover:border-orange-500/40",
      iconBg:
        "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    },
    {
      id: "deals-closed",
      title: "Deals Closed",
      value: dealsClosedCount,
      subtext: "Successful sales closed",
      badge: "High Impact",
      icon: TrendingUp,
      cardBg:
        "bg-gradient-to-br from-emerald-500/[0.08] via-card/90 to-teal-500/[0.03] dark:from-emerald-950/35 dark:via-card/85 dark:to-background border-emerald-500/20 hover:border-emerald-500/40",
      iconBg:
        "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      id: "completed",
      title: "Completed Visits",
      value: completedCount,
      subtext: "Inspections & Demos",
      badge: "Fulfilled",
      icon: CheckCircle2,
      cardBg:
        "bg-gradient-to-br from-blue-500/[0.08] via-card/90 to-cyan-500/[0.03] dark:from-blue-950/35 dark:via-card/85 dark:to-background border-blue-500/20 hover:border-blue-500/40",
      iconBg:
        "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    },
    {
      id: "follow-up",
      title: "Follow-ups Pending",
      value: followUpCount,
      subtext: `${successRate}% resolution rate`,
      badge: "Action Required",
      icon: AlertCircle,
      cardBg:
        "bg-gradient-to-br from-amber-500/[0.08] via-card/90 to-yellow-500/[0.03] dark:from-amber-950/35 dark:via-card/85 dark:to-background border-amber-500/20 hover:border-amber-500/40",
      iconBg:
        "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {statCards.map((stat) => {
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
              <span className="text-muted-foreground truncate max-w-[85px] sm:max-w-[140px]">
                {stat.subtext}
              </span>
              <span className="rounded-md bg-foreground/5 dark:bg-white/10 px-1.5 sm:px-2 py-0.5 font-bold uppercase tracking-wider text-muted-foreground text-[9px] sm:text-[10px]">
                {stat.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default VisitsStats;
