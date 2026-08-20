"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "@/components/brand/Wordmark";
import { ShieldCheck, Zap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthHeroSectionProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  tagline?: string;
  footerMetric?: string;
  backgroundImage: string;
  className?: string;
}

export function AuthHeroSection({
  badge = "Identity & Access Control",
  title = "Enterprise Workforce & Access Management",
  subtitle = "High-velocity role-based authorization, dynamic permission evaluation, and verified on-duty field workforce operations.",
  tagline = "NIST Level 2 RBAC Floor & Ceiling Defense",
  footerMetric = "<0.4ms Redis Policy Check",
  backgroundImage,
  className,
}: AuthHeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[100dvh] overflow-hidden bg-[#080C14] select-none",
        className
      )}
    >
      {/* ── Background Image Layer ───────────────────────────────────── */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#0A0F1A] z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent -translate-x-full animate-pulse" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.08)_0%,transparent_100%)]" />
            </motion.div>
          )}
        </AnimatePresence>

        <Image
          src={backgroundImage}
          alt="FieldOps Security Command"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className={cn(
            "object-cover transition-all duration-1000 ease-out",
            isLoaded ? "opacity-90 scale-100 blur-0" : "opacity-0 scale-105 blur-md"
          )}
          onLoad={() => setIsLoaded(true)}
        />

        {/* ── Dark Overlays & Gradient Vignettes ───────────────────────── */}
        <div className="absolute inset-0 z-[1] bg-black/45 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#080C14] via-[#080C14]/40 to-transparent" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-[#080C14]/70 via-transparent to-transparent" />
      </div>

      {/* ── Content Layer ───────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-between p-8 sm:p-12 lg:p-16 w-full h-full min-h-[100dvh]">
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <Wordmark size="md" invert />

          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>NIST RBAC Core</span>
          </div>
        </motion.div>

        {/* Center Title & Feature Callout */}
        <div className="max-w-xl my-auto py-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500/20 text-orange-400 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md border border-orange-500/30"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{badge}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-[1.15] tracking-tight"
            style={{ fontFamily: "var(--font-righteous), cursive" }}
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-normal"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Bottom Tagline & Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs text-slate-400"
        >
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-orange-500/70" />
            <span className="font-medium text-slate-300">{tagline}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <Lock className="h-3.5 w-3.5 text-orange-400" />
            <span>{footerMetric}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthHeroSection;
