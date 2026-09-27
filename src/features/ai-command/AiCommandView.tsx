"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Send,
  Sparkles,
  Database,
  Layers,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  FileText,
  X,
  HelpCircle,
} from "lucide-react";
import { aiCommandService } from "@/services/aiCommandCenterService";
import { AiCommandMessage, AiEvidenceIncident, AiMemoryEvidence } from "@/types";

const SUGGESTED_QUESTIONS = [
  "What caused the last payment failure?",
  "Have we seen this problem before?",
  "What patterns are increasing?",
  "Which failures are most likely to repeat?",
  "What did we learn from the last 10 incidents?",
  "Why are you recommending this action?",
  "Show me similar incidents.",
];

export function AiCommandView() {
  const [inputQuery, setInputQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showReasoningTrace, setShowReasoningTrace] = useState(false);
  const [selectedEvidenceIncident, setSelectedEvidenceIncident] = useState<AiEvidenceIncident | null>(null);
  const [selectedMemoryNode, setSelectedMemoryNode] = useState<AiMemoryEvidence | null>(null);

  // Initialize with the realistic demo response for "What caused the last payment failure?"
  const [activeMessage, setActiveMessage] = useState<AiCommandMessage>({
    id: "init-response",
    role: "assistant",
    timestamp: "Just now",
    query: "What caused the last payment failure?",
    historicalPattern: {
      patternCode: "PAT-017",
      patternName: "High Traffic + Database Contention",
      summary: "This incident resembles 4 previous incidents.",
      resemblanceText: "This incident resembles 4 previous incidents.",
      contentionFactor: "3 involved high database contention after deployment.",
      failedAttemptsText: "2 previous attempts to restart the service failed.",
    },
    recommendation: {
      actionText: "Investigate the database query introduced in the latest deployment.",
      rationale:
        "Unindexed foreign key lookups under > 8,000 RPS exhaust connection pool threads within 180 seconds. Avoid service restart; apply read-replica shedding instead.",
      priority: "Immediate",
    },
    evidenceIncidents: [
      {
        id: "INC-0871",
        name: "DB Read-Replica Lag Degrade",
        date: "81 days ago",
        outcome: "Successful Mitigation",
        rootCause: "Temporary query buffer bloat; mitigated early by pausing migration runner.",
        vectorSimilarity: 82.3,
      },
      {
        id: "INC-0918",
        name: "Checkout Service Deadlock Storm",
        date: "62 days ago",
        outcome: "Severe Outage",
        rootCause: "Simultaneous schema patch and concurrent customer checkout transactions.",
        vectorSimilarity: 86.4,
      },
      {
        id: "INC-0994",
        name: "Cascading API Gateway Timeout",
        date: "45 days ago",
        outcome: "Severe Outage",
        rootCause: "Upstream PostgreSQL write lock stalled worker threads, causing HTTP 504 surge.",
        vectorSimilarity: 88.7,
      },
      {
        id: "INC-1012",
        name: "Transaction Queue Thread Starvation",
        date: "31 days ago",
        outcome: "Failed Attempt",
        rootCause: "Restarting service under database lock contention crashed connection pool.",
        vectorSimilarity: 91.0,
      },
    ],
    influencingMemories: [
      {
        memoryId: "MEM-8421",
        title: "Payment API Contention Under Burst",
        learnedInsight: "Restarting the service is ineffective under high database contention.",
        historicalAction: "Service restart",
        historicalOutcome: "Failed (Caused cluster-wide crash)",
        confidence: 87,
        similarity: 94.2,
      },
      {
        memoryId: "MEM-8119",
        title: "Unindexed Foreign Key Cascade Lock",
        learnedInsight: "Missing covering index on ledger_events causes full table lock during migrations.",
        historicalAction: "Hotfix index deployment with CONCURRENTLY",
        historicalOutcome: "Successful Mitigation",
        confidence: 93,
        similarity: 91.5,
      },
    ],
    confidenceScore: 94.2,
    deductionTrace: [
      "Queried 8,492 memory embeddings for semantic matches to 'payment-api' and 'connection saturation'.",
      "Calculated 0.058 cosine distance match against pattern PAT-017.",
      "Identified 4 historical incidents with > 80% vector proximity.",
      "Isolated that restarting the pod had 0% success across 2 historical attempts.",
      "Synthesized prescriptive query validation recommendation.",
    ],
  });

  const handleAsk = async (question: string) => {
    if (!question.trim()) return;
    setIsSearching(true);
    setInputQuery(question);

    try {
      const result = await aiCommandService.queryOrganizationalMemory({ query: question });
      setActiveMessage(result);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(inputQuery);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Not a Generic Chatbot */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 p-6 sm:p-7 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-500/10 px-2.5 py-1 text-xs font-mono font-bold text-sky-400 border border-sky-500/30 uppercase tracking-wider inline-flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-sky-400" />
                Hindsight Memory Retrieval Engine
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300 border border-emerald-500/30">
                8,492 Memory Vectors Online
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Resonyx AI
            </h1>

            <p className="text-base sm:text-lg font-medium text-sky-200">
              Ask your organization&apos;s memory.
            </p>

            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              This is not a generic conversational chatbot. Every answer is grounded deterministically in
              historical postmortems, verified telemetry signatures, catalogued patterns, and proven remedial outcomes.
            </p>
          </div>

          {/* Cognitive Badges */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0 self-start lg:self-auto border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Database className="h-4 w-4 text-sky-400" />
              <span>Grounded in <strong>1,284 Incidents</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Layers className="h-4 w-4 text-amber-400" />
              <span><strong>43 Active Patterns</strong> Mined</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span><strong>Zero Hallucinated</strong> Heuristics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Questions Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-sky-400" />
            Suggested Organizational Queries
          </span>
          <span className="text-[11px] font-mono">Click any question to query memory</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all text-left ${
                activeMessage.query === q
                  ? "border-sky-500/60 bg-sky-950/60 text-sky-200 shadow-md shadow-sky-950/50"
                  : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white hover:bg-slate-850"
              }`}
            >
              &ldquo;{q}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Query Search Bar */}
      <form onSubmit={handleFormSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask organizational memory (e.g. 'What caused the last payment failure?')..."
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-3.5 pl-4 pr-32 text-sm text-white placeholder-slate-500 shadow-xl focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={isSearching || !inputQuery.trim()}
            className="absolute right-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-colors flex items-center gap-1.5"
          >
            {isSearching ? (
              <>
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                Querying...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Query Memory
              </>
            )}
          </button>
        </div>
      </form>

      {/* TWO-COLUMN LAYOUT: MAIN RESPONSE & RIGHT EVIDENCE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Structured AI Reasoning Response (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl space-y-6">
            {/* Header: Query Prompt & Inference Confidence */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Active Query
                </span>
                <div className="text-base font-bold text-white mt-0.5">
                  &ldquo;{activeMessage.query}&rdquo;
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-950 px-3 py-1.5 border border-slate-800 text-right">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Confidence</div>
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {activeMessage.confidenceScore}% Certainty
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: Historical Pattern Detected */}
            {activeMessage.historicalPattern && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-amber-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 font-mono">
                      Historical Pattern Detected
                    </h3>
                  </div>
                  <span className="rounded bg-amber-950/80 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-400 border border-amber-800/60">
                    {activeMessage.historicalPattern.patternCode}
                  </span>
                </div>

                <div className="rounded-xl border border-amber-900/40 bg-gradient-to-br from-amber-950/20 to-slate-950 p-4 space-y-2 text-sm text-slate-200">
                  <p className="font-semibold text-white">
                    {activeMessage.historicalPattern.resemblanceText}
                  </p>
                  <p className="text-xs text-slate-300">
                    • {activeMessage.historicalPattern.contentionFactor}
                  </p>
                  <p className="text-xs text-rose-300 font-medium">
                    • {activeMessage.historicalPattern.failedAttemptsText}
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 2: Recommendation */}
            {activeMessage.recommendation && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 font-mono">
                      Recommendation
                    </h3>
                  </div>
                  <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-400 border border-emerald-800/60">
                    Priority: {activeMessage.recommendation.priority}
                  </span>
                </div>

                <div className="rounded-xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/20 to-slate-950 p-4 space-y-2">
                  <p className="text-base font-bold text-white leading-snug">
                    {activeMessage.recommendation.actionText}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeMessage.recommendation.rationale}
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 3: Evidence */}
            {activeMessage.evidenceIncidents && activeMessage.evidenceIncidents.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-sky-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-sky-300 font-mono">
                      Evidence
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {activeMessage.evidenceIncidents.length} Linked Postmortems
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {activeMessage.evidenceIncidents.map((inc) => (
                    <button
                      key={inc.id}
                      onClick={() => setSelectedEvidenceIncident(inc)}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-left hover:border-sky-500/60 hover:bg-slate-900 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-sky-400 group-hover:underline">
                          {inc.id}
                        </span>
                        <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-sky-400" />
                      </div>
                      <div className="text-[11px] text-slate-300 truncate mt-1">
                        {inc.name}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 mt-1">
                        {inc.vectorSimilarity}% Match
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons: Show Evidence, View Memories, Explain Reasoning */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    if (activeMessage.evidenceIncidents && activeMessage.evidenceIncidents[0]) {
                      setSelectedEvidenceIncident(activeMessage.evidenceIncidents[0]);
                    }
                  }}
                  className="rounded-lg border border-sky-500/40 bg-sky-950/40 px-3.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-900/50 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5 text-sky-400" />
                  Show Evidence
                </button>

                <button
                  onClick={() => {
                    if (activeMessage.influencingMemories && activeMessage.influencingMemories[0]) {
                      setSelectedMemoryNode(activeMessage.influencingMemories[0]);
                    }
                  }}
                  className="rounded-lg border border-purple-500/40 bg-purple-950/40 px-3.5 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-900/50 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <Brain className="h-3.5 w-3.5 text-purple-400" />
                  View Memories
                </button>
              </div>

              <button
                onClick={() => setShowReasoningTrace(!showReasoningTrace)}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1"
              >
                {showReasoningTrace ? "Hide Reasoning Trace" : "Explain Reasoning"}
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${
                    showReasoningTrace ? "rotate-90" : ""
                  }`}
                />
              </button>
            </div>

            {/* Step-by-step cognitive deduction trace */}
            {showReasoningTrace && activeMessage.deductionTrace && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs animate-in fade-in duration-200">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Cognitive Reasoning Trace
                </div>
                <div className="space-y-1.5 font-mono text-slate-300">
                  {activeMessage.deductionTrace.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-sky-400 font-bold shrink-0">{idx + 1}.</span>
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Evidence Panel (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md shadow-xl space-y-5">
            {/* Evidence Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Influencing Memories
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Vector Retrieval
              </span>
            </div>

            {/* Influencing Memories Cards */}
            <div className="space-y-3">
              {activeMessage.influencingMemories?.map((mem) => (
                <div
                  key={mem.memoryId}
                  onClick={() => setSelectedMemoryNode(mem)}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 hover:border-purple-500/50 hover:bg-slate-900 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-400 group-hover:underline">
                      {mem.memoryId}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {mem.similarity}% Proximity
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-white">
                    {mem.title}
                  </div>

                  <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800/80 text-[11px] text-slate-300 italic leading-snug">
                    &ldquo;{mem.learnedInsight}&rdquo;
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Action: {mem.historicalAction}</span>
                    <span className={mem.historicalOutcome.includes("Failed") ? "text-rose-400" : "text-emerald-400"}>
                      {mem.historicalOutcome}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Grounded Correlated Incidents List */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono uppercase font-bold text-[10px]">
                  Supporting Incidents
                </span>
                <span className="text-[10px] font-mono">MTTR Recorded</span>
              </div>

              <div className="space-y-2">
                {activeMessage.evidenceIncidents?.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedEvidenceIncident(inc)}
                    className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 hover:border-sky-500/40 transition-colors cursor-pointer text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-sky-400">{inc.id}</div>
                      <div className="text-[11px] text-slate-300 max-w-[170px] truncate">{inc.name}</div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-semibold rounded px-1.5 py-0.5 border ${
                        inc.outcome.includes("Severe")
                          ? "bg-rose-950 text-rose-300 border-rose-800"
                          : inc.outcome.includes("Mitigation")
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : "bg-amber-950 text-amber-300 border-amber-800"
                      }`}
                    >
                      {inc.outcome}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Retrieval Telemetry Footer */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Vector Model:</span>
                <span className="text-slate-200">Resonyx-Embed-1536</span>
              </div>
              <div className="flex justify-between">
                <span>Search Latency:</span>
                <span className="text-emerald-400">18.4ms</span>
              </div>
              <div className="flex justify-between">
                <span>Embedding Distance:</span>
                <span className="text-slate-200">0.058 (Cosine)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EVIDENCE INCIDENT MODAL */}
      {selectedEvidenceIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  Incident Evidence: {selectedEvidenceIncident.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvidenceIncident(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-400">Incident Title:</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {selectedEvidenceIncident.name}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Occurred {selectedEvidenceIncident.date}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Root Cause Attribution
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedEvidenceIncident.rootCause}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Outcome</span>
                  <div className="text-xs font-bold text-amber-400 mt-0.5">
                    {selectedEvidenceIncident.outcome}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Vector Similarity</span>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">
                    {selectedEvidenceIncident.vectorSimilarity}% Match
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/incidents/${selectedEvidenceIncident.id}`}
                  className="w-full rounded-lg bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  Open Full Postmortem Dossier <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEMORY NODE MODAL */}
      {selectedMemoryNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Memory Node: {selectedMemoryNode.memoryId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMemoryNode(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-400">Context Title:</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {selectedMemoryNode.title}
                </div>
              </div>

              <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-4">
                <div className="text-[10px] font-mono uppercase text-purple-300 font-bold mb-1">
                  Learned Organizational Insight
                </div>
                <p className="text-sm text-white italic leading-relaxed">
                  &ldquo;{selectedMemoryNode.learnedInsight}&rdquo;
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Attempted Action:</span>
                  <span className="font-semibold text-white">{selectedMemoryNode.historicalAction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Historical Outcome:</span>
                  <span className={selectedMemoryNode.historicalOutcome.includes("Failed") ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                    {selectedMemoryNode.historicalOutcome}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cosine Similarity:</span>
                  <span className="text-emerald-400 font-mono font-bold">{selectedMemoryNode.similarity}%</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/hindsight"
                  className="w-full rounded-lg bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-200 text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  Explore Vector in Hindsight Explorer <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
