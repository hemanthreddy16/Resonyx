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
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Incident,
  AutonomousRecoveryPipelineResult,
} from "@/types";
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

  // Autonomous Pipeline Execution State
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<AutonomousRecoveryPipelineResult | null>(null);
  const [activePipelineStage, setActivePipelineStage] = useState<string>("DETECT");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  // Handler: Execute full autonomous recovery pipeline
  const handleRunPipeline = async () => {
    setIsRunningPipeline(true);
    setErrorMessage(null);
    setActivePipelineStage("DIAGNOSE");

    try {
      const response = await fetch("/api/agents/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId: incident.id }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || json.message || "Pipeline execution failed");
      }

      setPipelineResult(json.data);
      setActivePipelineStage(json.data.currentStage || "LEARN");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const PIPELINE_STAGES = [
    { key: "DETECT", label: "01. DETECT", name: "Detection" },
    { key: "DIAGNOSE", label: "02. DIAGNOSE", name: "Diagnosis" },
    { key: "PREDICT", label: "03. PREDICT", name: "Predict Risk" },
    { key: "STRATEGY", label: "04. STRATEGY", name: "Strategy" },
    { key: "POLICY", label: "05. POLICY", name: "Human Safety" },
    { key: "RECOVER", label: "06. RECOVER", name: "Execution" },
    { key: "VERIFY", label: "07. VERIFY", name: "Verification" },
    { key: "LEARN", label: "08. LEARN", name: "Hindsight Memory" },
  ];

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
          {/* Top Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2.5 py-1 rounded border border-sky-800/50">
                {incident.code}
              </span>
              <SeverityBadge severity={incident.severity} />
              <span
                className={`rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${
                  pipelineResult?.success || incident.status === "resolved"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : incident.status === "mitigated"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse"
                }`}
              >
                Status: {pipelineResult?.success ? "Resolved (Autonomous)" : incident.status}
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

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleRunPipeline}
              disabled={isRunningPipeline}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-xl shadow-emerald-950/50 hover:from-emerald-500 hover:to-sky-500 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isRunningPipeline ? "animate-spin" : ""}`} />
              <span>
                {isRunningPipeline ? "Running Autonomous Recovery..." : "Run Autonomous Recovery Pipeline"}
              </span>
            </button>

            <button
              onClick={() => setEvidenceModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <FileCode className="h-4 w-4 text-sky-400" />
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
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300 font-mono">
              ⚠️ {errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* AUTONOMOUS RECOVERY PIPELINE VISUALIZATION (DETECT -> DIAGNOSE -> PREDICT -> STRATEGY -> POLICY -> RECOVER -> VERIFY -> LEARN) */}
      <div className="rounded-2xl border border-sky-500/30 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Autonomous Recovery Pipeline
            </h2>
            <span className="rounded bg-sky-950 px-2 py-0.5 font-mono text-[10px] text-sky-300 border border-sky-800/60 font-semibold">
              OpenRouter + Hindsight + PostgreSQL
            </span>
          </div>

          <span className="font-mono text-xs text-slate-400">
            Current Stage:{" "}
            <strong className="text-emerald-400">
              {pipelineResult ? pipelineResult.currentStage : activePipelineStage}
            </strong>
          </span>
        </div>

        {/* 8-Stage Stepper Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {PIPELINE_STAGES.map((s, idx) => {
            const isCompleted =
              pipelineResult?.stages?.[s.name.toLowerCase() as keyof typeof pipelineResult.stages]?.status ===
                "completed" ||
              (pipelineResult && idx <= 7) ||
              (activePipelineStage === s.key && !isRunningPipeline && pipelineResult);
            const isRunning = isRunningPipeline && activePipelineStage === s.key;

            return (
              <div
                key={s.key}
                className={`rounded-xl border p-2.5 text-center transition-all ${
                  isCompleted
                    ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                    : isRunning
                    ? "border-sky-500/60 bg-sky-950/40 text-sky-300 animate-pulse ring-1 ring-sky-400"
                    : "border-slate-800 bg-slate-900/50 text-slate-400"
                }`}
              >
                <div className="text-[10px] font-mono font-bold">{s.label}</div>
                <div className="text-xs font-semibold text-white mt-0.5 truncate">{s.name}</div>
                <div className="mt-1 flex justify-center">
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                      <CheckCircle2 className="h-3 w-3" /> OK
                    </span>
                  ) : isRunning ? (
                    <span className="flex items-center gap-1 text-[10px] text-sky-400 font-mono">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">Ready</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Stage Output Panel */}
        {pipelineResult && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-4 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Autonomous Loop Succeeded
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                Verified in {pipelineResult.execution?.executionDuration || 350}ms
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Diagnosis Box */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="font-mono text-[10px] uppercase text-sky-400 font-bold">
                  AI Diagnosis
                </span>
                <p className="text-slate-200 font-medium line-clamp-3">
                  {pipelineResult.diagnosis?.diagnosis}
                </p>
                <div className="text-[11px] text-slate-400 font-mono pt-1">
                  Confidence: <strong className="text-sky-300">{pipelineResult.diagnosis?.confidence}%</strong>
                </div>
              </div>

              {/* Action Executed Box */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="font-mono text-[10px] uppercase text-amber-400 font-bold">
                  Controlled Execution
                </span>
                <div className="font-mono text-xs text-white font-bold">
                  [{pipelineResult.execution?.action}]
                </div>
                <p className="text-slate-300 text-[11px] line-clamp-2">
                  {pipelineResult.execution?.result}
                </p>
                <div className="text-[11px] text-emerald-400 font-mono pt-1">
                  Status: <strong>{pipelineResult.execution?.status.toUpperCase()}</strong>
                </div>
              </div>

              {/* Verification & Learning Box */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="font-mono text-[10px] uppercase text-emerald-400 font-bold">
                  Verification & Hindsight
                </span>
                <p className="text-slate-300 text-[11px]">
                  {pipelineResult.verification?.verificationResult}
                </p>
                <div className="text-[11px] text-cyan-300 font-mono pt-1">
                  P99: {pipelineResult.verification?.metrics.p99LatencyMs}ms | Memory Encoded
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Incident Timeline & AI Root Cause Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timeline Events (5 cols) */}
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

        {/* Right Column: AI Root Cause & Diagnosis (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <h2 className="text-base font-bold tracking-tight text-white">
                AI Root Cause & Strategy Analysis
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
                Confidence: {pipelineResult?.diagnosis?.confidence || incident.aiRootCause.confidence}%
              </span>
            </div>
          </div>

          {/* Likely Root Cause Card */}
          <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              Causal Root Cause:
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
              {pipelineResult?.diagnosis?.rootCause || incident.aiRootCause.likelyCause}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {pipelineResult?.diagnosis?.diagnosis || incident.aiRootCause.investigationDetails}
            </p>
          </div>

          {/* Recommended Allowed Actions */}
          {pipelineResult?.diagnosis?.recommendedActions && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Whitelisted Recovery Options:
              </span>
              <div className="flex flex-wrap gap-2">
                {pipelineResult.diagnosis.recommendedActions.map((act) => (
                  <span
                    key={act}
                    className="font-mono text-xs font-semibold rounded bg-sky-950/80 text-sky-300 border border-sky-800 px-2.5 py-1"
                  >
                    ✓ {act}
                  </span>
                ))}
              </div>
            </div>
          )}

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

      {/* Hindsight Recall Section: Similar Historical Incidents */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <h2 className="text-lg font-bold tracking-tight text-white">
              Hindsight Recall
            </h2>
            <span className="rounded bg-cyan-950 px-2 py-0.5 text-xs font-mono text-cyan-300 border border-cyan-800/50">
              Similar Historical Incidents
            </span>
          </div>

          <span className="text-xs text-slate-400">
            Vector cluster: <strong className="text-sky-300 font-mono">{incident.hindsightVectorId}</strong>
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Resonyx Hindsight matched current failure telemetry against historical incident records using 1536-dimensional embeddings:
        </p>

        {/* Similar Incidents Cards Grid */}
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
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                <span className="text-slate-400">Trace: <strong className="text-sky-300">{incident.evidence.affectedTraceId}</strong></span>
                <span className="text-amber-400">{incident.evidence.metricAnomaly}</span>
              </div>

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
