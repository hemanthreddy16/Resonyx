export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function getSeverityStyle(severity: "critical" | "high" | "medium" | "low" | "info") {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-red-500/10 border-red-500/30 text-red-400",
        badge: "bg-red-950/80 text-red-300 border-red-800/60",
        dot: "bg-red-500",
        glow: "shadow-[0_0_12px_rgba(239,68,68,0.2)]",
      };
    case "high":
      return {
        bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        badge: "bg-amber-950/80 text-amber-300 border-amber-800/60",
        dot: "bg-amber-500",
        glow: "shadow-[0_0_12px_rgba(245,158,11,0.2)]",
      };
    case "medium":
      return {
        bg: "bg-sky-500/10 border-sky-500/30 text-sky-400",
        badge: "bg-sky-950/80 text-sky-300 border-sky-800/60",
        dot: "bg-sky-400",
        glow: "shadow-[0_0_12px_rgba(56,189,248,0.2)]",
      };
    case "low":
      return {
        bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        badge: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60",
        dot: "bg-emerald-500",
        glow: "shadow-[0_0_12px_rgba(16,185,129,0.2)]",
      };
    case "info":
    default:
      return {
        bg: "bg-slate-500/10 border-slate-500/30 text-slate-400",
        badge: "bg-slate-900 text-slate-300 border-slate-800",
        dot: "bg-slate-400",
        glow: "",
      };
  }
}
