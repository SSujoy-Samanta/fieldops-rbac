"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { OAuthCallbackInner } from "./OAuthCallbackInner";

export default function GoogleCallbackPage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center p-6 overflow-hidden bg-background">
      {/* ── Ambient Radial Background & Top Accent Bar ─────────────────── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.06),transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-500 opacity-60" />

      {/* ── Central Content Box ────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-6 py-10">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                <div className="absolute inset-0 animate-pulse bg-orange-500/20 blur-xl rounded-full" />
              </div>
              <p className="text-sm font-medium text-muted-foreground animate-pulse">
                Initializing security sequence…
              </p>
            </div>
          }
        >
          <OAuthCallbackInner />
        </Suspense>
      </div>

      {/* ── Subtle Security Footer ─────────────────────────────────────── */}
      <div className="absolute bottom-8 left-0 w-full text-center">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-semibold">
          NIST Level 2 RBAC &bull; FieldOps Security Command
        </p>
      </div>
    </div>
  );
}
