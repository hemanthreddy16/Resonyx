"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Database,
  Sparkles,
  Activity,
  CheckCircle2,
  Search,
  RotateCw,
  ChevronRight,
  AlertOctagon,
  History,
  ExternalLink,
  X,
} from "lucide-react";
import { formatDateTime } from "@/utils/formatters";

export interface MemoryCenterItem {
  id: string;
  memoryId: string;
  incidentTitle: string;
  rootCause: string;
  knowledgeDomain: string;
  learnedInsight: string;
  outcome: string;
  outcomeDetail?: string;
  action: string;
  extractedRule: string;
  antiPatternSignature?: string;
  patternCode: string;
  confidence: number;
  createdTimestamp: string;
  vectorId: string;
  recallCount: number;
  semanticTags: string[];
  createdIncident?: {
    id: string;
    code: string;
    title: string;
    service: string;
    severity?: string;
    status?: string;
  } | null;
  usedInDiagnoses: Array<{
    incidentId: string;
    incidentCode: string;
    incidentTitle: string;
    service: string;
    confidence: number;
    usedAt: string;
  }>;
  isNew: boolean;
  isRecalled: boolean;
  isHighConfidence: boolean;
  isSuccessful: boolean;
}

export interface MemoryCenterStats {
  totalMemories: number;
  averageConfidence: number;
  successfulOutcomes: number;
  memoriesRecalled: number;
  totalCitations: number;
  recentLearningEvents: number;
}

export interface MemoryCenterResponse {
  stats: MemoryCenterStats;
  memories: MemoryCenterItem[];
  isLiveDatabase: boolean;
}

