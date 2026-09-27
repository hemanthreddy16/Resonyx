import React from "react";
import { cn } from "@/utils/cn";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string;
    positive: boolean;
    label?: string;
  };
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: "info" | "warning" | "success" | "danger";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  badge,
  badgeVariant = "info",
  className,
}: StatCardProps) {
  const badgeClasses = {
    info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
  }[badgeVariant];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-sky-950/20",
        className
      )}
    >
      {/* Top subtle highlight line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {badge && (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
              badgeClasses
            )}
          >
            {badge}
          </span>
        )}
        {Icon && !badge && (
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-slate-400 transition-colors group-hover:border-sky-500/30 group-hover:text-sky-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-white">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "text-xs font-medium",
              change.positive ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {change.positive ? "↓ " : "↑ "}
            {change.value} {change.label || ""}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400/90">{subtitle}</p>
      )}
    </div>
  );
}
