"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Clock,
  Zap,
  Cpu,
  Layers,
  FileCode,
  Database,
  ArrowRight,
  X,
  Terminal,
} from "lucide-react";
import { Incident } from "@/types";
import { SeverityBadge } from "@/components/ui/Badge";

interface IncidentDetailViewProps {
  incident: Incident;
}

export function IncidentDetailView({ incident }: IncidentDetailViewProps) {
  const router = useRouter();

  // Functional Modal States
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  const [showSimilarDrawer, setShowSimilarDrawer] = useState(false);
  const [selectedSimilar, setSelectedSimilar] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-sky-400 transition-colors">
          Command Center
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/incidents" className="hover:text-sky-400 transition-colors">
          Incidents
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-mono text-sky-300 font-semibold">{incident.code}</span>
      </div>

      {/* Main Incident Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-r from-[#070e1c] via-[#0a1324] to-[#0c1932] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 space-y-4">
          {/* Top Meta Bar: Status, Severity, Service, Detected Time */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2.5 py-1 rounded border border-sky-800/50">
                {incident.code}
              </span>
              <SeverityBadge severity={incident.severity} />
              <span
                className={`rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${
                  incident.status === "investigating"
                    ? "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse"
                    : incident.status === "mitigated"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}
              >
                Status: {incident.status}
              </span>
              <span className="font-mono text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                Service: <strong>{incident.service}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <Clock className="h-4 w-4 text-sky-400" />
              <span>Detected: <strong>{incident.detectedTime}</strong> ({incident.mttrMinutes}m MTTR)</span>
            </div>
          </div>

          {/* Title & Summary */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {incident.code} — {incident.title}
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              {incident.summary}
            </p>
          </div>

          {/* Three Key Functional Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setEvidenceModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-950/50 hover:bg-sky-500 transition-colors"
            >
              <FileCode className="h-4 w-4" />
              <span>View Evidence</span>
            </button>

            <button
              onClick={() => setMemoryModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-950/60 px-4 py-2 text-xs font-semibold text-cyan-200 shadow hover:bg-cyan-900/60 transition-colors"
            >
              <Database className="h-4 w-4 text-cyan-400" />
              <span>View Memory</span>
            </button>

            <button
              onClick={() => setShowSimilarDrawer(!showSimilarDrawer)}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Layers className="h-4 w-4 text-amber-400" />
              <span>{showSimilarDrawer ? "Hide Similar Incidents" : "Show Similar Incidents"}</span>
            </button>

            <Link
              href="/ai-command"
              className="ml-auto flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
            >
              <Terminal className="h-4 w-4" />
              <span>Open in AI Reasoning Console →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Incident Timeline & AI Root Cause Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incident Timeline (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Incident Timeline
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Synchronized Millisecond Telemetry
            </span>
          </div>

          <div className="relative border-l border-slate-800 ml-3 pl-5 space-y-6 pt-2">
            {incident.timelineEvents.map((evt, idx) => (
              <div key={idx} className="relative group">
                {/* Node Pip */}
                <div
                  className={`absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full border shadow ${
                    evt.type === "ai"
                      ? "border-emerald-400 bg-emerald-500 animate-pulse"
                      : evt.type === "error"
                      ? "border-red-400 bg-red-500"
                      : evt.type === "latency"
                      ? "border-amber-400 bg-amber-500"
                      : "border-sky-400 bg-sky-500"
                  }`}
                />

                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs font-bold text-sky-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {evt.time}
                  </span>
                  <span className="text-xs font-medium text-slate-200">
                    {evt.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Detection delay: <strong>6 minutes</strong></span>
            <span className="text-emerald-400 font-semibold">Resonyx Correlation: Instant</span>
          </div>
        </div>

        {/* Right Column: AI Root Cause Analysis (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <h2 className="text-base font-bold tracking-tight text-white">
                AI Root Cause Analysis
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
                Confidence: {incident.aiRootCause.confidence}%
              </span>
            </div>
          </div>

          {/* Likely Root Cause Card */}
          <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              Likely Root Cause:
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
              {incident.aiRootCause.likelyCause}
            </h3>
            {incident.aiRootCause.investigationDetails && (
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {incident.aiRootCause.investigationDetails}
              </p>
            )}
          </div>

          {/* Pattern Signature Matched */}
          {incident.patternMatch && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pattern Match Identified:
                </span>
                <div className="font-mono text-xs font-semibold text-sky-300 mt-0.5">
                  {incident.patternMatch.patternCode}
                </div>
                <div className="text-[11px] text-slate-400">
                  {incident.patternMatch.name}
                </div>
              </div>
              <span className="rounded bg-sky-950 px-2 py-1 text-xs font-mono font-bold text-sky-300 border border-sky-800/60">
                {incident.patternMatch.confidence}% Match
              </span>
            </div>
          )}

          {/* Key Learnings List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Key Organizational Learnings</span>
            </h4>
            <div className="space-y-2">
              {incident.keyLearnings.map((learning, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className="font-mono text-[10px] text-amber-400 shrink-0 mt-0.5">
                    [0{idx + 1}]
                  </span>
                  <span>{learning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hindsight Recall Section: 4 Similar Historical Incidents */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <h2 className="text-lg font-bold tracking-tight text-white">
              Hindsight Recall
            </h2>
            <span className="rounded bg-cyan-950 px-2 py-0.5 text-xs font-mono text-cyan-300 border border-cyan-800/50">
              4 Similar Historical Incidents
            </span>
          </div>

          <span className="text-xs text-slate-400">
            Vector cluster: <strong className="text-sky-300 font-mono">{incident.hindsightVectorId}</strong>
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Resonyx Hindsight matched current failure telemetry against historical incident records using 1536-dimensional embeddings:
        </p>

        {/* 4 Similar Incidents Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {incident.hindsightRecall.map((item) => (
            <div
              key={item.code}
              onClick={() => {
                setSelectedSimilar(item.code);
                setShowSimilarDrawer(true);
              }}
              className="group cursor-pointer rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 hover:border-sky-500/50 hover:bg-slate-950 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-xs font-bold text-sky-400 group-hover:text-sky-300">
                    {item.code}
                  </span>
                  {/* Similarity Pill */}
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
                    {item.similarity}%
                  </span>
                </div>

                <h4 className="mt-2.5 text-xs font-bold text-slate-200 group-hover:text-white line-clamp-2">
                  {item.title}
                </h4>

                <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                  Mitigation: {item.mitigation}
                </p>
              </div>

              <div className="mt-3.5 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>{item.date}</span>
                <span className="text-sky-400 group-hover:underline flex items-center gap-0.5">
                  Compare <ArrowRight className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drawer: Detailed Comparison for Similar Incidents */}
      {showSimilarDrawer && (
        <div className="rounded-xl border border-sky-500/30 bg-slate-950/90 p-5 shadow-2xl animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Historical Incident Comparison & Postmortem Correlation
              </h3>
            </div>
            <button
              onClick={() => setShowSimilarDrawer(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Incident</th>
                  <th className="py-2.5 px-3">Similarity</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Historical Root Cause & Resolution</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {incident.hindsightRecall.map((item) => (
                  <tr
                    key={item.code}
                    className={`transition-colors ${
                      selectedSimilar === item.code
                        ? "bg-sky-950/70 border-l-2 border-sky-400"
                        : "hover:bg-slate-900/50"
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-400">
                      {item.code}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
                        {item.similarity}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-md">
                      <strong>{item.title}:</strong> {item.mitigation}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => router.push(`/incidents`)}
                        className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-sky-500 hover:text-white"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Functional Modal 1: View Evidence */}
      {evidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-[#0b1220] shadow-2xl ring-1 ring-white/10 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  Incident Evidence & Telemetry Logs — {incident.code}
                </h3>
              </div>
              <button
                onClick={() => setEvidenceModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5 text-xs">
              {/* Telemetry Trace ID & Metrics */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                <span className="text-slate-400">Trace: <strong className="text-sky-300">{incident.evidence.affectedTraceId}</strong></span>
                <span className="text-amber-400">{incident.evidence.metricAnomaly}</span>
              </div>

              {/* Code / Query Diff */}
              {incident.evidence.queryDiff && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Suspect Code / SQL Migration Diff
                  </span>
                  <pre className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                    {incident.evidence.queryDiff}
                  </pre>
                </div>
              )}

              {/* Raw Log Output */}
              {incident.evidence.logSnippet && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Server Log Trajectory (At time of cascade)
                  </span>
                  <pre className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-red-200/90 overflow-x-auto leading-relaxed">
                    {incident.evidence.logSnippet}
                  </pre>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 bg-slate-900/60 px-6 py-3 flex justify-end">
              <button
                onClick={() => setEvidenceModalOpen(false)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Close Evidence Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Functional Modal 2: View Memory */}
      {memoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-[#0b1220] shadow-2xl ring-1 ring-white/10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Hindsight Vector Memory Record
                </h3>
              </div>
              <button
                onClick={() => setMemoryModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="rounded-lg border border-sky-500/20 bg-sky-950/30 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Vector Node ID
                  </span>
                  <div className="font-mono text-sm font-bold text-sky-300">
                    {incident.hindsightVectorId}
                  </div>
                </div>
                <span className="rounded bg-sky-500/20 px-2 py-1 font-mono text-xs text-sky-200 border border-sky-500/30">
                  1536 Dimensions
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Codified Prevention Rule in Memory
                </span>
                <p className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-medium text-slate-200 leading-relaxed">
                  {incident.preventativeMeasures[0] || "Enforce strict deadline propagation and threadpool bulkhead isolation."}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Semantic Embedding Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {incident.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-slate-850 px-2 py-0.5 font-mono text-[11px] text-slate-300 border border-slate-750"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 bg-slate-900/60 px-6 py-3 flex justify-end">
              <button
                onClick={() => setMemoryModalOpen(false)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Close Memory Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
