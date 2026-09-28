"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Zap,
  AlertOctagon,
  ArrowRight,
  Database,
  Cpu,
  Sparkles,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
  Radio,
  Brain,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { SeverityBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

// Types for live dashboard stats from PostgreSQL
export interface DashboardStats {
  metrics: {
    totalIncidents: number;
    totalDiagnoses: number;
    recoveryExecutions: number;
    successfulRecoveries: number;
    verifiedRecoveries: number;
    learnedMemories: number;
    auditEvents: number;
    activeIncidents: number;
  };
  learningImpact: {
    memoriesStored: number;
    memoriesRecalled: number;
    successfulRecoveryOutcomes: number;
    averageConfidence: number;
  };
  recentIncidents: Array<{
    id: string;
    code: string;
    title: string;
    service: string;
    severity: string;
    status: string;
    mttrMinutes: number;
    impactCost: number;
    affectedUsers: number;
    hindsightVectorId: string;
    summary?: string;
    createdTime?: string;
    occurredAt?: string;
  }>;
  recentLearnings: Array<{
    memoryId: string;
    incidentTitle: string;
    rootCause: string;
    outcome: string;
    confidence: number;
    createdTime: string;
    service?: string;
    learnedInsight?: string;
  }>;
  isLiveDatabase: boolean;
}

// Dynamically generate smooth sparkline points ending at the real metric count
function generateSparkline(value: number, spread = 0.25) {
  if (!value || value <= 0) {
    return [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];
  }
  return [
    { v: Math.max(0, Math.round(value * (1 - spread * 0.85))) },
    { v: Math.max(0, Math.round(value * (1 - spread * 0.65))) },
    { v: Math.max(0, Math.round(value * (1 - spread * 0.45))) },
    { v: Math.max(0, Math.round(value * (1 - spread * 0.25))) },
    { v: Math.max(0, Math.round(value * (1 - spread * 0.1))) },
    { v: value },
  ];
}

// Format confidence helper
function formatConfidence(c: number): string {
  if (c <= 1) {
    return `${(c * 100).toFixed(1)}%`;
  }
  return `${c.toFixed(1)}%`;
}

export function OverviewView() {
  const router = useRouter();

  // Live state from PostgreSQL API
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isHindsightLive, setIsHindsightLive] = useState(false);

  // Check real health status of Hindsight
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (!res.ok) throw new Error("Health check failed");
      const json = await res.json();
      const live =
        json?.services?.hindsight?.status === "CONNECTED" ||
        (json?.services?.hindsight?.configured === true && json?.status === "ok");
      setIsHindsightLive(Boolean(live));
    } catch {
      setIsHindsightLive(false);
    }
  }, []);

  // Fetch real statistics from /api/dashboard/stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
        setLastUpdated(new Date());
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[OverviewView] Failed to fetch live dashboard stats:", msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Polling every 5 seconds + Demo completion event listener + Tab focus
  useEffect(() => {
    fetchStats();
    checkHealth();

    // 1. Polling interval every 5 seconds
    const interval = setInterval(() => {
      fetchStats();
      checkHealth();
    }, 5000);

    // 2. Custom event listener dispatched by autonomous demo
    const handleDemoCompleted = () => {
      fetchStats();
      checkHealth();
    };
    window.addEventListener("resonyx:demo_completed", handleDemoCompleted);

    // 3. Tab focus listener
    const handleFocus = () => {
      fetchStats();
      checkHealth();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resonyx:demo_completed", handleDemoCompleted);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchStats, checkHealth]);

  const metrics = stats?.metrics || {
    totalIncidents: 0,
    totalDiagnoses: 0,
    recoveryExecutions: 0,
    successfulRecoveries: 0,
    verifiedRecoveries: 0,
    learnedMemories: 0,
    auditEvents: 0,
    activeIncidents: 0,
  };

  const learningImpact = stats?.learningImpact || {
    memoriesStored: 0,
    memoriesRecalled: 0,
    successfulRecoveryOutcomes: 0,
    averageConfidence: 0,
  };

  const recentIncidents = stats?.recentIncidents || [];
  const recentLearnings = stats?.recentLearnings || [];

  return (
    <div className="space-y-5 pb-8">
      {/* Top Command Center Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-r from-[#070e1c] via-[#091224] to-[#0c1830] p-5 sm:p-6 shadow-2xl">
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            {/* Header / Subtitle / Status */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-sky-400 font-bold">
                ORGANIZATIONAL FAILURE INTELLIGENCE
              </span>
              <span className="text-slate-600">•</span>
              {/* Status badge: HINDSIGHT LIVE (green) or OFFLINE (amber) based on health check */}
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-0.5 text-xs font-bold shadow-sm ${
                  isHindsightLive
                    ? "border-emerald-500/40 bg-emerald-950/70 text-emerald-300 shadow-emerald-950/50"
                    : "border-amber-500/40 bg-amber-950/70 text-amber-300 shadow-amber-950/50"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isHindsightLive ? "animate-ping bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      isHindsightLive ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                </span>
                <span>{isHindsightLive ? "HINDSIGHT LIVE" : "OFFLINE"}</span>
              </div>
            </div>

            <h1 className="text-[30px] sm:text-[36px] font-extrabold tracking-tight text-white leading-tight">
              Resonyx Command Center
            </h1>

            <h2 className="text-[17px] sm:text-[18px] font-medium text-sky-200/90 tracking-wide">
              Your organization is learning from every failure.
            </h2>

            <p className="text-[14px] sm:text-[15px] text-slate-300 leading-normal pt-0.5">
              An AI agent that remembers past incidents, learns which fixes work, and warns you before the same failure happens again.
            </p>
          </div>

          {/* Quick Actions: Primary & Secondary buttons side by side */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <Link
              href="/incidents"
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-950/50 hover:bg-sky-500 transition-colors"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>{`Inspect ${metrics.activeIncidents} Active Incidents`}</span>
            </Link>
            <Link
              href="/memory"
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Database className="h-4 w-4 text-sky-400" />
              <span>Hindsight Memory</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Enterprise Core Metrics Cards backed by real PostgreSQL data */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Core Operational Failure Metrics
          </span>
          <span className="text-[11px] text-slate-500 flex items-center gap-2">
            {stats?.isLiveDatabase ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live PostgreSQL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-400 font-mono">
                In-Memory Store
              </span>
            )}
            <span>•</span>
            <span>
              {isLoading
                ? "Connecting to database..."
                : lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()}`
                : "Continuous telemetry"}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {/* 1. Total Incidents */}
          <div className="rounded-xl border border-red-900/40 bg-gradient-to-b from-slate-900/90 to-red-950/10 p-4 backdrop-blur-sm shadow-sm hover:border-red-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Total Incidents</span>
                <span className={`flex h-2 w-2 rounded-full ${metrics.activeIncidents > 0 ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">
                  {metrics.totalIncidents}
                </span>
                {metrics.activeIncidents > 0 && (
                  <span className="text-[11px] font-semibold text-red-400">
                    {metrics.activeIncidents} active
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {metrics.totalIncidents === 0
                  ? "Awaiting first failure event"
                  : `${metrics.activeIncidents} active • ${Math.max(0, metrics.totalIncidents - metrics.activeIncidents)} resolved`}
              </p>
            </div>
            <div className="h-10 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateSparkline(metrics.totalIncidents, 0.3)}>
                  <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Diagnosed (Total Diagnoses) */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Diagnosed</span>
                <Cpu className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">
                  {metrics.totalDiagnoses}
                </span>
                <span className="text-[11px] font-semibold text-sky-400">
                  {metrics.totalIncidents > 0 ? `${Math.round((metrics.totalDiagnoses / Math.max(1, metrics.totalIncidents)) * 100)}% coverage` : "AI RCA"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Autonomous RCA investigations
              </p>
            </div>
            <div className="h-10 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateSparkline(metrics.totalDiagnoses, 0.25)}>
                  <Area type="monotone" dataKey="v" stroke="#38bdf8" strokeWidth={2} fill="#38bdf8" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Recovery Executions */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Recovery Executions</span>
                <Zap className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">
                  {metrics.recoveryExecutions}
                </span>
                <span className="text-[11px] font-semibold text-emerald-400">
                  {metrics.successfulRecoveries} successful
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Autonomous pipeline runs
              </p>
            </div>
            <div className="h-10 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateSparkline(metrics.recoveryExecutions, 0.2)}>
                  <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Verified Recoveries */}
          <div className="rounded-xl border border-emerald-900/50 bg-gradient-to-b from-slate-900/90 to-emerald-950/15 p-4 backdrop-blur-sm shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-emerald-300">Verified Recoveries</span>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-emerald-400">
                  {metrics.verifiedRecoveries}
                </span>
                <span className="text-[11px] font-semibold text-emerald-300">
                  SLO Passed
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Health & canary verified
              </p>
            </div>
            <div className="h-10 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateSparkline(metrics.verifiedRecoveries, 0.2)}>
                  <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. Memories Learned */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Memories Learned</span>
                <Database className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">
                  {metrics.learnedMemories}
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Hindsight
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Failure vectors codified
              </p>
            </div>
            <div className="h-10 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateSparkline(metrics.learnedMemories, 0.2)}>
                  <Area type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 6. Audit Events */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Audit Events</span>
                <Activity className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">
                  {metrics.auditEvents}
                </span>
                <span className="text-[11px] font-semibold text-purple-400">
                  Ledger
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Immutable event trail
              </p>
            </div>
            <div className="h-10 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateSparkline(metrics.auditEvents, 0.2)}>
                  <Area type="monotone" dataKey="v" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Impact Section (Requirement 7) */}
      <div className="rounded-2xl border border-sky-900/40 bg-gradient-to-r from-[#061224] via-[#081830] to-[#0a1e3a] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-900/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-sky-500/20 p-2 text-sky-400 border border-sky-500/30">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Learning Impact & Resilience Attribution</span>
                <span className="rounded bg-sky-950 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-300 border border-sky-800/50">
                  REAL-TIME
                </span>
              </h2>
              <p className="text-xs text-sky-200/70 mt-0.5">
                Quantifiable resilience metrics codified from PostgreSQL hindsight memories and autonomous verification checks.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Memories Stored */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Memories Stored</span>
              <Database className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-cyan-300">
                {learningImpact.memoriesStored}
              </span>
              <span className="text-xs font-mono text-slate-400">vectors</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Permanent failure signatures codified in PostgreSQL
            </p>
          </div>

          {/* Memories Recalled */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Memories Recalled</span>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                {learningImpact.memoriesRecalled}
              </span>
              <span className="text-xs font-mono text-slate-400">lookups</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Historical failure precedents matched during RCA
            </p>
          </div>

          {/* Successful Recovery Outcomes */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Recovery Outcomes</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                {learningImpact.successfulRecoveryOutcomes}
              </span>
              <span className="text-xs font-mono text-emerald-400">verified</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Postmortem outcomes verified in production
            </p>
          </div>

          {/* Average Confidence */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Average Confidence</span>
              <Activity className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-sky-300">
                {learningImpact.averageConfidence > 0
                  ? formatConfidence(learningImpact.averageConfidence)
                  : "0.0%"}
              </span>
              <span className="text-xs font-mono text-sky-400">RCA Certainty</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Mean AI diagnostic and verification certainty
            </p>
          </div>
        </div>
      </div>

      {/* Live Operational Intelligence Section (Requirement 5) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-400 animate-pulse" />
              <h2 className="text-xl font-bold tracking-tight text-white">
                Live Operational Intelligence
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time incident records streamed from PostgreSQL through the Hindsight reasoning engine. Click an incident to inspect postmortem details.
            </p>
          </div>

          <Link
            href="/incidents"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Incidents ({metrics.totalIncidents})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Empty State when PostgreSQL has 0 incidents */}
        {recentIncidents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
            <AlertOctagon className="mx-auto h-8 w-8 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-300">
              No Incidents Recorded in PostgreSQL
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              The database has 0 incident records. Run the 60-second autonomous recovery demo to trigger an incident and watch the dashboard update live.
            </p>
            <div className="pt-2">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-sky-500 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Launch Autonomous Demo</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Live Incidents Cards from PostgreSQL */
          <div className="grid grid-cols-1 gap-4">
            {recentIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => router.push(`/incidents/${inc.id}`)}
                className="group cursor-pointer rounded-xl border border-slate-800/90 bg-slate-900/60 p-5 backdrop-blur-sm shadow-lg hover:border-sky-500/40 hover:bg-slate-900/90 transition-all duration-200"
              >
                {/* Header: Code, Title, Service, Severity, Status, Detected Time */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/50">
                      {inc.code || `INC-${inc.id.slice(0, 6)}`}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-sky-200 transition-colors">
                      {inc.title}
                    </h3>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-xs text-slate-300 font-medium">
                      {inc.service}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <SeverityBadge severity={inc.severity as "critical" | "high" | "medium" | "low" | "info"} />
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        inc.status === "investigating"
                          ? "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse"
                          : inc.status === "mitigated" || inc.status === "resolved"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-sky-500/20 text-sky-300 border-sky-500/30"
                      }`}
                    >
                      {inc.status}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="h-3.5 w-3.5" />
                      {inc.createdTime
                        ? formatDateTime(inc.createdTime)
                        : inc.occurredAt
                        ? formatDateTime(inc.occurredAt)
                        : `${inc.mttrMinutes || 12}m MTTR`}
                    </span>
                  </div>
                </div>

                {/* AI Insight Box */}
                <div className="mt-3.5 rounded-lg border border-sky-500/20 bg-[#071124] p-3.5">
                  <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Resonyx AI Hindsight Insight</span>
                  </div>
                  <p className="mt-1 text-xs text-sky-100 font-medium leading-relaxed">
                    {inc.summary
                      ? inc.summary
                      : `Hindsight engine synthesized failure telemetry for ${inc.service}. Root cause attribution and automated recovery plan generated from vector memory.`}
                  </p>
                </div>

                {/* Action Button & Telemetry Footer */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>
                      Impact: <strong className="text-amber-400">{formatCurrency(inc.impactCost || 0)}</strong>
                    </span>
                    <span>
                      Affected: <strong className="text-slate-200">{(inc.affectedUsers || 0).toLocaleString()} users</strong>
                    </span>
                    <span className="font-mono text-[11px] text-cyan-300">
                      Vector: {inc.hindsightVectorId || "vec_0xdefault"}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/incidents/${inc.id}`);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-sky-500 transition-colors"
                  >
                    <span>Open Postmortem & Remediation</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Learnings / Hindsight Section (Requirement 6) */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Recent Organizational Learnings
            </h2>
          </div>
          <Link
            href="/memory"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>View All Memories ({metrics.learnedMemories})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          Latest architectural immunity rules codified into PostgreSQL Hindsight memory from resolved failure events.
        </p>

        {/* Empty State when PostgreSQL has 0 memories */}
        {recentLearnings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center space-y-3">
            <Database className="mx-auto h-8 w-8 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-300">
              No Hindsight Memories Recorded in PostgreSQL
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              When an incident is investigated and resolved through the autonomous recovery pipeline, its postmortem learnings and recovery outcomes will be permanently codified here.
            </p>
          </div>
        ) : (
          /* Real Memories from PostgreSQL */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {recentLearnings.map((item, idx) => (
              <div
                key={item.memoryId || `mem-${idx}`}
                className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/50">
                        {item.memoryId}
                      </span>
                      {item.service && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.service}
                        </span>
                      )}
                    </div>
                    <span className="rounded bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {formatConfidence(item.confidence)} Certainty
                    </span>
                  </div>

                  <h4 className="mt-2 text-xs font-bold text-white line-clamp-1">
                    {item.incidentTitle}
                  </h4>

                  <div className="mt-2 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Root Cause Learned
                      </span>
                      <p className="text-slate-300 font-medium leading-relaxed line-clamp-2">
                        {item.rootCause}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 block">
                        Recovery Outcome
                      </span>
                      <p className="text-emerald-200/90 font-mono text-[11px] leading-relaxed line-clamp-2">
                        {item.outcome}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-850 pt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-cyan-400 font-mono truncate max-w-[240px] flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span>Codified in PostgreSQL</span>
                  </span>
                  <span className="text-slate-500 shrink-0">
                    {item.createdTime ? formatDateTime(item.createdTime) : "Just now"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
