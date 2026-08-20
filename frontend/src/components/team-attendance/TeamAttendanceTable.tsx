"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceSession, ATTENDANCE_STATUS } from "@/types/attendance";
import type { PaginationMeta } from "@/types/user";
import { SYSTEM_ROLE } from "@/types/rbac";

interface TeamAttendanceTableProps {
  logs: AttendanceSession[];
  pagination?: PaginationMeta;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

/**
 * Live duration ticker for currently clocked in staff
 */
function LiveShiftDuration({ clockIn }: { clockIn: string }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const start = new Date(clockIn).getTime();
    const update = () => {
      const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
      setSeconds(diff);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [clockIn]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold shadow-2xs">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span>{timeStr}</span>
    </div>
  );
}

export function TeamAttendanceTable({
  logs,
  pagination,
  currentPage,
  onPageChange,
  isLoading,
  onClearFilters,
  hasActiveFilters,
}: TeamAttendanceTableProps) {
  const totalPages = pagination?.totalPages || 1;
  const totalLogs = pagination?.total || logs.length;

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (roleName?: string) => {
    switch (roleName) {
      case SYSTEM_ROLE.OWNER:
        return (
          <Badge
            variant="outline"
            className="text-[10px] font-bold border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
          >
            Executive Owner
          </Badge>
        );
      case SYSTEM_ROLE.MANAGER:
        return (
          <Badge
            variant="outline"
            className="text-[10px] font-bold border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          >
            Operations Manager
          </Badge>
        );
      case SYSTEM_ROLE.FIELD_EMPLOYEE:
      default:
        return (
          <Badge
            variant="outline"
            className="text-[10px] font-bold border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            Field Employee
          </Badge>
        );
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (minutes === null || minutes === undefined) return "—";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return {
      dateStr: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Main Data Table Card ───────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-[240px] text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Employee
                </TableHead>
                <TableHead className="w-[150px] text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Role
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Clock In
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Clock Out
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Shift Duration
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="w-[200px] text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Location / Notes
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* 1. Skeleton Loading Rows */}
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx} className="border-border/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex flex-col gap-1.5">
                          <Skeleton className="h-3.5 w-24 rounded-md" />
                          <Skeleton className="h-3 w-32 rounded-md" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-3.5 w-16 rounded-md" />
                        <Skeleton className="h-3 w-20 rounded-md" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-3.5 w-16 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-3.5 w-32 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                /* 2. Empty State */
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 p-6 max-w-md mx-auto">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col gap-1 text-center">
                        <h4 className="text-sm font-bold text-foreground">
                          No Team Attendance Records Found
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {hasActiveFilters
                            ? "No team shifts match your active search and filter criteria."
                            : "No workforce attendance sessions have been logged in this period."}
                        </p>
                      </div>
                      {hasActiveFilters && onClearFilters && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onClearFilters}
                          className="h-8 px-3 rounded-lg text-xs font-semibold mt-1 cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          Reset Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                /* 3. Real Data Rows */
                logs.map((session) => {
                  const inDate = formatDate(session.clockIn);
                  const isClockedIn =
                    session.status === ATTENDANCE_STATUS.CLOCKED_IN;
                  const employee = session.user;

                  return (
                    <TableRow
                      key={session.id}
                      className="border-border/50 transition-colors hover:bg-muted/30"
                    >
                      {/* Employee Column */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border/80 shrink-0">
                            {employee?.avatar && (
                              <AvatarImage
                                src={employee.avatar}
                                alt={employee.name}
                              />
                            )}
                            <AvatarFallback className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400 text-xs font-black font-mono">
                              {getInitials(employee?.name || "User")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-xs text-foreground truncate max-w-[150px]">
                              {employee?.name || "Unknown Staff"}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[150px]">
                              {employee?.email || "—"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role Column */}
                      <TableCell>
                        {getRoleBadge(employee?.role?.name)}
                      </TableCell>

                      {/* Clock In Column */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-foreground font-mono">
                            {formatTime(session.clockIn)}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {inDate.weekday}, {inDate.dateStr}
                            </span>
                          </span>
                        </div>
                      </TableCell>

                      {/* Clock Out Column */}
                      <TableCell>
                        {session.clockOut ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-foreground font-mono">
                              {formatTime(session.clockOut)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDate(session.clockOut).dateStr}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active On Duty</span>
                          </div>
                        )}
                      </TableCell>

                      {/* Shift Duration Column */}
                      <TableCell>
                        {isClockedIn ? (
                          <LiveShiftDuration clockIn={session.clockIn} />
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/60 border border-border/60 text-foreground font-mono text-xs font-semibold">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDuration(session.durationMinutes)}</span>
                          </div>
                        )}
                      </TableCell>

                      {/* Status Badge Column */}
                      <TableCell>
                        {isClockedIn ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 gap-1.5"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Clocked In</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 text-[11px] font-medium px-2 py-0.5 gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3 text-slate-500" />
                            <span>Clocked Out</span>
                          </Badge>
                        )}
                      </TableCell>

                      {/* Location / Notes Column */}
                      <TableCell>
                        {session.locationNotes ? (
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground max-w-[190px]">
                            <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                            <span
                              className="truncate"
                              title={session.locationNotes}
                            >
                              {session.locationNotes}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Footer Pagination Bar ───────────────────────────────────── */}
        <div className="flex items-center justify-between p-4 border-t border-border/60 bg-muted/20 text-xs">
          <span className="text-muted-foreground">
            Showing <strong className="text-foreground">{logs.length}</strong> of{" "}
            <strong className="text-foreground">{totalLogs}</strong> shifts logged
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="h-8 w-8 p-0 rounded-lg cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-xs font-semibold text-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="h-8 w-8 p-0 rounded-lg cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamAttendanceTable;
