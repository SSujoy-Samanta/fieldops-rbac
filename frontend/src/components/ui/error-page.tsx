"use client";

import React from "react";
import Link from "next/link";
import { AlertOctagon, LogIn, RefreshCcw, ShieldAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorPageProps {
  wordmark?: React.ReactNode;
  title?: string;
  description?: string;
  errorMessage?: string;
  digest?: string;
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    icon?: React.ReactNode;
    href: string;
  };
  footerLabel?: string;
  statusUrl?: string;
  supportUrl?: string;
}

export function ErrorPage({
  wordmark,
  title = "System Interruption",
  description = "We encountered an unexpected glitch. Our engineers are already on the case.",
  errorMessage,
  digest,
  primaryAction = {
    label: "Synchronize & Retry",
    icon: <RefreshCcw className="mr-2 h-4 w-4" />,
  },
  secondaryAction = {
    label: "Return to Access",
    icon: <LogIn className="mr-2 h-4 w-4" />,
    href: "/login",
  },
  footerLabel = "FieldOps Secure Access",
  statusUrl = "https://status.fieldops.local",
  supportUrl = "mailto:support@fieldops.local",
}: ErrorPageProps) {
  return (
    <main className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-background px-6 py-6 sm:px-12 sm:py-8 lg:px-16">
      {/* Ambient Red/Rose Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-rose-500/15 via-red-500/15 to-orange-500/10 blur-[130px]" />
      </div>

      {/* Header — Full Width */}
      <header className="z-10 flex w-full items-center justify-between">
        {wordmark}
      </header>

      {/* Main Card */}
      <div className="z-10 my-auto flex w-full flex-col items-center justify-center py-12 text-center">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-destructive/30 bg-card/60 p-4 shadow-xl backdrop-blur-xl">
          <AlertOctagon className="h-10 w-10 text-destructive animate-pulse" />
          <span className="absolute -top-2 -right-2 flex h-6 items-center rounded-full bg-destructive/15 px-2 text-xs font-bold text-destructive border border-destructive/30">
            500
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

        {/* Error Details */}
        {(errorMessage || digest) && (
          <div className="mt-6 w-full max-w-md rounded-xl border border-border/80 bg-muted/40 p-3.5 text-left text-xs font-mono text-muted-foreground backdrop-blur-sm">
            {errorMessage && (
              <p className="font-semibold text-destructive/90 break-words">
                {errorMessage}
              </p>
            )}
            {digest && (
              <p className="mt-1 text-muted-foreground/70">
                Digest ID: <span className="select-all">{digest}</span>
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row w-full max-w-md gap-3.5">
          {primaryAction &&
            (primaryAction.onClick ? (
              <Button
                onClick={primaryAction.onClick}
                className="flex-1 h-11 px-6 py-2.5 text-base font-medium rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white shadow-lg shadow-rose-500/20 transition-transform active:scale-[0.98]"
              >
                {primaryAction.icon ?? <RefreshCcw className="mr-2 h-4 w-4" />}
                {primaryAction.label}
              </Button>
            ) : (
              <Link
                href={primaryAction.href ?? "/"}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "flex-1 h-11 px-6 py-2.5 text-base font-medium rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white shadow-lg shadow-rose-500/20 transition-transform active:scale-[0.98]"
                )}
              >
                {primaryAction.icon ?? <RefreshCcw className="mr-2 h-4 w-4" />}
                {primaryAction.label}
              </Link>
            ))}

          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex-1 h-11 px-6 py-2.5 text-base font-medium rounded-xl border-border/80 hover:bg-muted transition-transform active:scale-[0.98]"
              )}
            >
              {secondaryAction.icon ?? <LogIn className="mr-2 h-4 w-4" />}
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </div>

      {/* Footer — Full Width */}
      <footer className="z-10 flex w-full flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" />
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

export default ErrorPage;
