"use client";

import React from "react";
import {
  Search,
  X,
  RotateCcw,
  Download,
  Plus,
  ChevronDown,
  Briefcase,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  VISIT_PURPOSE,
  VISIT_OUTCOME,
  VISIT_PURPOSE_LABELS,
  VISIT_OUTCOME_LABELS,
  type VisitDatePreset,
} from "@/types/visit";
import { cn } from "@/lib/utils";

interface VisitsFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedPurpose?: VISIT_PURPOSE;
  onPurposeChange: (val?: VISIT_PURPOSE) => void;
  selectedOutcome?: VISIT_OUTCOME;
  onOutcomeChange: (val?: VISIT_OUTCOME) => void;
  selectedPreset: VisitDatePreset;
  onPresetChange: (preset: VisitDatePreset) => void;
  onResetFilters: () => void;
  onOpenCreateModal?: () => void;
  canCreateVisit?: boolean;
  hasActiveFilters: boolean;
  onExportCsv?: () => void;
}

export function VisitsFilters({
  search,
  onSearchChange,
  selectedPurpose,
  onPurposeChange,
  selectedOutcome,
  onOutcomeChange,
  selectedPreset,
  onPresetChange,
  onResetFilters,
  onOpenCreateModal,
  canCreateVisit = true,
  hasActiveFilters,
  onExportCsv,
}: VisitsFiltersProps) {
  const presetLabels: Record<VisitDatePreset, string> = {
    ALL: "All Logs",
    TODAY: "Today",
    WEEK: "Last 7 Days",
    MONTH: "This Month",
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-3.5 sm:p-5 backdrop-blur-xl shadow-xs overflow-hidden">
      {/* ── Top Bar: Search + Dropdown Filters + Action Buttons ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Search + Dropdowns */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* 1. Search Box: Full width on mobile, fixed on desktop */}
          <div className="relative w-full sm:w-72 lg:w-80 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customer, address, notes..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9.5 w-full pl-9 pr-8 text-xs rounded-lg border-border/80 bg-background/80 focus-visible:ring-orange-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* 2. Dropdown Filters: 2-column grid on mobile, row on tablet/desktop */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            {/* Purpose Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9.5 w-full sm:w-auto px-3 rounded-lg text-xs font-semibold border-border/80 bg-background/80 hover:bg-muted cursor-pointer gap-1.5 justify-between sm:justify-center",
                      selectedPurpose &&
                        "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                    )}
                  />
                }
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Briefcase className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span className="truncate">
                    {selectedPurpose
                      ? VISIT_PURPOSE_LABELS[selectedPurpose]
                      : "All Purposes"}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-52 rounded-lg border-border/80 bg-card/95 backdrop-blur-xl shadow-xl p-1"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Filter By Purpose
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => onPurposeChange(undefined)}
                    className="text-xs rounded-md cursor-pointer"
                  >
                    All Purposes
                  </DropdownMenuItem>
                  {Object.entries(VISIT_PURPOSE_LABELS).map(([key, label]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => onPurposeChange(key as VISIT_PURPOSE)}
                      className="text-xs rounded-md cursor-pointer"
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Outcome Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9.5 w-full sm:w-auto px-3 rounded-lg text-xs font-semibold border-border/80 bg-background/80 hover:bg-muted cursor-pointer gap-1.5 justify-between sm:justify-center",
                      selectedOutcome &&
                        "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                    )}
                  />
                }
              >
                <div className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">
                    {selectedOutcome
                      ? VISIT_OUTCOME_LABELS[selectedOutcome]
                      : "All Outcomes"}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-52 rounded-lg border-border/80 bg-card/95 backdrop-blur-xl shadow-xl p-1"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Filter By Outcome
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => onOutcomeChange(undefined)}
                    className="text-xs rounded-md cursor-pointer"
                  >
                    All Outcomes
                  </DropdownMenuItem>
                  {Object.entries(VISIT_OUTCOME_LABELS).map(([key, label]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => onOutcomeChange(key as VISIT_OUTCOME)}
                      className="text-xs rounded-md cursor-pointer"
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Right Side: Action Row with Reset, Export & Log Visit in Single Row */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-9.5 flex-1 sm:flex-initial px-3 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer gap-1.5 justify-center shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}

          {onExportCsv && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExportCsv}
              className={cn(
                "h-9.5 px-3 rounded-lg text-xs font-semibold border-border/80 bg-background/80 hover:bg-muted cursor-pointer gap-1.5 shadow-xs justify-center",
                hasActiveFilters ? "flex-1 sm:flex-initial" : "flex-1 sm:w-auto"
              )}
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Export CSV</span>
            </Button>
          )}

          {canCreateVisit && onOpenCreateModal && (
            <Button
              type="button"
              size="sm"
              onClick={onOpenCreateModal}
              className="h-9.5 flex-1 sm:flex-initial px-3.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 cursor-pointer gap-1.5 justify-center"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Visit</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Bottom Bar: Fully Responsive Date Range Presets ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 shrink-0">
              <Calendar className="h-3.5 w-3.5 text-orange-500" />
              <span>Timeframe:</span>
            </span>

            {hasActiveFilters && (
              <div className="sm:hidden text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md">
                Filters Active
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 sm:flex items-center gap-1 p-1 rounded-lg bg-background/80 border border-border/80 w-full sm:w-auto">
            {(["ALL", "TODAY", "WEEK", "MONTH"] as VisitDatePreset[]).map(
              (preset) => {
                const isSelected = selectedPreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onPresetChange(preset)}
                    className={cn(
                      "px-2 sm:px-3 py-1.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-semibold text-center transition-all cursor-pointer truncate",
                      isSelected
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {presetLabels[preset]}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="hidden sm:block text-[11px] font-medium text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-md shrink-0">
            Filters Active
          </div>
        )}
      </div>
    </div>
  );
}

export default VisitsFilters;
