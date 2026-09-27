import React from "react";
import { cn } from "@/utils/cn";
import { SeverityLevel } from "@/types";
import { getSeverityStyle } from "@/utils/formatters";

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
  showDot?: boolean;
}

export function SeverityBadge({ severity, className, showDot = true }: SeverityBadgeProps) {
  const styles = getSeverityStyle(severity);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        styles.badge,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full animate-pulse", styles.dot)}
        />
      )}
      {severity}
    </span>
  );
}

interface TagBadgeProps {
  label: string;
  className?: string;
  variant?: "neutral" | "azure" | "outline";
}

export function TagBadge({ label, className, variant = "neutral" }: TagBadgeProps) {
  const styles = {
    neutral: "bg-slate-800/80 text-slate-300 border-slate-700/60",
    azure: "bg-sky-950/70 text-sky-300 border-sky-800/50",
    outline: "bg-transparent text-slate-400 border-slate-800",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium tracking-tight",
        styles,
        className
      )}
    >
      {label}
    </span>
  );
}
