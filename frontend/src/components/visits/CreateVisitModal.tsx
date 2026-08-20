"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  LocateFixed,
  AlertTriangle,
  ArrowRight,
  Lock,
} from "lucide-react";
import {
  VISIT_PURPOSE,
  VISIT_OUTCOME,
  VISIT_PURPOSE_LABELS,
  VISIT_OUTCOME_LABELS,
  type CreateVisitInput,
} from "@/types/visit";
import { useCreateVisit } from "@/hooks/useVisits";
import { useTodayAttendance } from "@/hooks/useAttendance";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateVisitModal({ open, onOpenChange }: CreateVisitModalProps) {
  const { mutate: createVisit, isPending } = useCreateVisit();
  const { data: todayStatus, isLoading: checkingShift } = useTodayAttendance();
  const { isOwner } = usePermissions();

  const [customerName, setCustomerName] = useState("");
  const [purpose, setPurpose] = useState<VISIT_PURPOSE>(
    VISIT_PURPOSE.ROUTINE_INSPECTION
  );
  const [outcome, setOutcome] = useState<VISIT_OUTCOME>(
    VISIT_OUTCOME.COMPLETED
  );
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // Operational rule: Owners bypass attendance requirement, other staff must be clocked in
  const isClockedIn = Boolean(todayStatus?.isClockedIn);
  const canSubmit = isOwner || isClockedIn;

  const resetForm = () => {
    setCustomerName("");
    setPurpose(VISIT_PURPOSE.ROUTINE_INSPECTION);
    setOutcome(VISIT_OUTCOME.COMPLETED);
    setAddress("");
    setNotes("");
  };

  const handleFetchGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", {
        description: "Your browser does not support GPS location services.",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = position.coords;
        const gpsString = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)} (±${Math.round(accuracy)}m)`;
        setAddress((prev) => (prev ? `${prev} [GPS: ${gpsString}]` : gpsString));
        toast.success("GPS Location Captured", {
          description: `Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        });
      },
      (error) => {
        setIsLocating(false);
        toast.error("GPS Capture Failed", {
          description:
            error.message || "Please enable location access in browser settings.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      toast.error("Shift Not Active", {
        description: "You must clock in on your shift before recording field visits.",
      });
      return;
    }

    if (!customerName.trim()) {
      toast.error("Validation Error", {
        description: "Customer or company name is required.",
      });
      return;
    }

    if (!address.trim()) {
      toast.error("Validation Error", {
        description: "Visit address or location is required.",
      });
      return;
    }

    const payload: CreateVisitInput = {
      customerName: customerName.trim(),
      purpose,
      outcome,
      address: address.trim(),
      notes: notes.trim() || undefined,
      visitDate: new Date().toISOString(),
    };

    createVisit(payload, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isPending) {
          onOpenChange(val);
          if (!val) resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl">
        {/* Top Brand Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 shrink-0" />

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Main Body */}
          <div className="p-6 flex flex-col gap-4">
            {/* Header */}
            <DialogHeader className="p-0 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <DialogTitle className="text-lg font-bold font-righteous text-foreground">
                    Record Customer Visit
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Log on-site client interactions, demos, and inspection outcomes
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Shift Inactive Warning Banner */}
            {!checkingShift && !canSubmit && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-700 dark:text-amber-300 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div className="leading-relaxed">
                    <span className="font-bold">Shift Not Active: </span>
                    Operational compliance policy requires you to be clocked in before recording visits.
                  </div>
                </div>
                <Link
                  href="/attendance"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 shrink-0 cursor-pointer transition-colors border border-amber-500/30"
                >
                  <span>Clock In Now</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Form Fields Container */}
            <div className="flex flex-col gap-3.5">
              {/* Customer Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">
                  Customer / Company Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Apex Industrial Supplies, John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={!canSubmit || isPending}
                  className={cn(
                    "h-9.5 rounded-lg text-xs border-border/80 bg-background/80 focus-visible:ring-orange-500",
                    !canSubmit && "cursor-not-allowed opacity-60 bg-muted/40"
                  )}
                  required
                />
              </div>

              {/* Purpose & Outcome grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Purpose */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-orange-500" />
                    <span>Visit Purpose</span>
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as VISIT_PURPOSE)}
                    disabled={!canSubmit || isPending}
                    className={cn(
                      "h-9.5 rounded-lg text-xs border border-border/80 bg-background/80 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500",
                      canSubmit ? "cursor-pointer" : "cursor-not-allowed opacity-60 bg-muted/40"
                    )}
                  >
                    {Object.entries(VISIT_PURPOSE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Outcome */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Visit Outcome</span>
                  </label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as VISIT_OUTCOME)}
                    disabled={!canSubmit || isPending}
                    className={cn(
                      "h-9.5 rounded-lg text-xs border border-border/80 bg-background/80 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500",
                      canSubmit ? "cursor-pointer" : "cursor-not-allowed opacity-60 bg-muted/40"
                    )}
                  >
                    {Object.entries(VISIT_OUTCOME_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Site Address with GPS capture button */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    <span>Site Address / Location <span className="text-rose-500">*</span></span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleFetchGps}
                    disabled={!canSubmit || isLocating || isPending}
                    className={cn(
                      "h-6 px-2 text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 gap-1",
                      canSubmit ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                    )}
                  >
                    {isLocating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <LocateFixed className="h-3 w-3" />
                    )}
                    <span>{isLocating ? "Fetching GPS..." : "Auto-Detect GPS"}</span>
                  </Button>
                </div>
                <Input
                  placeholder="e.g. 742 Evergreen Terrace, Sector 4, Springfield"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!canSubmit || isPending}
                  className={cn(
                    "h-9.5 rounded-lg text-xs border-border/80 bg-background/80 focus-visible:ring-orange-500",
                    !canSubmit && "cursor-not-allowed opacity-60 bg-muted/40"
                  )}
                  required
                />
              </div>

              {/* Notes / Remarks */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Meeting Notes & Next Steps (Optional)</span>
                </label>
                <Textarea
                  placeholder="Add meeting discussion summary, quote requests, follow-up dates, or site observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!canSubmit || isPending}
                  rows={3}
                  className={cn(
                    "rounded-lg text-xs border-border/80 bg-background/80 focus-visible:ring-orange-500 resize-none",
                    !canSubmit && "cursor-not-allowed opacity-60 bg-muted/40"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Unified Footer Actions matching ClockOutModal / CreateUserModal standard */}
          <div className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 px-4 rounded-lg text-xs font-semibold border-border/80 hover:bg-muted cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!canSubmit || isPending}
              className={cn(
                "h-9 px-5 rounded-lg text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all",
                canSubmit
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20 cursor-pointer"
                  : "bg-muted-foreground/30 text-muted-foreground cursor-not-allowed opacity-60 shadow-none"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Logging Visit...</span>
                </>
              ) : !canSubmit ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Clock In Required to Save</span>
                </>
              ) : (
                <span>Save Field Visit</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateVisitModal;
