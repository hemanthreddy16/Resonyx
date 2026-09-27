"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Database,
  Cpu,
  RefreshCw,
  Layers,
  CheckCircle2,
  ArrowRight,
  X,
  Activity,
  Terminal,
  GitBranch,
  Brain,
} from "lucide-react";
import {
  MOCK_HINDSIGHT_MEMORIES,
  MOCK_HINDSIGHT_STATUS,
  MOCK_MEMORY_STATISTICS,
} from "@/data/mockHindsightMemory";
import { HindsightMemoryRecord } from "@/types";

export function HindsightView() {
  // Filter States
  const [search, setSearch] = useState("");
  const [selectedIncident, setSelectedIncident] = useState("all");
  const [selectedRootCause, setSelectedRootCause] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedOutcome, setSelectedOutcome] = useState("all");
  const [selectedPattern, setSelectedPattern] = useState("all");
  const [selectedDecision, setSelectedDecision] = useState("all");

  // Selected Memory for Detail Modal / Drawer
  const [selectedMemory, setSelectedMemory] = useState<HindsightMemoryRecord | null>(null);

  // Live Vector Simulation Status
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Trigger Force Sync Simulation
  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncFeedback("Syncing 8,492 failure vectors across 18 clusters...");
    setTimeout(() => {
      setIsSyncing(false);
      setSyncFeedback("All vectors synchronized with zero semantic drift (14.8ms).");
      setTimeout(() => setSyncFeedback(null), 3000);
    }, 800);
  };

  // Distinct filter options
  const allIncidents = Array.from(new Set(MOCK_HINDSIGHT_MEMORIES.map((m) => m.sourceIncident)));
  const allRootCauses = Array.from(new Set(MOCK_HINDSIGHT_MEMORIES.map((m) => m.rootCause)));
  const allActions = Array.from(new Set(MOCK_HINDSIGHT_MEMORIES.map((m) => m.action)));
  const allPatterns = Array.from(new Set(MOCK_HINDSIGHT_MEMORIES.map((m) => m.patternCode)));
  const allDecisions = Array.from(new Set(MOCK_HINDSIGHT_MEMORIES.map((m) => m.decision)));

  // Filter evaluation
  const filteredMemories = MOCK_HINDSIGHT_MEMORIES.filter((mem) => {
    const matchesSearch =
      search === "" ||
      mem.memoryCode.toLowerCase().includes(search.toLowerCase()) ||
      mem.sourceIncident.toLowerCase().includes(search.toLowerCase()) ||
      mem.learnedInsight.toLowerCase().includes(search.toLowerCase()) ||
      mem.action.toLowerCase().includes(search.toLowerCase()) ||
      mem.rootCause.toLowerCase().includes(search.toLowerCase()) ||
      mem.extractedRule.toLowerCase().includes(search.toLowerCase()) ||
      mem.semanticTags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesIncident =
      selectedIncident === "all" || mem.sourceIncident === selectedIncident;

    const matchesRootCause =
      selectedRootCause === "all" || mem.rootCause === selectedRootCause;

    const matchesAction =
      selectedAction === "all" || mem.action === selectedAction;

    const matchesOutcome =
      selectedOutcome === "all" || mem.outcome === selectedOutcome;

    const matchesPattern =
      selectedPattern === "all" || mem.patternCode === selectedPattern;

    const matchesDecision =
      selectedDecision === "all" || mem.decision === selectedDecision;

    return (
      matchesSearch &&
      matchesIncident &&
      matchesRootCause &&
      matchesAction &&
      matchesOutcome &&
      matchesPattern &&
      matchesDecision
    );
  });

  const resetFilters = () => {
    setSearch("");
    setSelectedIncident("all");
    setSelectedRootCause("all");
    setSelectedAction("all");
    setSelectedOutcome("all");
    setSelectedPattern("all");
    setSelectedDecision("all");
  };

  const hasActiveFilters =
    search !== "" ||
    selectedIncident !== "all" ||
    selectedRootCause !== "all" ||
    selectedAction !== "all" ||
    selectedOutcome !== "all" ||
    selectedPattern !== "all" ||
    selectedDecision !== "all";

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Hindsight Memory
            </h1>
            <span className="rounded-md bg-cyan-950 px-2.5 py-1 text-xs font-mono text-cyan-300 border border-cyan-800/60 font-semibold">
              Cognitive Vector Store
            </span>
          </div>
          <p className="mt-1 text-sm sm:text-base font-medium text-slate-300">
            The long-term organizational memory behind Resonyx
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing Clusters..." : "Sync Memory Bank"}</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300 font-mono animate-in fade-in">
          ✓ {syncFeedback}
        </div>
      )}

      {/* Core Philosophical Triad Banner: Remember → Recall → Learn */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/25 bg-gradient-to-r from-[#071329] via-[#0b1c38] to-[#071329] p-6 sm:p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-sky-400">
              COGNITIVE ARCHITECTURE
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-white flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-sky-300">Remember</span>
              <span className="text-slate-500 font-normal">→</span>
              <span className="text-cyan-300">Recall</span>
              <span className="text-slate-500 font-normal">→</span>
              <span className="text-emerald-300">Learn</span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed pt-1">
              Every failure incident is encoded into vector memory, recalled across distributed infrastructure in sub-20ms, and synthesized into permanent organizational immunity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-sky-500/30 bg-slate-950/70 p-3.5 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Recall Precision
              </span>
              <span className="text-xl font-mono font-bold text-emerald-400 mt-0.5 block">
                {MOCK_HINDSIGHT_STATUS.accuracyRate}%
              </span>
            </div>
            <div className="rounded-xl border border-sky-500/30 bg-slate-950/70 p-3.5 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Vector Cluster
              </span>
              <span className="text-xl font-mono font-bold text-sky-300 mt-0.5 block">
                1536-dim
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Statistics: Incidents, Root Causes, Resolutions, Decisions, Outcomes, Patterns */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hindsight Memory Graph Statistics
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            {MOCK_HINDSIGHT_STATUS.indexedVectors.toLocaleString()} failure vectors indexed
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* 1. Incidents — 1,284 */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Incidents</span>
              <Database className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white tracking-tight">
              {MOCK_MEMORY_STATISTICS.incidents.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Retrospectives</span>
          </div>

          {/* 2. Root Causes — 327 */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Root Causes</span>
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-cyan-300 tracking-tight">
              {MOCK_MEMORY_STATISTICS.rootCauses.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Failure vectors</span>
          </div>

          {/* 3. Resolutions — 562 */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Resolutions</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-400 tracking-tight">
              {MOCK_MEMORY_STATISTICS.resolutions.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Playbooks codified</span>
          </div>

          {/* 4. Decisions — 894 */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Decisions</span>
              <GitBranch className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-400 tracking-tight">
              {MOCK_MEMORY_STATISTICS.decisions.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Operator choices</span>
          </div>

          {/* 5. Outcomes — 1,147 */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Outcomes</span>
              <Activity className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white tracking-tight">
              {MOCK_MEMORY_STATISTICS.outcomes.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Feedback nodes</span>
          </div>

          {/* 6. Patterns — 43 */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Patterns</span>
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-cyan-400 tracking-tight">
              {MOCK_MEMORY_STATISTICS.patterns.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Crystallized graphs</span>
          </div>
        </div>
      </div>

      {/* Searchable Memory Explorer with 6 Filters */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Searchable Memory Explorer
            </h2>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Global Query Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-cyan-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memory records by symptom, action, root cause, code, or learned insight..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/90 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* 6 Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 text-xs">
          {/* 1. Incident Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Incident
            </label>
            <select
              value={selectedIncident}
              onChange={(e) => setSelectedIncident(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none truncate"
            >
              <option value="all">All Incidents</option>
              {allIncidents.map((inc) => (
                <option key={inc} value={inc}>
                  {inc}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Root Cause Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Root Cause
            </label>
            <select
              value={selectedRootCause}
              onChange={(e) => setSelectedRootCause(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none truncate"
            >
              <option value="all">All Root Causes</option>
              {allRootCauses.map((rc) => (
                <option key={rc} value={rc}>
                  {rc}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Action Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Action Taken
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none truncate"
            >
              <option value="all">All Actions</option>
              {allActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Outcome Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Historical Outcome
            </label>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none"
            >
              <option value="all">All Outcomes</option>
              <option value="Failed">Failed</option>
              <option value="Ineffective">Ineffective</option>
              <option value="Mitigated">Mitigated</option>
              <option value="Recovered">Recovered</option>
              <option value="Prevented">Prevented</option>
            </select>
          </div>

          {/* 5. Pattern Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Pattern Signature
            </label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none truncate"
            >
              <option value="all">All Patterns</option>
              {allPatterns.map((pat) => (
                <option key={pat} value={pat}>
                  {pat}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Decision Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Operator Decision
            </label>
            <select
              value={selectedDecision}
              onChange={(e) => setSelectedDecision(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none truncate"
            >
              <option value="all">All Decisions</option>
              {allDecisions.map((dec) => (
                <option key={dec} value={dec}>
                  {dec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Detailed Memory Cards Feed (Not a Boring Table) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              Codified Memory Records ({filteredMemories.length})
            </h3>
            <span className="text-xs text-slate-400">
              Ordered by recall frequency & cognitive confidence
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredMemories.map((mem) => {
            const isFailed = mem.outcome === "Failed" || mem.outcome === "Ineffective";

            return (
              <div
                key={mem.id}
                onClick={() => setSelectedMemory(mem)}
                className="group cursor-pointer rounded-2xl border border-slate-800/90 bg-gradient-to-r from-[#090f1d] via-[#0b1426] to-[#090f1d] p-6 backdrop-blur-sm shadow-xl hover:border-cyan-500/50 hover:shadow-cyan-950/30 transition-all duration-200 space-y-4"
              >
                {/* Header: Memory Code, Source Incident, Vector ID, Outcome Badge, Confidence */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-extrabold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800/60 shadow-sm">
                      {mem.memoryCode}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      Source: <strong className="text-sky-400">{mem.sourceIncidentCode}</strong> ({mem.sourceIncident})
                    </span>
                    <span className="rounded bg-slate-850 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                      Vector: {mem.vectorId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Outcome Badge */}
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                        isFailed
                          ? "bg-red-500/15 text-red-300 border-red-500/30"
                          : mem.outcome === "Mitigated"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      Outcome: {mem.outcome}
                    </span>

                    {/* Confidence Meter */}
                    <span className="rounded-md bg-emerald-950/80 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400 border border-emerald-800/60">
                      {mem.confidence}% Confidence
                    </span>
                  </div>
                </div>

                {/* Key Insight Highlight (The Core Lesson) */}
                <div className="rounded-xl border border-cyan-500/25 bg-cyan-950/20 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                    Learned Insight:
                  </span>
                  <blockquote className="text-sm sm:text-base font-semibold text-white leading-relaxed italic">
                    &ldquo;{mem.learnedInsight}&rdquo;
                  </blockquote>
                </div>

                {/* 3-Column Context, Action, and Historical Outcome Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Context */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Operational Context
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {mem.context.map((ctx, cIdx) => (
                        <span
                          key={cIdx}
                          className="rounded bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-800"
                        >
                          • {ctx}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Taken */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Attempted Action
                    </span>
                    <div className="font-semibold text-slate-200">
                      {mem.action}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Decision: {mem.decision}
                    </p>
                  </div>

                  {/* Historical Outcome Detail */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Historical Outcome Details
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {mem.outcomeDetail}
                    </p>
                  </div>
                </div>

                {/* Footer: Related Memories & Detailed Inspection Link */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold">Related Memories:</span>
                    <div className="flex items-center gap-1.5">
                      {mem.relatedMemories.map((rm) => (
                        <span
                          key={rm}
                          className="rounded bg-slate-850 px-2 py-0.5 font-mono text-[11px] text-sky-300 border border-slate-750"
                        >
                          {rm}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400">
                      Recalled <strong>{mem.recallCount} times</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      <span>Inspect Vector Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Memory Detail Drawer / Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-[#090f1d] shadow-2xl ring-1 ring-white/10 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                  {selectedMemory.memoryCode}
                </span>
                <span className="text-sm font-bold text-white">
                  Memory Vector Detail
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
                  {selectedMemory.confidence}% Confidence
                </span>
              </div>
              <button
                onClick={() => setSelectedMemory(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 space-y-5 text-xs">
              {/* Learned Insight Hero */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  Synthesized Organizational Learning
                </span>
                <blockquote className="text-base font-semibold text-white italic">
                  &ldquo;{selectedMemory.learnedInsight}&rdquo;
                </blockquote>
              </div>

              {/* Cognitive Vector Telemetry */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Vector ID</span>
                  <div className="mt-1 font-mono font-bold text-sky-300 text-xs">
                    {selectedMemory.vectorId}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Embedding</span>
                  <div className="mt-1 font-mono font-bold text-white text-xs">
                    1536 Dimensions
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Recall Count</span>
                  <div className="mt-1 font-mono font-bold text-emerald-400 text-xs">
                    {selectedMemory.recallCount} times
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pattern Signature</span>
                  <div className="mt-1 font-mono font-bold text-amber-300 text-xs truncate">
                    {selectedMemory.patternCode}
                  </div>
                </div>
              </div>

              {/* Context & Action Matrix */}
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Incident Trigger Context
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedMemory.context.map((ctx, idx) => (
                      <span key={idx} className="rounded bg-slate-900 px-2.5 py-1 text-slate-200 border border-slate-800">
                        {ctx}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Evaluated Operator Action
                  </span>
                  <p className="text-slate-200 font-medium">
                    Action: <strong>{selectedMemory.action}</strong> • Decision: {selectedMemory.decision}
                  </p>
                  <p className="text-slate-400 text-[11px] pt-1">
                    Historical Result: <strong className="text-red-400">{selectedMemory.outcome}</strong> — {selectedMemory.outcomeDetail}
                  </p>
                </div>
              </div>

              {/* Codified Prevention Rule */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Codified Prevention Rule in Memory
                </span>
                <p className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3.5 text-xs text-emerald-200 leading-relaxed font-medium">
                  🛡️ {selectedMemory.extractedRule}
                </p>
              </div>

              {/* Semantic Embedding Tags */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Semantic Embedding Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMemory.semanticTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-slate-850 px-2 py-0.5 font-mono text-[11px] text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="border-t border-slate-800 bg-slate-900/60 px-6 py-3 flex items-center justify-between">
              <Link
                href="/ai-command"
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <Terminal className="h-4 w-4" />
                <span>Simulate in AI Reasoning Console</span>
              </Link>

              <button
                onClick={() => setSelectedMemory(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Close Memory Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
