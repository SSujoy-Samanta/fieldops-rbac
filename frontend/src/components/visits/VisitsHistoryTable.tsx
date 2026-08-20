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
  MapPin,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  VISIT_PURPOSE_LABELS,
  VISIT_OUTCOME_LABELS,
  type Visit,
  VISIT_OUTCOME,
  type VisitsPagination,
} from "@/types/visit";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface VisitsHistoryTableProps {
  visits: Visit[];
  pagination?: VisitsPagination;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onViewDetails: (visit: Visit) => void;
  onEditVisit: (visit: Visit) => void;
  onDeleteVisit: (visit: Visit) => void;
  onOpenCreateModal?: () => void;
}

export function VisitsHistoryTable({
  visits,
  pagination,
  isLoading,
  onPageChange,
  onViewDetails,
  onEditVisit,
  onDeleteVisit,
  onOpenCreateModal,
}: VisitsHistoryTableProps) {
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

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl shadow-xs">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-lg" />
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
          <MapPin className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold font-righteous text-foreground">
          No Field Visits Found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
          No customer visit records match your selected filters or you haven&apos;t logged any visits yet.
        </p>
        {onOpenCreateModal && (
          <Button
            type="button"
            size="sm"
            onClick={onOpenCreateModal}
            className="h-9 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 cursor-pointer"
          >
            Log First Visit
          </Button>
        )}
      </div>
    );
  }

  const { page = 1, totalPages = 1, total = 0 } = pagination || {};

  return (
    <div className="flex flex-col gap-4">
      {/* ── Main Table Card ────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-[220px] text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Customer & Date
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
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Notes
                </TableHead>
                <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-[80px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visits.map((visit) => {
                const outcomeStyle =
                  outcomeColors[visit.outcome] || outcomeColors.COMPLETED;

                return (
                  <TableRow
                    key={visit.id}
                    className="border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    {/* Customer & Date */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground truncate max-w-[160px] sm:max-w-[200px]">
                            {visit.customerName}
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(visit.visitDate), "MMM d, yyyy · p")}
                          </span>
                        </div>
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

                    {/* Notes */}
                    <TableCell className="py-3">
                      {visit.notes ? (
                        <span
                          className="text-xs text-muted-foreground line-clamp-1 max-w-[160px]"
                          title={visit.notes}
                        >
                          {visit.notes}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">
                          None
                        </span>
                      )}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                            />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 rounded-lg border-border/80 bg-card/95 backdrop-blur-xl shadow-xl p-1"
                        >
                          <DropdownMenuItem
                            onClick={() => onViewDetails(visit)}
                            className="text-xs rounded-md cursor-pointer gap-2"
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-500" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditVisit(visit)}
                            className="text-xs rounded-md cursor-pointer gap-2"
                          >
                            <Edit className="h-3.5 w-3.5 text-amber-500" />
                            <span>Edit Record</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteVisit(visit)}
                            className="text-xs rounded-md cursor-pointer gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete Log</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
              <strong className="text-foreground">{totalPages}</strong> ({total} visits)
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

export default VisitsHistoryTable;
