"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Clock, RotateCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useTeamAttendance,
  useTeamAttendanceStats,
} from "@/hooks/useAttendance";
import { ATTENDANCE_STATUS } from "@/types/attendance";
import { SYSTEM_ROLE, PERMISSION_KEY } from "@/types/rbac";
import { RequirePermission } from "@/components/RequirePermission";
import { TeamAttendanceStatsCards } from "./TeamAttendanceStatsCards";
import { TeamAttendanceFilters, TeamDatePreset } from "./TeamAttendanceFilters";
import { TeamAttendanceTable } from "./TeamAttendanceTable";

export function TeamAttendanceManager() {
  return (
    <RequirePermission permission={PERMISSION_KEY.READ_ALL_ATTENDANCE}>
      <TeamAttendanceManagerContent />
    </RequirePermission>
  );
}

function TeamAttendanceManagerContent() {
  // ── 1. Search & Filter State ──
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<SYSTEM_ROLE | undefined>(
    undefined
  );
  const [selectedStatus, setSelectedStatus] = useState<
    ATTENDANCE_STATUS | undefined
  >(undefined);
  const [datePreset, setDatePreset] = useState<TeamDatePreset>("ALL");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // ── 2. Debounce Search (350ms) ──
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // ── 3. Calculate Date Range from Preset ──
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

  // ── 4. React Query Hooks ──
  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useTeamAttendanceStats({
    role: selectedRole,
    date: dateRange.startDate,
  });

  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useTeamAttendance({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    role: selectedRole,
    status: selectedStatus,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    sortBy: "clockIn",
    sortOrder: "desc",
  });

  const logsList = listData?.logs || [];
  const pagination = listData?.pagination;
  const totalLogs = pagination?.total ?? logsList.length;

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    selectedRole !== undefined ||
    selectedStatus !== undefined ||
    datePreset !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedRole(undefined);
    setSelectedStatus(undefined);
    setDatePreset("ALL");
    setPage(1);
  };

  const handleRoleChange = (role?: SYSTEM_ROLE) => {
    setSelectedRole(role);
    setPage(1);
  };

  const handleStatusChange = (status?: ATTENDANCE_STATUS) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handlePresetChange = (preset: TeamDatePreset) => {
    setDatePreset(preset);
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
              <Clock className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.5]" />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400 font-mono">
                  Workforce Governance
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
                Team Attendance & <span className="text-orange-500">Shifts</span>
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Monitor real-time employee check-ins, active shift durations, GPS verification, and workforce operational metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Team Sync</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                refetchStats();
                refetchList();
              }}
              disabled={isStatsLoading || isListFetching}
              className="h-10 px-4 rounded-lg text-xs font-semibold border-border/80 bg-background/80 hover:bg-muted cursor-pointer gap-2 shadow-xs"
            >
              <RotateCcw
                className={`h-3.5 w-3.5 ${
                  isListFetching ? "animate-spin text-orange-500" : ""
                }`}
              />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── 1. Team Attendance KPI Metrics Cards ───────────────────────── */}
      <TeamAttendanceStatsCards
        stats={statsData || null}
        isLoading={isStatsLoading}
        selectedStatus={selectedStatus}
        onStatusSelect={handleStatusChange}
      />

      {/* ── 2. Filters & Export Bar ───────────────────────────────────── */}
      <TeamAttendanceFilters
        search={search}
        onSearchChange={setSearch}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        selectedPreset={datePreset}
        onPresetChange={handlePresetChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        totalLogs={totalLogs}
        logsForExport={logsList}
      />

      {/* ── 3. Team Shifts Records Table ──────────────────────────────── */}
      <TeamAttendanceTable
        logs={logsList}
        pagination={pagination}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isListLoading || isListFetching}
        onClearFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}

export default TeamAttendanceManager;
