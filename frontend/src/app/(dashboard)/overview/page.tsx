"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useTodayAttendance,
  useTeamAttendanceStats,
} from "@/hooks/useAttendance";
import {
  useSelfVisits,
  useTeamVisitStats,
} from "@/hooks/useVisits";
import {
  CalendarCheck,
  MapPin,
  Users,
  ShieldCheck,
  Clock,
  Sparkles,
  Compass,
  Crown,
  TrendingUp,
  Activity,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Flame,
  Check,
  Cpu,
  Percent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SYSTEM_ROLE, PERMISSION_KEY } from "@/types/rbac";
import { VISIT_OUTCOME, VISIT_OUTCOME_LABELS } from "@/types/visit";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function OverviewPage() {
  const { user } = useUser();
  const { roleName, isOwner, can } = usePermissions();

  // ── Attendance Data ────────────────────────────────────────────────────────
  const { data: todayAttendance, isLoading: loadingAttendance } = useTodayAttendance();

  // Manager / Owner team stats
  const canViewTeam = isOwner || can(PERMISSION_KEY.READ_ALL_ATTENDANCE);
  const { data: teamAttendanceStats, isLoading: loadingTeamAttendance } = useTeamAttendanceStats();

  // ── Visits Data ────────────────────────────────────────────────────────────
  const { data: selfVisitsData, isLoading: loadingSelfVisits } = useSelfVisits({ limit: 50 });
  const { data: teamVisitStats, isLoading: loadingTeamVisits } = useTeamVisitStats();

  // ── Active Stats View Tab ──────────────────────────────────────────────────
  const [activeMetricTab, setActiveMetricTab] = useState<"shift" | "visits" | "security">("shift");

  // ── Live Shift Elapsed Timer ───────────────────────────────────────────────
  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!todayAttendance?.isClockedIn || !todayAttendance?.currentSession?.clockIn) {
      setLiveElapsedSeconds(0);
      return;
    }

    const clockInTime = new Date(todayAttendance.currentSession.clockIn).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - clockInTime) / 1000));
      setLiveElapsedSeconds(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [todayAttendance?.isClockedIn, todayAttendance?.currentSession?.clockIn]);

  const formattedLiveTimer = useMemo(() => {
    const hrs = Math.floor(liveElapsedSeconds / 3600);
    const mins = Math.floor((liveElapsedSeconds % 3600) / 60);
    const secs = liveElapsedSeconds % 60;
    return `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  }, [liveElapsedSeconds]);

  // ── Greeting Calculation ───────────────────────────────────────────────────
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // ── Role Visual Badge Config ───────────────────────────────────────────────
  const roleBadgeConfig = useMemo(() => {
    if (isOwner || roleName === SYSTEM_ROLE.OWNER) {
      return {
        label: "Workspace Owner",
        icon: Crown,
        badgeClass: "border-amber-500/50 bg-amber-500/15 text-amber-500 dark:text-amber-400",
        glow: "shadow-amber-500/20",
      };
    }
    if (roleName === SYSTEM_ROLE.MANAGER) {
      return {
        label: "Operations Manager",
        icon: ShieldCheck,
        badgeClass: "border-indigo-500/50 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
        glow: "shadow-indigo-500/20",
      };
    }
    return {
      label: "Field Specialist",
      icon: Compass,
      badgeClass: "border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      glow: "shadow-emerald-500/20",
    };
  }, [roleName, isOwner]);

  const RoleIcon = roleBadgeConfig.icon;

  // ── Accumulated Daily Shift Progress ───────────────────────────────────────
  const totalMinutesToday = todayAttendance?.todaySummary?.totalMinutes || 0;
  const liveTotalMinutes = todayAttendance?.isClockedIn
    ? totalMinutesToday + Math.floor(liveElapsedSeconds / 60)
    : totalMinutesToday;
  const dailyTargetMinutes = 8 * 60; // 8 hours target
  const dailyProgressPercent = Math.min(100, Math.round((liveTotalMinutes / dailyTargetMinutes) * 100));

  // ── Field Visits Outcome Statistics ────────────────────────────────────────
  const visitOutcomesStats = useMemo(() => {
    if (canViewTeam && teamVisitStats?.outcomes) {
      const total = teamVisitStats.totalVisits || 0;
      const completed = teamVisitStats.outcomes[VISIT_OUTCOME.COMPLETED] || 0;
      const dealClosed = teamVisitStats.outcomes[VISIT_OUTCOME.DEAL_CLOSED] || 0;
      const followUp = teamVisitStats.outcomes[VISIT_OUTCOME.FOLLOW_UP_REQUIRED] || 0;
      const rescheduled = teamVisitStats.outcomes[VISIT_OUTCOME.RESCHEDULED] || 0;
      const noShow = teamVisitStats.outcomes[VISIT_OUTCOME.NO_SHOW] || 0;

      const successfulCount = completed + dealClosed;
      const successRate = total > 0 ? Math.round((successfulCount / total) * 100) : 0;

      return {
        total,
        completed,
        dealClosed,
        followUp,
        rescheduled,
        noShow,
        successRate,
      };
    }

    // Personal visits breakdown
    const visits = selfVisitsData?.visits || [];
    const total = visits.length;
    const completed = visits.filter((v) => v.outcome === VISIT_OUTCOME.COMPLETED).length;
    const dealClosed = visits.filter((v) => v.outcome === VISIT_OUTCOME.DEAL_CLOSED).length;
    const followUp = visits.filter((v) => v.outcome === VISIT_OUTCOME.FOLLOW_UP_REQUIRED).length;
    const rescheduled = visits.filter((v) => v.outcome === VISIT_OUTCOME.RESCHEDULED).length;
    const noShow = visits.filter((v) => v.outcome === VISIT_OUTCOME.NO_SHOW).length;

    const successfulCount = completed + dealClosed;
    const successRate = total > 0 ? Math.round((successfulCount / total) * 100) : 0;

    return {
      total,
      completed,
      dealClosed,
      followUp,
      rescheduled,
      noShow,
      successRate,
    };
  }, [canViewTeam, teamVisitStats, selfVisitsData]);

  // ── Team Attendance Rate Calculation ───────────────────────────────────────
  const attendanceRate = useMemo(() => {
    if (!teamAttendanceStats) return 0;
    const { totalActiveEmployees, currentlyClockedIn } = teamAttendanceStats;
    if (!totalActiveEmployees || totalActiveEmployees === 0) return 0;
    return Math.min(100, Math.round((currentlyClockedIn / totalActiveEmployees) * 100));
  }, [teamAttendanceStats]);

  return (
    <div className="relative flex flex-col gap-8 pb-16 animate-in fade-in duration-500">
      {/* ── Multi-tone Atmospheric Glowing Orbs ─────────────────────────────── */}
      <div className="absolute -top-10 -right-10 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 -left-16 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-indigo-600/15 via-purple-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 h-[350px] w-[350px] rounded-full bg-gradient-to-tl from-emerald-500/15 via-teal-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* ── 1. Hero Analytics Command Banner (Brand Orange/Amber) ────────────── */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-orange-500/35 bg-gradient-to-br from-orange-500/[0.08] via-card/90 to-amber-500/[0.04] dark:from-orange-950/40 dark:via-card/90 dark:to-background p-6 sm:p-8 backdrop-blur-2xl shadow-xl shadow-orange-500/5">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Ambient Corner Glows */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Operator Welcome Header */}
          <div className="flex flex-col gap-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 shadow-xs backdrop-blur-md">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span>Live Analytics HUD</span>
              </div>
              <span className="text-muted-foreground/40">•</span>
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-xs backdrop-blur-md",
                  roleBadgeConfig.badgeClass
                )}
              >
                <RoleIcon className="h-3.5 w-3.5" />
                <span>{roleBadgeConfig.label}</span>
              </div>
              <Badge variant="outline" className="text-[11px] border-border/80 text-muted-foreground font-mono bg-background/50">
                {format(new Date(), "EEE, MMM dd, yyyy")}
              </Badge>
            </div>

            <h1
              className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight"
              style={{ fontFamily: "var(--font-righteous), cursive" }}
            >
              {greeting}, {user?.name?.split(" ")[0] || "Operator"}!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Real-time workforce intelligence, live shift duration tracking, field outcome metrics, and NIST Level 2 clearance evaluation.
            </p>
          </div>

          {/* Interactive Metric Switcher (Icon-only, Rounded-LG) */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-card/80 dark:bg-muted/40 border-2 border-border/70 backdrop-blur-xl shadow-xs self-start lg:self-center">
            <button
              onClick={() => setActiveMetricTab("shift")}
              title="Shift Duration & Attendance Metrics"
              aria-label="Shift Duration & Attendance Metrics"
              className={cn(
                "p-2 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer",
                activeMetricTab === "shift"
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-xs border border-blue-500/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <Clock className="h-4 w-4 text-blue-500" />
            </button>
            <button
              onClick={() => setActiveMetricTab("visits")}
              title="Field Visits & Outcome Analytics"
              aria-label="Field Visits & Outcome Analytics"
              className={cn(
                "p-2 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer",
                activeMetricTab === "visits"
                  ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-xs border border-indigo-500/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <MapPin className="h-4 w-4 text-indigo-500" />
            </button>
            <button
              onClick={() => setActiveMetricTab("security")}
              title="RBAC Security & Cryptographic Defense"
              aria-label="RBAC Security & Cryptographic Defense"
              className={cn(
                "p-2 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer",
                activeMetricTab === "security"
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 shadow-xs border border-rose-500/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <ShieldCheck className="h-4 w-4 text-rose-500" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Primary KPI Multi-Tone Grid (4 Distinct Colors) ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Shift Status & Live Elapsed Timer (Cobalt / Cyber Blue Theme) */}
        <div className="group relative overflow-hidden rounded-3xl border-2 border-blue-500/35 bg-gradient-to-br from-blue-500/[0.08] via-card/85 to-indigo-500/[0.04] dark:from-blue-950/30 dark:via-card/85 dark:to-background p-6 backdrop-blur-xl shadow-lg shadow-blue-500/5 hover:border-blue-500/70 hover:shadow-blue-500/20 transition-all duration-300 flex flex-col justify-between gap-5">
          <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              Shift Status
            </span>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-xs",
                todayAttendance?.isClockedIn
                  ? "border-blue-500/50 bg-blue-500/15 text-blue-500 dark:text-blue-400 animate-pulse"
                  : "border-border/80 bg-muted/60 text-muted-foreground"
              )}
            >
              {todayAttendance?.isClockedIn ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  <span>On Duty</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                  <span>Off Duty</span>
                </>
              )}
            </div>
          </div>

          <div className="relative z-10">
            {loadingAttendance ? (
              <Skeleton className="h-9 w-36 rounded-xl" />
            ) : todayAttendance?.isClockedIn ? (
              <div className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-black text-foreground font-mono tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-blue-500 bg-clip-text text-transparent">
                  {formattedLiveTimer}
                </span>
                <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                  <Activity className="h-3 w-3 text-blue-500" />
                  Clocked in at{" "}
                  {todayAttendance.currentSession?.clockIn
                    ? format(new Date(todayAttendance.currentSession.clockIn), "hh:mm a")
                    : "--:--"}
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-black text-foreground">
                  Off Duty
                </span>
                <span className="text-xs text-muted-foreground mt-1 font-medium">
                  {todayAttendance?.todaySummary?.sessionsCount
                    ? `${todayAttendance.todaySummary.sessionsCount} session(s) completed today`
                    : "No active shifts today"}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar towards 8h Target */}
          <div className="relative z-10 flex flex-col gap-1.5 pt-3 border-t border-border/40">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>Daily Target Progress</span>
              <span className="font-bold text-foreground font-mono">
                {(liveTotalMinutes / 60).toFixed(1)} / 8.0 hrs ({dailyProgressPercent}%)
              </span>
            </div>
            <div className="h-2 w-full bg-muted/40 dark:bg-muted/20 rounded-full overflow-hidden border border-border/40">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Field Visits Volume & Success Rate (Indigo / Violet Theme) */}
        <div className="group relative overflow-hidden rounded-3xl border-2 border-indigo-500/35 bg-gradient-to-br from-indigo-500/[0.08] via-card/85 to-purple-500/[0.04] dark:from-indigo-950/30 dark:via-card/85 dark:to-background p-6 backdrop-blur-xl shadow-lg shadow-indigo-500/5 hover:border-indigo-500/70 hover:shadow-indigo-500/20 transition-all duration-300 flex flex-col justify-between gap-5">
          <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-indigo-500" />
              {canViewTeam ? "Total Team Visits" : "My Logged Visits"}
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/25 shadow-xs">
              <Target className="h-4 w-4" />
            </div>
          </div>

          <div className="relative z-10">
            {loadingSelfVisits || (canViewTeam && loadingTeamVisits) ? (
              <Skeleton className="h-9 w-24 rounded-xl" />
            ) : (
              <div className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-black text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-indigo-500 bg-clip-text text-transparent">
                  {visitOutcomesStats.total}
                </span>
                <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                  <Check className="h-3 w-3 text-emerald-500" />
                  {visitOutcomesStats.completed + visitOutcomesStats.dealClosed} successful outcomes
                </span>
              </div>
            )}
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/40 font-medium">
            <span>Success Rate</span>
            <span className="text-indigo-500 font-black font-mono text-xs">
              {visitOutcomesStats.successRate}%
            </span>
          </div>
        </div>

        {/* Card 3: Team Workforce / Attendance Rate (Teal / Mint Theme) */}
        <div className="group relative overflow-hidden rounded-3xl border-2 border-teal-500/35 bg-gradient-to-br from-teal-500/[0.08] via-card/85 to-emerald-500/[0.04] dark:from-teal-950/30 dark:via-card/85 dark:to-background p-6 backdrop-blur-xl shadow-lg shadow-teal-500/5 hover:border-teal-500/70 hover:shadow-teal-500/20 transition-all duration-300 flex flex-col justify-between gap-5">
          <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-teal-500/10 blur-2xl pointer-events-none group-hover:bg-teal-500/20 transition-all" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-teal-500" />
              {canViewTeam ? "Active Staff On Duty" : "Security Protocol"}
            </span>
            <div className="p-2.5 rounded-xl bg-teal-500/15 text-teal-500 border border-teal-500/25 shadow-xs">
              {canViewTeam ? <TrendingUp className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            </div>
          </div>

          <div className="relative z-10">
            {canViewTeam ? (
              loadingTeamAttendance ? (
                <Skeleton className="h-9 w-28 rounded-xl" />
              ) : (
                <div className="flex flex-col">
                  <span className="text-3xl sm:text-4xl font-black text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-teal-500 bg-clip-text text-transparent font-mono">
                    {teamAttendanceStats?.currentlyClockedIn || 0} /{" "}
                    {teamAttendanceStats?.totalActiveEmployees || 0}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 font-medium">
                    Staff members currently on active shift
                  </span>
                </div>
              )
            ) : (
              <div className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-black text-foreground">
                  NIST Level 2
                </span>
                <span className="text-xs text-muted-foreground mt-1 font-medium">
                  {isOwner ? "Owner Unrestricted" : `${roleName} Clearance`}
                </span>
              </div>
            )}
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/40 font-medium">
            <span>{canViewTeam ? "Workforce Attendance Rate" : "Access Guard"}</span>
            <span className="text-teal-500 font-black font-mono text-xs">
              {canViewTeam ? `${attendanceRate}%` : "Enforced"}
            </span>
          </div>
        </div>

        {/* Card 4: Redis Engine & Evaluation Speed (Rose / Pink Theme) */}
        <div className="group relative overflow-hidden rounded-3xl border-2 border-rose-500/35 bg-gradient-to-br from-rose-500/[0.08] via-card/85 to-pink-500/[0.04] dark:from-rose-950/30 dark:via-card/85 dark:to-background p-6 backdrop-blur-xl shadow-lg shadow-rose-500/5 hover:border-rose-500/70 hover:shadow-rose-500/20 transition-all duration-300 flex flex-col justify-between gap-5">
          <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-rose-500/10 blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-rose-500" />
              RBAC Policy Engine
            </span>
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/25 shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-black text-foreground font-mono bg-gradient-to-r from-foreground via-foreground/90 to-rose-500 bg-clip-text text-transparent">
                &lt;0.4 ms
              </span>
              <span className="text-xs text-muted-foreground mt-1 font-medium">
                Redis Set SISMEMBER cache evaluation
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/40 font-medium">
            <span>Policy Evaluation</span>
            <span className="text-emerald-500 font-black text-xs flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Zero Stale Reads
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Interactive Analytics Deep-Dive Grids ─────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeMetricTab === "shift" && (
          <motion.div
            key="shift-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Shift Breakdown Box (Amber / Gold Theme) */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] via-card/85 to-orange-500/[0.03] dark:from-amber-950/30 dark:via-card/85 dark:to-background backdrop-blur-2xl shadow-xl shadow-amber-500/5 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/30 shrink-0">
                    <BarChart3 className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                      Today&apos;s Shift Duration Analytics
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Calculated on-duty work duration and punch session metrics
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold border-amber-500/40 text-amber-500 bg-amber-500/10 self-start sm:self-auto shrink-0">
                  {(liveTotalMinutes / 60).toFixed(1)} hrs
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-lg border border-amber-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex flex-col gap-1 shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Time</span>
                  {loadingAttendance ? (
                    <Skeleton className="h-7 w-20 rounded-md" />
                  ) : (
                    <span className="text-xl font-extrabold text-foreground font-mono">
                      {Math.floor(liveTotalMinutes / 60)}h {liveTotalMinutes % 60}m
                    </span>
                  )}
                </div>
                <div className="p-3 sm:p-4 rounded-lg border border-amber-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex flex-col gap-1 shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Sessions</span>
                  {loadingAttendance ? (
                    <Skeleton className="h-7 w-12 rounded-md" />
                  ) : (
                    <span className="text-xl font-extrabold text-foreground font-mono">
                      {todayAttendance?.todaySummary?.sessionsCount || 0}
                    </span>
                  )}
                </div>
                <div className="p-3 sm:p-4 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] backdrop-blur-md flex flex-col gap-1 shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Fulfillment</span>
                  {loadingAttendance ? (
                    <Skeleton className="h-7 w-16 rounded-md" />
                  ) : (
                    <span className="text-xl font-extrabold text-emerald-500 font-mono">
                      {dailyProgressPercent}%
                    </span>
                  )}
                </div>
              </div>

              {/* Visual Shift Segment Breakdown */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Standard 8.0h Shift Progress Bar</span>
                  <span className="text-foreground font-bold font-mono">
                    {Math.max(0, 480 - liveTotalMinutes)}m remaining
                  </span>
                </div>
                <div className="h-3 w-full bg-muted/60 rounded-lg overflow-hidden p-0.5 border border-border/60">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-md transition-all duration-500 shadow-xs"
                    style={{ width: `${dailyProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Shift Health & Operational Compliance (Emerald / Teal Theme) */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.06] via-card/85 to-teal-500/[0.03] dark:from-emerald-950/30 dark:via-card/85 dark:to-background backdrop-blur-2xl shadow-xl shadow-emerald-500/5 flex flex-col justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 shrink-0">
                    <CalendarCheck className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                      Attendance & Shift Assurance
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Automated audit trail and verified timestamps
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold border-emerald-500/40 text-emerald-500 bg-emerald-500/10 self-start sm:self-auto shrink-0">
                  100% Geotagged
                </Badge>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-3 sm:p-3.5 rounded-lg border border-emerald-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 text-xs">
                  <span className="text-muted-foreground font-medium">GPS Coordinates Validation</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1 shrink-0">
                    <Check className="h-3.5 w-3.5" /> High Accuracy Locked
                  </span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-lg border border-emerald-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 text-xs">
                  <span className="text-muted-foreground font-medium">Auto Session Persistence</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1 shrink-0">
                    <Check className="h-3.5 w-3.5" /> PostgreSQL Synchronized
                  </span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-lg border border-emerald-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 text-xs">
                  <span className="text-muted-foreground font-medium">Overtime & Multi-session Support</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1 shrink-0">
                    <Check className="h-3.5 w-3.5" /> Dynamic Tracking Active
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeMetricTab === "visits" && (
          <motion.div
            key="visits-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Visit Outcome Distribution Box (Indigo / Purple Theme) */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.06] via-card/85 to-purple-500/[0.03] dark:from-indigo-950/30 dark:via-card/85 dark:to-background backdrop-blur-2xl shadow-xl shadow-indigo-500/5 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 shrink-0">
                    <PieChart className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                      Field Visit Outcome Spectrum
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Customer visit resolution and closed deal analytics
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold border-indigo-500/40 text-indigo-500 bg-indigo-500/10 self-start sm:self-auto shrink-0">
                  {loadingSelfVisits || (canViewTeam && loadingTeamVisits) ? (
                    <Skeleton className="h-4 w-16" />
                  ) : (
                    `${visitOutcomesStats.total} Total Visits`
                  )}
                </Badge>
              </div>

              {/* Outcome Bars */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                      {VISIT_OUTCOME_LABELS[VISIT_OUTCOME.COMPLETED]} & {VISIT_OUTCOME_LABELS[VISIT_OUTCOME.DEAL_CLOSED]}
                    </span>
                    <span className="font-bold text-foreground font-mono">
                      {loadingSelfVisits || (canViewTeam && loadingTeamVisits) ? (
                        <Skeleton className="h-3 w-16" />
                      ) : (
                        `${visitOutcomesStats.completed + visitOutcomesStats.dealClosed} (${
                          visitOutcomesStats.total > 0
                            ? Math.round(
                                ((visitOutcomesStats.completed + visitOutcomesStats.dealClosed) /
                                  visitOutcomesStats.total) *
                                  100
                              )
                            : 0
                        }%)`
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted/40 dark:bg-muted/20 rounded-full overflow-hidden border border-border/40">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-xs"
                      style={{
                        width: `${
                          visitOutcomesStats.total > 0
                            ? Math.round(
                                ((visitOutcomesStats.completed + visitOutcomesStats.dealClosed) /
                                  visitOutcomesStats.total) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" />
                      {VISIT_OUTCOME_LABELS[VISIT_OUTCOME.FOLLOW_UP_REQUIRED]}
                    </span>
                    <span className="font-bold text-foreground font-mono">
                      {loadingSelfVisits || (canViewTeam && loadingTeamVisits) ? (
                        <Skeleton className="h-3 w-16" />
                      ) : (
                        `${visitOutcomesStats.followUp} (${
                          visitOutcomesStats.total > 0
                            ? Math.round((visitOutcomesStats.followUp / visitOutcomesStats.total) * 100)
                            : 0
                        }%)`
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted/40 dark:bg-muted/20 rounded-full overflow-hidden border border-border/40">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500 shadow-xs"
                      style={{
                        width: `${
                          visitOutcomesStats.total > 0
                            ? Math.round((visitOutcomesStats.followUp / visitOutcomesStats.total) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-xs shadow-blue-500/50" />
                      {VISIT_OUTCOME_LABELS[VISIT_OUTCOME.RESCHEDULED]}
                    </span>
                    <span className="font-bold text-foreground font-mono">
                      {loadingSelfVisits || (canViewTeam && loadingTeamVisits) ? (
                        <Skeleton className="h-3 w-16" />
                      ) : (
                        `${visitOutcomesStats.rescheduled} (${
                          visitOutcomesStats.total > 0
                            ? Math.round((visitOutcomesStats.rescheduled / visitOutcomesStats.total) * 100)
                            : 0
                        }%)`
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted/40 dark:bg-muted/20 rounded-full overflow-hidden border border-border/40">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500 shadow-xs"
                      style={{
                        width: `${
                          visitOutcomesStats.total > 0
                            ? Math.round((visitOutcomesStats.rescheduled / visitOutcomesStats.total) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50" />
                      {VISIT_OUTCOME_LABELS[VISIT_OUTCOME.NO_SHOW]}
                    </span>
                    <span className="font-bold text-foreground font-mono">
                      {loadingSelfVisits || (canViewTeam && loadingTeamVisits) ? (
                        <Skeleton className="h-3 w-16" />
                      ) : (
                        `${visitOutcomesStats.noShow} (${
                          visitOutcomesStats.total > 0
                            ? Math.round((visitOutcomesStats.noShow / visitOutcomesStats.total) * 100)
                            : 0
                        }%)`
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted/40 dark:bg-muted/20 rounded-full overflow-hidden border border-border/40">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500 shadow-xs"
                      style={{
                        width: `${
                          visitOutcomesStats.total > 0
                            ? Math.round((visitOutcomesStats.noShow / visitOutcomesStats.total) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visit Efficiency & Conversion Stats (Cyan / Teal Theme) */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/[0.06] via-card/85 to-indigo-500/[0.03] dark:from-cyan-950/30 dark:via-card/85 dark:to-background backdrop-blur-2xl shadow-xl shadow-cyan-500/5 flex flex-col justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 shrink-0">
                    <Percent className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                      Conversion & Efficiency Index
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Effectiveness ratio across logged customer inspections
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 self-start sm:self-auto shrink-0">
                  {loadingSelfVisits || (canViewTeam && loadingTeamVisits) ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    `${visitOutcomesStats.successRate}% Success`
                  )}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-lg border border-cyan-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex flex-col gap-1 shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Success Rate</span>
                  {loadingSelfVisits || (canViewTeam && loadingTeamVisits) ? (
                    <Skeleton className="h-8 w-16 rounded-md" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                      {visitOutcomesStats.successRate}%
                    </span>
                  )}
                </div>
                <div className="p-3 sm:p-4 rounded-lg border border-amber-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex flex-col gap-1 shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Follow-Up Load</span>
                  {loadingSelfVisits || (canViewTeam && loadingTeamVisits) ? (
                    <Skeleton className="h-8 w-16 rounded-md" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-amber-500 font-mono">
                      {visitOutcomesStats.followUp}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-lg border border-cyan-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 text-xs">
                <span className="text-muted-foreground font-medium">GPS Geolocation Quality</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1 shrink-0">
                  <Check className="h-3.5 w-3.5" /> 100% Geocoded
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {activeMetricTab === "security" && (
          <motion.div
            key="security-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* RBAC Privilege Matrix Clearance (Emerald / Teal Theme) */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.06] via-card/85 to-teal-500/[0.03] dark:from-emerald-950/30 dark:via-card/85 dark:to-background backdrop-blur-2xl shadow-xl shadow-emerald-500/5 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 shrink-0">
                    <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                      RBAC Security Clearance Matrix
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Active permissions and separation of duties enforcement
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold border-emerald-500/40 text-emerald-500 bg-emerald-500/10 self-start sm:self-auto shrink-0">
                  Level 2 Clearance
                </Badge>
              </div>

              <div className="flex flex-col gap-2.5 sm:gap-3 text-xs">
                <div className="p-3 sm:p-3.5 rounded-lg border border-emerald-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
                  <span className="text-muted-foreground font-medium">Clock In & Out Authorization</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1 shrink-0">
                    <Check className="h-3.5 w-3.5" /> Active
                  </span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-lg border border-emerald-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
                  <span className="text-muted-foreground font-medium">Customer Visits Logging</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1 shrink-0">
                    <Check className="h-3.5 w-3.5" /> Active
                  </span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-lg border border-emerald-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
                  <span className="text-muted-foreground font-medium">Team Workforce Intelligence</span>
                  <span className={cn("font-bold flex items-center gap-1 shrink-0", canViewTeam ? "text-emerald-500" : "text-muted-foreground")}>
                    {canViewTeam ? <Check className="h-3.5 w-3.5" /> : null}
                    {canViewTeam ? "Granted" : "Restricted"}
                  </span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-lg border border-emerald-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
                  <span className="text-muted-foreground font-medium">User Management & Provisioning</span>
                  <span className={cn("font-bold flex items-center gap-1 shrink-0", isOwner || can(PERMISSION_KEY.MANAGE_USERS) ? "text-emerald-500" : "text-muted-foreground")}>
                    {isOwner || can(PERMISSION_KEY.MANAGE_USERS) ? <Check className="h-3.5 w-3.5" /> : null}
                    {isOwner || can(PERMISSION_KEY.MANAGE_USERS) ? "Granted" : "Restricted"}
                  </span>
                </div>
              </div>
            </div>

            {/* Architecture Guarantees & Defense (Purple / Indigo Theme) */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/[0.06] via-card/85 to-indigo-500/[0.03] dark:from-purple-950/30 dark:via-card/85 dark:to-background backdrop-blur-2xl shadow-xl shadow-purple-500/5 flex flex-col justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 shrink-0">
                    <Cpu className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                      Cryptographic Defense Layer
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Session integrity and zero-trust authentication guarantees
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold border-purple-500/40 text-purple-500 bg-purple-500/10 self-start sm:self-auto shrink-0">
                  Multi-Tier Defense
                </Badge>
              </div>

              <div className="flex flex-col gap-2.5 sm:gap-3 text-xs text-muted-foreground">
                <div className="p-3 sm:p-3.5 rounded-lg border border-purple-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>HttpOnly JWTs</strong> with double-submit CSRF cookie mitigation.
                  </span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-lg border border-purple-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Redis JTI Blacklist</strong>: Immediate session revocation on password resets.
                  </span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-lg border border-purple-500/20 bg-background/60 dark:bg-card/60 backdrop-blur-md flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Single-Flight Token Refresh</strong>: Race-condition-free Axios queueing.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Platform Infrastructure Audit Cards ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative overflow-hidden p-6 rounded-3xl border-2 border-emerald-500/35 bg-gradient-to-br from-emerald-500/[0.08] via-card/85 to-teal-500/[0.04] dark:from-emerald-950/30 dark:via-card/85 dark:to-background backdrop-blur-xl shadow-lg shadow-emerald-500/5 hover:border-emerald-500/70 hover:shadow-emerald-500/20 transition-all duration-300 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              RBAC Authorization
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-xl font-black text-foreground">
            {roleBadgeConfig.label}
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            {isOwner
              ? "Full root authorization bypass with absolute administrative capabilities."
              : `Enforced under NIST Level 2 dynamic role policies for ${roleName}.`}
          </p>
        </div>

        <div className="group relative overflow-hidden p-6 rounded-3xl border-2 border-rose-500/35 bg-gradient-to-br from-rose-500/[0.08] via-card/85 to-pink-500/[0.04] dark:from-rose-950/30 dark:via-card/85 dark:to-background backdrop-blur-xl shadow-lg shadow-rose-500/5 hover:border-rose-500/70 hover:shadow-rose-500/20 transition-all duration-300 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Session Revocation
            </span>
            <Sparkles className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-xl font-black text-foreground font-mono">
            Redis JTI Session Store
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Immediate token blacklisting on logout and credential rotation with single-flight Axios queue.
          </p>
        </div>

        <div className="group relative overflow-hidden p-6 rounded-3xl border-2 border-indigo-500/35 bg-gradient-to-br from-indigo-500/[0.08] via-card/85 to-purple-500/[0.04] dark:from-indigo-950/30 dark:via-card/85 dark:to-background backdrop-blur-xl shadow-lg shadow-indigo-500/5 hover:border-indigo-500/70 hover:shadow-indigo-500/20 transition-all duration-300 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Geolocation Validation
            </span>
            <MapPin className="h-4 w-4 text-indigo-500" />
          </div>
          <span className="text-xl font-black text-foreground font-mono">
            100% Geocoded GPS
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Every customer visit and punch log is verified with GPS coordinates to prevent spoofing.
          </p>
        </div>
      </div>
    </div>
  );
}
