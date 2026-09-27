"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Brain,
  TrendingUp,
  Sparkles,
  ChevronRight,
  X,
  Quote,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  LEARNING_DAY_MILESTONES,
  MEMORY_GROWTH_CHART_DATA,
  PATTERN_CONFIDENCE_CHART_DATA,
  PREVENTED_FAILURES_CHART_DATA,
  LATEST_ORGANIZATIONAL_LEARNINGS,
  LearningDayMilestone,
} from "@/data/mockTimeline";

export function TimelineView() {
  const [selectedMilestone, setSelectedMilestone] = useState<LearningDayMilestone | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<"memory" | "confidence" | "prevented">("memory");

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-500/10 px-2.5 py-1 text-xs font-mono font-bold text-sky-400 border border-sky-500/30 uppercase tracking-wider inline-flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-sky-400" />
                Evolutionary Knowledge Engine
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300 border border-emerald-500/30">
                Continuous Learning Active
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              How Resonyx Learned
            </h1>

            <p className="text-base sm:text-lg font-medium text-sky-200/90 max-w-3xl leading-relaxed">
              &ldquo;The AI is becoming better because it is accumulating experience.&rdquo;
            </p>

            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Follow Resonyx&apos;s chronological journey from Day 1 to present day. Observe how raw, painful outages
              crystallized into high-confidence patterns and evolved into automated failure prevention.
            </p>
          </div>

          {/* Quick Metrics Summary Banner */}
          <div className="flex flex-wrap lg:flex-col gap-3 shrink-0 self-start lg:self-auto border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Total Experience Base</div>
              <div className="text-xl font-mono font-bold text-white">1,284 Incidents</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Discovered Invariants</div>
              <div className="text-xl font-mono font-bold text-sky-400">43 Patterns</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Compounded Immunity</div>
              <div className="text-xl font-mono font-bold text-emerald-400">127 Prevented</div>
            </div>
          </div>
        </div>
      </div>

      {/* THREE CORE LEARNING CHARTS */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Empirical Learning Trajectory
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Quantifiable proof of compounding intelligence: memory scaling, pattern reinforcement, and preventative payoff.
            </p>
          </div>

          {/* Chart View Tabs */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab("memory")}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeChartTab === "memory"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Memory Growth
            </button>
            <button
              onClick={() => setActiveChartTab("confidence")}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeChartTab === "confidence"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Pattern Confidence
            </button>
            <button
              onClick={() => setActiveChartTab("prevented")}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeChartTab === "prevented"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Prevented Failures
            </button>
          </div>
        </div>

        {/* Dynamic Chart Display Area */}
        <div className="h-72 w-full pt-2">
          {/* Chart 1: Memory Growth */}
          {activeChartTab === "memory" && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono">
                  Indexed failure vectors growing from <strong>8</strong> (Day 1) to <strong>8,492</strong> (Present)
                </span>
                <span className="text-sky-400 font-mono font-semibold">1,284 Incidents Total</span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MEMORY_GROWTH_CHART_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#0369a1" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val: unknown) => [Number(val ?? 0).toLocaleString(), "Volume"]}
                      contentStyle={{
                        backgroundColor: "#0d1525",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#f8fafc",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="memories"
                      name="Memory Embeddings (1536-dim)"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      fill="url(#memGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="incidents"
                      name="Catalogued Incidents"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 2: Pattern Confidence */}
          {activeChartTab === "confidence" && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono">
                  Bayesian reinforcement: confidence increases as recurring postmortems corroborate root cause
                </span>
                <span className="text-emerald-400 font-mono font-semibold">94%+ Production Accuracy</span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PATTERN_CONFIDENCE_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis domain={[50, 100]} stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      formatter={(val: unknown) => [`${val}%`, "Statistical Confidence"]}
                      contentStyle={{
                        backgroundColor: "#0d1525",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#f8fafc",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pat017"
                      name="PAT-017 (High Traffic + DB Contention)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pat031"
                      name="PAT-031 (API Timeout Spike)"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pat023"
                      name="PAT-023 (Canary Memory Leak)"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      name="Fleetwide Average Confidence"
                      stroke="#a855f7"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 3: Prevented Failures */}
          {activeChartTab === "prevented" && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono">
                  Compounding failure prevention: early observation gives way to rapid proactive interception
                </span>
                <span className="text-emerald-400 font-mono font-semibold">$1.84M Saved To Date</span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PREVENTED_FAILURES_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val: unknown) => [`${val} Outages Prevented`, "Intercepted"]}
                      contentStyle={{
                        backgroundColor: "#0d1525",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#f8fafc",
                      }}
                    />
                    <Bar
                      dataKey="prevented"
                      name="Prevented Production Failures"
                      fill="url(#prevGrad)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CHRONOLOGICAL TIMELINE SECTION */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Chronological Evolution Timeline
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any milestone to inspect underlying telemetry, vector memories, and experience gain.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Interactive Roadmap: Click any card for details
          </span>
        </div>

        {/* Vertical Connected Milestone Cards */}
        <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-6">
          {LEARNING_DAY_MILESTONES.map((milestone) => {
            const isDay1 = milestone.dayNumber === 1;
            const isDay14 = milestone.dayNumber === 14;
            const isDay30 = milestone.dayNumber === 30;
            const isDay45 = milestone.dayNumber === 45;
            const isDay60 = milestone.dayNumber === 60;

            return (
              <div
                key={milestone.id}
                onClick={() => setSelectedMilestone(milestone)}
                className="relative group cursor-pointer"
              >
                {/* Glowing Node Dot Anchor */}
                <div
                  className={`absolute -left-[35px] sm:-left-[51px] top-4 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all group-hover:scale-125 shadow-lg ${
                    isDay1
                      ? "border-sky-500 bg-slate-950 text-sky-400 shadow-sky-500/30"
                      : isDay14
                      ? "border-amber-500 bg-slate-950 text-amber-400 shadow-amber-500/30"
                      : isDay30
                      ? "border-indigo-500 bg-slate-950 text-indigo-400 shadow-indigo-500/30"
                      : isDay45 || isDay60
                      ? "border-emerald-500 bg-slate-950 text-emerald-400 shadow-emerald-500/40"
                      : "border-slate-500 bg-slate-950 text-slate-400"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                </div>

                {/* Milestone Card Container */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-md shadow-xl transition-all duration-200 group-hover:border-sky-500/50 group-hover:bg-slate-900 group-hover:shadow-2xl">
                  {/* Card Header: Day Tag, Badge, Type */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded border border-sky-800/60">
                        {milestone.dayLabel}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {milestone.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 capitalize">
                        {milestone.type}
                      </span>
                      <span className="text-xs text-sky-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                        Inspect <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mt-3">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                      {milestone.title}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {milestone.subtitle}
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>

                  {/* Metrics Row */}
                  <div className="mt-4 flex flex-wrap gap-2.5 pt-3 border-t border-slate-800/60">
                    {milestone.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs font-mono"
                      >
                        <span className="text-slate-400 text-[10px] uppercase font-semibold">
                          {m.label}:{" "}
                        </span>
                        <span className="font-bold text-slate-200">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION: LATEST ORGANIZATIONAL LEARNINGS */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Quote className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Latest Organizational Learnings
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              High-confidence axiomatic truths synthesized from multi-incident retrospective analysis.
            </p>
          </div>

          <span className="rounded-md bg-amber-950/60 px-2.5 py-1 text-xs font-mono font-semibold text-amber-300 border border-amber-800/50">
            5 Core Institutional Learnings
          </span>
        </div>

        {/* Learnings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LATEST_ORGANIZATIONAL_LEARNINGS.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all"
            >
              <div>
                {/* Learning Card Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50">
                    {item.patternCode}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      Confidence:
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {item.confidence}%
                    </span>
                  </div>
                </div>

                {/* The Learning Quote */}
                <blockquote className="mt-3 text-sm sm:text-base font-semibold text-white italic leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>

                {/* Preventive Guidance */}
                <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-900/60 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Actionable Architectural Rule
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-snug">
                    {item.preventiveGuidance}
                  </p>
                </div>
              </div>

              {/* Card Footer: Metadata */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px]">Domain: <strong className="text-slate-200">{item.impactDomain}</strong></span>
                <span className="font-mono text-[11px] text-slate-400">
                  Grounded in {item.sourceIncidentsCount} incidents
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MILESTONE DETAIL MODAL */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <Brain className="h-5 w-5 text-sky-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400">
                      {selectedMilestone.dayLabel}
                    </span>
                    <span className="text-xs text-slate-400">• {selectedMilestone.badge}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {selectedMilestone.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedMilestone.description}
              </p>

              {/* Target System & Telemetry */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  System Context &amp; Telemetry
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Affected Scope:</span>
                  <span className="font-mono text-white font-semibold">{selectedMilestone.details.system}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Signature:</span>
                  <span className="font-mono text-amber-400">{selectedMilestone.details.telemetrySignature}</span>
                </div>
              </div>

              {/* Key Insight */}
              <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4">
                <div className="flex items-center gap-2 text-sky-300 font-bold mb-1">
                  <Sparkles className="h-4 w-4" />
                  Cognitive Synthesis
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {selectedMilestone.details.keyInsight}
                </p>
              </div>

              {/* Experience Gain */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex items-center gap-2 text-emerald-300 font-bold mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Accumulated Experience
                </div>
                <p className="text-emerald-100 leading-relaxed font-medium">
                  {selectedMilestone.details.experienceGain}
                </p>
              </div>

              {/* Cross-Link navigation if pattern or incident exists */}
              {selectedMilestone.details.associatedPattern && (
                <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
                  <span className="text-slate-400">Discovered Pattern:</span>
                  <Link
                    href="/patterns"
                    className="font-mono font-bold text-sky-400 hover:underline flex items-center gap-1"
                  >
                    {selectedMilestone.details.associatedPattern} <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 bg-slate-950 px-6 py-3.5 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Milestone recorded in Resonyx Hindsight Ledger
              </span>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
