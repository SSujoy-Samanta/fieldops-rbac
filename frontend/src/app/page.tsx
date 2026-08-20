"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  Lock,
  MapPin,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
  LogOut,
} from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

export default function LandingPage() {
  const { user, logout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.info("Logged out of workspace.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"rbac" | "attendance" | "visits">(
    "rbac"
  );
  const [selectedPipelineStep, setSelectedPipelineStep] = useState<number>(3);

  const pipelineSteps = [
    {
      id: 0,
      name: "Inbound Request",
      tag: "Client / HTTP",
      desc: "Express server receives authenticated request with Cookie / Bearer Token.",
      metrics: "Port 5000 • CORS Protected",
      code: "GET /api/visits?page=1&limit=10\nCookie: accessToken=eyJhbGciOi...",
    },
    {
      id: 1,
      name: "Rate Limiter",
      tag: "Redis In-Memory",
      desc: "Per-IP sliding window rate limiter prevents DDoS and brute-force token replay.",
      metrics: "100 req / 15 min per IP",
      code: "evalsha rate_limit:192.168.1.1 100 900",
    },
    {
      id: 2,
      name: "JWT Session Check",
      tag: "Redis Key Lookup",
      desc: "Validates JTI session key in Redis (`auth:session:${userId}:${jti}`). Instant revocation on deactivation.",
      metrics: "<0.3ms lookup latency",
      code: "EXISTS auth:session:usr_998a12bc:jti_7f83a\n→ 1 (Valid Session)",
    },
    {
      id: 3,
      name: "SISMEMBER RBAC Guard",
      tag: "Redis Set O(1)",
      desc: "Checks role permission key (`rbac:perms:${userId}`). Sub-millisecond evaluation with OWNER bypass.",
      metrics: "<0.4ms • Zero DB Load",
      code: "SISMEMBER rbac:perms:usr_998a12bc READ_ALL_VISIT\n→ 1 (Permission Granted)",
    },
    {
      id: 4,
      name: "Shift Guard & Business Logic",
      tag: "Service Layer",
      desc: "Enforces operational state constraints. Visits strictly require an active CLOCKED_IN shift.",
      metrics: "Double Clock-In Guard Active",
      code: "const active = await attendanceRepo.findActiveSession(userId);\nif (!active) throw new ForbiddenError('Clock-in required');",
    },
    {
      id: 5,
      name: "Postgres & Cache Invalidation",
      tag: "Prisma & Redis",
      desc: "Executes indexed SQL queries. Mutations trigger deterministic non-blocking SCAN cache invalidations.",
      metrics: "Indexed PK Query • Zero Stale Data",
      code: "await prisma.visit.create({ data });\nawait cacheService.invalidateVisit(userId);",
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground selection:bg-orange-500/20 selection:text-orange-500">
      {/* ── Background Ambient Atmosphere ─────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[250px] left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-tr from-orange-500/15 via-indigo-500/15 to-amber-500/10 blur-[140px]" />
        <div className="absolute top-[600px] -left-[200px] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[130px]" />
        <div className="absolute bottom-[200px] -right-[200px] h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[140px]" />
      </div>

      {/* ── Header / Navbar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl shadow-xs transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Wordmark size="md" href="/" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#rbac" className="hover:text-foreground transition-colors">
              RBAC Engine
            </a>
            <a href="#architecture" className="hover:text-foreground transition-colors">
              Architecture
            </a>
            <a href="#roles" className="hover:text-foreground transition-colors">
              Role Matrix
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-semibold rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-sm shadow-rose-500/10 transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            ) : (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-10 px-5 text-sm font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition-transform active:scale-[0.98]"
                )}
              >
                Sign In
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Container ──────────────────────────────────── */}
      <main id="main-content" className="flex-1 w-full">
        {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Status Chip */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-500 backdrop-blur-md mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>NIST Constrained RBAC & Dynamic Field Operations</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]"
            style={{ fontFamily: "var(--font-righteous), cursive" }}
          >
            Granular Access Control.{" "}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 bg-clip-text text-transparent">
              Zero Operational Friction.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
          >
            Enterprise-grade Role-Based Access Control engineered for field
            workforces. Sub-millisecond Redis permission evaluation, shift-guarded
            customer visits, and automated NIST privilege escalation defenses.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href={user ? "/overview" : "/login"}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-12 px-8 text-base font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/25 w-full sm:w-auto transition-transform active:scale-[0.98]"
              )}
            >
              {user ? "Go to Dashboard" : "Sign In to Workspace"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <a
              href="#architecture"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-12 px-8 text-base font-semibold rounded-xl border-border/80 hover:bg-muted w-full sm:w-auto transition-transform active:scale-[0.98]"
              )}
            >
              <Server className="mr-2 h-5 w-5 text-indigo-500" />
              View Architecture
            </a>
          </motion.div>

          {/* Trust Metric Badges */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl text-left"
          >
            <div className="rounded-2xl border-2 border-orange-500/35 bg-gradient-to-b from-orange-500/[0.07] to-card/70 p-4 backdrop-blur-xl shadow-[0_0_16px_-2px_rgba(249,115,22,0.18)] hover:border-orange-500/80 hover:shadow-[0_0_28px_-2px_rgba(249,115,22,0.4)] transition-all duration-300">
              <div className="flex items-center gap-2 text-orange-500 font-bold text-lg">
                <Zap className="h-5 w-5" />
                <span>&lt;0.4 ms</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Redis SISMEMBER Set Evaluation
              </p>
            </div>

            <div className="rounded-2xl border-2 border-indigo-500/35 bg-gradient-to-b from-indigo-500/[0.07] to-card/70 p-4 backdrop-blur-xl shadow-[0_0_16px_-2px_rgba(99,102,241,0.18)] hover:border-indigo-500/80 hover:shadow-[0_0_28px_-2px_rgba(99,102,241,0.4)] transition-all duration-300">
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-lg">
                <ShieldCheck className="h-5 w-5" />
                <span>NIST Level 2</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Constrained Floor & Ceiling Policies
              </p>
            </div>

            <div className="rounded-2xl border-2 border-emerald-500/35 bg-gradient-to-b from-emerald-500/[0.07] to-card/70 p-4 backdrop-blur-xl shadow-[0_0_16px_-2px_rgba(16,185,129,0.18)] hover:border-emerald-500/80 hover:shadow-[0_0_28px_-2px_rgba(16,185,129,0.4)] transition-all duration-300">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-lg">
                <Clock className="h-5 w-5" />
                <span>State Machine</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Double Clock-In & Overlap Proof
              </p>
            </div>

            <div className="rounded-2xl border-2 border-amber-500/35 bg-gradient-to-b from-amber-500/[0.07] to-card/70 p-4 backdrop-blur-xl shadow-[0_0_16px_-2px_rgba(245,158,11,0.18)] hover:border-amber-500/80 hover:shadow-[0_0_28px_-2px_rgba(245,158,11,0.4)] transition-all duration-300">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-lg">
                <MapPin className="h-5 w-5" />
                <span>Shift Guarded</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Verified On-Duty Field Logging
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Interactive Feature Showcase ────────────────────────────── */}
      <section id="features" className="py-16 border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-righteous), cursive" }}
            >
              Unified Field & Security Command
            </h2>
            <p className="mt-3 text-muted-foreground">
              Explore how FieldOps bridges high-assurance dynamic authorization with
              real-time field workforce logistics.
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="flex justify-center mb-8 px-2">
            <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-card/90 p-1 sm:p-1.5 shadow-sm backdrop-blur-md max-w-full overflow-x-auto">
              <button
                onClick={() => setActiveTab("rbac")}
                title="Dynamic RBAC"
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all select-none cursor-pointer whitespace-nowrap",
                  activeTab === "rbac"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Lock className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Dynamic RBAC</span>
                <span className="sm:hidden text-xs">RBAC</span>
              </button>

              <button
                onClick={() => setActiveTab("attendance")}
                title="Attendance Engine"
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all select-none cursor-pointer whitespace-nowrap",
                  activeTab === "attendance"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Clock className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Attendance Engine</span>
                <span className="sm:hidden text-xs">Attendance</span>
              </button>

              <button
                onClick={() => setActiveTab("visits")}
                title="Field Visits"
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all select-none cursor-pointer whitespace-nowrap",
                  activeTab === "visits"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Field Visits</span>
                <span className="sm:hidden text-xs">Visits</span>
              </button>
            </div>
          </div>

          {/* Tab 1: RBAC Demo */}
          <AnimatePresence mode="wait">
            {activeTab === "rbac" && (
              <motion.div
                key="rbac"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-orange-500 font-bold">
                      <Shield className="h-5 w-5" />
                      <span>Real-time Permission Evaluation</span>
                    </div>
                    <h3 className="text-2xl font-bold">
                      Zero-overhead role assignments and dynamic updates.
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Permissions are resolved via Redis Sets in sub-millisecond
                      time. When a role is edited, non-blocking pipeline invalidation
                      instantly propagates changes to all active users without
                      requiring logout.
                    </p>
                    <div className="pt-2 flex flex-col gap-2 text-xs font-mono text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>OWNER: Immutable full superuser bypass</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>MANAGER: Team dashboard + user administration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>FIELD_EMPLOYEE: Self operational scope only</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-muted/40 p-5 font-mono text-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                      <span className="text-muted-foreground">
                        GET /api/rbac/my-permissions
                      </span>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        200 OK (0.4ms)
                      </Badge>
                    </div>
                    <pre className="text-foreground/90 overflow-x-auto p-2">
{`{
  "user": {
    "id": "usr_998a12bc",
    "name": "Sarah Jenkins",
    "email": "sarah.manager@fieldops.com",
    "role": "MANAGER"
  },
  "rbac": {
    "roleName": "MANAGER",
    "permissions": [
      "CLOCK_IN_OUT",
      "READ_SELF_ATTENDANCE",
      "READ_ALL_ATTENDANCE",
      "SAVE_VISIT",
      "READ_SELF_VISIT",
      "READ_ALL_VISIT",
      "MANAGE_USERS"
    ],
    "isOwner": false
  }
}`}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Attendance Demo */}
            {activeTab === "attendance" && (
              <motion.div
                key="attendance"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold">
                      <Clock className="h-5 w-5" />
                      <span>State Machine Shift Lifecycle</span>
                    </div>
                    <h3 className="text-2xl font-bold">
                      Prevents orphan shifts and overlapping attendance logs.
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Employees can clock in with optional location notes. The system
                      tracks exact timestamps, prevents double clock-ins across
                      midnight boundaries, and computes precise duration upon clock-out.
                    </p>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                            Active Shift Status
                          </span>
                          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                        </div>
                        <div className="mt-4 text-3xl font-extrabold">05h 42m</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Clocked in at 09:00 AM (Location: Metro Area Hub)
                        </p>
                      </div>
                      <div className="mt-6 flex gap-2">
                        <span className="w-full text-center py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-white">
                          Clocked In
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Today&apos;s Team Summary
                        </span>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                          <div className="p-2 rounded-xl bg-muted/60">
                            <div className="text-xl font-bold text-emerald-500">24</div>
                            <div className="text-[10px] text-muted-foreground">On Duty</div>
                          </div>
                          <div className="p-2 rounded-xl bg-muted/60">
                            <div className="text-xl font-bold text-muted-foreground">6</div>
                            <div className="text-[10px] text-muted-foreground">Completed</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-4 text-center">
                        Aggregated across 30 active team members
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Field Visits Demo */}
            {activeTab === "visits" && (
              <motion.div
                key="visits"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-amber-500 font-bold">
                      <MapPin className="h-5 w-5" />
                      <span>Operational Compliance</span>
                    </div>
                    <h3 className="text-2xl font-bold">
                      Customer site visits tied directly to active duty.
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Field employees cannot submit customer visits while off-duty.
                      The backend verifies active attendance before creating visit logs,
                      preventing fake reporting and ensuring complete auditable compliance.
                    </p>
                  </div>

                  <div className="lg:col-span-2 space-y-3">
                    <div className="rounded-2xl border border-border p-4 bg-muted/30 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">Apex Industrial Corp</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Purpose: Product Demo • Location: Industrial Park Sector 4
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        DEAL_CLOSED
                      </Badge>
                    </div>

                    <div className="rounded-2xl border border-border p-4 bg-muted/30 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">Summit Logistics Hub</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Purpose: Routine Inspection • Location: Terminal 2 West
                        </div>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                        FOLLOW_UP_REQUIRED
                      </Badge>
                    </div>

                    <div className="rounded-2xl border border-border p-4 bg-muted/30 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">Beacon Retail Outlet #14</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Purpose: Maintenance • Location: Central Boulevard
                        </div>
                      </div>
                      <Badge variant="outline" className="text-foreground/80">
                        COMPLETED
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Architecture Interactive Pipeline & Bento Grid ──────────── */}
      <section id="architecture" className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-foreground/90 backdrop-blur-md shadow-xs mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              <span className="uppercase text-[11px] font-bold tracking-wider bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Engineered for Production
              </span>
            </div>

            <h2
              className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-righteous), cursive" }}
            >
              High-Velocity Distributed Architecture
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg">
              Engineered with sub-millisecond Redis memory evaluation, strict NIST
              level 2 policy guards, and transactional PostgreSQL persistence.
            </p>
          </div>

          {/* Interactive Request Pipeline Visualizer */}
          <div className="mb-16 rounded-3xl border border-border/80 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-500">
                  <Activity className="h-4 w-4" />
                  <span>Live Execution Pipeline Visualizer</span>
                </div>
                <h3 className="text-xl font-bold mt-1">
                  Trace an Inbound Request Through the Backend Layers
                </h3>
              </div>
              <Badge variant="outline" className="self-start sm:self-auto font-mono text-xs text-muted-foreground">
                Total Latency: ~1.2ms
              </Badge>
            </div>

            {/* Pipeline Step Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
              {pipelineSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setSelectedPipelineStep(step.id)}
                  className={cn(
                    "flex flex-col text-left p-3 rounded-xl border transition-all select-none cursor-pointer text-xs",
                    selectedPipelineStep === step.id
                      ? "border-orange-500 bg-orange-500/10 shadow-sm"
                      : "border-border/60 bg-muted/30 hover:border-border hover:bg-muted/60"
                  )}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground mb-1">
                    <span>0{step.id + 1}</span>
                    <span className="font-semibold text-foreground/80">{step.tag}</span>
                  </div>
                  <div className="font-bold truncate text-foreground">
                    {step.name}
                  </div>
                </button>
              ))}
            </div>

            {/* Active Step Details & Code Snippet */}
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-5 font-mono text-xs grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-center gap-2 text-orange-500 font-semibold mb-2">
                  <Terminal className="h-4 w-4" />
                  <span>Step 0{pipelineSteps[selectedPipelineStep].id + 1}: {pipelineSteps[selectedPipelineStep].name}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  {pipelineSteps[selectedPipelineStep].desc}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-card border border-border text-[11px] text-foreground font-semibold">
                  <span>⚡ Metric:</span>
                  <span className="text-orange-500">{pipelineSteps[selectedPipelineStep].metrics}</span>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-black/80 p-4 text-emerald-400 overflow-x-auto shadow-inner">
                <div className="text-[10px] text-muted-foreground border-b border-border/30 pb-1.5 mb-2 font-sans flex items-center justify-between">
                  <span>Execution Log</span>
                  <span>TypeScript / Redis</span>
                </div>
                <pre className="text-[11px] leading-relaxed">
                  {pipelineSteps[selectedPipelineStep].code}
                </pre>
              </div>
            </div>
          </div>

          {/* 6-Grid Architecture Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Redis SISMEMBER */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border-2 border-orange-500/30 bg-gradient-to-b from-orange-500/[0.08] via-card/70 to-card/90 p-7 backdrop-blur-xl shadow-[0_0_20px_-3px_rgba(249,115,22,0.18)] hover:border-orange-500/80 hover:shadow-[0_0_38px_-2px_rgba(249,115,22,0.42)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-orange-500/15 border-2 border-orange-500/35 flex items-center justify-center text-orange-500 mb-5 shadow-[0_0_12px_rgba(249,115,22,0.25)]">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Sub-ms SISMEMBER Evaluation</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Permissions are stored as Redis Sets (`rbac:perms:${`{userId}`}`).
                  Guards query `SISMEMBER` in O(1) time (&lt;0.4ms), bypassing Postgres for
                  read paths while supporting full atomic pipeline invalidations.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-orange-500/20 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Complexity:</span>
                <span className="text-orange-500 font-semibold">O(1) Set Member</span>
              </div>
            </motion.div>

            {/* Card 2: NIST Level 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border-2 border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.08] via-card/70 to-card/90 p-7 backdrop-blur-xl shadow-[0_0_20px_-3px_rgba(99,102,241,0.18)] hover:border-indigo-500/80 hover:shadow-[0_0_38px_-2px_rgba(99,102,241,0.42)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/15 border-2 border-indigo-500/35 flex items-center justify-center text-indigo-500 mb-5 shadow-[0_0_12px_rgba(99,102,241,0.25)]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">NIST Constrained Policy Guards</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Strict floor constraints ensure field staff can never be stripped of
                  clock-in abilities, while ceiling caps prevent privilege escalation.
                  OWNER superusers are completely immutable.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-indigo-500/20 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Standard:</span>
                <span className="text-indigo-500 font-semibold">NIST RBAC Floor/Ceiling</span>
              </div>
            </motion.div>

            {/* Card 3: Shift State Machine */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.08] via-card/70 to-card/90 p-7 backdrop-blur-xl shadow-[0_0_20px_-3px_rgba(16,185,129,0.18)] hover:border-emerald-500/80 hover:shadow-[0_0_38px_-2px_rgba(16,185,129,0.42)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/35 flex items-center justify-center text-emerald-500 mb-5 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Shift State Machine & Locks</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Prevents double clock-in concurrency races with strict active session
                  checks. Calculates exact millisecond duration upon clock-out and expands
                  midnight queries automatically with zero timezone drift.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Integrity:</span>
                <span className="text-emerald-500 font-semibold">Zero Double Clock-Ins</span>
              </div>
            </motion.div>

            {/* Card 4: Shift-Guarded Visits */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border-2 border-amber-500/30 bg-gradient-to-b from-amber-500/[0.08] via-card/70 to-card/90 p-7 backdrop-blur-xl shadow-[0_0_20px_-3px_rgba(245,158,11,0.18)] hover:border-amber-500/80 hover:shadow-[0_0_38px_-2px_rgba(245,158,11,0.42)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border-2 border-amber-500/35 flex items-center justify-center text-amber-500 mb-5 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Operational Field Compliance</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Customer visits strictly enforce active shift attendance. Field
                  employees cannot record visits while off-duty, producing auditable
                  compliance logs with zero ghost entries.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-amber-500/20 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Enforcement:</span>
                <span className="text-amber-500 font-semibold">Active Session Required</span>
              </div>
            </motion.div>

            {/* Card 5: Sole Owner Defense */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border-2 border-rose-500/30 bg-gradient-to-b from-rose-500/[0.08] via-card/70 to-card/90 p-7 backdrop-blur-xl shadow-[0_0_20px_-3px_rgba(244,63,94,0.18)] hover:border-rose-500/80 hover:shadow-[0_0_38px_-2px_rgba(244,63,94,0.42)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-rose-500/15 border-2 border-rose-500/35 flex items-center justify-center text-rose-500 mb-5 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Sole Owner Lockout Defense</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The system actively enforces that at least one Owner remains active.
                  Demoting or deactivating the last active Owner is hard-blocked at both
                  policy and repository layers with 400 Bad Request.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-rose-500/20 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Protection:</span>
                <span className="text-rose-500 font-semibold">Anti-Lockout Guarantee</span>
              </div>
            </motion.div>

            {/* Card 6: Cache-Aside & Tag Invalidation */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-b from-cyan-500/[0.08] via-card/70 to-card/90 p-7 backdrop-blur-xl shadow-[0_0_20px_-3px_rgba(6,182,212,0.18)] hover:border-cyan-500/80 hover:shadow-[0_0_38px_-2px_rgba(6,182,212,0.42)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 border-2 border-cyan-500/35 flex items-center justify-center text-cyan-500 mb-5 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Deterministic MD5 Cache-Aside</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Query filters are hashed alphabetically via MD5 into keys
                  (`visits:self:uid:hash`). Mutations execute non-blocking SCAN pattern
                  sweeps, guaranteeing zero stale data with sub-millisecond read times.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-cyan-500/20 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Strategy:</span>
                <span className="text-cyan-500 font-semibold">SCAN Pattern Purge</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Role Comparison Matrix ──────────────────────────────────── */}
      <section id="roles" className="py-16 border-t border-border/40 bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-righteous), cursive" }}
            >
              NIST Constrained RBAC Policy Matrix
            </h2>
            <p className="mt-3 text-muted-foreground">
              Guaranteed privilege ceilings and operational floors.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-lg">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Permission Key</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4 text-center">Owner</th>
                  <th className="px-6 py-4 text-center">Manager</th>
                  <th className="px-6 py-4 text-center">Field Employee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-xs">
                <tr>
                  <td className="px-6 py-4 font-bold text-foreground">CLOCK_IN_OUT</td>
                  <td className="px-6 py-4 text-muted-foreground font-sans">ATTENDANCE</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Bypass)</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Floor)</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Floor)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-foreground">READ_SELF_ATTENDANCE</td>
                  <td className="px-6 py-4 text-muted-foreground font-sans">ATTENDANCE</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Bypass)</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Floor)</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Floor)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-foreground">READ_ALL_ATTENDANCE</td>
                  <td className="px-6 py-4 text-muted-foreground font-sans">ATTENDANCE</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Bypass)</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓</td>
                  <td className="px-6 py-4 text-center text-rose-500 font-sans font-semibold">✗ (Blocked)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-foreground">SAVE_VISIT</td>
                  <td className="px-6 py-4 text-muted-foreground font-sans">VISITS</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Bypass)</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-foreground">READ_SELF_VISIT</td>
                  <td className="px-6 py-4 text-muted-foreground font-sans">VISITS</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Bypass)</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-foreground">READ_ALL_VISIT</td>
                  <td className="px-6 py-4 text-muted-foreground font-sans">VISITS</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Bypass)</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓</td>
                  <td className="px-6 py-4 text-center text-rose-500 font-sans font-semibold">✗ (Blocked)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-foreground">MANAGE_USERS</td>
                  <td className="px-6 py-4 text-muted-foreground font-sans">USERS</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Bypass)</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Ceiling)</td>
                  <td className="px-6 py-4 text-center text-rose-500 font-sans font-semibold">✗ (Blocked)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-foreground">MANAGE_ROLES</td>
                  <td className="px-6 py-4 text-muted-foreground font-sans">ROLES</td>
                  <td className="px-6 py-4 text-center text-emerald-500 font-sans font-semibold">✓ (Exclusive)</td>
                  <td className="px-6 py-4 text-center text-rose-500 font-sans font-semibold">✗ (Ceiling Lock)</td>
                  <td className="px-6 py-4 text-center text-rose-500 font-sans font-semibold">✗ (Blocked)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border-2 border-orange-500/35 bg-gradient-to-br from-orange-500/15 via-card/90 to-indigo-500/15 p-8 sm:p-14 lg:p-16 overflow-hidden text-center backdrop-blur-2xl shadow-[0_0_40px_-5px_rgba(249,115,22,0.22)]">
            {/* Background Ambient Lights inside Card */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-orange-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              {/* Glowing Center Emblem */}
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-indigo-600 text-white shadow-xl shadow-orange-500/35 border border-white/20">
                <ShieldCheck className="h-9 w-9 text-white animate-pulse" />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500" />
                </span>
              </div>

              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-500 backdrop-blur-md mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Enterprise Ready • NIST RBAC & Field Operations</span>
              </div>

              {/* Title */}
              <h2
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]"
                style={{ fontFamily: "var(--font-righteous), cursive" }}
              >
                Ready to Secure Your{" "}
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 bg-clip-text text-transparent">
                  Field Operations?
                </span>
              </h2>

              {/* Subtitle */}
              <p className="mt-5 text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
                Experience high-performance NIST RBAC authorization, sub-millisecond
                Redis permission checks, and automated on-duty shift validation.
              </p>

              {/* Feature Highlights Grid */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl text-left">
                <div className="rounded-2xl border border-orange-500/20 bg-card/60 p-3.5 backdrop-blur-md flex items-center gap-3 shadow-xs">
                  <div className="rounded-xl bg-orange-500/15 p-2 text-orange-500 shrink-0">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">&lt;0.4ms Latency</div>
                    <div className="text-[11px] text-muted-foreground">Redis Set Evaluation</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-500/20 bg-card/60 p-3.5 backdrop-blur-md flex items-center gap-3 shadow-xs">
                  <div className="rounded-xl bg-indigo-500/15 p-2 text-indigo-500 shrink-0">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Zero Escalation</div>
                    <div className="text-[11px] text-muted-foreground">NIST Ceiling Locks</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-card/60 p-3.5 backdrop-blur-md flex items-center gap-3 shadow-xs">
                  <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-500 shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Shift Verification</div>
                    <div className="text-[11px] text-muted-foreground">Double Clock-In Guard</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Link
                  href={user ? "/overview" : "/login"}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "h-12 px-8 text-base font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/35 w-full sm:w-auto transition-transform active:scale-[0.98]"
                  )}
                >
                  {user ? "Enter Workspace" : "Sign In to Workspace"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>

                <a
                  href="#roles"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-12 px-6 text-base font-semibold rounded-xl border-border/80 hover:bg-muted w-full sm:w-auto transition-transform active:scale-[0.98]"
                  )}
                >
                  Explore Policy Matrix
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-10 bg-background/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Wordmark size="sm" href="/" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FieldOps Enterprise Access System. Built with
            Next.js & Express.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href={user ? "/overview" : "/login"} className="hover:text-foreground transition-colors">
              {user ? "Dashboard" : "Sign In"}
            </Link>
            <a
              href="https://status.fieldops.local"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Status
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
