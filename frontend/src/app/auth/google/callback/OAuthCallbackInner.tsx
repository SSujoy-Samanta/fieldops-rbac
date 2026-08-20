"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Fingerprint, Lock, RefreshCw, AlertCircle } from "lucide-react";
import { authApi, getOAuthRedirectUri, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

const STATUS_STEPS = [
  {
    icon: Lock,
    title: "Authorizing Access",
    message: "Establishing secure Google OAuth handshake…",
    glow: "bg-orange-500/35",
    box: "bg-orange-500/15 border-orange-500/40 shadow-orange-500/20",
    iconColor: "text-orange-500 dark:text-orange-400",
    pill: "bg-orange-500/15 border-orange-500/40 text-orange-600 dark:text-orange-300",
    barColor: "bg-gradient-to-r from-orange-500 to-amber-500",
  },
  {
    icon: Fingerprint,
    title: "Verifying Credentials",
    message: "Validating Google ID token signature & RBAC role…",
    glow: "bg-indigo-500/25",
    box: "bg-indigo-500/15 border-indigo-500/30 shadow-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    pill: "bg-indigo-500/15 border-indigo-500/30 text-indigo-700 dark:text-indigo-300",
    barColor: "bg-gradient-to-r from-indigo-500 to-purple-600",
  },
  {
    icon: ShieldCheck,
    title: "Finalizing Session",
    message: "Provisioning NIST Level 2 workspace session…",
    glow: "bg-emerald-500/25",
    box: "bg-emerald-500/15 border-emerald-500/30 shadow-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    pill: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    barColor: "bg-gradient-to-r from-emerald-500 to-teal-500",
  },
] as const;

export function OAuthCallbackInner() {
  const router = useRouter();
  const { setUser } = useUser();
  const searchParams = useSearchParams();
  const called = useRef(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── 1. Rotate visual progress steps ───────────────────────────────
  useEffect(() => {
    if (errorMessage) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STATUS_STEPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [errorMessage]);

  // ── 2. Handle Google OAuth Code Exchange ──────────────────────────
  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      const msg = "Google sign in was cancelled or denied. Redirecting to login...";
      setErrorMessage(msg);
      toast.error(msg);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      return;
    }

    if (!code || !state) {
      const msg = "Invalid OAuth callback: missing authorization code or state token.";
      setErrorMessage(msg);
      toast.error(msg);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      return;
    }

    // Retrieve preserved returnTo destination
    let returnTo = "/overview";
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("fieldops_return_to");
      if (saved && saved.startsWith("/") && !saved.startsWith("//")) {
        returnTo = saved;
        sessionStorage.removeItem("fieldops_return_to");
      }
    }

    const redirectUri = getOAuthRedirectUri();

    authApi
      .googleCallback({
        code,
        state,
        redirectUri,
      })
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
        }
        toast.success("Signed in successfully with Google! Welcome to workspace.");
        router.push(returnTo);
      })
      .catch((err: unknown) => {
        const msg =
          getErrorMessage(err) ||
          "Google sign-in failed. Ensure your account is provisioned by an administrator.";
        setErrorMessage(msg);
        toast.error(msg);
        setTimeout(() => {
          router.push("/login");
        }, 3500);
      });
  }, [searchParams, router, setUser]);

  const step = STATUS_STEPS[currentStep] ?? STATUS_STEPS[0];
  const StepIcon = step.icon;

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto py-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5 w-full"
        >
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-500/40 bg-rose-500/10 shadow-lg shadow-rose-500/10">
            <div className="absolute inset-0 blur-2xl rounded-full scale-125 bg-rose-500/20" />
            <AlertCircle className="h-10 w-10 relative z-10 text-rose-500 stroke-[2.25]" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Authentication Failed
            </h1>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed px-2">
              {errorMessage}
            </p>
          </div>

          <p className="text-xs text-muted-foreground/70 font-mono">
            Redirecting to sign in page…
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto py-2">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex flex-col items-center gap-6 text-center w-full"
      >
        {/* Central Floating 3D Icon Box */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.7, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0, y: [0, -3, 0] }}
              exit={{ scale: 0.7, opacity: 0, rotate: 15 }}
              transition={{
                scale: { type: "spring", stiffness: 260, damping: 20 },
                opacity: { duration: 0.2 },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              }}
              className={`relative flex h-20 w-20 items-center justify-center rounded-3xl border shadow-lg ${step.box}`}
            >
              <div className={`absolute inset-0 blur-2xl rounded-full scale-125 ${step.glow}`} />
              <StepIcon className={`h-10 w-10 relative z-10 stroke-[2.25] ${step.iconColor}`} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Title & Animated Message */}
        <div className="flex flex-col items-center gap-2 w-full">
          <AnimatePresence mode="wait">
            <motion.h1
              key={step.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-righteous), cursive" }}
            >
              {step.title}
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={step.message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-muted-foreground leading-relaxed px-1"
            >
              {step.message}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Status Badge & Animated Progress Bar */}
        <div className="flex flex-col items-center gap-3 w-full mt-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.pill}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center justify-center gap-2 py-1.5 px-4 rounded-full w-fit border shadow-xs ${step.pill}`}
            >
              <RefreshCw className={`h-3.5 w-3.5 animate-spin ${step.iconColor}`} />
              <span className="text-xs font-bold">Authentication in progress</span>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="w-full max-w-[240px] h-1.5 bg-muted rounded-full overflow-hidden relative mt-1">
            <motion.div
              initial={{ width: "20%" }}
              animate={{ width: `${((currentStep + 1) / STATUS_STEPS.length) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full ${step.barColor} rounded-full relative overflow-hidden transition-colors duration-500`}
            >
              {/* Silky smooth shimmer overlay */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              />
            </motion.div>
          </div>

          <p className="text-xs text-muted-foreground/60 mt-1 font-medium">
            This will only take a moment.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default OAuthCallbackInner;
