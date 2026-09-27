"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { SeverityBadge } from "@/components/ui/Badge";
import { MOCK_INCIDENTS } from "@/data/mockIncidents";
import { formatCurrency } from "@/utils/formatters";

// Sparkline Mini Data
const SPARK_ACTIVE = [{ v: 12 }, { v: 10 }, { v: 11 }, { v: 9 }, { v: 8 }, { v: 7 }];
const SPARK_HISTORICAL = [{ v: 1190 }, { v: 1220 }, { v: 1245 }, { v: 1260 }, { v: 1275 }, { v: 1284 }];
const SPARK_PATTERNS = [{ v: 34 }, { v: 36 }, { v: 39 }, { v: 41 }, { v: 42 }, { v: 43 }];
const SPARK_PREVENTED = [{ v: 82 }, { v: 94 }, { v: 106 }, { v: 114 }, { v: 121 }, { v: 127 }];
const SPARK_MEMORY = [{ v: 7800 }, { v: 8020 }, { v: 8210 }, { v: 8350 }, { v: 8420 }, { v: 8492 }];
const SPARK_RECOVERY = [{ v: 88.4 }, { v: 89.9 }, { v: 91.2 }, { v: 92.5 }, { v: 93.8 }, { v: 94.2 }];

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
    telemetry: "1536-dimensional semantic query matched against 8,492 organizational failure vectors in 14.8ms.",
    mechanism: "HNSW cosine distance calculation identifies high similarity cluster vec_0x789f2a4.",
    aiOutput: "Found 4 exact historical matches: INC-8942, INC-8120, INC-7940. Failure signatures are 98% identical.",
    icon: Database,
  },
  {
    id: "pattern",
    name: "Pattern Discovery",
    code: "04. SIGNATURE CLASSIFICATION",
    shortDesc: "Crystallizes recurring failure signatures.",
    telemetry: "Correlated across 14 historical occurrences. Recurrence frequency: 1.8 incidents/month.",
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
    aiOutput: "Pre-Deploy Alert: 92% failure probability detected in checkout-v2.14.0 pull request.",
    icon: ShieldAlert,
  },
  {
    id: "prevention",
    name: "Preventive Action",
    code: "06. GUARDRAIL ENFORCEMENT",
    shortDesc: "Automated CI/CD policy gates & runtime breakers.",
    telemetry: "Guardrail #PRV-104 invoked across 42 microservice repositories in GitHub Actions.",
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
    aiOutput: "Failure averted. Estimated $480,000 downtime loss avoided. MTTR reduced from 83m to 0m.",
    icon: CheckCircle2,
  },
  {
    id: "learning",
    name: "Learning",
    code: "08. CODIFIED RESILIENCE",
    shortDesc: "Permanently codified into organizational memory.",
    telemetry: "Resilience Score elevated +4.8%. Knowledge indexed into Hindsight Memory vector store.",
    mechanism: "Continuous feedback loop feeds the updated vector memory, strengthening pre-deploy radar.",
    aiOutput: "Continuous Learning Complete. The organization will never suffer this specific failure again.",
    icon: RotateCw,
  },
];

// Recent Organizational Lessons
const RECENT_LEARNINGS = [
  {
    id: "lrn-01",
    incidentCode: "INC-8942",
    service: "checkout-orchestrator",
    lesson: "Synchronous downstream HTTP/gRPC calls without strict hedged timeouts propagate threadpool saturation backwards in < 90s.",
    guardrail: "PRV-104: Enforced 650ms Deadline Propagation & Bulkhead",
    category: "Cascading Timeout",
    date: "Sep 24, 2026",
  },
  {
    id: "lrn-02",
    incidentCode: "INC-8891",
    service: "account-ledger-db",
    lesson: "Zero-downtime PostgreSQL DDL migrations must require lock_timeout <= 2000ms to prevent connection pool exhaustion.",
    guardrail: "PRV-014: Zero-Downtime Safe DDL Pipeline Gate",
    category: "DB Concurrency",
    date: "Sep 18, 2026",
  },
  {
    id: "lrn-03",
    incidentCode: "INC-8760",
    service: "ingress-mesh-gateway",
    lesson: "Edge CDN ingress must drop malformed wildcard vanity host headers to prevent CoreDNS NXDOMAIN cache OOMKills.",
    guardrail: "PRV-210: Edge Host Header Filter & NodeLocal DNSCache",
    category: "Network / DNS",
    date: "Sep 10, 2026",
  },
  {
    id: "lrn-04",
    incidentCode: "INC-8615",
    service: "auth-identity-broker",
    lesson: "Ephemeral STS authentication token refreshes must be scheduled at minimum 30% of TTL ahead of expiry with randomized jitter.",
    guardrail: "PRV-089: Distributed Credential Randomized Jitter Buffer",
    category: "IAM Race Condition",
    date: "Aug 29, 2026",
  },
];

