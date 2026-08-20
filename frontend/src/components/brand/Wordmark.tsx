"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type WordmarkSize = "xs" | "sm" | "md" | "lg" | "xl";

interface WordmarkProps {
  size?: WordmarkSize;
  invert?: boolean;
  className?: string;
  href?: string;
  showIcon?: boolean;
}

export function Wordmark({
  size = "md",
  invert = false,
  className,
  href = "/overview",
  showIcon = true,
}: WordmarkProps) {
  const sizeClasses: Record<WordmarkSize, string> = {
    xs: "text-base gap-2",
    sm: "text-[1.3rem] gap-2.5",
    md: "text-2xl gap-3",
    lg: "text-3xl gap-3.5",
    xl: "text-4xl gap-4",
  };

  const iconSizes: Record<WordmarkSize, string> = {
    xs: "w-3.5 h-3.5",
    sm: "w-4.5 h-4.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const iconContainers: Record<WordmarkSize, string> = {
    xs: "p-1 rounded-sm",
    sm: "p-1.5 rounded-md",
    md: "p-2 rounded-lg",
    lg: "p-2.5 rounded-xl",
    xl: "p-3 rounded-2xl",
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center font-bold tracking-tight select-none group transition-all duration-200 hover:opacity-90 active:scale-95 cursor-pointer leading-none",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <div
          className={cn(
            "relative flex items-center justify-center bg-gradient-to-br from-orange-500 via-amber-500 to-indigo-600 text-white shadow-sm shadow-orange-500/25 group-hover:shadow-md group-hover:shadow-orange-500/40 group-hover:scale-105 transition-all duration-300 shrink-0",
            iconContainers[size]
          )}
        >
          <ShieldCheck className={cn("text-white stroke-[2.5]", iconSizes[size])} />
        </div>
      )}

      <div className="flex items-center leading-none">
        <span
          className={cn(
            "tracking-tight font-extrabold transition-colors leading-none",
            invert ? "text-white" : "text-foreground"
          )}
          style={{ fontFamily: "var(--font-righteous), cursive" }}
        >
          Field
        </span>
        <span
          className="bg-gradient-to-r from-orange-500 to-indigo-500 bg-clip-text text-transparent font-extrabold leading-none ml-0.5"
          style={{ fontFamily: "var(--font-righteous), cursive" }}
        >
          Ops
        </span>
      </div>
    </Link>
  );
}

export default Wordmark;
