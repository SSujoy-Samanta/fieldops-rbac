"use client";

import React, { useState, useMemo } from "react";
import {
  Compass,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequirePermission } from "@/components/RequirePermission";
import { PERMISSION_KEY, SYSTEM_ROLE } from "@/types/rbac";
import {
  VISIT_PURPOSE,
  VISIT_OUTCOME,
  type VisitDatePreset,
  type Visit,
  VISIT_PURPOSE_LABELS,
  VISIT_OUTCOME_LABELS,
} from "@/types/visit";
import { useTeamVisits, useTeamVisitStats } from "@/hooks/useVisits";
import { TeamVisitsStatsCards } from "./TeamVisitsStatsCards";
import { TeamVisitsFilters } from "./TeamVisitsFilters";
import { TeamVisitsTable } from "./TeamVisitsTable";
import { VisitDetailsModal } from "@/components/visits/VisitDetailsModal";
import { subDays, startOfMonth, format } from "date-fns";
import { toast } from "sonner";

export function TeamVisitsManager() {
  // ── Filter & Query State ───────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<SYSTEM_ROLE | undefined>();
  const [selectedPurpose, setSelectedPurpose] = useState<VISIT_PURPOSE | undefined>();
  const [selectedOutcome, setSelectedOutcome] = useState<VISIT_OUTCOME | undefined>();
  const [selectedPreset, setSelectedPreset] = useState<VisitDatePreset>("ALL");
  const [page, setPage] = useState(1);

  // Modals state
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

  // Query team visits
  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch.trim() || undefined,
      role: selectedRole,
      purpose: selectedPurpose,
      outcome: selectedOutcome,
      startDate,
      endDate,
    }),
    [page, debouncedSearch, selectedRole, selectedPurpose, selectedOutcome, startDate, endDate]
  );

  const {
    data,
    isLoading: isLoadingVisits,
    isFetching: isFetchingVisits,
    refetch: refetchVisits,
  } = useTeamVisits(queryParams);

  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useTeamVisitStats({
    startDate,
    endDate,
    role: selectedRole,
  });

  const visits = data?.visits || [];
  const pagination = data?.pagination;

  const hasActiveFilters = Boolean(
    search || selectedRole || selectedPurpose || selectedOutcome || selectedPreset !== "ALL"
  );

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedRole(undefined);
    setSelectedPurpose(undefined);
    setSelectedOutcome(undefined);
    setSelectedPreset("ALL");
    setPage(1);
  };

  const handleRefreshAll = () => {
    refetchVisits();
    refetchStats();
  };

  // Export CSV
  const handleExportCsv = () => {
    if (visits.length === 0) {
      toast.error("Export Failed", {
        description: "No team field visits available to export.",
      });
      return;
    }

    const headers = [
      "Visit ID",
      "Field Employee",
      "Employee Email",
      "Role",
      "Customer Name",
      "Purpose",
      "Outcome",
      "Address",
      "Visit Date",
      "Notes",
    ];

    const rows = visits.map((v) => [
      v.id,
      `"${(v.user?.name || "").replace(/"/g, '""')}"`,
      `"${(v.user?.email || "").replace(/"/g, '""')}"`,
      `"${v.user?.role?.name || ""}"`,
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
      `team-field-visits-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV Export Complete", {
      description: `Exported ${visits.length} team visit log(s).`,
    });
  };

  return (
    <RequirePermission permission={PERMISSION_KEY.READ_ALL_VISIT}>
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* ── Ambient Header Card ─────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card/90 via-card/50 to-background p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 h-64 w-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 h-48 w-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25">
                <Compass className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-orange-600 dark:text-orange-400">
                    Field Operations & Audit
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                    <ShieldCheck className="h-3 w-3" />
                    <span>NIST Level 2</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-righteous tracking-tight text-foreground">
                  Team Field Visits & Activity
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                  Real-time monitoring of customer on-site visits, sales demos, and field outcomes across all team representatives.
                </p>
              </div>
            </div>

            {/* Header Refresh Button */}
            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={isFetchingVisits}
                className="h-9 px-3 rounded-lg text-xs font-semibold border-border/80 bg-background/80 hover:bg-muted cursor-pointer gap-1.5 shadow-xs"
              >
                <RotateCcw
                  className={`h-3.5 w-3.5 ${isFetchingVisits ? "animate-spin text-orange-500" : "text-muted-foreground"}`}
                />
                <span>{isFetchingVisits ? "Refreshing..." : "Refresh"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ── KPI Stats Cards ────────────────────────────────────────── */}
        <TeamVisitsStatsCards
          stats={stats}
          isLoading={isLoadingStats}
        />

        {/* ── Search & Filters Bar ───────────────────────────────────── */}
        <TeamVisitsFilters
          search={search}
          onSearchChange={setSearch}
          selectedRole={selectedRole}
          onRoleChange={(role) => {
            setSelectedRole(role);
            setPage(1);
          }}
          selectedPurpose={selectedPurpose}
          onPurposeChange={(purpose) => {
            setSelectedPurpose(purpose);
            setPage(1);
          }}
          selectedOutcome={selectedOutcome}
          onOutcomeChange={(outcome) => {
            setSelectedOutcome(outcome);
            setPage(1);
          }}
          selectedPreset={selectedPreset}
          onPresetChange={(preset) => {
            setSelectedPreset(preset);
            setPage(1);
          }}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          onExportCsv={handleExportCsv}
        />

        {/* ── Team Visits Table ──────────────────────────────────────── */}
        <TeamVisitsTable
          visits={visits}
          pagination={pagination}
          isLoading={isLoadingVisits}
          onPageChange={setPage}
          onViewDetails={setDetailsVisit}
        />

        {/* ── Details Modal ──────────────────────────────────────────── */}
        <VisitDetailsModal
          visit={detailsVisit}
          open={Boolean(detailsVisit)}
          onOpenChange={(open) => !open && setDetailsVisit(null)}
        />
      </div>
    </RequirePermission>
  );
}

export default TeamVisitsManager;