export function OverviewView() {
  const router = useRouter();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [autoPlayLoop, setAutoPlayLoop] = useState(true);

  // Auto-cycle through the learning loop steps every 4.5 seconds unless paused
  useEffect(() => {
    if (!autoPlayLoop) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % LEARNING_LOOP_STEPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlayLoop]);

  const activeStep = LEARNING_LOOP_STEPS[activeStepIndex];

  // Realistic live operational incidents
  const liveIncidents = MOCK_INCIDENTS.slice(0, 3);

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
              {/* Pulsing HINDSIGHT ACTIVE indicator */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/70 px-3 py-1 text-xs font-bold text-emerald-300 shadow-sm shadow-emerald-950/50">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span>● HINDSIGHT ACTIVE</span>
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
            <Link
              href="/incidents"
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-sky-950/50 hover:bg-sky-500 transition-colors"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>Inspect 7 Active Outages</span>
            </Link>
            <Link
              href="/ai-command"
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Terminal className="h-4 w-4 text-sky-400" />
              <span>AI Command Console</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Enterprise KPI Cards with Realistic Trends & Mini Sparkline Charts */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Core Operational Failure Metrics
          </span>
          <span className="text-[11px] text-slate-500">
            Continuous telemetry • Updated 8s ago
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {/* 1. Active Incidents — 7 */}
          <div className="rounded-xl border border-red-900/40 bg-gradient-to-b from-slate-900/90 to-red-950/10 p-4 backdrop-blur-sm shadow-sm hover:border-red-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Active Incidents</span>
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">7</span>
                <span className="text-[11px] font-semibold text-emerald-400">↓ 2 shift</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">3 P1 Critical • 4 P2 High</p>
            </div>
            <div className="h-10 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPARK_ACTIVE}>
                  <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Historical Incidents — 1,284 */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Historical Incidents</span>
                <Database className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">1,284</span>
                <span className="text-[11px] font-semibold text-sky-400">+12 Q3</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Indexed postmortems</p>
            </div>
            <div className="h-10 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPARK_HISTORICAL}>
                  <Area type="monotone" dataKey="v" stroke="#38bdf8" strokeWidth={2} fill="#38bdf8" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Learned Patterns — 43 */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Learned Patterns</span>
                <Layers className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">43</span>
                <span className="text-[11px] font-semibold text-amber-400">+3 new</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Anti-pattern signatures</p>
            </div>
            <div className="h-10 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPARK_PATTERNS}>
                  <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Prevented Failures — 127 */}
          <div className="rounded-xl border border-emerald-900/50 bg-gradient-to-b from-slate-900/90 to-emerald-950/15 p-4 backdrop-blur-sm shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-emerald-300">Prevented Failures</span>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-emerald-400">127</span>
                <span className="text-[11px] font-semibold text-emerald-300">+18 mo</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">$4.9M downtime saved</p>
            </div>
            <div className="h-10 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPARK_PREVENTED}>
                  <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. Memory Records — 8,492 */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Memory Records</span>
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">8,492</span>
                <span className="text-[11px] font-mono text-cyan-400">1536-dim</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">99.4% recall precision</p>
            </div>
            <div className="h-10 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPARK_MEMORY}>
                  <Area type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 6. Recovery Success — 94.2% */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Recovery Success</span>
                <Activity className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">94.2%</span>
                <span className="text-[11px] font-semibold text-emerald-400">+5.8%</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Auto-mitigated in &lt;15m</p>
            </div>
            <div className="h-10 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPARK_RECOVERY}>
                  <Area type="monotone" dataKey="v" stroke="#38bdf8" strokeWidth={2} fill="#38bdf8" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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

      {/* Live Operational Intelligence Section */}
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
              Active cluster failures streaming through the Hindsight reasoning engine. Click an incident to inspect postmortem details.
            </p>
          </div>

          <Link
            href="/incidents"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Incidents</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3 Live Incidents Cards */}
        <div className="grid grid-cols-1 gap-4">
          {liveIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => router.push(`/incidents/${inc.id}`)}
              className="group cursor-pointer rounded-xl border border-slate-800/90 bg-slate-900/60 p-5 backdrop-blur-sm shadow-lg hover:border-sky-500/40 hover:bg-slate-900/90 transition-all duration-200"
            >
              {/* Header: Code, Service, Severity, Status, Detected Time */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/50">
                    {inc.code}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-200 transition-colors">
                    {inc.title}
                  </h3>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="font-mono text-xs text-slate-300 font-medium">
                    {inc.service}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <SeverityBadge severity={inc.severity} />
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      inc.status === "investigating"
                        ? "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {inc.status}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    {inc.mttrMinutes}m ago
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
                  &ldquo;This incident resembles {inc.similarityMatchCount} historical incidents ({inc.keyLearnings[0]?.slice(0, 80)}...). Hindsight has identified identical cascading thread exhaustion signatures and recommended immediate deadline propagation.&rdquo;
                </p>
              </div>

              {/* Action Button & Telemetry Footer */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                <div className="flex items-center gap-4 text-slate-400">
                  <span>Impact: <strong className="text-amber-400">{formatCurrency(inc.impactCost)}</strong></span>
                  <span>Affected: <strong className="text-slate-200">{inc.affectedUsers.toLocaleString()} users</strong></span>
                  <span className="font-mono text-[11px] text-cyan-300">Vector: {inc.hindsightVectorId}</span>
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
      </div>

      {/* Recent Learning Section */}
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
            <span>View Full Learning Timeline</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          Latest architectural immunity rules codified into Hindsight memory from resolved failure events.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {RECENT_LEARNINGS.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400">
                      {item.incidentCode}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.service}
                    </span>
                  </div>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                    {item.category}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-200 font-medium leading-relaxed">
                  {item.lesson}
                </p>
              </div>

              <div className="mt-4 border-t border-slate-850 pt-2.5 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-mono truncate max-w-[260px]">
                  🛡️ {item.guardrail}
                </span>
                <span className="text-slate-500 shrink-0">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
