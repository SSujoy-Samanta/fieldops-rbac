"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TriColorLoaderProps {
  className?: string;
  size?: number;
}

export function TriColorLoader({ className, size = 64 }: TriColorLoaderProps) {
  return (
    <div
      className={cn("relative flex items-center justify-center shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          {/* Brand Orange Arc */}
          <path
            d="M 50 10 A 40 40 0 0 0 10 50 A 38 38 0 0 1 50 18 A 4 4 0 0 0 50 10 Z"
            fill="#F97316"
          />

          {/* Brand Amber/Indigo Arc */}
          <g transform="rotate(120 50 50)">
            <path
              d="M 50 10 A 40 40 0 0 0 10 50 A 38 38 0 0 1 50 18 A 4 4 0 0 0 50 10 Z"
              fill="#F59E0B"
            />
          </g>

          {/* Brand Indigo/Blue Arc */}
          <g transform="rotate(240 50 50)">
            <path
              d="M 50 10 A 40 40 0 0 0 10 50 A 38 38 0 0 1 50 18 A 4 4 0 0 0 50 10 Z"
              fill="#4F46E5"
            />
          </g>
        </svg>
      </motion.div>
    </div>
  );
}

export default TriColorLoader;
