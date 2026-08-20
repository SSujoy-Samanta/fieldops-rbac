"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Compass,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import {
  VISIT_PURPOSE_LABELS,
  VISIT_OUTCOME_LABELS,
  type Visit,
  VISIT_OUTCOME,
  type VisitsPagination,
} from "@/types/visit";
import { SYSTEM_ROLE } from "@/types/rbac";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TeamVisitsTableProps {
  visits: Visit[];
  pagination?: VisitsPagination;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onViewDetails: (visit: Visit) => void;
}

export function TeamVisitsTable({
  visits,
  pagination,
  isLoading,
  onPageChange,
  onViewDetails,
}: TeamVisitsTableProps) {
  const outcomeColors: Record<
    VISIT_OUTCOME,
    { bg: string; text: string; border: string }
  > = {
    COMPLETED: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/30",
    },
    DEAL_CLOSED: {
      bg: "bg-purple-500/10 dark:bg-purple-500/15",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-500/30",
    },
    FOLLOW_UP_REQUIRED: {
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/30",
    },
    RESCHEDULED: {
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-500/30",
    },
    NO_SHOW: {
      bg: "bg-rose-500/10 dark:bg-rose-500/15",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-500/30",
    },
  };

  const roleStyles: Record<SYSTEM_ROLE, { bg: string; text: string; border: string; label: string }> = {
    OWNER: {
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-500/30",
      label: "Owner",
    },
    MANAGER: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-500/30",
      label: "Manager",
    },
    FIELD_EMPLOYEE: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/30",
      label: "Field Agent",
    },
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl shadow-xs">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
              <Skeleton className="h-6 w-28 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-border/80 bg-card/40 text-center backdrop-blur-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 mb-3">
          <Compass className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold font-righteous text-foreground">
          No Team Visits Found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          No customer field visits recorded for the selected search query or date range.
        </p>
      </div>
    );
  }

  const { page = 1, totalPages = 1, total = 0 } = pagination || {};

  return (
    <div className="flex flex-col gap-4">
      {/* ── Main Data Table Card ───────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-[230px] text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Field Representative
                </TableHead>
                <TableHead className="w-[200px] text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Customer & Time
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Purpose
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Outcome
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Site Location
                </TableHead>
                <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-[90px]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visits.map((visit) => {
                const outcomeStyle =
                  outcomeColors[visit.outcome] || outcomeColors.COMPLETED;

                const role = visit.user?.role?.name as SYSTEM_ROLE | undefined;
                const roleStyle = role ? roleStyles[role] : roleStyles.FIELD_EMPLOYEE;

                const userInitials =
                  visit.user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "U";

                return (
                  <TableRow
                    key={visit.id}
                    className="border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    {/* Employee info */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs border border-orange-500/30">
                          {userInitials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground truncate max-w-[120px] sm:max-w-[150px]">
                              {visit.user?.name || "Staff Member"}
                            </span>
                            <span
                              className={cn(
                                "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border",
                                roleStyle.bg,
                                roleStyle.text,
                                roleStyle.border
                              )}
                            >
                              {roleStyle.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                            {visit.user?.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Customer & Timestamp */}
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground truncate max-w-[160px] sm:max-w-[190px]">
                          {visit.customerName}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(visit.visitDate), "MMM d · p")}
                        </span>
                      </div>
                    </TableCell>

                    {/* Purpose */}
                    <TableCell className="py-3">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/60 text-foreground border border-border/60 text-[11px] font-medium">
                        <Briefcase className="h-3 w-3 text-orange-500" />
                        <span>{VISIT_PURPOSE_LABELS[visit.purpose]}</span>
                      </div>
                    </TableCell>

                    {/* Outcome */}
                    <TableCell className="py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border",
                          outcomeStyle.bg,
                          outcomeStyle.text,
                          outcomeStyle.border
                        )}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{VISIT_OUTCOME_LABELS[visit.outcome]}</span>
                      </span>
                    </TableCell>

                    {/* Site Location */}
                    <TableCell className="py-3">
                      <span
                        className="text-xs text-muted-foreground truncate block max-w-[180px] sm:max-w-[220px]"
                        title={visit.address}
                      >
                        {visit.address}
                      </span>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(visit)}
                        className="h-8 px-2.5 rounded-lg text-xs font-semibold border-border/70 bg-background/60 hover:bg-muted cursor-pointer gap-1"
                      >
                        <Eye className="h-3.5 w-3.5 text-orange-500" />
                        <span className="hidden sm:inline">Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination Footer ────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20 text-xs">
            <span className="text-muted-foreground">
              Showing page <strong className="text-foreground">{page}</strong> of{" "}
              <strong className="text-foreground">{totalPages}</strong> ({total} total visits)
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="h-8 px-2.5 rounded-lg text-xs font-semibold border-border/70 bg-background/60 hover:bg-muted cursor-pointer gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="h-8 px-2.5 rounded-lg text-xs font-semibold border-border/70 bg-background/60 hover:bg-muted cursor-pointer gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamVisitsTable;
