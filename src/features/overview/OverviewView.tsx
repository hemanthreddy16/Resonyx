"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  AlertOctagon,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Sparkles,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
  RotateCw,
  Radio,
  Terminal,
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

// 8 Stages of the Organizational Learning Loop
interface LoopStep {
  id: string;
  name: string;
  code: string;
  shortDesc: string;
  telemetry: string;
  mechanism: string;
  aiOutput: string;
  icon: React.ComponentType<{ className?: string }>;
}

const LEARNING_LOOP_STEPS: LoopStep[] = [
  {
    id: "incident",
    name: "Incident",
    code: "01. TELEMETRY TRIGGER",
    shortDesc: "Outage or anomaly detected in production.",
    telemetry: "p99 latency > 6.4s on payment-gateway-proxy. 3 Availability Zones reporting socket saturation.",
    mechanism: "Real-time Datadog APM alert triggers Resonyx Hindsight Sentinel webhook within 800ms.",
    aiOutput: "Incident payload synthesized: Severity P1, Impact $185K, 54,000 active checkout sessions affected.",
    icon: AlertOctagon,
  },
  {
    id: "investigation",
    name: "AI Investigation",
    code: "02. ROOT CAUSE ATTRIBUTION",
    shortDesc: "Automated distributed trace & error budget scan.",
    telemetry: "Trace depth: 14 downstream microservices evaluated. Deadlock localized in async threadpool.",
    mechanism: "Resonyx-RCA-v4 traverses RPC DAG graph, isolating upstream thread depletion to unhedged downstream client.",
    aiOutput: "Attributed Root Cause: Cascading Timeout with monotonic thread starvation (Confidence: 98.7%).",
    icon: Cpu,
  },
  {
    id: "hindsight",
    name: "Hindsight Memory",
    code: "03. VECTOR RETRIEVAL",
    shortDesc: "Recalls identical historical failure vectors.",
    telemetry: "1536-dimensional semantic query matched against PostgreSQL failure vectors in 14.8ms.",
    mechanism: "HNSW cosine distance calculation identifies high similarity cluster vec_0x789f2a4.",
    aiOutput: "Found exact historical matches. Failure signatures are 98% identical.",
    icon: Database,
  },
  {
    id: "pattern",
    name: "Pattern Discovery",
    code: "04. SIGNATURE CLASSIFICATION",
    shortDesc: "Crystallizes recurring failure signatures.",
    telemetry: "Correlated across historical occurrences. Recurrence frequency: 1.8 incidents/month.",
    mechanism: "Pattern Engine matches PAT-CASCADING-QUEUE-01: Synchronous Downstream Bottleneck with Thread Saturation.",
    aiOutput: "Anti-pattern classified. Blast radius: Global Multi-Region. Trend: Declining (-40% since guardrail).",
    icon: Layers,
  },
  {
    id: "risk",
    name: "Risk Detection",
    code: "05. PRE-DEPLOY RADAR",
    shortDesc: "Intercepts future similar changes before deploy.",
    telemetry: "Scanned 1,420 Pull Requests, 84 Terraform plans, and 18 Helm release manifests this week.",
    mechanism: "AST code analysis detects unbounded sync gRPC client in PR #4892 matching the failure signature.",
    aiOutput: "Pre-Deploy Alert: 92% failure probability detected in checkout pull request.",
    icon: ShieldAlert,
  },
  {
    id: "prevention",
    name: "Preventive Action",
    code: "06. GUARDRAIL ENFORCEMENT",
    shortDesc: "Automated CI/CD policy gates & runtime breakers.",
    telemetry: "Guardrail #PRV-104 invoked across microservice repositories in GitHub Actions.",
    mechanism: "Enforces 650ms deadline propagation, isolated bulkhead threadpools, and full jitter backoff.",
    aiOutput: "Policy Enforced: CI/CD blocked merging until client was refactored with hedged circuit breaker.",
    icon: ShieldCheck,
  },
  {
    id: "outcome",
    name: "Outcome",
    code: "07. IMMUNITY ATTAINMENT",
    shortDesc: "Zero-downtime averted failure & validated resilience.",
    telemetry: "Next downstream third-party stall absorbed gracefully with 0ms client timeout propagation.",
    mechanism: "Bulkheaded threads rejected saturated calls; canary cluster maintained 99.99% availability.",
    aiOutput: "Failure averted. Estimated downtime loss avoided. MTTR reduced to sub-minute range.",
    icon: CheckCircle2,
  },
  {
    id: "learning",
    name: "Learning",
    code: "08. CODIFIED RESILIENCE",
    shortDesc: "Permanently codified into organizational memory.",
    telemetry: "Resilience Score elevated. Knowledge indexed into PostgreSQL Hindsight Memory store.",
    mechanism: "Continuous feedback loop feeds the updated vector memory, strengthening pre-deploy radar.",
    aiOutput: "Continuous Learning Complete. The organization has codified defense against this failure mode.",
    icon: RotateCw,
  },
];

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
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [autoPlayLoop, setAutoPlayLoop] = useState(true);

  // Live state from PostgreSQL API
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch real statistics from /api/dashboard/stats
  const fetchStats = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  }, []);

  // Polling every 5 seconds + Demo completion event listener + Tab focus
  useEffect(() => {
    fetchStats(false);

    // 1. Polling interval every 5 seconds
    const interval = setInterval(() => {
      fetchStats(true);
    }, 5000);

    // 2. Custom event listener dispatched by the 60-second autonomous demo
    const handleDemoCompleted = () => {
      fetchStats(false);
    };
    window.addEventListener("resonyx:demo_completed", handleDemoCompleted);

    // 3. Tab focus listener
    const handleFocus = () => {
      fetchStats(true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resonyx:demo_completed", handleDemoCompleted);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchStats]);

  // Auto-cycle through the learning loop steps every 4.5 seconds unless paused
  useEffect(() => {
    if (!autoPlayLoop) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % LEARNING_LOOP_STEPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlayLoop]);

  const activeStep = LEARNING_LOOP_STEPS[activeStepIndex];

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
    <div className="space-y-8 pb-12">
      {/* Top Command Center Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-r from-[#070e1c] via-[#091224] to-[#0c1830] p-6 sm:p-8 shadow-2xl">
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            {/* Header / Subtitle / Status */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-sky-400 font-bold">
                Organizational Failure Intelligence
              </span>
              <span className="text-slate-600">•</span>
              {/* Pulsing HINDSIGHT ACTIVE indicator with live DB status */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/70 px-3 py-1 text-xs font-bold text-emerald-300 shadow-sm shadow-emerald-950/50">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span>
                  {stats?.isLiveDatabase ? "● POSTGRESQL & HINDSIGHT LIVE" : "● HINDSIGHT ACTIVE"}
                </span>
                <span className="rounded bg-emerald-900/60 px-1.5 py-0.2 text-[10px] font-mono text-emerald-200">
                  v3.4
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Resonyx Command Center
            </h1>

            <h3 className="text-base sm:text-lg font-medium text-sky-200/90 tracking-wide">
              Your organization is learning from every failure.
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
              Real-time operational command console converting incident telemetry into permanent architectural resilience.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => fetchStats(false)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-850 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh live metrics from PostgreSQL"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-sky-400" : ""}`} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
            <Link
              href="/incidents"
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-950/50 hover:bg-sky-500 transition-colors"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>
                {metrics.activeIncidents > 0
                  ? `Inspect ${metrics.activeIncidents} Active Outages`
                  : `Inspect ${metrics.totalIncidents} Incidents`}
              </span>
            </Link>
            <Link
              href="/ai-command"
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Terminal className="h-4 w-4 text-sky-400" />
              <span>AI Command Console</span>
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
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-sky-300/80 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-800/40">
              Recall Precision: 99.4%
            </span>
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

      {/* Large Interactive Section: Organizational Learning Loop */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#090f1d] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-sky-950 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-300 border border-sky-800/50">
                CONTINUOUS FEEDBACK ARCHITECTURE
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Organizational Learning Loop
              </h2>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Interactive 8-stage intelligence loop converting operational incidents into permanent organizational immunity. Click any node to inspect live engine telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoPlayLoop(!autoPlayLoop)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                autoPlayLoop
                  ? "border-sky-500/40 bg-sky-950/60 text-sky-300"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              <RotateCw className={`h-3.5 w-3.5 ${autoPlayLoop ? "animate-spin" : ""}`} />
              <span>{autoPlayLoop ? "Auto-cycling Loop" : "Paused"}</span>
            </button>
          </div>
        </div>

        {/* 8-Stage Interactive Navigation Track */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {LEARNING_LOOP_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === activeStepIndex;

            return (
              <button
                key={step.id}
                onClick={() => {
                  setAutoPlayLoop(false);
                  setActiveStepIndex(idx);
                }}
                className={`group relative flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-200 ${
                  isActive
                    ? "border-sky-400 bg-sky-950/60 shadow-lg shadow-sky-950/50 ring-1 ring-sky-400/50"
                    : "border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                {/* Connecting arrow indicator between nodes */}
                {idx < LEARNING_LOOP_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-slate-600 font-mono text-[10px]">
                    →
                  </div>
                )}
                {idx === LEARNING_LOOP_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-sky-400 font-mono text-[10px] animate-pulse">
                    ↺
                  </div>
                )}

                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    isActive
                      ? "border-sky-400 bg-sky-500 text-white shadow-md shadow-sky-500/30"
                      : "border-slate-800 bg-slate-900 text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <span
                  className={`mt-2 text-xs font-semibold truncate ${
                    isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                  }`}
                >
                  {step.name}
                </span>

                <span className="font-mono text-[9px] text-slate-400 mt-0.5">
                  Step 0{idx + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Loop Stage Deep Inspector */}
        <div className="rounded-xl border border-sky-500/25 bg-slate-950/80 p-5 shadow-inner space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-sky-600/20 p-2 text-sky-400 border border-sky-500/30">
                <activeStep.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400">
                    {activeStep.code}
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.2 text-[10px] font-semibold uppercase text-slate-300">
                    Live Engine State
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {activeStep.name}: {activeStep.shortDesc}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Sub-20ms Telemetry Bus
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Real-time Telemetry */}
            <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Stage Telemetry Signature
              </span>
              <p className="font-mono text-slate-200 leading-relaxed">
                {activeStep.telemetry}
              </p>
            </div>

            {/* AI Mechanism */}
            <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Underlying Resonyx Mechanism
              </span>
              <p className="text-slate-300 leading-relaxed">
                {activeStep.mechanism}
              </p>
            </div>

            {/* AI Output / Action */}
            <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-3.5 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                Intelligence Codification
              </span>
              <p className="text-sky-200 leading-relaxed font-medium">
                {activeStep.aiOutput}
              </p>
            </div>
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
            href="/timeline"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>View Full Learning Timeline ({metrics.learnedMemories})</span>
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
