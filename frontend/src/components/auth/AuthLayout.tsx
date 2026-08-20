"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  hero: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export function AuthLayout({ hero, content, className }: AuthLayoutProps) {
  return (
    <main
      className={cn(
        "h-[100dvh] w-full flex flex-col lg:flex-row overflow-hidden bg-background",
        className
      )}
    >
      {/* ── Left Section (Hero) - 3/5 width ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-2/4 xl:w-3/5 bg-[#080C14] border-r border-white/5 relative overflow-hidden">
        {hero}
        {/* Subtle bleed-in effect */}
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080C14]/30 to-transparent pointer-events-none" />
      </div>

      {/* ── Right Section (Form) - 2/5 width ────────────────────────── */}
      <div className="flex-1 lg:w-2/4 xl:w-2/5 relative h-full overflow-hidden bg-background">
        {/* Background Layer (Fixed) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {/* Vibrant Orbs - Premium Motion */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 0.9, 0.7],
              y: [0, -10, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[15%] w-[70%] md:w-[60%] h-[50%] md:h-[60%] bg-gradient-to-br from-orange-500/25 to-amber-500/20 dark:from-orange-400/20 dark:to-amber-400/15 rounded-full blur-[100px] md:blur-[140px]"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.7, 0.9, 0.7],
              y: [0, 10, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-[10%] -right-[15%] w-[80%] md:w-[70%] h-[55%] md:h-[65%] bg-gradient-to-br from-indigo-500/25 to-purple-500/20 dark:from-indigo-400/20 dark:to-purple-400/15 rounded-full blur-[100px] md:blur-[140px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.7, 0.5],
              x: [0, 20, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[40%] right-[-15%] w-[50%] h-[50%] bg-gradient-to-br from-orange-500/15 to-amber-500/15 dark:from-orange-400/10 dark:to-amber-400/10 rounded-full blur-[120px]"
          />

          {/* Glass Overlay */}
          <div className="absolute inset-0 backdrop-blur-[30px] md:backdrop-blur-[40px]" />
        </div>

        {/* Scrollable Content Layer */}
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
          {/* Perfect Centering Container */}
          <div className="min-h-full w-full flex flex-col justify-center items-center py-12 px-6 sm:px-10 md:px-12">
            <div suppressHydrationWarning className="w-full max-w-md">
              {content}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;
