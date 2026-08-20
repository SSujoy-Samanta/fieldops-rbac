"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Save, RotateCcw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MatrixActionBarProps {
  changeCount: number;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function MatrixActionBar({
  changeCount,
  isSaving,
  onSave,
  onDiscard,
}: MatrixActionBarProps) {
  if (changeCount === 0) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="pointer-events-auto flex items-center justify-between gap-2.5 sm:gap-4 px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-lg border border-orange-500/40 bg-background/95 backdrop-blur-2xl shadow-2xl shadow-orange-500/20 max-w-2xl w-full">
        {/* ── Left Info Section ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-md bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 shrink-0">
            <Sparkles className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold text-foreground whitespace-nowrap">
                Unsaved Changes
              </span>
              <Badge
                variant="outline"
                className="text-[10px] font-mono font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 px-1.5 py-0 rounded-md shrink-0 whitespace-nowrap"
              >
                {changeCount} {changeCount === 1 ? "diff" : "diffs"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate hidden md:block">
              Saving triggers immediate Redis tag-based RBAC cache sync.
            </p>
          </div>
        </div>

        {/* ── Right Action Buttons ──────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
            className="text-xs font-semibold hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg h-8 sm:h-9 px-2.5 sm:px-3"
          >
            <RotateCcw className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Discard</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 cursor-pointer rounded-lg h-8 sm:h-9 px-3 sm:px-4 active:scale-95 transition-all shrink-0"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin sm:mr-1.5" />
                <span className="hidden sm:inline">Saving…</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 sm:mr-1.5" />
                <span>Save Matrix</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MatrixActionBar;
