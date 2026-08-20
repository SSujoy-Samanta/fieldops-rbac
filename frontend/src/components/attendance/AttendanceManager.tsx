"use client";

import React, { useState, useMemo } from "react";
import { CalendarCheck, RotateCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useTodayAttendance,
  useSelfAttendance,
} from "@/hooks/useAttendance";
import { ATTENDANCE_STATUS } from "@/types/attendance";
import { PERMISSION_KEY } from "@/types/rbac";
import { RequirePermission } from "@/components/RequirePermission";
import { ShiftControlCard } from "./ShiftControlCard";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceFilters, DatePreset } from "./AttendanceFilters";
import { AttendanceHistoryTable } from "./AttendanceHistoryTable";
import { ClockOutModal } from "./ClockOutModal";

export function AttendanceManager() {
  return (
    <RequirePermission permission={PERMISSION_KEY.READ_SELF_ATTENDANCE}>
      <AttendanceManagerContent />
    </RequirePermission>
  );
}

function AttendanceManagerContent() {
  // ── 1. Filter States ──
  const [datePreset, setDatePreset] = useState<DatePreset>("ALL");
  const [statusFilter, setStatusFilter] = useState<ATTENDANCE_STATUS | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // ── 2. Modal States ──
  const [isClockOutModalOpen, setIsClockOutModalOpen] = useState<boolean>(false);

  // ── 3. Calculate Date Filter Range from Preset ──
  const dateRange = useMemo(() => {
    const now = new Date();
    if (datePreset === "TODAY") {
      const todayStr = now.toISOString().split("T")[0];
      return { startDate: todayStr, endDate: todayStr };
    }
    if (datePreset === "WEEK") {
      const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        startDate: pastWeek.toISOString().split("T")[0],
        endDate: now.toISOString().split("T")[0],
      };
    }
    if (datePreset === "MONTH") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: startOfMonth.toISOString().split("T")[0],
        endDate: now.toISOString().split("T")[0],
      };
    }
    return { startDate: undefined, endDate: undefined };
  }, [datePreset]);

  // ── 4. React Query Data Fetching ──
  const {
    data: todayStatus,
    isLoading: isTodayLoading,
    refetch: refetchToday,
  } = useTodayAttendance();

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
    refetch: refetchHistory,
  } = useSelfAttendance({
    page,
    limit,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    status: statusFilter,
    sortBy: "clockIn",
    sortOrder: "desc",
  });

  const logsList = historyData?.logs || [];
  const pagination = historyData?.pagination;
  const totalLogs = pagination?.total ?? logsList.length;

  const hasActiveFilters = datePreset !== "ALL" || statusFilter !== undefined;

  const handleResetFilters = () => {
    setDatePreset("ALL");
    setStatusFilter(undefined);
    setPage(1);
  };

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    setPage(1);
  };

  const handleStatusChange = (status?: ATTENDANCE_STATUS) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ── Glassmorphism Header Card ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/50 to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 h-32 w-64 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-indigo-600 text-white shadow-lg shadow-orange-500/25 shrink-0">
              <CalendarCheck className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.5]" />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400 font-mono">
                  Workforce Operations
                </span>
                <Badge
                  variant="outline"
                  className="text-[11px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 px-2 py-0.5 rounded-full"
                >
                  NIST Level 2
                </Badge>
              </div>

              <h1
                className="text-2xl sm:text-3xl font-black text-foreground tracking-tight"
                style={{ fontFamily: "var(--font-righteous), cursive" }}
              >
                My Attendance & <span className="text-orange-500">Shifts</span>
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Track active shift hours, punch in with GPS verification, and review personal attendance records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Shift Tracker</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                refetchToday();
                refetchHistory();
              }}
              disabled={isTodayLoading || isHistoryFetching}
              className="h-10 px-4 rounded-lg text-xs font-semibold border-border/80 bg-background/80 hover:bg-muted cursor-pointer gap-2 shadow-xs"
            >
              <RotateCcw
                className={`h-3.5 w-3.5 ${
                  isHistoryFetching ? "animate-spin text-orange-500" : ""
                }`}
              />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── 1. Interactive Shift Control & Live Clock Widget ───────────── */}
      <ShiftControlCard
        todayStatus={todayStatus || null}
        isLoading={isTodayLoading}
        onOpenClockOutModal={() => setIsClockOutModalOpen(true)}
      />

      {/* ── 2. Today's Metrics & Summary Stats Cards ───────────────────── */}
      <AttendanceStats
        todayStatus={todayStatus || null}
        totalLogsCount={totalLogs}
        isLoading={isTodayLoading}
      />

      {/* ── 3. Filters & Export Bar ───────────────────────────────────── */}
      <AttendanceFilters
        selectedPreset={datePreset}
        onPresetChange={handlePresetChange}
        selectedStatus={statusFilter}
        onStatusChange={handleStatusChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        totalLogs={totalLogs}
        logsForExport={logsList}
      />

      {/* ── 4. Shift Records Data Table ───────────────────────────────── */}
      <AttendanceHistoryTable
        logs={logsList}
        pagination={pagination}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isHistoryLoading || isHistoryFetching}
        onClearFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ── 5. End Shift & Clock-Out Confirmation Modal ──────────────── */}
      <ClockOutModal
        session={todayStatus?.currentSession || null}
        isOpen={isClockOutModalOpen}
        onClose={() => setIsClockOutModalOpen(false)}
      />
    </div>
  );
}

export default AttendanceManager;
