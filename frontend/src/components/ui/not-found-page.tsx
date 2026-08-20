"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Home, ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NotFoundPageProps {
  wordmark?: React.ReactNode;
  title?: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  footerLabel?: string;
  statusUrl?: string;
  supportUrl?: string;
}

export function NotFoundPage({
  wordmark,
  title = "Beyond the Horizon",
  description = "The path you sought leads to uncharted territory. Let's navigate you back.",
  primaryAction = {
    label: "Return to Safety",
    href: "/",
  },
  secondaryAction = {
    label: "Main Portal",
    href: "/login",
  },
  footerLabel = "FieldOps Secure Access",
  statusUrl = "https://status.fieldops.local",
  supportUrl = "mailto:support@fieldops.local",
}: NotFoundPageProps) {
  return (
    <main className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-background px-6 py-6 sm:px-12 sm:py-8 lg:px-16">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-orange-500/15 via-indigo-500/15 to-amber-500/10 blur-[130px]" />
      </div>

      {/* Top Header / Branding — Full Width */}
      <header className="z-10 flex w-full items-center justify-between">
        {wordmark}
      </header>

      {/* Central Hero Card */}
      <div className="z-10 my-auto flex w-full flex-col items-center justify-center py-12 text-center">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border/80 bg-card/60 p-4 shadow-xl backdrop-blur-xl">
          <Compass className="h-10 w-10 text-orange-500 animate-pulse" />
          <span className="absolute -top-2 -right-2 flex h-6 items-center rounded-full bg-orange-500/10 px-2 text-xs font-bold text-orange-500 border border-orange-500/20">
            404
          </span>
        </div>

        <h1
          className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground"
          style={{ fontFamily: "var(--font-righteous), cursive" }}
        >
          {title}
        </h1>

        <p className="mt-3 text-base text-muted-foreground sm:text-lg max-w-md">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row w-full max-w-md gap-3.5">
          {primaryAction && (
            <Link
              href={primaryAction.href}
              className={cn(
                buttonVariants({ variant: "default" }),
                "flex-1 h-11 px-6 py-2.5 text-base font-medium rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 transition-transform active:scale-[0.98]"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              {primaryAction.label}
            </Link>
          )}

          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex-1 h-11 px-6 py-2.5 text-base font-medium rounded-xl border-border/80 hover:bg-muted transition-transform active:scale-[0.98]"
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </div>

      {/* Footer — Full Width Edge-to-Edge with clean border */}
      <footer className="z-10 flex w-full flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-orange-500" />
          <span>{footerLabel}</span>
        </div>

        <div className="flex items-center gap-6">
          {statusUrl && (
            <a
              href={statusUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              System Health
            </a>
          )}
          {supportUrl && (
            <a
              href={supportUrl}
              className="hover:text-foreground transition-colors"
            >
              Contact Support
            </a>
          )}
        </div>
      </footer>
    </main>
  );
}

export default NotFoundPage;
