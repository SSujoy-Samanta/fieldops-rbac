"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "default" | "outline" | "ghost";
}

export function AuthButton({
  children,
  className,
  isLoading = false,
  loadingText = "Processing...",
  variant = "default",
  disabled,
  ...props
}: AuthButtonProps) {
  if (variant === "outline") {
    return (
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full">
        <button
          disabled={isLoading || disabled}
          className={cn(
            "w-full h-11 md:h-12 text-sm md:text-base font-semibold rounded-xl border border-border/70 bg-background/60 hover:bg-muted/80 text-foreground transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
            className
          )}
          {...props}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span>{loadingText}</span>
            </>
          ) : (
            children
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} className="w-full">
      <button
        disabled={isLoading || disabled}
        className={cn(
          "w-full h-11 md:h-12 text-sm md:text-base font-semibold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25",
          "rounded-xl relative overflow-hidden group/btn flex items-center justify-center",
          className
        )}
        {...props}
      >
        {/* Content Layer */}
        <div className="relative z-10 flex items-center justify-center gap-2.5 w-full h-full px-4">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>{loadingText}</span>
            </>
          ) : (
            children
          )}
        </div>

        {/* Elegant X-Axis Shimmer */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover/btn:animate-pulse" />
        </div>
      </button>
    </motion.div>
  );
}

export default AuthButton;
