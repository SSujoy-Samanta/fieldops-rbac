import React from "react";
import { cn } from "@/lib/utils";

interface OAuthDividerProps {
  label?: string;
  className?: string;
}

export function OAuthDivider({
  label = "or continue with work email",
  className,
}: OAuthDividerProps) {
  return (
    <div className={cn("relative flex items-center gap-4 py-1.5", className)}>
      <div className="flex-1 h-px bg-border/60" />
      <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap px-1">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

export default OAuthDivider;
