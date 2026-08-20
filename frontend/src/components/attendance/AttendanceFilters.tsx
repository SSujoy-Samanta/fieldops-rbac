"use client";

import React from "react";
import {
  Calendar,
  Filter,
  RotateCcw,
  Download,
  CheckCircle2,
  Clock,
  ChevronDown,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type DatePreset = "ALL" | "TODAY" | "WEEK" | "MONTH";

interface AttendanceFiltersProps {
  selectedPreset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
  selectedStatus?: ATTENDANCE_STATUS;
  onStatusChange: (status?: ATTENDANCE_STATUS) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalLogs?: number;
  logsForExport?: AttendanceSession[];
}

export function AttendanceFilters({
  selectedPreset,
  onPresetChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  hasActiveFilters,
  totalLogs: _totalLogs,
  logsForExport,
}: AttendanceFiltersProps) {
  // Export CSV Helper
  const handleExportCsv = () => {
    if (!logsForExport || logsForExport.length === 0) {
      toast.info("No attendance records to export for current filter.");
      return;
    }

    try {
      const headers = ["Session ID", "Date", "Clock In", "Clock Out", "Duration (Mins)", "Status", "Location Notes"];
      const rows = logsForExport.map((log) => [
        `"${log.id}"`,
        `"${new Date(log.date).toLocaleDateString()}"`,
        `"${new Date(log.clockIn).toLocaleTimeString()}"`,
        log.clockOut ? `"${new Date(log.clockOut).toLocaleTimeString()}"` : '"In Progress"',
        log.durationMinutes ?? 0,
        `"${log.status}"`,
        `"${(log.locationNotes || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `my_attendance_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Attendance history exported as CSV.");
    } catch {
      toast.error("Failed to generate CSV export.");
    }
  };

  const presets: { key: DatePreset; label: string }[] = [
    { key: "ALL", label: "All History" },
    { key: "TODAY", label: "Today" },
    { key: "WEEK", label: "Last 7 Days" },
    { key: "MONTH", label: "This Month" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl">
      {/* ── Left Side: Date Range Presets ── */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-bold text-muted-foreground mr-1.5 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-orange-500" />
          <span>Range:</span>
        </span>

        {presets.map((preset) => {
          const isSelected = selectedPreset === preset.key;
          return (
            <Button
              key={preset.key}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPresetChange(preset.key)}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                isSelected
                  ? "border-orange-500/60 bg-orange-500/15 text-orange-700 dark:text-orange-300 shadow-xs ring-1 ring-orange-500/30"
                  : "border-border/60 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>

      {/* ── Right Side: Status Filter & Export Button ── */}
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
        {/* Status Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 transition-all cursor-pointer border-border/60 bg-background/60",
                  selectedStatus && "border-orange-500/60 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                )}
              />
            }
          >
            <Filter className="h-3.5 w-3.5" />
            <span>
              {selectedStatus === ATTENDANCE_STATUS.CLOCKED_IN
                ? "Active Only"
                : selectedStatus === ATTENDANCE_STATUS.CLOCKED_OUT
                ? "Completed"
                : "All Status"}
            </span>
            <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 p-1.5 rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                Filter by Status
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onStatusChange(undefined)}
                className="cursor-pointer rounded-lg text-xs font-medium py-1.5"
              >
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(ATTENDANCE_STATUS.CLOCKED_OUT)}
                className="cursor-pointer rounded-lg text-xs font-medium py-1.5 gap-2 text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Completed</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(ATTENDANCE_STATUS.CLOCKED_IN)}
                className="cursor-pointer rounded-lg text-xs font-medium py-1.5 gap-2 text-sky-600 dark:text-sky-400"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Active Session</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters (if active) */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        )}

        {/* Export CSV Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="h-8 px-3 rounded-lg text-xs font-semibold border-border/60 bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer gap-1.5"
        >
          <Download className="h-3.5 w-3.5 text-orange-500" />
          <span>Export CSV</span>
        </Button>
      </div>
    </div>
  );
}

export default AttendanceFilters;