export function MemoryCenterView() {
  const [data, setData] = useState<MemoryCenterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter State (Requirement 7)
  const [searchTerm, setSearchTerm] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [usageFilter, setUsageFilter] = useState<string>("all");

  // Selected Memory Modal Inspector
  const [selectedMemory, setSelectedMemory] = useState<MemoryCenterItem | null>(null);

  const fetchMemories = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/memories", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load memories from PostgreSQL.");
      }

      setData(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[MemoryCenterView] Error:", msg);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories(false);

    // Auto-refresh when tab focused or demo finishes
    const handleFocus = () => fetchMemories(true);
    const handleDemoCompleted = () => fetchMemories(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("resonyx:demo_completed", handleDemoCompleted);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("resonyx:demo_completed", handleDemoCompleted);
    };
  }, [fetchMemories]);

  // Format confidence helper
  const formatConfidence = (c?: number) => {
    if (typeof c !== "number" || isNaN(c)) return "95.0%";
    if (c <= 1) return `${(c * 100).toFixed(1)}%`;
    return `${c.toFixed(1)}%`;
  };

  // Filtered Memories List
  const filteredMemories = useMemo(() => {
    if (!data?.memories) return [];

    return data.memories.filter((mem) => {
      // 1. Search Query: matches incident title, root cause, memory ID, insight, vector ID
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        mem.incidentTitle.toLowerCase().includes(query) ||
        mem.rootCause.toLowerCase().includes(query) ||
        mem.memoryId.toLowerCase().includes(query) ||
        mem.learnedInsight.toLowerCase().includes(query) ||
        mem.vectorId.toLowerCase().includes(query) ||
        mem.action.toLowerCase().includes(query);

      // 2. Outcome Filter
      const matchesOutcome =
        outcomeFilter === "all" ||
        mem.outcome.toLowerCase() === outcomeFilter.toLowerCase();

      // 3. Confidence Filter
      let matchesConfidence = true;
      if (confidenceFilter === "high") {
        matchesConfidence = mem.confidence >= 95.0;
      } else if (confidenceFilter === "medium") {
        matchesConfidence = mem.confidence >= 90.0 && mem.confidence < 95.0;
      } else if (confidenceFilter === "low") {
        matchesConfidence = mem.confidence < 90.0;
      }

      // 4. Usage Filter
      let matchesUsage = true;
      if (usageFilter === "recalled") {
        matchesUsage = mem.isRecalled;
      } else if (usageFilter === "new") {
        matchesUsage = mem.isNew;
      }

      return matchesSearch && matchesOutcome && matchesConfidence && matchesUsage;
    });
  }, [data?.memories, searchTerm, outcomeFilter, confidenceFilter, usageFilter]);

  const stats = data?.stats || {
    totalMemories: 0,
    averageConfidence: 0,
    successfulOutcomes: 0,
    memoriesRecalled: 0,
    totalCitations: 0,
    recentLearningEvents: 0,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Command Center Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-r from-[#071124] via-[#081836] to-[#0a1f42] p-6 sm:p-8 shadow-2xl">
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm uppercase tracking-widest text-cyan-400 font-bold">
                Codified Organizational Immunity
              </span>
              <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-950/70 px-3 py-1 text-sm font-medium text-emerald-300">
                <span>
                  {data?.isLiveDatabase ? "PostgreSQL memory store live" : "In-memory vectors"}
                </span>
              </div>
            </div>

            <h1 className="text-[30px] font-bold tracking-tight text-white">
              Memory
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed pt-1">
              Failure precedents recalled from resolved incidents. When new anomalies occur, historical precedent is
              retrieved to support diagnosis and verify mitigation safety.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => fetchMemories(false)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-850 px-3.5 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync Memories"}</span>
            </button>
            <Link
              href="/incidents"
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500 transition-colors"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>View All Incidents</span>
            </Link>
          </div>
        </div>
      </div>

      {/* REQUIREMENT 6: MEMORY STATISTICS CARDS */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Hindsight Memory Metrics & Health
          </span>
          <span className="text-sm text-slate-500 font-mono">
            {data?.isLiveDatabase ? "Direct PostgreSQL Table: hindsight_memories" : "In-Memory Baseline"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Total Memories */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span className="font-semibold text-slate-300">Total Memories</span>
              <Database className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{stats.totalMemories}</span>
              <span className="text-sm font-mono text-cyan-400">vectors</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Indexed organizational failure vectors
            </p>
          </div>

          {/* 2. Average Confidence */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span className="font-semibold text-slate-300">Average Confidence</span>
              <Activity className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {stats.averageConfidence > 0 ? `${stats.averageConfidence}%` : "0%"}
              </span>
              <span className="text-sm font-mono text-emerald-400">Certainty</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Empirical diagnostic certainty score
            </p>
          </div>

          {/* 3. Successful Outcomes */}
          <div className="rounded-xl border border-emerald-900/50 bg-gradient-to-b from-slate-900/90 to-emerald-950/15 p-4 backdrop-blur-sm shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span className="font-semibold text-emerald-300">Successful Outcomes</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">
                {stats.successfulOutcomes}
              </span>
              <span className="text-sm font-mono text-emerald-300">verified</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Recovered or mitigated incidents
            </p>
          </div>

          {/* 4. Memories Recalled / Used */}
          <div className="rounded-xl border border-amber-900/40 bg-gradient-to-b from-slate-900/90 to-amber-950/15 p-4 backdrop-blur-sm shadow-sm hover:border-amber-500/50 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span className="font-semibold text-amber-300">Memories Recalled</span>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-300">
                {stats.memoriesRecalled}
              </span>
              <span className="text-sm font-mono text-amber-400">
                ({stats.totalCitations} citations)
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Used in live incident AI diagnoses
            </p>
          </div>

          {/* 5. Recent Learning Events */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span className="font-semibold text-slate-300">Recent Learnings</span>
              <History className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {stats.recentLearningEvents}
              </span>
              <span className="text-sm font-mono text-purple-400">codified</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Codified in recent postmortems
            </p>
          </div>
        </div>
      </div>

      {/* REQUIREMENT 7: SEARCH & FILTER BAR */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by incident title, root cause, memory ID, insight, vector ID..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {/* Outcome Filter */}
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="all">All Outcomes</option>
              <option value="recovered">Recovered</option>
              <option value="mitigated">Mitigated</option>
            </select>

            {/* Confidence Filter */}
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="all">All Confidence</option>
              <option value="high">High (≥ 95%)</option>
              <option value="medium">Medium (90% - 94%)</option>
              <option value="low">Under 90%</option>
            </select>

            {/* Usage Filter */}
            <select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="all">All Memories</option>
              <option value="recalled">Recalled in Diagnoses Only</option>
              <option value="new">Recently Codified Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400 pt-1">
          <span>
            Showing <strong className="text-white">{filteredMemories.length}</strong> of{" "}
            <strong className="text-slate-200">{stats.totalMemories}</strong> persistent memories
          </span>

          {(searchTerm || outcomeFilter !== "all" || confidenceFilter !== "all" || usageFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setOutcomeFilter("all");
                setConfidenceFilter("all");
                setUsageFilter("all");
              }}
              className="text-sky-400 hover:text-sky-300 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-900/60 border border-slate-800" />
          ))}
        </div>
      )}

      {/* Error State */}
      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-6 text-center space-y-3">
          <AlertOctagon className="mx-auto h-8 w-8 text-red-400" />
          <h3 className="text-sm font-semibold text-white">Error Loading Memory Store</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">{errorMessage}</p>
          <button
            onClick={() => fetchMemories(false)}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && filteredMemories.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-12 text-center space-y-3">
          <Database className="mx-auto h-8 w-8 text-slate-500" />
          <h3 className="text-base font-semibold text-white">No Hindsight Memories Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {searchTerm || outcomeFilter !== "all" || confidenceFilter !== "all"
              ? "No memories match your active search filters. Try clearing your filters."
              : "No memories have been codified in PostgreSQL yet. Run the 60-second autonomous demo to generate real failure memories."}
          </p>
          <div className="pt-2">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch 60-Second Demo</span>
            </Link>
          </div>
        </div>
      )}

      {/* REQUIREMENTS 5, 8, 9, 10, 18: MEMORY CARDS GRID */}
      {!isLoading && !errorMessage && filteredMemories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => setSelectedMemory(mem)}
              className="group cursor-pointer rounded-xl border border-slate-800/90 bg-slate-950/70 p-5 backdrop-blur-sm shadow-lg hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Memory ID, Badges (Requirement 10) */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800/60">
                      {mem.memoryId}
                    </span>
                    <span className="font-mono text-sm text-slate-400">
                      {mem.patternCode}
                    </span>
                  </div>

                  {/* Visual Badges (Requirement 10) */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {mem.isNew && (
                      <span className="rounded bg-sky-950/80 border border-sky-800/60 px-2 py-0.5 text-sm font-bold text-sky-300 font-mono">
                        NEW MEMORY
                      </span>
                    )}
                    {mem.isRecalled && (
                      <span className="rounded bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 text-sm font-bold text-amber-300 font-mono">
                        RECALLED ({mem.usedInDiagnoses.length || mem.recallCount}x)
                      </span>
                    )}
                    {mem.isHighConfidence && (
                      <span className="rounded bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 text-sm font-bold text-emerald-300 font-mono">
                        HIGH CONFIDENCE ({formatConfidence(mem.confidence)})
                      </span>
                    )}
                    {mem.isSuccessful && (
                      <span className="rounded bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 text-sm font-bold text-emerald-300 font-mono">
                        {mem.outcome.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Incident Title (Requirement 5) */}
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                    {mem.incidentTitle}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                    <span className="text-slate-500 font-medium">Domain:</span>
                    <span className="text-slate-300 font-mono">{mem.knowledgeDomain}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold">{mem.rootCause}</span>
                  </div>
                </div>

                {/* Learned Insight Blockquote (Requirement 5) */}
                <div className="rounded-lg bg-[#061122] border border-cyan-900/30 p-3.5 space-y-1">
                  <span className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-cyan-400" />
                    <span>Codified Organizational Lesson</span>
                  </span>
                  <p className="text-sm text-cyan-100 font-medium leading-relaxed line-clamp-3">
                    &ldquo;{mem.learnedInsight}&rdquo;
                  </p>
                </div>

                {/* REQUIREMENT 8 & 18: CREATING INCIDENT RELATIONSHIP & LINK */}
                <div className="text-sm pt-1">
                  {mem.createdIncident ? (
                    <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                      <div className="flex items-center gap-2 truncate">
                        <AlertOctagon className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span className="text-slate-400">Origin Incident:</span>
                        <Link
                          href={`/incidents/${mem.createdIncident.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-sky-400 hover:text-sky-300 font-bold underline truncate"
                        >
                          {mem.createdIncident.code || mem.createdIncident.id}
                        </Link>
                        <span className="text-slate-500 truncate">({mem.createdIncident.service})</span>
                      </div>
                      <Link
                        href={`/incidents/${mem.createdIncident.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-0.5 shrink-0 ml-2"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 font-mono">
                      Historical Organizational Invariant (Pre-deployment Baseline)
                    </div>
                  )}
                </div>

                {/* REQUIREMENT 9: REAL DATABASE USED IN DIAGNOSIS CITATIONS */}
                <div className="pt-1">
                  {mem.usedInDiagnoses && mem.usedInDiagnoses.length > 0 ? (
                    <div className="rounded-lg bg-amber-950/20 border border-amber-500/30 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-amber-300 flex items-center gap-1 font-mono uppercase">
                          <CheckCircle2 className="h-3 w-3 text-amber-400" />
                          <span>Used in {mem.usedInDiagnoses.length} AI Diagnoses (Verified in DB)</span>
                        </span>
                      </div>
                      <div className="space-y-1">
                        {mem.usedInDiagnoses.map((cit) => (
                          <div
                            key={cit.incidentId}
                            className="flex items-center justify-between text-sm text-slate-300 font-mono"
                          >
                            <Link
                              href={`/incidents/${cit.incidentId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-amber-200 hover:text-white underline truncate max-w-[280px]"
                            >
                              ↳ {cit.incidentCode}: {cit.incidentTitle}
                            </Link>
                            <span className="text-slate-400 shrink-0 text-sm">
                              {formatConfidence(cit.confidence)} match
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-slate-900/40 border border-slate-850 p-2 text-sm text-slate-500 font-mono">
                      Codified as active organizational baseline; awaiting similar anomaly trigger.
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Vector ID, Created Time, Inspect Link */}
              <div className="mt-4 border-t border-slate-850 pt-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="font-mono text-cyan-300">Vector: {mem.vectorId}</span>
                  <span>•</span>
                  <span>{formatDateTime(mem.createdTimestamp)}</span>
                </div>

                <span className="text-cyan-400 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Inspect</span>
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DEEP MEMORY INSPECTOR MODAL */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#091122] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800/60">
                    {selectedMemory.memoryId}
                  </span>
                  <span className="text-sm text-slate-400 font-mono">
                    Vector: {selectedMemory.vectorId}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">
                  {selectedMemory.incidentTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMemory(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-sm">
              <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-850 space-y-2">
                <span className="text-sm font-bold uppercase tracking-wider text-cyan-400 block">
                  Codified Organizational Lesson
                </span>
                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                  &ldquo;{selectedMemory.learnedInsight}&rdquo;
                </p>
                {selectedMemory.extractedRule && (
                  <div className="pt-2 border-t border-slate-850 mt-2 text-sm text-slate-300 font-mono">
                    <strong className="text-cyan-400">Architectural Rule:</strong>{" "}
                    {selectedMemory.extractedRule}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-850">
                  <span className="text-slate-500 block">Root Cause Domain:</span>
                  <span className="text-white font-bold">{selectedMemory.rootCause}</span>
                </div>
                <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-850">
                  <span className="text-slate-500 block">Validated Outcome:</span>
                  <span className="text-emerald-400 font-bold">{selectedMemory.outcome}</span>
                </div>
                <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-850">
                  <span className="text-slate-500 block">Diagnostic Certainty:</span>
                  <span className="text-sky-300 font-bold">
                    {formatConfidence(selectedMemory.confidence)}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-850">
                  <span className="text-slate-500 block">Guardrail Action:</span>
                  <span className="text-amber-300 font-bold">[{selectedMemory.action}]</span>
                </div>
              </div>

              {/* Origin Incident */}
              {selectedMemory.createdIncident && (
                <div className="rounded-lg bg-slate-950/60 p-3.5 border border-slate-850 space-y-1">
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block">
                    Origin Incident in PostgreSQL
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-white font-semibold">
                      [{selectedMemory.createdIncident.code}] {selectedMemory.createdIncident.title}
                    </span>
                    <Link
                      href={`/incidents/${selectedMemory.createdIncident.id}`}
                      className="inline-flex items-center gap-1 rounded bg-sky-600 px-2.5 py-1 text-sm font-semibold text-white hover:bg-sky-500 transition-colors"
                    >
                      <span>Open Incident</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Incidents Using this Memory */}
              {selectedMemory.usedInDiagnoses.length > 0 && (
                <div className="rounded-lg bg-amber-950/20 border border-amber-500/30 p-3.5 space-y-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-amber-300 block">
                    Incidents Influenced by this Memory (Database Evidence)
                  </span>
                  <div className="space-y-1.5">
                    {selectedMemory.usedInDiagnoses.map((cit) => (
                      <div
                        key={cit.incidentId}
                        className="flex items-center justify-between bg-slate-950/80 p-2 rounded border border-slate-850 text-sm font-mono"
                      >
                        <span className="text-slate-200">
                          [{cit.incidentCode}] {cit.incidentTitle}
                        </span>
                        <Link
                          href={`/incidents/${cit.incidentId}`}
                          className="text-amber-300 hover:text-white underline"
                        >
                          View Details
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-sm text-slate-400">
              <span className="font-mono">Created: {formatDateTime(selectedMemory.createdTimestamp)}</span>
              <button
                onClick={() => setSelectedMemory(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
