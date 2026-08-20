"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  RotateCcw,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequirePermission } from "@/components/RequirePermission";
import { PERMISSION_KEY } from "@/types/rbac";
import {
  VISIT_PURPOSE,
  VISIT_OUTCOME,
  type VisitDatePreset,
  type Visit,
  VISIT_PURPOSE_LABELS,
  VISIT_OUTCOME_LABELS,
} from "@/types/visit";
import { useSelfVisits } from "@/hooks/useVisits";
import { usePermissions } from "@/hooks/usePermissions";
import { VisitsStats } from "./VisitsStats";
import { VisitsFilters } from "./VisitsFilters";
import { VisitsHistoryTable } from "./VisitsHistoryTable";
import { CreateVisitModal } from "./CreateVisitModal";
import { EditVisitModal } from "./EditVisitModal";
import { DeleteVisitModal } from "./DeleteVisitModal";
import { VisitDetailsModal } from "./VisitDetailsModal";
import { subDays, startOfMonth, format } from "date-fns";
import { toast } from "sonner";

export function VisitsManager() {
  const { can } = usePermissions();
  const canSaveVisit = can(PERMISSION_KEY.SAVE_VISIT);

  // ── Filter & Query State ───────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<VISIT_PURPOSE | undefined>();
  const [selectedOutcome, setSelectedOutcome] = useState<VISIT_OUTCOME | undefined>();
  const [selectedPreset, setSelectedPreset] = useState<VisitDatePreset>("ALL");
  const [page, setPage] = useState(1);

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [deletingVisit, setDeletingVisit] = useState<Visit | null>(null);
  const [detailsVisit, setDetailsVisit] = useState<Visit | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Compute date range based on preset
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    if (selectedPreset === "TODAY") {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      return {
        startDate: todayStart.toISOString(),
        endDate: now.toISOString(),
      };
    }
    if (selectedPreset === "WEEK") {
      return {
        startDate: subDays(now, 7).toISOString(),
        endDate: now.toISOString(),
      };
    }
    if (selectedPreset === "MONTH") {
      return {
        startDate: startOfMonth(now).toISOString(),
        endDate: now.toISOString(),
      };
    }
    return { startDate: undefined, endDate: undefined };
  }, [selectedPreset]);

  // Query self visits
  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch.trim() || undefined,
      purpose: selectedPurpose,
      outcome: selectedOutcome,
      startDate,
      endDate,
    }),
    [page, debouncedSearch, selectedPurpose, selectedOutcome, startDate, endDate]
  );

  const { data, isLoading, isFetching, refetch } = useSelfVisits(queryParams);

  const visits = data?.visits || [];
  const pagination = data?.pagination;

  const hasActiveFilters = Boolean(
    search || selectedPurpose || selectedOutcome || selectedPreset !== "ALL"
  );

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedPurpose(undefined);
    setSelectedOutcome(undefined);
    setSelectedPreset("ALL");
    setPage(1);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (visits.length === 0) {
      toast.error("Export Failed", {
        description: "No field visits available to export.",
      });
      return;
    }

    const headers = [
      "Visit ID",
      "Customer Name",
      "Purpose",
      "Outcome",
      "Address",
      "Visit Date",
      "Notes",
    ];

    const rows = visits.map((v) => [
      v.id,
      `"${v.customerName.replace(/"/g, '""')}"`,
      `"${VISIT_PURPOSE_LABELS[v.purpose]}"`,
      `"${VISIT_OUTCOME_LABELS[v.outcome]}"`,
      `"${v.address.replace(/"/g, '""')}"`,
      `"${format(new Date(v.visitDate), "yyyy-MM-dd HH:mm:ss")}"`,
      `"${(v.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `my-field-visits-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV Export Complete", {
      description: `Exported ${visits.length} visit record(s).`,
    });
  };

  return (
    <RequirePermission permission={PERMISSION_KEY.READ_SELF_VISIT}>
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* ── Ambient Header Card ─────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card/90 via-card/50 to-background p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 h-64 w-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 h-48 w-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25">
                <MapPin className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-orange-600 dark:text-orange-400">
                    Field Operations
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                    <ShieldCheck className="h-3 w-3" />
                    <span>NIST Level 2</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-righteous tracking-tight text-foreground">
                  My Field Visits & Logs
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                  Record on-site customer interactions, track inspection outcomes, and manage personal field visits with GPS verification.
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-9 px-3 rounded-lg text-xs font-semibold border-border/80 bg-background/80 hover:bg-muted cursor-pointer gap-1.5 shadow-xs"
              >
                <RotateCcw
                  className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-orange-500" : "text-muted-foreground"}`}
                />
                <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
              </Button>

              {canSaveVisit && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="h-9 px-4 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 cursor-pointer gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Log Visit</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── KPI Stats Cards ────────────────────────────────────────── */}
        <VisitsStats
          visits={visits}
          totalVisits={pagination?.total}
          isLoading={isLoading}
        />

        {/* ── Search & Filters Bar ───────────────────────────────────── */}
        <VisitsFilters
          search={search}
          onSearchChange={setSearch}
          selectedPurpose={selectedPurpose}
          onPurposeChange={(val) => {
            setSelectedPurpose(val);
            setPage(1);
          }}
          selectedOutcome={selectedOutcome}
          onOutcomeChange={(val) => {
            setSelectedOutcome(val);
            setPage(1);
          }}
          selectedPreset={selectedPreset}
          onPresetChange={(val) => {
            setSelectedPreset(val);
            setPage(1);
          }}
          onResetFilters={handleResetFilters}
          onOpenCreateModal={() => setCreateOpen(true)}
          canCreateVisit={canSaveVisit}
          hasActiveFilters={hasActiveFilters}
          onExportCsv={handleExportCsv}
        />

        {/* ── History Table ──────────────────────────────────────────── */}
        <VisitsHistoryTable
          visits={visits}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={setPage}
          onViewDetails={setDetailsVisit}
          onEditVisit={setEditingVisit}
          onDeleteVisit={setDeletingVisit}
          onOpenCreateModal={() => setCreateOpen(true)}
        />

        {/* ── Modals ─────────────────────────────────────────────────── */}
        <CreateVisitModal
          open={createOpen}
          onOpenChange={setCreateOpen}
        />

        <EditVisitModal
          visit={editingVisit}
          open={Boolean(editingVisit)}
          onOpenChange={(open) => !open && setEditingVisit(null)}
        />

        <DeleteVisitModal
          visit={deletingVisit}
          open={Boolean(deletingVisit)}
          onOpenChange={(open) => !open && setDeletingVisit(null)}
        />

        <VisitDetailsModal
          visit={detailsVisit}
          open={Boolean(detailsVisit)}
          onOpenChange={(open) => !open && setDetailsVisit(null)}
        />
      </div>
    </RequirePermission>
  );
}

export default VisitsManager;
