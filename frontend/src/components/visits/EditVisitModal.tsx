"use client";

import React, { useState, useEffect } from "react";
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
  Edit,
} from "lucide-react";
import {
  VISIT_PURPOSE,
  VISIT_OUTCOME,
  VISIT_PURPOSE_LABELS,
  VISIT_OUTCOME_LABELS,
  type Visit,
  type UpdateVisitInput,
} from "@/types/visit";
import { useUpdateVisit } from "@/hooks/useVisits";
import { toast } from "sonner";

interface EditVisitModalProps {
  visit: Visit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVisitModal({
  visit,
  open,
  onOpenChange,
}: EditVisitModalProps) {
  const { mutate: updateVisit, isPending } = useUpdateVisit();

  const [customerName, setCustomerName] = useState("");
  const [purpose, setPurpose] = useState<VISIT_PURPOSE>(
    VISIT_PURPOSE.ROUTINE_INSPECTION
  );
  const [outcome, setOutcome] = useState<VISIT_OUTCOME>(
    VISIT_OUTCOME.COMPLETED
  );
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (visit) {
      setCustomerName(visit.customerName);
      setPurpose(visit.purpose);
      setOutcome(visit.outcome);
      setAddress(visit.address);
      setNotes(visit.notes || "");
    }
  }, [visit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visit) return;

    if (!customerName.trim()) {
      toast.error("Validation Error", {
        description: "Customer or company name is required.",
      });
      return;
    }

    if (!address.trim()) {
      toast.error("Validation Error", {
        description: "Visit address is required.",
      });
      return;
    }

    const payload: UpdateVisitInput = {
      customerName: customerName.trim(),
      purpose,
      outcome,
      address: address.trim(),
      notes: notes.trim() ? notes.trim() : null,
    };

    updateVisit(
      { id: visit.id, payload },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
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
                  <Edit className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <DialogTitle className="text-lg font-bold font-righteous text-foreground">
                    Edit Visit Record
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Update customer details, visit purpose, or outcome status
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Form Fields */}
            <div className="flex flex-col gap-3.5">
              {/* Customer Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">
                  Customer / Company Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Apex Industrial Supplies"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={isPending}
                  className="h-9.5 rounded-lg text-xs border-border/80 bg-background/80 focus-visible:ring-orange-500"
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
                    disabled={isPending}
                    className="h-9.5 rounded-lg text-xs border border-border/80 bg-background/80 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
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
                    disabled={isPending}
                    className="h-9.5 rounded-lg text-xs border border-border/80 bg-background/80 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {Object.entries(VISIT_OUTCOME_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Site Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span>Site Address <span className="text-rose-500">*</span></span>
                </label>
                <Input
                  placeholder="Visit address or location"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isPending}
                  className="h-9.5 rounded-lg text-xs border-border/80 bg-background/80 focus-visible:ring-orange-500"
                  required
                />
              </div>

              {/* Notes / Remarks */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Meeting Notes & Next Steps</span>
                </label>
                <Textarea
                  placeholder="Update discussion notes, follow-up dates..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isPending}
                  rows={3}
                  className="rounded-lg text-xs border-border/80 bg-background/80 focus-visible:ring-orange-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
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
              disabled={isPending}
              className="h-9 px-5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 cursor-pointer flex items-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditVisitModal;
