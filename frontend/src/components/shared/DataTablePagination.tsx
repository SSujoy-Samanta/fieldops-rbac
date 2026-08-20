"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataTablePaginationProps {
  /** Current 1-based page index */
  page: number;
  /** Number of items displayed per page */
  limit: number;
  /** Total number of items matching the query */
  total: number;
  /** Total computed pages. If omitted, computed as Math.ceil(total / limit) */
  totalPages?: number;
  /** Callback fired when page number changes */
  onPageChange: (page: number) => void;
  /** Name of entity being paginated (e.g. "member", "role", "visit", "record") */
  entityName?: string;
  /** Whether to hide pagination UI when total fits on 1 page. Defaults to false */
  hideOnSinglePage?: boolean;
  /** Additional CSS class names for container */
  className?: string;
}

export function DataTablePagination({
  page,
  limit,
  total,
  totalPages: rawTotalPages,
  onPageChange,
  entityName = "record",
  hideOnSinglePage = false,
  className,
}: DataTablePaginationProps) {
  const calculatedTotalPages = rawTotalPages ?? Math.ceil(total / (limit || 1));
  const totalPages = Math.max(calculatedTotalPages, 1);

  if (total === 0 || (hideOnSinglePage && totalPages <= 1)) {
    return null;
  }

  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  // Format entity name label (e.g. "1 member" vs "20 members")
  const formattedEntityLabel =
    total === 1
      ? entityName.replace(/s$/i, "")
      : entityName.endsWith("s")
      ? entityName
      : `${entityName}s`;

  return (
    <nav
      aria-label="Pagination Navigation"
      className={cn(
        "px-6 py-4 bg-muted/20 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground",
        className
      )}
    >
      {/* ── Left: Range Indicator ───────────────────────────────────── */}
      <div className="text-xs sm:text-sm font-medium">
        Showing <span className="font-bold text-foreground">{startItem}</span> to{" "}
        <span className="font-bold text-foreground">{endItem}</span> of{" "}
        <span className="font-bold text-foreground">{total}</span>{" "}
        {formattedEntityLabel}
      </div>

      {/* ── Right: Navigation Controls ──────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous Page"
          disabled={isFirstPage}
          onClick={() => !isFirstPage && onPageChange(page - 1)}
          className={cn(
            "h-9 w-9 rounded-lg border-border/60 shadow-xs transition-all",
            isFirstPage
              ? "opacity-40 cursor-not-allowed pointer-events-auto"
              : "cursor-pointer hover:bg-orange-500 hover:text-white hover:border-orange-500 active:scale-95"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center px-1">
          <div className="h-9 px-3.5 sm:px-4 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-xs">
            Page {page} of {totalPages}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          aria-label="Next Page"
          disabled={isLastPage}
          onClick={() => !isLastPage && onPageChange(page + 1)}
          className={cn(
            "h-9 w-9 rounded-lg border-border/60 shadow-xs transition-all",
            isLastPage
              ? "opacity-40 cursor-not-allowed pointer-events-auto"
              : "cursor-pointer hover:bg-orange-500 hover:text-white hover:border-orange-500 active:scale-95"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}

export default DataTablePagination;
