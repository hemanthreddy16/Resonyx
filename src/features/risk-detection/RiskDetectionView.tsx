"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Database,
  GitBranch,
  ArrowDown,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Info,
  Clock,
  Zap,
  Sliders,
  Sparkles,
  X,
  FileText,
  Brain,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { RiskGauge } from "./components/RiskGauge";
import {
  MOCK_RISK_TIMELINE,
  MOCK_HISTORICAL_PREDICTIONS,
  EVIDENCE_INCIDENTS,
} from "@/data/mockRisks";
import { HistoricalRiskPrediction } from "@/types";

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  type: "detection" | "operator_action" | "mitigation" | "system";
}

export function RiskDetectionView() {
  // Operational state
  const [riskScore, setRiskScore] = useState<number>(78);
  const [riskStatus, setRiskStatus] = useState<
    "ELEVATED" | "CRITICAL" | "MODERATE" | "NORMAL" | "MITIGATED"
  >("ELEVATED");
  const [isMitigated, setIsMitigated] = useState<boolean>(false);
  const [recommendationStatus, setRecommendationStatus] = useState<
    "pending" | "accepted" | "dismissed"
  >("pending");

  // Notifications state
  const [notification, setNotification] = useState<{
    type: "success" | "warning";
    message: string;
    subtext?: string;
  } | null>(null);

  // Evidence Modal state
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  const [selectedIncidentDetail, setSelectedIncidentDetail] = useState<string | null>(null);

  // Filter for historical predictions table
  const [predictionFilter, setPredictionFilter] = useState<"all" | "prevented" | "outage">("all");

  // Live Activity Timeline
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([
    {
      id: "evt-01",
      time: "18 mins ago",
      title: "Deployment v2.14.0-canary initiated",
      detail: "CI/CD Pipeline #8924 deployed canary pods to checkout cluster.",
      type: "system",
    },
    {
      id: "evt-02",
      time: "12 mins ago",
      title: "Traffic Volume Ingress Surge Detected",
      detail: "Gateway RPS climbed to 14,850 (+312% nominal baseline).",
      type: "detection",
    },
    {
      id: "evt-03",
      time: "7 mins ago",
      title: "Database CPU & Connection Saturation",
      detail: "Primary Aurora Postgres CPU climbed to 92.4%; lock queue depth = 48.",
      type: "detection",
    },
    {
      id: "evt-04",
      time: "4 mins ago",
      title: "Hindsight Memory Similarity Triggered",
      detail: "91.8% vector similarity detected with INC-1047, INC-1039, and PAT-017.",
      type: "detection",
    },
  ]);

  // Handle "Accept Recommendation"
  const handleAcceptRecommendation = () => {
    setIsMitigated(true);
    setRiskScore(26);
    setRiskStatus("MITIGATED");
    setRecommendationStatus("accepted");

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")} UTC`;

    // Add event to activity timeline
    const newEvent: TimelineEvent = {
      id: `evt-${Date.now()}`,
      time: timeString,
      title: "Operator Accepted Hindsight Recommendation",
      detail:
        "Database migration #4492 paused until 03:00 UTC off-peak window. Synthetic query performance validation container scheduled.",
      type: "operator_action",
    };

    setTimelineEvents((prev) => [newEvent, ...prev]);

    // Show success notification banner
    setNotification({
      type: "success",
      message: "Automated Guardrail Enforced: Migration Pipeline Paused",
      subtext:
        "Operational risk successfully mitigated from 78/100 (ELEVATED) to 26/100 (NORMAL). Query performance validation container scheduled.",
    });
  };

  // Handle "Dismiss"
  const handleDismiss = () => {
    setRecommendationStatus("dismissed");

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")} UTC`;

    const newEvent: TimelineEvent = {
      id: `evt-${Date.now()}`,
      time: timeString,
      title: "Operator Overrode / Dismissed Recommendation",
      detail:
        "Warning: Proceeding with database migration under elevated risk. Historical outcome RSK-385 indicates 66% probability of service degradation.",
      type: "warning" as unknown as "operator_action",
    };

    setTimelineEvents((prev) => [newEvent, ...prev]);

    setNotification({
      type: "warning",
      message: "Warning: Hindsight Recommendation Overridden by Operator",
      subtext:
        "Risk remains ELEVATED (78/100). Primary Postgres database node continues operating under 92.4% CPU contention.",
    });
  };

  const filteredPredictions = MOCK_HISTORICAL_PREDICTIONS.filter((p) => {
    if (predictionFilter === "all") return true;
    if (predictionFilter === "prevented") return p.outcome.includes("Prevented");
    if (predictionFilter === "outage") return p.outcome.includes("Outage Occurred");
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner: Memory Grounding Callout */}
      <div className="relative overflow-hidden rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/50 p-4 sm:p-5 shadow-lg shadow-sky-950/20 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="rounded-lg bg-sky-500/10 p-2.5 border border-sky-500/30 text-sky-400 shrink-0">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase">
                  Hindsight Memory-Backed Inference
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Zero LLM Hallucinations
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                Organizational Failure Memory Active
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Risk scoring is computed deterministically by calculating cosine vector similarities against{" "}
                <span className="text-white font-semibold">8,492 indexed failure memories</span> and{" "}
                <span className="text-white font-semibold">43 learned patterns</span>, ensuring verifiable,
                audit-ready operational intelligence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <Link
              href="/hindsight"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              Explore Memory Vectors <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Predictive Risk Detection
              </h1>
              <span
                className={`rounded-md px-2.5 py-0.5 text-xs font-mono font-bold border tracking-wide ${
                  isMitigated
                    ? "bg-emerald-950/80 text-emerald-400 border-emerald-700/60"
                    : "bg-rose-950/80 text-rose-400 border-rose-800/70 animate-pulse"
                }`}
              >
                ● {isMitigated ? "RISK MITIGATED" : "ELEVATED BLAST RADIUS"}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Live blast radius radar correlating incoming infra changes, deployment canaries, and traffic spikes with historical failure signatures.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowEvidenceModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-sky-400" />
              Evidence Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Optional Success / Warning Alert Banner */}
      {notification && (
        <div
          className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-xs sm:text-sm transition-all duration-300 ${
            notification.type === "success"
              ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-200"
              : "border-amber-500/50 bg-amber-950/30 text-amber-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-white text-sm">{notification.message}</div>
              {notification.subtext && (
                <div className="mt-0.5 text-xs opacity-90">{notification.subtext}</div>
              )}
            </div>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Hero Grid: Risk Gauge & Detected Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Large Risk Visualization Gauge */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert
                className={`h-5 w-5 ${isMitigated ? "text-emerald-400" : "text-rose-400"}`}
              />
              <span className="text-sm font-bold text-white">Current Operational Risk</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Evaluated 12s ago
            </span>
          </div>

          {/* Semicircular SVG Risk Gauge */}
          <div className="py-2">
            <RiskGauge score={riskScore} status={riskStatus} isMitigated={isMitigated} />
          </div>

          {/* Gauge Sub-Metrics */}
          <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-4 text-center">
            <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800/70">
              <div className="text-[10px] uppercase font-mono text-slate-400">Tolerance</div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">&lt; 40 / 100</div>
            </div>
            <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800/70">
              <div className="text-[10px] uppercase font-mono text-slate-400">Peak Load</div>
              <div className="text-xs font-bold text-amber-400 mt-0.5">14.8K RPS</div>
            </div>
            <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800/70">
              <div className="text-[10px] uppercase font-mono text-slate-400">Blast Radius</div>
              <div className={`text-xs font-bold mt-0.5 ${isMitigated ? "text-emerald-400" : "text-rose-400"}`}>
                {isMitigated ? "Contained" : "Tier-1 Critical"}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detected Signals */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-sky-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Detected Signals</h2>
            </div>
            <span className="rounded-md bg-sky-950/60 px-2 py-0.5 text-[11px] font-mono text-sky-300 border border-sky-800/50">
              4 Active Telemetry Vectors
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
            {/* Signal 1: High API traffic */}
            <div className="rounded-xl border border-rose-900/40 bg-gradient-to-br from-rose-950/20 to-slate-950 p-4 hover:border-rose-700/60 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold font-mono">
                  <TrendingUp className="h-4 w-4 text-rose-400" />
                  HIGH API TRAFFIC
                </div>
                <span className="rounded bg-rose-950 px-1.5 py-0.5 text-[10px] font-mono text-rose-300 border border-rose-800/50">
                  +312%
                </span>
              </div>
              <div className="mt-2 text-xl font-mono font-bold text-white">
                14,850 <span className="text-xs font-normal text-slate-400">req / sec</span>
              </div>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                Inbound requests to <code className="text-slate-300">/v2/checkout/process</code> surged beyond standard capacity threshold.
              </p>
            </div>

            {/* Signal 2: Database CPU increasing */}
            <div className="rounded-xl border border-rose-900/40 bg-gradient-to-br from-rose-950/20 to-slate-950 p-4 hover:border-rose-700/60 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold font-mono">
                  <Database className="h-4 w-4 text-rose-400" />
                  DATABASE CPU INCREASING
                </div>
                <span className="rounded bg-rose-950 px-1.5 py-0.5 text-[10px] font-mono text-rose-300 border border-rose-800/50">
                  92.4% CPU
                </span>
              </div>
              <div className="mt-2 text-xl font-mono font-bold text-white">
                pg-primary-01 <span className="text-xs font-normal text-slate-400">(Aurora)</span>
              </div>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                Connection pool queue depth reached 48 waiting threads with lock waits on ledger indexes.
              </p>
            </div>

            {/* Signal 3: Recent deployment */}
            <div className="rounded-xl border border-amber-900/40 bg-gradient-to-br from-amber-950/20 to-slate-950 p-4 hover:border-amber-700/60 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-mono">
                  <GitBranch className="h-4 w-4 text-amber-400" />
                  RECENT DEPLOYMENT
                </div>
                <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-800/50">
                  18m ago
                </span>
              </div>
              <div className="mt-2 text-lg font-mono font-bold text-white">
                v2.14.0-canary <span className="text-xs font-normal text-slate-400">#8924</span>
              </div>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                Canary release introduces modified settlement foreign key constraints and index changes.
              </p>
            </div>

            {/* Signal 4: Similarity to 6 historical incidents */}
            <div className="rounded-xl border border-sky-900/40 bg-gradient-to-br from-sky-950/20 to-slate-950 p-4 hover:border-sky-700/60 transition-all cursor-pointer" onClick={() => setShowEvidenceModal(true)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-sky-300 text-xs font-bold font-mono">
                  <Brain className="h-4 w-4 text-sky-400" />
                  SIMILARITY MATCH
                </div>
                <span className="rounded bg-sky-950 px-1.5 py-0.5 text-[10px] font-mono text-sky-300 border border-sky-800/50">
                  91.8% Match
                </span>
              </div>
              <div className="mt-2 text-lg font-mono font-bold text-white">
                6 Historical Incidents
              </div>
              <p className="mt-1 text-xs text-slate-400 leading-snug flex items-center justify-between">
                <span>Matched INC-1047, INC-1039 &amp; 4 others.</span>
                <span className="text-sky-400 font-semibold underline text-[11px]">View &rarr;</span>
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Pattern Classification: <strong className="text-slate-200">PAT-017 (High Traffic + DB Contention)</strong>
            </span>
            <span className="font-mono text-slate-500">Vector Confidence: 94.2%</span>
          </div>
        </div>
      </div>

      {/* Visual Flow: Why Is This Risky? */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl">
        <div className="border-b border-slate-800/80 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Why Is This Risky?</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Step-by-step cognitive deduction tracing current telemetry to historical outage causality.
            </p>
          </div>
          <span className="rounded-md bg-indigo-950/60 px-2.5 py-0.5 text-xs font-mono text-indigo-300 border border-indigo-800/50 self-start sm:self-auto">
            Hindsight Causal Graph
          </span>
        </div>

        {/* 5-Step Visual Flow Diagram */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* Step 1: Current Conditions */}
          <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-4 flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Step 01
                </span>
                <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
              </div>
              <h3 className="text-sm font-bold text-white mt-1">Current Conditions</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Traffic &gt; 80% capacity with simultaneous database CPU at 92.4% and an in-flight migration script.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              Telemetry: 14.8K RPS
            </div>
          </div>

          {/* Step 2: Historical Memories */}
          <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-4 flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Step 02
                </span>
                <Brain className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <h3 className="text-sm font-bold text-white mt-1">Historical Memories</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Resonyx queries 8,492 Hindsight vector embeddings across past production postmortems.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-sky-400">
              Query: MEM-8421, MEM-8119
            </div>
          </div>

          {/* Step 3: 6 Similar Incidents */}
          <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-4 flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Step 03
                </span>
                <span className="rounded bg-sky-950 px-1 py-0.5 text-[9px] font-mono text-sky-300 border border-sky-800/60">
                  91.8% Match
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">6 Similar Incidents</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Identified 6 past events sharing this exact lock contention and traffic surge signature.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-300">
              INC-1047, INC-1039, etc.
            </div>
          </div>

          {/* Step 4: 4 Resulted In Outages */}
          <div className="rounded-xl border border-rose-800/50 bg-rose-950/20 p-4 flex flex-col justify-between hover:border-rose-700 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                  Step 04
                </span>
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              </div>
              <h3 className="text-sm font-bold text-rose-200 mt-1">4 Resulted In Outages</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Historical record shows 66.7% (4 of 6) escalated into complete checkout outages averaging 34m downtime.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-rose-900/60 text-[11px] font-mono text-rose-300 font-bold">
              Avg Loss: $140K / event
            </div>
          </div>

          {/* Step 5: Risk Detected */}
          <div
            className={`rounded-xl border p-4 flex flex-col justify-between transition-colors ${
              isMitigated
                ? "border-emerald-800/60 bg-emerald-950/20"
                : "border-rose-700 bg-rose-950/40"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                  Step 05
                </span>
                {isMitigated ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-rose-400 animate-pulse" />
                )}
              </div>
              <h3 className={`text-sm font-bold mt-1 ${isMitigated ? "text-emerald-200" : "text-white"}`}>
                {isMitigated ? "Risk Mitigated" : "Risk Detected"}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isMitigated
                  ? "Protective guardrail applied: migration paused, load shedding active."
                  : "Elevated risk 78/100: Predictive breaker armed to prevent repeat catastrophic failure."}
              </p>
            </div>
            <div
              className={`mt-4 pt-3 border-t text-[11px] font-mono font-bold ${
                isMitigated
                  ? "border-emerald-800/60 text-emerald-400"
                  : "border-rose-800/60 text-rose-400"
              }`}
            >
              Status: {isMitigated ? "NORMAL (26/100)" : "ELEVATED (78/100)"}
            </div>
          </div>
        </div>

        {/* Downward Connector visual footer */}
        <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
          <span>Current Conditions</span>
          <ArrowDown className="h-3.5 w-3.5 text-sky-400 rotate-[-90deg] hidden md:inline" />
          <span className="hidden md:inline">Historical Memories</span>
          <ArrowDown className="h-3.5 w-3.5 text-sky-400 rotate-[-90deg] hidden md:inline" />
          <span className="hidden md:inline">6 Similar Incidents</span>
          <ArrowDown className="h-3.5 w-3.5 text-rose-400 rotate-[-90deg] hidden md:inline" />
          <span className="hidden md:inline">4 Resulted In Outages</span>
          <ArrowDown className="h-3.5 w-3.5 text-rose-400 rotate-[-90deg] hidden md:inline" />
          <span className="font-bold text-white">Risk Detected</span>
        </div>
      </div>

      {/* AI Recommendation Section */}
      <div
        className={`rounded-2xl border p-6 backdrop-blur-md shadow-xl transition-all duration-300 ${
          isMitigated
            ? "border-emerald-800/60 bg-emerald-950/15"
            : "border-sky-500/40 bg-gradient-to-r from-slate-900 via-sky-950/20 to-slate-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-sky-500/10 p-2 border border-sky-500/30 text-sky-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">AI Recommendation</h2>
              <div className="text-xs text-slate-400">
                Grounded in Learned Pattern <span className="text-sky-300 font-mono">PAT-017</span> and Incident Memory <span className="text-sky-300 font-mono">MEM-8421</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Status:</span>
            {recommendationStatus === "accepted" && (
              <span className="rounded-md bg-emerald-950/80 px-2.5 py-1 text-xs font-mono font-semibold text-emerald-300 border border-emerald-800/60 inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Accepted &amp; Enforced
              </span>
            )}
            {recommendationStatus === "dismissed" && (
              <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-mono font-semibold text-slate-400 border border-slate-700 inline-flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Dismissed by Operator
              </span>
            )}
            {recommendationStatus === "pending" && (
              <span className="rounded-md bg-amber-950/80 px-2.5 py-1 text-xs font-mono font-semibold text-amber-300 border border-amber-800/60 inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Awaiting Operator Action
              </span>
            )}
          </div>
        </div>

        {/* The Core Recommendation Callout */}
        <div className="my-5 rounded-xl border border-sky-500/30 bg-slate-950/70 p-4 sm:p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-sky-400 mb-1">
            Prescriptive Hindsight Action
          </div>
          <p className="text-base sm:text-lg font-medium text-white italic leading-relaxed">
            &ldquo;Delay the database migration until traffic decreases and run query performance validation.&rdquo;
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-sky-400" />
              Target: <code className="text-slate-200">payment-service / migration-runner #4492</code>
            </span>
            <span>•</span>
            <span>Recommended Window: <strong className="text-emerald-400">After 03:00 UTC (&lt; 4,000 RPS)</strong></span>
            <span>•</span>
            <span>Confidence: <strong className="text-sky-300">94.2%</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAcceptRecommendation}
              disabled={recommendationStatus === "accepted"}
              className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold shadow-lg transition-all inline-flex items-center gap-2 ${
                recommendationStatus === "accepted"
                  ? "bg-emerald-800/40 text-emerald-300 border border-emerald-700/50 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {recommendationStatus === "accepted" ? "Recommendation Accepted" : "Accept Recommendation"}
            </button>

            <button
              onClick={handleDismiss}
              disabled={recommendationStatus === "accepted" || recommendationStatus === "dismissed"}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              <XCircle className="h-4 w-4" />
              Dismiss
            </button>
          </div>

          <button
            onClick={() => setShowEvidenceModal(true)}
            className="rounded-lg border border-sky-500/40 bg-sky-950/30 px-3.5 py-2 text-xs sm:text-sm font-semibold text-sky-300 hover:bg-sky-900/40 hover:text-sky-200 transition-colors inline-flex items-center gap-1.5"
          >
            <FileText className="h-4 w-4 text-sky-400" />
            View Evidence
          </button>
        </div>
      </div>

      {/* 2-Column: Live Activity Timeline & 24h Risk History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 24h Risk History Chart */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="border-b border-slate-800/80 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Risk History (Last 24 Hours)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuous operational blast radius tracking with baseline and safety thresholds.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-500" /> Baseline
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Risk Score
              </span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_RISK_TIMELINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.6} />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: unknown) => [`${val} / 100`, "Risk Score"]}
                  contentStyle={{
                    backgroundColor: "#0d1525",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#f8fafc",
                  }}
                />
                <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Warning Threshold", fill: "#f59e0b", fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: "Critical Threshold", fill: "#f43f5e", fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="riskScore"
                  name="Operational Risk"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fill="url(#riskAreaGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  name="Safe Baseline"
                  stroke="#475569"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span>Normal Baseline: ~22 / 100</span>
            <span className="text-rose-400 font-mono font-bold">Peak: 78 / 100 (Detected Now)</span>
          </div>
        </div>

        {/* Right: Activity Timeline */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-sky-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Activity Timeline</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Live Telemetry Feed</span>
          </div>

          <div className="my-4 space-y-4 max-h-[250px] overflow-y-auto pr-1">
            {timelineEvents.map((evt) => (
              <div key={evt.id} className="relative flex items-start gap-3 pl-2 text-xs">
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                    evt.type === "operator_action"
                      ? "bg-emerald-400 ring-4 ring-emerald-950"
                      : evt.type === "detection"
                      ? "bg-rose-400 ring-4 ring-rose-950"
                      : "bg-sky-400 ring-4 ring-sky-950"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">{evt.title}</span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">{evt.time}</span>
                  </div>
                  <p className="mt-0.5 text-slate-400 leading-snug">{evt.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800/80 pt-3 text-[11px] text-slate-500 font-mono text-center">
            {timelineEvents.length} events logged in current incident session
          </div>
        </div>
      </div>

      {/* Previous Risk Predictions & Outcomes Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl">
        <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Previous Risk Predictions &amp; Verified Outcomes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical ledger proving failure avoidance efficacy and highlighting consequences of dismissed warnings.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 self-start sm:self-auto">
            <button
              onClick={() => setPredictionFilter("all")}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                predictionFilter === "all"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({MOCK_HISTORICAL_PREDICTIONS.length})
            </button>
            <button
              onClick={() => setPredictionFilter("prevented")}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                predictionFilter === "prevented"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Failures Prevented (5)
            </button>
            <button
              onClick={() => setPredictionFilter("outage")}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                predictionFilter === "outage"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Ignored &rarr; Outages (1)
            </button>
          </div>
        </div>

        {/* Predictions Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <th className="pb-3 font-semibold">Prediction / System</th>
                <th className="pb-3 font-semibold">Memory Grounding</th>
                <th className="pb-3 font-semibold">Action Taken</th>
                <th className="pb-3 font-semibold">Verified Outcome</th>
                <th className="pb-3 font-semibold text-right">Capital Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPredictions.map((pred: HistoricalRiskPrediction) => {
                const isOutage = pred.outcome.includes("Outage Occurred");

                return (
                  <tr key={pred.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-400">{pred.id}</span>
                        <span className="text-slate-200 font-medium">{pred.predictionTitle}</span>
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-slate-400">
                        {pred.targetSystem} • {pred.timestamp}
                      </div>
                    </td>

                    <td className="py-3.5 pr-3 font-mono text-[11px]">
                      <span className="rounded bg-slate-950 px-2 py-0.5 border border-slate-800 text-slate-300">
                        {pred.memorySource}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Confidence: {pred.confidence}%
                      </div>
                    </td>

                    <td className="py-3.5 pr-3 max-w-xs">
                      <div className="text-slate-300 leading-snug">{pred.actionTaken}</div>
                      <span
                        className={`inline-block mt-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold ${
                          pred.actionType === "Accepted"
                            ? "bg-sky-950 text-sky-300 border border-sky-800/60"
                            : pred.actionType === "Automated"
                            ? "bg-indigo-950 text-indigo-300 border border-indigo-800/60"
                            : "bg-rose-950 text-rose-300 border border-rose-800/60"
                        }`}
                      >
                        {pred.actionType}
                      </span>
                    </td>

                    <td className="py-3.5 pr-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-bold border ${
                          isOutage
                            ? "bg-rose-950 text-rose-300 border-rose-800/60"
                            : "bg-emerald-950 text-emerald-300 border-emerald-800/60"
                        }`}
                      >
                        {isOutage ? <XCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        {pred.outcome}
                      </span>
                      <p className="mt-1 text-[11px] text-slate-400 max-w-xs leading-snug">
                        {pred.outcomeDetail}
                      </p>
                    </td>

                    <td className="py-3.5 text-right font-mono font-bold">
                      <span className={isOutage ? "text-rose-400" : "text-emerald-400"}>
                        {pred.savedCapital}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Dossier Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-sky-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Hindsight Risk Evidence Dossier
                  </h3>
                  <p className="text-xs text-slate-400">
                    Causal grounding backing recommendation for <code className="text-sky-300">payment-service / migration-runner #4492</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Telemetry Diff */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">
                  Current Telemetry vs. Baseline vs. Outage Signature
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                    <span className="text-slate-400">Inbound RPS</span>
                    <div className="text-lg font-mono font-bold text-rose-400 mt-1">14,850 RPS</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Baseline: 3,600 RPS (+312%)</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                    <span className="text-slate-400">Aurora DB CPU</span>
                    <div className="text-lg font-mono font-bold text-rose-400 mt-1">92.4%</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Threshold Warning: 80.0%</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                    <span className="text-slate-400">Lock Wait Queue</span>
                    <div className="text-lg font-mono font-bold text-rose-400 mt-1">48 threads</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Normal: &lt; 2 threads</div>
                  </div>
                </div>
              </div>

              {/* 6 Correlated Incidents Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    6 Historical Incidents Matched via Vector Distance
                  </span>
                  <span className="text-xs font-mono text-rose-400 font-semibold">
                    4 Resulted in Catastrophic Outages (66.7%)
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                        <th className="p-3">Incident</th>
                        <th className="p-3">Similarity</th>
                        <th className="p-3">Result</th>
                        <th className="p-3">Downtime</th>
                        <th className="p-3">Root Cause</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {EVIDENCE_INCIDENTS.map((inc) => (
                        <tr
                          key={inc.id}
                          className="hover:bg-slate-900 transition-colors cursor-pointer"
                          onClick={() =>
                            setSelectedIncidentDetail(
                              selectedIncidentDetail === inc.id ? null : inc.id
                            )
                          }
                        >
                          <td className="p-3 font-mono font-bold text-sky-400">
                            <Link
                              href={`/incidents/${inc.id}`}
                              className="hover:underline flex items-center gap-1"
                            >
                              {inc.id}
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                            </Link>
                            <div className="text-[11px] text-slate-300 font-normal mt-0.5">
                              {inc.name}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-emerald-400 font-bold">
                            {inc.vectorSimilarity}%
                          </td>
                          <td className="p-3">
                            {inc.resultedInOutage ? (
                              <span className="rounded bg-rose-950 px-2 py-0.5 text-[11px] font-mono text-rose-300 border border-rose-800">
                                Outage
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-950 px-2 py-0.5 text-[11px] font-mono text-emerald-300 border border-emerald-800">
                                Mitigated
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono">
                            {inc.downtimeMinutes > 0 ? (
                              <span className="text-rose-400 font-bold">{inc.downtimeMinutes} mins</span>
                            ) : (
                              <span className="text-slate-400">0 mins</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-300 max-w-sm text-[11px] leading-snug">
                            {inc.rootCause}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Memory Vector Grounding Details */}
              <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                  <Brain className="h-4 w-4" />
                  Vector Embedding Verification
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  Query vector calculated from current telemetry tuple:{" "}
                  <code className="text-sky-300 font-mono">[traffic_surge: 3.12, db_cpu: 0.924, migration_exclusive_lock: 1]</code>.
                  Cosine distance match against Memory Cluster <strong className="text-white">MEM-8421</strong> is{" "}
                  <strong className="text-emerald-400">0.058 (94.2% match)</strong>. This confirms that proceeding with database migration during active traffic bursts carries a 66.7% deterministic failure expectation.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 bg-slate-950 px-6 py-3.5 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Verified against 8,492 Hindsight failure vectors
              </span>
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
