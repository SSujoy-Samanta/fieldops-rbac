"use client";

import React from "react";
import {
  Search,
  X,
  RotateCcw,
  Download,
  ChevronDown,
  Shield,
  Activity,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ATTENDANCE_STATUS, AttendanceSession } from "@/types/attendance";
import { SYSTEM_ROLE } from "@/types/rbac";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type TeamDatePreset = "ALL" | "TODAY" | "WEEK" | "MONTH";

interface TeamAttendanceFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedRole?: SYSTEM_ROLE;
  onRoleChange: (role?: SYSTEM_ROLE) => void;
  selectedStatus?: ATTENDANCE_STATUS;
  onStatusChange: (status?: ATTENDANCE_STATUS) => void;
  selectedPreset: TeamDatePreset;
  onPresetChange: (preset: TeamDatePreset) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalLogs?: number;
  logsForExport?: AttendanceSession[];
}

export function TeamAttendanceFilters({
  search,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  selectedPreset,
  onPresetChange,
  onResetFilters,
  hasActiveFilters,
  totalLogs: _totalLogs,
  logsForExport,
}: TeamAttendanceFiltersProps) {
  // Export Team CSV Helper
  const handleExportCsv = () => {
    if (!logsForExport || logsForExport.length === 0) {
      toast.info("No team attendance records to export for current filter.");
      return;
    }

    try {
      const headers = [
        "Employee Name",
        "Email",
        "Role",
        "Session ID",
        "Date",
        "Clock In Time",
        "Clock Out Time",
        "Duration (Minutes)",
        "Duration (Hours)",
        "Status",
        "Location / Site Notes",
      ];

      const rows = logsForExport.map((log) => [
        `"${(log.user?.name || "Unknown").replace(/"/g, '""')}"`,
        `"${(log.user?.email || "Unknown").replace(/"/g, '""')}"`,
        `"${(log.user?.role?.name || "N/A").replace(/"/g, '""')}"`,
        `"${log.id}"`,
        `"${log.date}"`,
        `"${new Date(log.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}"`,
        log.clockOut
          ? `"${new Date(log.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}"`
          : `"ACTIVE_ON_DUTY"`,
        log.durationMinutes ?? 0,
        log.durationMinutes ? Number((log.durationMinutes / 60).toFixed(2)) : 0,
        `"${log.status}"`,
        `"${(log.locationNotes || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `team_attendance_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(
        `Successfully exported ${logsForExport.length} team records to CSV.`
      );
    } catch {
      toast.error("Failed to export attendance records to CSV.");
    }
  };

  const presetLabels: Record<TeamDatePreset, string> = {
    ALL: "All Records",
    TODAY: "Today Only",
    WEEK: "Last 7 Days",
    MONTH: "This Month",
  };

  const roleLabels: Record<string, string> = {
    [SYSTEM_ROLE.OWNER]: "Executive Owner",
    [SYSTEM_ROLE.MANAGER]: "Operations Manager",
    [SYSTEM_ROLE.FIELD_EMPLOYEE]: "Field Employee",
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 backdrop-blur-xl shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Controls: Search + Dropdowns + Presets */}
        <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-2.5 flex-1">
          {/* 1. Search Box: Full width on mobile */}
          <div className="relative w-full sm:w-72 lg:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff by name or email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9.5 w-full pl-9 pr-8 text-xs rounded-lg border-border/80 bg-background/80 focus-visible:ring-orange-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* 2. Dropdown Filters: Single 2-column row on mobile */}
          <div className="grid grid-cols-2 w-full sm:w-auto sm:flex sm:items-center gap-2 shrink-0">
            {/* Role Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9.5 w-full sm:w-auto px-3 rounded-lg text-xs font-semibold border-border/80 bg-background/80 hover:bg-muted cursor-pointer gap-1.5 justify-between sm:justify-center",
                      selectedRole &&
                        "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                    )}
                  />
                }
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Shield className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span className="truncate">
                    {selectedRole ? roleLabels[selectedRole] : "All Roles"}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 rounded-lg border-border/80 bg-card/95 backdrop-blur-xl shadow-xl p-1"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Filter By Role
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => onRoleChange(undefined)}
                    className="text-xs rounded-md cursor-pointer"
                  >
                    All Roles
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRoleChange(SYSTEM_ROLE.OWNER)}
                    className="text-xs rounded-md cursor-pointer flex items-center justify-between"
                  >
                    <span>Executive Owner</span>
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRoleChange(SYSTEM_ROLE.MANAGER)}
                    className="text-xs rounded-md cursor-pointer flex items-center justify-between"
                  >
                    <span>Operations Manager</span>
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRoleChange(SYSTEM_ROLE.FIELD_EMPLOYEE)}
                    className="text-xs rounded-md cursor-pointer flex items-center justify-between"
                  >
                    <span>Field Employee</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9.5 w-full sm:w-auto px-3 rounded-lg text-xs font-semibold border-border/80 bg-background/80 hover:bg-muted cursor-pointer gap-1.5 justify-between sm:justify-center",
                      selectedStatus &&
                        "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                    )}
                  />
                }
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Activity className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">
                    {selectedStatus === ATTENDANCE_STATUS.CLOCKED_IN
                      ? "Active"
                      : selectedStatus === ATTENDANCE_STATUS.CLOCKED_OUT
                      ? "Completed"
                      : "All Status"}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 rounded-lg border-border/80 bg-card/95 backdrop-blur-xl shadow-xl p-1"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Filter By Status
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(undefined)}
                    className="text-xs rounded-md cursor-pointer"
                  >
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(ATTENDANCE_STATUS.CLOCKED_IN)}
                    className="text-xs rounded-md cursor-pointer flex items-center justify-between"
                  >
                    <span>Active On Duty</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(ATTENDANCE_STATUS.CLOCKED_OUT)}
                    className="text-xs rounded-md cursor-pointer flex items-center justify-between"
                  >
                    <span>Completed Shift</span>
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 3. Date Presets */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-background/80 border border-border/80 overflow-x-auto">
            {(["ALL", "TODAY", "WEEK", "MONTH"] as TeamDatePreset[]).map(
              (preset) => {
                const isSelected = selectedPreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onPresetChange(preset)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap",
                      isSelected
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {presetLabels[preset]}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Right Controls: Action Row with Reset & Export in ONE unified row */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-9.5 flex-1 sm:flex-initial px-3 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer gap-1.5 justify-center shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className={cn(
              "h-9.5 px-3.5 rounded-lg text-xs font-semibold border-border/80 bg-background/80 hover:bg-muted cursor-pointer gap-1.5 shadow-xs justify-center",
              hasActiveFilters ? "flex-1 sm:flex-initial" : "w-full sm:w-auto"
            )}
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TeamAttendanceFilters;
