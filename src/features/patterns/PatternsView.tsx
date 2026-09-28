"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { MOCK_PATTERNS } from "@/data/mockPatterns";
import { FailurePattern } from "@/types";

// Chart 1: Pattern Frequency & Recurrence
const FREQUENCY_DATA = [
  { pattern: "PAT-017", name: "DB Contention", observed: 17, successful: 12, failed: 5, impact: 1850 },
  { pattern: "PAT-023", name: "Memory Leak", observed: 14, successful: 11, failed: 3, impact: 1420 },
  { pattern: "PAT-031", name: "API Timeout", observed: 19, successful: 15, failed: 4, impact: 2150 },
  { pattern: "PAT-038", name: "Cache Failure", observed: 11, successful: 8, failed: 3, impact: 980 },
];

// Chart 2: AI Pattern Confidence Trajectory over Time (as memories accumulate)
const CONFIDENCE_TRAJECTORY = [
  { memoryVolume: "1.2K vecs", pat017: 74, pat031: 78, pat023: 71, pat038: 68 },
  { memoryVolume: "3.5K vecs", pat017: 82, pat031: 85, pat023: 80, pat038: 76 },
  { memoryVolume: "5.8K vecs", pat017: 88, pat031: 91, pat023: 86, pat038: 82 },
  { memoryVolume: "8.4K vecs", pat017: 94, pat031: 96, pat023: 92, pat038: 89 },
];

