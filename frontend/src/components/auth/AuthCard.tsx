"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function AuthCard({
  children,
  title,
  subtitle,
  className,
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn("w-full flex flex-col gap-6 p-1 sm:p-2", className)}
    >
      {(title || subtitle) && (
        <div className="flex flex-col gap-2">
          {title && (
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-righteous), cursive" }}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm sm:text-base text-muted-foreground font-medium leading-normal">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="flex-1 w-full">{children}</div>
    </motion.div>
  );
}

export default AuthCard;
