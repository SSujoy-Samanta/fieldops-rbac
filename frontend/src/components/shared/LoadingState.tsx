"use client";

import React from "react";
import { motion } from "framer-motion";
import { TriColorLoader } from "./TriColorLoader";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  text?: string;
  subtext?: string;
  size?: number;
  className?: string;
  minHeight?: string;
}

export function LoadingState({
  text = "Loading",
  subtext,
  size = 64,
  className,
  minHeight = "min-h-[400px]",
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700",
        minHeight,
        className
      )}
    >
      <TriColorLoader
        size={size}
        className="opacity-95 drop-shadow-[0_0_15px_rgba(249,115,22,0.15)]"
      />

      <div className="mt-8 flex flex-col items-center gap-3 max-w-xs text-center">
        <p className="text-xs sm:text-sm font-bold text-foreground/80 uppercase tracking-[0.25em] animate-pulse">
          {text}
        </p>

        {subtext && (
          <p className="text-[11px] text-muted-foreground font-medium tracking-wide">
            {subtext}
          </p>
        )}

        <div className="h-1 w-32 bg-muted-foreground/20 dark:bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-500 rounded-full"
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default LoadingState;