export function PatternsView() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPattern, setSelectedPattern] = useState<FailurePattern | null>(MOCK_PATTERNS[0]);
  const [chartView, setChartView] = useState<"resolution" | "confidence" | "observed">("resolution");
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Filtered patterns
  const filteredPatterns = MOCK_PATTERNS.filter((pat) => {
    const matchesSearch =
      search === "" ||
      pat.patternCode.toLowerCase().includes(search.toLowerCase()) ||
      pat.name.toLowerCase().includes(search.toLowerCase()) ||
      pat.typicalOutcome.toLowerCase().includes(search.toLowerCase()) ||
      pat.recommendedPrevention.toLowerCase().includes(search.toLowerCase()) ||
      pat.commonConditions.some((c) => c.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || pat.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Pattern Intelligence
          </h1>
          <p className="mt-1 text-sm sm:text-base font-medium text-slate-300">
            Patterns discovered from organizational memory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-950/50 hover:bg-sky-500 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Interactive Demo</span>
          </Link>
        </div>
      </div>

      {/* Hero Intelligence Cognitive Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-r from-[#071329] via-[#0b1c38] to-[#071329] p-6 sm:p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Failure Graph Clustering</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Systemic Anti-Patterns
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              By continuously correlating historical postmortems, memory vectors, and operator decisions, Resonyx discovers repeating failure signatures that humans miss.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="rounded-xl border border-sky-500/30 bg-slate-950/80 p-3.5 text-center min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Catalogued Signatures
              </span>
              <span className="text-2xl font-bold font-mono text-white mt-0.5 block">
                {MOCK_PATTERNS.length} Active
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                {Math.round(MOCK_PATTERNS.reduce((acc, p) => acc + p.confidenceScore, 0) / MOCK_PATTERNS.length)}% Mean Confidence
              </span>
            </div>

            <div className="rounded-xl border border-sky-500/30 bg-slate-950/80 p-3.5 text-center min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Resolutions
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">
                {MOCK_PATTERNS.reduce((acc, p) => acc + p.successfulResolutions, 0)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Historical fixes verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section: Pattern Frequency, Resolutions, Confidence Trajectory */}
      <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Statistical Pattern Intelligence Analytics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-dimensional analysis of pattern occurrences, resolution efficacy, and AI confidence growth.
            </p>
          </div>

          {/* Chart View Switcher */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 self-start sm:self-auto">
            <button
              onClick={() => setChartView("resolution")}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                chartView === "resolution"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Successful vs Failed
            </button>
            <button
              onClick={() => setChartView("confidence")}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                chartView === "confidence"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Confidence Over Time
            </button>
            <button
              onClick={() => setChartView("observed")}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                chartView === "observed"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Incidents Observed
            </button>
          </div>
        </div>

        {/* Dynamic Recharts Chart */}
        <div className="h-64 w-full pt-2">
          {chartView === "resolution" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FREQUENCY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="pattern" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1525",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#f8fafc",
                  }}
                />
                <Bar dataKey="successful" name="Successful Resolutions" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" name="Failed Attempted Actions" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartView === "confidence" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CONFIDENCE_TRAJECTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="memoryVolume" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1525",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#f8fafc",
                  }}
                />
                <Line type="monotone" dataKey="pat031" name="PAT-031 (API Timeout)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pat017" name="PAT-017 (DB Contention)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pat023" name="PAT-023 (Memory Leak)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pat038" name="PAT-038 (Cache Failure)" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {chartView === "observed" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FREQUENCY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="pattern" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: unknown) => [`${Number(val ?? 0)} incidents`, "Observed Incidents"]}
                  contentStyle={{
                    backgroundColor: "#0d1525",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#f8fafc",
                  }}
                />
                <Bar dataKey="observed" name="Observed Incidents" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Successful Resolutions (75.4%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span>Failed Operator Interventions (24.6%)</span>
            </span>
          </div>
          <span className="font-mono text-cyan-400">
            Confidence strengthens monotonically with vector memory volume
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patterns (e.g. PAT-017), conditions, outcomes, or preventions..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          {["all", "Concurrency", "Deployment", "Architectural", "Operational"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-sky-600/30 text-sky-300 border border-sky-500/50"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {cat === "all" ? "All Domains" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Learned Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPatterns.map((pat) => {
          const isSelected = selectedPattern?.id === pat.id;
          const totalRes = pat.successfulResolutions + pat.failedResolutions;
          const successPct = Math.round((pat.successfulResolutions / totalRes) * 100);

          return (
            <div
              key={pat.id}
              onClick={() => {
                setSelectedPattern(pat);
                setIsDetailDrawerOpen(true);
              }}
              className={`group cursor-pointer rounded-2xl border p-6 backdrop-blur-sm transition-all duration-200 space-y-4 ${
                isSelected
                  ? "border-sky-500/60 bg-gradient-to-b from-[#091428] to-[#070e1c] shadow-xl shadow-sky-950/40 ring-1 ring-sky-500/40"
                  : "border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90"
              }`}
            >
              {/* Header: Pattern Code & Confidence */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-sky-300 bg-sky-950 px-2.5 py-1 rounded-md border border-sky-800/60 shadow-sm">
                      {pat.patternCode}
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">
                      {pat.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-sky-200 transition-colors pt-1">
                    {pat.name}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="rounded-md bg-emerald-950/80 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400 border border-emerald-800/60">
                    {pat.confidenceScore}% Confidence
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    Observed: <strong className="text-white">{pat.observedCount} times</strong>
                  </div>
                </div>
              </div>

              {/* Resolution Metrics Bar: Successful vs Failed */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Historical Resolution Efficacy:</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-400 font-bold">{pat.successfulResolutions} Resolved</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-red-400 font-bold">{pat.failedResolutions} Failed</span>
                  </div>
                </div>

                {/* Progress bar split */}
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${successPct}%` }}
                    title={`${pat.successfulResolutions} successful resolutions`}
                  />
                  <div
                    className="bg-red-500 h-full transition-all duration-300"
                    style={{ width: `${100 - successPct}%` }}
                    title={`${pat.failedResolutions} failed actions`}
                  />
                </div>
              </div>

              {/* Common Conditions Pills */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Common Pre-Failure Conditions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pat.commonConditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-950 px-2 py-0.5 text-[11px] font-mono text-amber-300 border border-amber-500/20"
                    >
                      ⚠ {cond}
                    </span>
                  ))}
                </div>
              </div>

              {/* Typical Outcome */}
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Typical Outcome:
                </span>
                <p className="text-slate-200 font-medium leading-relaxed">
                  {pat.typicalOutcome}
                </p>
              </div>

              {/* Recommended Prevention */}
              <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Recommended Prevention:</span>
                </span>
                <p className="text-emerald-200 font-medium leading-relaxed">
                  {pat.recommendedPrevention}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  Playbook: <strong className="text-sky-300">{pat.preventionPlaybook}</strong>
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPattern(pat);
                    setIsDetailDrawerOpen(true);
                  }}
                  className="flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300"
                >
                  <span>Detailed Pattern Analysis</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Pattern View Drawer / Modal */}
      {isDetailDrawerOpen && selectedPattern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-[#090f1d] shadow-2xl ring-1 ring-white/10 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-sky-300 bg-sky-950 px-2.5 py-1 rounded border border-sky-800/60">
                  {selectedPattern.patternCode}
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedPattern.name}
                </h3>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
                  {selectedPattern.confidenceScore}% Confidence
                </span>
              </div>
              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-5 text-xs">
              {/* Learned Lesson Hero */}
              <div className="rounded-xl border border-sky-500/30 bg-sky-950/25 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-1">
                  Synthesized Organizational Lesson:
                </span>
                <blockquote className="text-sm sm:text-base font-semibold text-white leading-relaxed italic">
                  &ldquo;{selectedPattern.learnedLesson}&rdquo;
                </blockquote>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Occurrences</span>
                  <div className="mt-1 font-mono text-lg font-bold text-white">
                    {selectedPattern.observedCount} times
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Resolutions</span>
                  <div className="mt-1 font-mono text-lg font-bold text-emerald-400">
                    {selectedPattern.successfulResolutions} Succeeded
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Failed Actions</span>
                  <div className="mt-1 font-mono text-lg font-bold text-red-400">
                    {selectedPattern.failedResolutions} Ineffective
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Resolution Rate</span>
                  <div className="mt-1 font-mono text-lg font-bold text-sky-300">
                    {Math.round((selectedPattern.successfulResolutions / Math.max(1, selectedPattern.successfulResolutions + selectedPattern.failedResolutions)) * 100)}%
                  </div>
                </div>
              </div>

              {/* Common Pre-Conditions */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Common Failure Pre-Conditions:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedPattern.commonConditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-950 px-2.5 py-1 text-xs font-mono text-amber-300 border border-amber-500/30"
                    >
                      ⚠ {cond}
                    </span>
                  ))}
                </div>
              </div>

              {/* Root Causes Identified */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Identified Root Causes:
                </span>
                <div className="space-y-1.5">
                  {selectedPattern.rootCauses.map((rc, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 text-xs text-slate-200 flex items-start gap-2"
                    >
                      <span className="font-mono text-sky-400 font-bold">•</span>
                      <span>{rc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparative Actions Taken: Successful vs Failed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Successful Actions */}
                <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/15 p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Successful Recovery Actions</span>
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-emerald-200">
                    {selectedPattern.successfulActions.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Failed Actions */}
                <div className="rounded-xl border border-red-900/40 bg-red-950/15 p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" />
                    <span>Failed / Ineffective Actions</span>
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-red-200">
                    {selectedPattern.failedActions.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-red-400 font-bold">✕</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Prevention Playbook */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Recommended Architectural Prevention</span>
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-300">
                    {selectedPattern.preventionPlaybook}
                  </span>
                </div>
                <p className="text-xs text-white font-medium leading-relaxed">
                  {selectedPattern.recommendedPrevention}
                </p>
              </div>

              {/* Historical Incidents Correlated */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Correlated Historical Incidents ({selectedPattern.historicalIncidents.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedPattern.historicalIncidents.map((incCode) => (
                    <Link
                      key={incCode}
                      href={`/incidents/${incCode.toLowerCase()}`}
                      className="rounded bg-sky-950/80 px-2.5 py-1 text-xs font-mono font-bold text-sky-300 border border-sky-800/60 hover:border-sky-400 hover:text-white transition-colors"
                    >
                      {incCode} →
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 bg-slate-900/60 px-6 py-3 flex items-center justify-between">
              <Link
                href="/prevention"
                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold"
              >
                <span>View Enforced Guardrails in Prevention Center →</span>
              </Link>

              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
