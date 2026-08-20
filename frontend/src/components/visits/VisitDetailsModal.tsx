"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  User,
} from "lucide-react";
import {
  VISIT_PURPOSE_LABELS,
  VISIT_OUTCOME_LABELS,
  type Visit,
  VISIT_OUTCOME,
} from "@/types/visit";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface VisitDetailsModalProps {
  visit: Visit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VisitDetailsModal({
  visit,
  open,
  onOpenChange,
}: VisitDetailsModalProps) {
  if (!visit) return null;

  const outcomeColors: Record<VISIT_OUTCOME, { bg: string; text: string; border: string }> = {
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

  const outcomeStyle = outcomeColors[visit.outcome] || outcomeColors.COMPLETED;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />

        <div className="p-6 flex flex-col gap-5">
          <DialogHeader className="p-0 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold font-righteous text-foreground">
                    {visit.customerName}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {format(new Date(visit.visitDate), "PPP 'at' p")}
                    </span>
                  </DialogDescription>
                </div>
              </div>

              {/* Outcome Badge */}
              <div
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0",
                  outcomeStyle.bg,
                  outcomeStyle.text,
                  outcomeStyle.border
                )}
              >
                {VISIT_OUTCOME_LABELS[visit.outcome]}
              </div>
            </div>
          </DialogHeader>

          {/* Details Grid */}
          <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs">
            {/* User if present */}
            {visit.user && (
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-orange-500" />
                  <span>Field Representative:</span>
                </span>
                <span className="font-semibold text-foreground">
                  {visit.user.name} ({visit.user.email})
                </span>
              </div>
            )}

            {/* Purpose */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-orange-500" />
                <span>Visit Purpose:</span>
              </span>
              <span className="font-semibold text-foreground">
                {VISIT_PURPOSE_LABELS[visit.purpose]}
              </span>
            </div>

            {/* Site Address */}
            <div className="flex flex-col gap-1 pt-2 border-t border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-orange-500" />
                <span>Site Location / Address:</span>
              </span>
              <span className="font-medium text-foreground bg-background/60 p-2.5 rounded-lg border border-border/50 select-all font-mono text-[11px]">
                {visit.address}
              </span>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1 pt-2 border-t border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Discussion Notes & Observations:</span>
              </span>
              <div className="font-normal text-foreground bg-background/60 p-2.5 rounded-lg border border-border/50 whitespace-pre-wrap leading-relaxed">
                {visit.notes || (
                  <span className="italic text-muted-foreground">
                    No additional notes recorded for this visit.
                  </span>
                )}
              </div>
            </div>

            {/* Record Timestamps */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
              <span>Log ID: {visit.id}</span>
              <span>
                Created: {format(new Date(visit.createdAt), "MMM d, yyyy HH:mm")}
              </span>
            </div>
          </div>
        </div>

        {/* Unified Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-lg text-xs font-semibold border-border/80 hover:bg-muted cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VisitDetailsModal;
