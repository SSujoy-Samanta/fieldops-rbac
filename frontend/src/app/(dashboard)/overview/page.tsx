"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import {
  CalendarCheck,
  MapPin,
  Users,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function OverviewPage() {
  const { user } = useUser();

  const quickLinks = [
    {
      title: "Attendance & Shifts",
      desc: "Punch in/out, view shift history, and manage team attendance logs.",
      icon: CalendarCheck,
      href: "/attendance",
      accent: "text-orange-500",
      border: "border-orange-500/30 hover:border-orange-500/60",
      bg: "from-orange-500/10 to-transparent",
    },
    {
      title: "Field Visits",
      desc: "Log customer visits with live GPS verification and review team visit logs.",
      icon: MapPin,
      href: "/visits",
      accent: "text-indigo-500",
      border: "border-indigo-500/30 hover:border-indigo-500/60",
      bg: "from-indigo-500/10 to-transparent",
    },
    {
      title: "User Directory",
      desc: "Manage staff accounts, assign operational roles, and enforce security policies.",
      icon: Users,
      href: "/users",
      accent: "text-blue-500",
      border: "border-blue-500/30 hover:border-blue-500/60",
      bg: "from-blue-500/10 to-transparent",
    },
    {
      title: "Roles & Permissions",
      desc: "Configure granular RBAC permissions with real-time tag-based cache invalidation.",
      icon: ShieldCheck,
      href: "/roles",
      accent: "text-emerald-500",
      border: "border-emerald-500/30 hover:border-emerald-500/60",
      bg: "from-emerald-500/10 to-transparent",
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* ── Welcome Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-card/60 backdrop-blur-xl shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Workspace Overview
            </span>
            <Badge variant="outline" className="text-[10px] border-orange-500/40 text-orange-500 font-mono">
              Live Session
            </Badge>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight"
            style={{ fontFamily: "var(--font-righteous), cursive" }}
          >
            Welcome Back, {user?.name || "Operator"}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Role-Based Access Control and Field Operations Security Console.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background/80 text-xs font-semibold text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-orange-500" />
            <span>NIST Constrained Session</span>
          </div>
        </div>
      </div>

      {/* ── Metric Snapshot ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Evaluation Latency</span>
            <Zap className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-foreground">&lt;0.4 ms</div>
          <span className="text-[11px] text-muted-foreground">Redis Set SISMEMBER cache</span>
        </div>

        <div className="p-5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Security Standard</span>
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-foreground">NIST Level 2</div>
          <span className="text-[11px] text-muted-foreground">Ceiling locks & audit logging</span>
        </div>

        <div className="p-5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Operational Guard</span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-foreground">Shift Active</div>
          <span className="text-[11px] text-muted-foreground">Double clock-in prevention</span>
        </div>

        <div className="p-5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Cache State</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground">Zero Stale</div>
          <span className="text-[11px] text-muted-foreground">Deterministic invalidation</span>
        </div>
      </div>

      {/* ── Quick Navigation Cards ───────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-foreground">Operational Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={cn(
                  "group p-6 rounded-2xl border bg-gradient-to-br transition-all duration-300 hover:shadow-lg backdrop-blur-xl flex flex-col justify-between gap-4",
                  card.border,
                  card.bg
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn("p-3 rounded-xl bg-background/80 border border-border/60", card.accent)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-orange-500 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
