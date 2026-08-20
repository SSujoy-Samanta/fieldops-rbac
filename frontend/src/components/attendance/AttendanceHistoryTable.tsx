"use client";

import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
import { Skeleton } from "@/components/ui/skeleton";
import { ATTENDANCE_STATUS, AttendanceSession } from "@/types/attendance";
import type { PaginationMeta } from "@/types/user";
import { cn } from "@/lib/utils";

interface AttendanceHistoryTableProps {
  logs: AttendanceSession[];
  pagination?: PaginationMeta;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function AttendanceHistoryTable({
  logs,
  pagination,
  currentPage,
  onPageChange,
  isLoading,
  onClearFilters,
  hasActiveFilters,
}: AttendanceHistoryTableProps) {
  // Format Duration helper (e.g. 510 mins -> 8h 30m)
  const formatDuration = (mins: number | null) => {
    if (mins === null || mins === undefined) return "--";
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) return `${remainingMins}m`;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Table Container ── */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px] px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Date & Day
                </TableHead>
                <TableHead className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Clock In
                </TableHead>
                <TableHead className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Clock Out
                </TableHead>
                <TableHead className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Duration
                </TableHead>
                <TableHead className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Location / Notes
                </TableHead>
                <TableHead className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                  Shift Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                // ── Skeleton Loader Rows ──
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/30">
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-28 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-20 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-20 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded-md" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-32 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end">
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                // ── Empty State ──
                <TableRow>
                  <TableCell colSpan={6} className="h-72 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto p-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shadow-xs">
                        <Calendar className="h-7 w-7" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        No Attendance Records Found
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {hasActiveFilters
                          ? "No shift records match your selected date range or status filters."
                          : "You have not logged any shifts yet. Use the Clock-In widget above to start your first session!"}
                      </p>
                      {hasActiveFilters && onClearFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onClearFilters}
                          className="mt-2 h-8 rounded-lg text-xs font-semibold border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 cursor-pointer"
                        >
                          Clear Active Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // ── Data Rows ──
                logs.map((log) => {
                  const clockInDate = new Date(log.clockIn);
                  const clockOutDate = log.clockOut ? new Date(log.clockOut) : null;
                  const isCurrentSession = log.status === ATTENDANCE_STATUS.CLOCKED_IN;

                  return (
                    <TableRow
                      key={log.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      {/* Date & Day */}
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground">
                            {clockInDate.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {clockInDate.toLocaleDateString(undefined, {
                              weekday: "long",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Clock In */}
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-foreground">
                          <Clock className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                          <span>
                            {clockInDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Clock Out */}
                      <TableCell className="px-6 py-4">
                        {clockOutDate ? (
                          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-foreground">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>
                              {clockOutDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          >
                            Active Now
                          </Badge>
                        )}
                      </TableCell>

                      {/* Duration Pill */}
                      <TableCell className="px-6 py-4">
                        {isCurrentSession ? (
                          <Badge
                            variant="outline"
                            className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30"
                          >
                            In Progress
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border",
                              (log.durationMinutes || 0) >= 480
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                : (log.durationMinutes || 0) >= 240
                                ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
                                : "bg-muted/60 text-muted-foreground border-border/80"
                            )}
                          >
                            {formatDuration(log.durationMinutes)}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Location / Notes */}
                      <TableCell className="px-6 py-4">
                        {log.locationNotes ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-[240px] truncate" title={log.locationNotes}>
                            <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                            <span className="truncate">{log.locationNotes}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">
                            No notes
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          {isCurrentSession ? (
                            <Badge
                              variant="outline"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                              <span>Active</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Completed</span>
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Table Footer / Pagination ── */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border/60 bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-bold text-foreground">
                {(currentPage - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-foreground">
                {Math.min(currentPage * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-bold text-foreground">{pagination.total}</span> records
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="h-8 px-3 rounded-lg text-xs font-semibold gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Button>

              <span className="text-xs font-bold font-mono px-2 text-foreground">
                Page {currentPage} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages || isLoading}
                className="h-8 px-3 rounded-lg text-xs font-semibold gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceHistoryTable;
