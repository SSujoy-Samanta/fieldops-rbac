"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Square,
  MapPin,
  Loader2,
} from "lucide-react";
import { useClockOut } from "@/hooks/useAttendance";
import type { AttendanceSession } from "@/types/attendance";

interface ClockOutModalProps {
  session: AttendanceSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClockOutModal({
  session,
  isOpen,
  onClose,
}: ClockOutModalProps) {
  const [checkoutNotes, setCheckoutNotes] = useState<string>("");
  const clockOutMutation = useClockOut();

  if (!session) return null;

  const clockInTime = new Date(session.clockIn);
  const now = new Date();
  const elapsedMinutes = Math.max(
    1,
    Math.round((now.getTime() - clockInTime.getTime()) / (1000 * 60))
  );
  const hours = Math.floor(elapsedMinutes / 60);
  const mins = elapsedMinutes % 60;
  const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const handleConfirmClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync({
        locationNotes: checkoutNotes.trim() || undefined,
      });
      setCheckoutNotes("");
      onClose();
    } catch {
      // Toast handled by hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card">
        {/* ── Top Brand Gradient Bar ── */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500/40 via-rose-500 to-rose-500/40 shrink-0" />

        <div className="p-6">
          {/* Header */}
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
                <Square className="h-5 w-5 fill-rose-500" />
              </div>
              <div className="flex flex-col text-left">
                <DialogTitle className="text-lg font-bold text-foreground">
                  End Shift & Clock Out
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Confirm your checkout to calculate total shift hours.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Shift Summary Strip */}
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] flex flex-col gap-3 my-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Shift Started At:</span>
              <span className="font-bold text-foreground font-mono">
                {clockInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-rose-500/15 pt-2">
              <span className="text-muted-foreground">Current Duration:</span>
              <span className="font-black text-rose-600 dark:text-rose-400 font-mono text-sm">
                {durationText}
              </span>
            </div>

            {session.locationNotes && (
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground border-t border-rose-500/15 pt-2">
                <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="truncate">{session.locationNotes}</span>
              </div>
            )}
          </div>

          {/* Checkout Remarks Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Checkout Remarks / Notes (Optional)
            </label>
            <Input
              placeholder="e.g. Completed all scheduled deliveries, leaving site"
              value={checkoutNotes}
              onChange={(e) => setCheckoutNotes(e.target.value)}
              className="h-10 rounded-lg text-xs border-border/80 bg-background/80 focus-visible:ring-rose-500"
              disabled={clockOutMutation.isPending}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={clockOutMutation.isPending}
            className="h-10 px-4 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleConfirmClockOut}
            disabled={clockOutMutation.isPending}
            className="h-10 px-5 rounded-lg text-xs font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-2"
          >
            {clockOutMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Ending Shift...</span>
              </>
            ) : (
              <>
                <Square className="h-3.5 w-3.5 fill-white" />
                <span>Confirm Clock Out</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClockOutModal;
