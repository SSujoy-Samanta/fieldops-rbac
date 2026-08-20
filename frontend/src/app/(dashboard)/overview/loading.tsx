import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OverviewLoading() {
  return (
    <div className="relative flex flex-col gap-8 pb-16 animate-in fade-in duration-300">
      {/* Ambient background glow orbs */}
      <div className="absolute -top-10 -right-10 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-16 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-indigo-600/10 via-purple-500/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* ── 1. Hero Analytics Command Banner Skeleton ───────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-muted/40 via-card/85 to-muted/20 p-6 sm:p-8 backdrop-blur-2xl shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-2xl w-full">
          <div className="flex flex-wrap items-center gap-2.5">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-md" />
          </div>
          <Skeleton className="h-10 w-3/4 max-w-md rounded-xl" />
          <Skeleton className="h-4 w-full max-w-lg rounded-lg" />
        </div>

        {/* Tab switcher skeleton */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-card/80 border-2 border-border/70 self-start lg:self-center">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* ── 2. Primary KPI Multi-Tone Grid Skeletons (4 Columns) ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="rounded-3xl border-2 border-border/50 bg-card/60 p-6 flex flex-col justify-between gap-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
          <div className="flex flex-col gap-2 pt-3 border-t border-border/40">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-3 w-12 rounded-md" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-3xl border-2 border-border/50 bg-card/60 p-6 flex flex-col justify-between gap-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-3xl border-2 border-border/50 bg-card/60 p-6 flex flex-col justify-between gap-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-3xl border-2 border-border/50 bg-card/60 p-6 flex flex-col justify-between gap-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      </div>

      {/* ── 3. Interactive Analytics Deep-Dive Skeletons (2 Columns) ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-3xl border-2 border-border/50 bg-card/60 p-6 sm:p-8 backdrop-blur-xl flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-3 w-64 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-40 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        </div>

        <div className="rounded-3xl border-2 border-border/50 bg-card/60 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-3 w-64 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* ── 4. Platform Infrastructure Audit Skeletons (3 Columns) ──────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border-2 border-border/50 bg-card/60 p-6 backdrop-blur-xl flex flex-col gap-3">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-6 w-36 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>

        <div className="rounded-3xl border-2 border-border/50 bg-card/60 p-6 backdrop-blur-xl flex flex-col gap-3">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-6 w-44 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>

        <div className="rounded-3xl border-2 border-border/50 bg-card/60 p-6 backdrop-blur-xl flex flex-col gap-3">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-32 rounded-md" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
