"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useDeleteVisit } from "@/hooks/useVisits";
import type { Visit } from "@/types/visit";

interface DeleteVisitModalProps {
  visit: Visit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteVisitModal({
  visit,
  open,
  onOpenChange,
}: DeleteVisitModalProps) {
  const { mutate: deleteVisit, isPending } = useDeleteVisit();

  const handleDelete = () => {
    if (!visit) return;
    deleteVisit(visit.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-rose-500/30 bg-card shadow-2xl">
        <div className="h-1.5 w-full bg-rose-500 shrink-0" />
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-lg font-bold font-righteous text-foreground">
                Delete Visit Log
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This action is permanent and cannot be undone.
              </DialogDescription>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 text-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Customer:</span>
              <span className="font-bold text-foreground">
                {visit?.customerName}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Address:</span>
              <span className="font-medium text-foreground truncate max-w-[200px]">
                {visit?.address}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Visit Date:</span>
              <span className="font-mono text-foreground">
                {visit?.visitDate
                  ? new Date(visit.visitDate).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Unified Footer */}
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
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="h-9 px-5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-600/20"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Permanently Delete</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteVisitModal;
