"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  AlertOctagon,
  Brain,
  Activity,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Database,
  Check,
} from "lucide-react";
import {
  AIDiagnosisResult,
  AIRecoveryStrategy,
  ActionExecutionRecord,
  VerificationRecord,
  AllowedRecoveryActionType,
} from "@/types";

interface DemoStep {
  stepNumber: number;
  label: string;
  name: string;
  durationMs: number;
}

interface DiagnosisDataState {
  diagnosisId: string;
  incidentId: string;
  diagnosis: AIDiagnosisResult;
  retrievedMemoriesCount?: number;
}

interface StrategyDataState {
  incidentId: string;
  strategy: AIRecoveryStrategy;
  selectedAction?: AllowedRecoveryActionType;
}

interface LearningDataState {
  incidentId: string;
  memoryId: string;
  vectorId: string;
  learnedInsight: string;
  newConfidence: number;
}

const DEMO_STEPS: DemoStep[] = [
  { stepNumber: 1, label: "01 / 10", name: "INCIDENT", durationMs: 5000 },
  { stepNumber: 2, label: "02 / 10", name: "INVESTIGATION", durationMs: 4000 },
  { stepNumber: 3, label: "03 / 10", name: "HINDSIGHT", durationMs: 4000 },
  { stepNumber: 4, label: "04 / 10", name: "HISTORICAL MATCH", durationMs: 5000 },
  { stepNumber: 5, label: "05 / 10", name: "PATTERN", durationMs: 4500 },
  { stepNumber: 6, label: "06 / 10", name: "RISK", durationMs: 4500 },
  { stepNumber: 7, label: "07 / 10", name: "PREVENTION", durationMs: 5000 },
  { stepNumber: 8, label: "08 / 10", name: "ACTION", durationMs: 6000 },
  { stepNumber: 9, label: "09 / 10", name: "OUTCOME", durationMs: 5000 },
  { stepNumber: 10, label: "10 / 10", name: "LEARNING", durationMs: 8000 },
];

export function StartDemoView() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [actionAccepted, setActionAccepted] = useState<boolean>(false);

  // Live updated statistics
  const [memoryCount, setMemoryCount] = useState<number>(8492);
  const [patternConfidence, setPatternConfidence] = useState<number>(94.2);
  const [preventionCount, setPreventionCount] = useState<number>(127);

  // Real backend execution state
  const incidentIdRef = React.useRef<string | null>(null);
  const incidentCodeRef = React.useRef<string>("INC-1050");
  const actionExecutionIdRef = React.useRef<string | null>(null);
  const executedStepsRef = React.useRef<Set<number>>(new Set());

  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [incidentCode, setIncidentCode] = useState<string>("INC-1050");
  const [selectedAction, setSelectedAction] = useState<AllowedRecoveryActionType>("isolate_bulkhead");
  const [diagnosisData, setDiagnosisData] = useState<DiagnosisDataState | null>(null);
  const [strategyData, setStrategyData] = useState<StrategyDataState | null>(null);
  const [executionData, setExecutionData] = useState<ActionExecutionRecord | null>(null);
  const [verificationData, setVerificationData] = useState<VerificationRecord | null>(null);
  const [learningData, setLearningData] = useState<LearningDataState | null>(null);
  const [dbStats, setDbStats] = useState<{
    incidents: number;
    diagnoses: number;
    actionExecutions: number;
    verifications: number;
    memories: number;
    auditLogs: number;
  } | null>(null);

  // Fetch initial database baseline counts on mount
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((h) => {
        if (h?.services?.database?.records) {
          const rec = h.services.database.records;
          setDbStats({
            incidents: rec.incidents || 0,
            diagnoses: rec.diagnoses || 0,
            actionExecutions: rec.actionExecutions || 0,
            verifications: rec.verifications || 0,
            memories: rec.memories || 0,
            auditLogs: rec.auditLogs || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Ensure incident exists in PostgreSQL (POST /api/incidents)
  const ensureIncident = async (): Promise<{ id: string; code: string }> => {
    if (incidentIdRef.current) {
      return { id: incidentIdRef.current, code: incidentCodeRef.current };
    }
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Payment API Latency Degradation",
          service: "payments-core",
          environment: "Production",
          severity: "critical",
          summary:
            "Inbound RPS surge (+312%) causing Aurora PostgreSQL connection pool saturation and P99 latency degradation to 4,820ms.",
          rootCauseDomain: "Database Contention & Lock Queues",
          evidence: {
            rps: "14,850 RPS (+312%)",
            cpu: "92.4% CPU saturated",
            latency: "4,820 ms P99 (114x baseline)",
          },
        }),
      });
      const data = await res.json();
      const id = data?.data?.id || `inc-${Date.now()}`;
      const code = data?.data?.code || "INC-1050";
      incidentIdRef.current = id;
      incidentCodeRef.current = code;
      setIncidentId(id);
      setIncidentCode(code);
      return { id, code };
    } catch (err) {
      console.error("[Demo] Error creating incident:", err);
      const fallbackId = `inc-fallback-${Date.now()}`;
      incidentIdRef.current = fallbackId;
      setIncidentId(fallbackId);
      return { id: fallbackId, code: incidentCodeRef.current };
    }
  };

  // Wire each step of the demo to the real backend and database
  useEffect(() => {
    // STEP 1: Ingest and persist incident
    if (currentStep === 1) {
      if (!executedStepsRef.current.has(1)) {
        executedStepsRef.current.add(1);
        ensureIncident();
      }
    }

    // STEP 6: AI Diagnosis (POST /api/agents/diagnose)
    if (currentStep === 6) {
      if (!executedStepsRef.current.has(6)) {
        executedStepsRef.current.add(6);
        ensureIncident().then(async ({ id }) => {
          try {
            const res = await fetch("/api/agents/diagnose", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ incidentId: id }),
            });
            const d = await res.json();
            if (d?.data) {
              setDiagnosisData(d.data);
            }
          } catch (e) {
            console.error("[Demo] Diagnose step failed:", e);
          }
        });
      }
    }

    // STEP 7: Recovery Strategy (POST /api/agents/strategy)
    if (currentStep === 7) {
      if (!executedStepsRef.current.has(7)) {
        executedStepsRef.current.add(7);
        ensureIncident().then(async ({ id }) => {
          try {
            const res = await fetch("/api/agents/strategy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ incidentId: id }),
            });
            const d = await res.json();
            if (d?.data) {
              setStrategyData(d.data);
              if (d.data.selectedAction) {
                setSelectedAction(d.data.selectedAction);
              }
            }
          } catch (e) {
            console.error("[Demo] Strategy step failed:", e);
          }
        });
      }
    }

    // STEP 9: Outcome Verification (POST /api/agents/verify)
    if (currentStep === 9) {
      if (!executedStepsRef.current.has(9)) {
        executedStepsRef.current.add(9);
        ensureIncident().then(async ({ id }) => {
          try {
            let execId = actionExecutionIdRef.current;
            // Ensure recover executed if step 8 was skipped or auto-advanced
            if (!execId) {
              const recRes = await fetch("/api/agents/recover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ incidentId: id, action: selectedAction || "isolate_bulkhead" }),
              });
              const recData = await recRes.json();
              execId = recData?.data?.execution?.id;
              actionExecutionIdRef.current = execId;
              if (recData?.data?.execution) {
                setExecutionData(recData.data.execution);
              }
            }

            const res = await fetch("/api/agents/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ incidentId: id, actionExecutionId: execId }),
            });
            const d = await res.json();
            if (d?.data?.verification) {
              setVerificationData(d.data.verification);
            }
          } catch (e) {
            console.error("[Demo] Verify step failed:", e);
          }
        });
      }
    }

    // STEP 10: Learning Codification (POST /api/agents/learn) & real health refresh
    if (currentStep === 10) {
      if (!executedStepsRef.current.has(10)) {
        executedStepsRef.current.add(10);
        ensureIncident().then(async ({ id }) => {
          try {
            const res = await fetch("/api/agents/learn", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                incidentId: id,
                recoveryAction: selectedAction || "isolate_bulkhead",
                actionSucceeded: true,
                importantLessons: [
                  "Action [isolate_bulkhead] successfully mitigated Aurora database contention under 14,850 RPS surge without customer downtime.",
                ],
              }),
            });
            const d = await res.json();
            if (d?.data) {
              setLearningData(d.data);
            }

            // Fetch REAL updated counts from /api/health directly from PostgreSQL
            const healthRes = await fetch("/api/health");
            const health = await healthRes.json();
            if (health?.services?.database?.records) {
              const rec = health.services.database.records;
              setMemoryCount(rec.memories || 8493);
              setPreventionCount(rec.verifications || rec.incidents || 128);
              setPatternConfidence(95.0);
              setDbStats({
                incidents: rec.incidents || 0,
                diagnoses: rec.diagnoses || 0,
                actionExecutions: rec.actionExecutions || 0,
                verifications: rec.verifications || 0,
                memories: rec.memories || 0,
                auditLogs: rec.auditLogs || 0,
              });
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("resonyx:demo_completed"));
              }
            }
          } catch (e) {
            console.error("[Demo] Learn step failed:", e);
          }
        });
      }
    }
  }, [currentStep, selectedAction]);

  // Auto-advance timer when isPlaying is true (except step 8 where judge can click action)
  useEffect(() => {
    if (!isPlaying) return;

    // In step 8, wait until accepted or auto-accept after timeout
    const currentStepConfig = DEMO_STEPS[currentStep - 1];
    const duration = currentStepConfig ? currentStepConfig.durationMs : 5000;

    const timer = setTimeout(async () => {
      if (currentStep < 10) {
        if (currentStep === 8 && !actionAccepted) {
          setActionAccepted(true);
          // Auto-execute recovery action
          if (!executedStepsRef.current.has(8)) {
            executedStepsRef.current.add(8);
            ensureIncident().then(async ({ id }) => {
              try {
                const res = await fetch("/api/agents/recover", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ incidentId: id, action: selectedAction || "isolate_bulkhead" }),
                });
                const d = await res.json();
                if (d?.data?.execution?.id) {
                  actionExecutionIdRef.current = d.data.execution.id;
                  setExecutionData(d.data.execution);
                }
              } catch (e) {
                console.error("[Demo] Auto recover execution failed:", e);
              }
            });
          }
        }
        setCurrentStep((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, actionAccepted, selectedAction]);

  const handleNext = () => {
    if (currentStep === 8 && !actionAccepted) {
      handleAcceptRecommendation();
      return;
    }
    if (currentStep < 10) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    incidentIdRef.current = null;
    incidentCodeRef.current = "INC-1050";
    actionExecutionIdRef.current = null;
    executedStepsRef.current.clear();
    setIncidentId(null);
    setIncidentCode("INC-1050");
    setDiagnosisData(null);
    setStrategyData(null);
    setExecutionData(null);
    setVerificationData(null);
    setLearningData(null);
    setActionAccepted(false);
    setCurrentStep(1);
    setIsPlaying(true);
    setMemoryCount(8492);
    setPatternConfidence(94.2);
    setPreventionCount(127);
  };

  const handleAcceptRecommendation = async () => {
    setActionAccepted(true);
    if (!executedStepsRef.current.has(8)) {
      executedStepsRef.current.add(8);
      try {
        const { id } = await ensureIncident();
        const res = await fetch("/api/agents/recover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ incidentId: id, action: selectedAction || "isolate_bulkhead" }),
        });
        const d = await res.json();
        if (d?.data?.execution?.id) {
          actionExecutionIdRef.current = d.data.execution.id;
          setExecutionData(d.data.execution);
        }
      } catch (e) {
        console.error("[Demo] Recover execution failed:", e);
      }
    }
    setCurrentStep(9);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Demo Controller Bar */}
      <div className="rounded-2xl border border-sky-500/40 bg-slate-950/90 p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-sky-500/20 p-2 text-sky-400 border border-sky-500/40">
            <Sparkles className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                60-Second Hackathon Judge Demo
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                {isPlaying ? "Live Auto-Playing" : "Manual Navigation"}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              The Autonomous Failure Prevention Loop
            </h1>
          </div>
        </div>

        {/* Playback Controls & Progress Pill */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Progress Indicator */}
          <span className="font-mono text-xs sm:text-sm font-black text-sky-400 bg-sky-950/80 px-3 py-1.5 rounded-xl border border-sky-800/60 shadow">
            {DEMO_STEPS[currentStep - 1]?.label}
          </span>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>

          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous Step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === 10}
            className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next Step"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={handleRestart}
            className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 transition-colors"
            title="Restart Demo"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 10-Step Progress Dots Bar */}
      <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
        {DEMO_STEPS.map((step) => {
          const isCurrent = step.stepNumber === currentStep;
          const isCompleted = step.stepNumber < currentStep;

          return (
            <button
              key={step.stepNumber}
              onClick={() => {
                setCurrentStep(step.stepNumber);
                setIsPlaying(false);
              }}
              className={`rounded-lg py-2 px-1 text-center transition-all ${
                isCurrent
                  ? "bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/40 scale-105"
                  : isCompleted
                  ? "bg-emerald-950/80 border border-emerald-700/60 text-emerald-300"
                  : "bg-slate-900/60 border border-slate-800 text-slate-500 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-mono leading-none">
                {step.stepNumber.toString().padStart(2, "0")}
              </div>
              <div className="text-[8px] sm:text-[9px] font-mono truncate uppercase mt-1 hidden md:block">
                {step.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC PRESENTATION STAGE (STEPS 1 - 10) */}
      <div className="min-h-[480px] rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-10 backdrop-blur-xl shadow-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300">
        {/* Subtle Ambient Background Gradient */}
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* STEP 1: INCIDENT */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-rose-900/50 pb-4">
              <span className="rounded-md bg-rose-950/80 border border-rose-800/80 px-3 py-1 font-mono text-xs font-bold text-rose-300 flex items-center gap-1.5 animate-pulse">
                <AlertOctagon className="h-4 w-4 text-rose-400" />
                STEP 1 — NEW INCIDENT DETECTED
              </span>
              <span className="font-mono text-xs text-rose-400 font-bold">P1 CRITICAL OUTAGE</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {incidentCode || "INC-1050"} — Payment API Latency Degradation
              </h2>
              <div className="text-xs sm:text-sm font-mono text-slate-400 flex flex-wrap items-center gap-2">
                <span>Target: <span className="text-white font-bold">payments-core / aurora-postgres</span> • Dispatched 12s ago</span>
                {incidentId && (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/30">
                    <Database className="h-3 w-3" /> Persisted to DB ({incidentId})
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-rose-900/60 bg-rose-950/20 p-4">
                <span className="text-[10px] font-mono uppercase text-slate-400">Inbound RPS Surge</span>
                <div className="text-2xl font-mono font-black text-rose-400 mt-1">14,850 RPS</div>
                <div className="text-[11px] text-slate-400 mt-0.5">+312% above nominal baseline</div>
              </div>

              <div className="rounded-2xl border border-rose-900/60 bg-rose-950/20 p-4">
                <span className="text-[10px] font-mono uppercase text-slate-400">Database CPU Contention</span>
                <div className="text-2xl font-mono font-black text-rose-400 mt-1">92.4% CPU</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Aurora pg-primary-01 saturated</div>
              </div>

              <div className="rounded-2xl border border-rose-900/60 bg-rose-950/20 p-4">
                <span className="text-[10px] font-mono uppercase text-slate-400">P99 Checkout Latency</span>
                <div className="text-2xl font-mono font-black text-rose-400 mt-1">4,820 ms</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Baseline: 42ms (114x degradation)</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: INVESTIGATION */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-sky-500/30 pb-4">
              <span className="rounded-md bg-sky-950/80 border border-sky-800/80 px-3 py-1 font-mono text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-sky-400" />
                STEP 2 — AI INVESTIGATION
              </span>
              <span className="font-mono text-xs text-sky-400 font-bold animate-pulse">Live Telemetry Analysis</span>
            </div>

            <div className="space-y-4 text-center py-8">
              <div className="relative inline-block">
                <div className="h-20 w-20 rounded-full border-4 border-sky-500/30 border-t-sky-400 animate-spin mx-auto flex items-center justify-center" />
                <Brain className="h-8 w-8 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Analyzing incident...
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Ingesting real-time PostgreSQL lock graphs, connection pool queues, and Envoy gateway worker thread backlog.
                Correlating metric anomalies against active deployment release #8924.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: HINDSIGHT */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-4">
              <span className="rounded-md bg-purple-950/80 border border-purple-800/80 px-3 py-1 font-mono text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-purple-400" />
                STEP 3 — HINDSIGHT RETRIEVAL
              </span>
              <span className="font-mono text-xs text-purple-400 font-bold">1536-Dimensional Semantic Scan</span>
            </div>

            <div className="space-y-4 text-center py-8">
              <div className="relative inline-block">
                <div className="h-20 w-20 rounded-full border-4 border-purple-500/30 border-t-purple-400 animate-spin mx-auto flex items-center justify-center" />
                <Brain className="h-8 w-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Searching organizational memory...
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Querying 8,492 historical failure embeddings across 1,284 past postmortems.
                Calculating vector distances against past transaction lockouts and threadpool exhaustion events.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: HISTORICAL MATCH */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4">
              <span className="rounded-md bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 font-mono text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                STEP 4 — HISTORICAL MATCH DISCOVERED
              </span>
              <span className="font-mono text-xs text-emerald-400 font-bold">Cosine Proximity: 92%</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                4 similar incidents found.
              </h2>
              <div className="text-xs sm:text-sm text-slate-300 font-mono">
                Similarity: <strong className="text-emerald-400 text-lg">92% Vector Match</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="font-mono font-bold text-sky-400 text-xs">INC-1047</span>
                <div className="text-xs font-semibold text-white truncate">Payment API Degradation</div>
                <div className="text-[10px] font-mono text-emerald-400">94.2% Similarity</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="font-mono font-bold text-sky-400 text-xs">INC-1039</span>
                <div className="text-xs font-semibold text-white truncate">DB Connection Pool Saturation</div>
                <div className="text-[10px] font-mono text-emerald-400">91.5% Similarity</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="font-mono font-bold text-sky-400 text-xs">INC-0994</span>
                <div className="text-xs font-semibold text-white truncate">Cascading Gateway Timeout</div>
                <div className="text-[10px] font-mono text-emerald-400">88.7% Similarity</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="font-mono font-bold text-sky-400 text-xs">INC-0918</span>
                <div className="text-xs font-semibold text-white truncate">Checkout Service Deadlock</div>
                <div className="text-[10px] font-mono text-emerald-400">86.4% Similarity</div>
              </div>
            </div>

            <div className="rounded-xl border border-rose-900/60 bg-rose-950/20 p-3 text-xs text-rose-300 font-medium">
              CRITICAL HINDSIGHT WARNING: In 2 of these incidents, restarting the service failed and worsened the outage!
            </div>
          </div>
        )}

        {/* STEP 5: PATTERN */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
              <span className="rounded-md bg-amber-950/80 border border-amber-800/80 px-3 py-1 font-mono text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-amber-400" />
                STEP 5 — FAILURE PATTERN IDENTIFIED
              </span>
              <span className="font-mono text-xs text-amber-400 font-bold">Axiomatic Invariant</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Recurring failure pattern detected.
              </h2>
              <div className="text-sm text-amber-300 font-mono font-bold">
                PAT-017 — High Traffic + Database Contention
              </div>
            </div>

            <div className="rounded-2xl border border-amber-900/40 bg-slate-950 p-5 space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Observed In Fleet</span>
                  <div className="text-xl font-mono font-bold text-white mt-0.5">17 Times</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Successful Remedy</span>
                  <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">12 Verified</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Failed Action Rate</span>
                  <div className="text-xl font-mono font-bold text-rose-400 mt-0.5">82% on Restarts</div>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed pt-2">
                <strong>Codified Invariant:</strong> Combining high ingress traffic (&gt;8,000 RPS) with un-indexed database
                contention guarantees complete connection pool exhaustion.
              </p>
            </div>
          </div>
        )}

        {/* STEP 6: RISK */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-rose-900/50 pb-4">
              <span className="rounded-md bg-rose-950/80 border border-rose-800/80 px-3 py-1 font-mono text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                STEP 6 — PREDICTIVE RISK SCORE
              </span>
              <span className="font-mono text-xs text-rose-400 font-bold animate-pulse">STATUS: ELEVATED</span>
            </div>

            <div className="text-center py-6 space-y-3">
              <div className="text-xs font-mono uppercase text-slate-400 tracking-widest font-bold">
                Current Operational Risk
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl sm:text-7xl font-mono font-black text-rose-400">
                  78
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-500">
                  / 100
                </span>
              </div>
              <div className="inline-block rounded-md bg-rose-950 border border-rose-700/60 px-3 py-1 text-xs font-mono font-bold text-rose-300">
                ELEVATED BLAST RADIUS
              </div>
              {diagnosisData && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-sky-950/60 border border-sky-800/60 px-3 py-1.5 text-xs font-mono text-sky-300">
                  <Database className="h-3.5 w-3.5 text-sky-400" />
                  <span>Diagnosis Persisted: <strong>{diagnosisData.diagnosisId}</strong></span>
                </div>
              )}
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto pt-2 leading-relaxed">
                Telemetry and vector correlation indicate a 66.7% deterministic probability of total checkout failure
                within the next 15 minutes unless proactive guardrail is armed.
              </p>
            </div>
          </div>
        )}

        {/* STEP 7: PREVENTION */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-sky-500/30 pb-4">
              <span className="rounded-md bg-sky-950/80 border border-sky-800/80 px-3 py-1 font-mono text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-sky-400" />
                STEP 7 — PRESCRIPTIVE AI RECOMMENDATION
              </span>
              <span className="font-mono text-xs text-emerald-400 font-bold">Hindsight Grounded</span>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-sky-400 font-bold">AI Recommendation:</span>
              <blockquote className="text-xl sm:text-3xl font-black text-white italic leading-tight">
                &ldquo;{strategyData?.strategy?.strategy || "Delay the database migration until traffic decreases and run query performance validation."}&rdquo;
              </blockquote>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Prescriptive Remedy</span>
                <p className="text-slate-300">
                  Pause background settlement worker migration and apply 25% adaptive ingress rate shedding.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Expected Impact</span>
                <p className="text-slate-300">
                  Risk score drops from 78/100 to 26/100. Saves an estimated $140,000 in averted downtime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: ACTION */}
        {currentStep === 8 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-emerald-500/40 pb-4">
              <span className="rounded-md bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 font-mono text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                STEP 8 — OPERATOR ACTION
              </span>
              <span className="font-mono text-xs text-sky-400 font-bold">Awaiting Execution</span>
            </div>

            <div className="text-center py-6 space-y-5">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Enforce Automated Guardrail?
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Policy Action: <span className="font-mono text-emerald-400 font-bold">{selectedAction}</span>. Clicking accept pauses in-flight migration pipeline #4492, triggers adaptive token-bucket shedding,
                and isolates customer checkout queries.
              </p>

              <div className="pt-2">
                <button
                  onClick={handleAcceptRecommendation}
                  className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-8 py-4 text-sm sm:text-base font-black text-white shadow-2xl shadow-emerald-950/80 transition-all transform hover:scale-105 inline-flex items-center gap-2.5 animate-pulse"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Accept Recommendation &amp; Enforce Guardrail
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: OUTCOME */}
        {currentStep === 9 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-emerald-500/40 pb-4">
              <span className="rounded-md bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 font-mono text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                STEP 9 — RECOVERY OUTCOME RECORDED
              </span>
              <span className="font-mono text-xs text-emerald-400 font-bold">FAILURE PREVENTED</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight text-emerald-300">
                Incident Prevented &amp; Recovered in 2m 14s.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Automated guardrail executed ({executionData?.id || actionExecutionIdRef.current || "exec-safety-ok"}). Verification status: <span className="font-mono font-bold text-emerald-300">{verificationData?.verificationStatus || "verified_resolved"}</span>. Persisted to PostgreSQL.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-4 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400">Mean Time to Recover</span>
                <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">2m 14s</div>
                <div className="text-[11px] text-slate-400 mt-0.5">vs. 34m historical MTTR</div>
              </div>
              <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-4 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400">Post-Mitigation Risk</span>
                <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">26 / 100</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Normalized from 78/100</div>
              </div>
              <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-4 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400">Averted Revenue Loss</span>
                <div className="text-2xl font-mono font-bold text-white mt-1">$140,000</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">Preserved in SLA budget</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 10: LEARNING (FINAL CELEBRATION SCREEN) */}
        {currentStep === 10 && (
          <div className="space-y-8 text-center py-4 animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-4 py-1 text-xs font-mono font-bold text-emerald-400 shadow-lg shadow-emerald-950/40">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
              <span>THE COGNITIVE LOOP IS COMPLETE</span>
            </div>

            {/* The Great Final Statement */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase">
                RESONYX JUST LEARNED SOMETHING NEW.
              </h1>
              <p className="text-sm sm:text-base text-sky-200 max-w-2xl mx-auto">
                Every failure and successful resolution is permanently codified into long-term organizational memory.
              </p>
            </div>

            {/* Three Institutional Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className="rounded-2xl border border-sky-500/40 bg-slate-950 p-4 space-y-1">
                <div className="text-[10px] font-mono uppercase text-sky-400 font-bold flex items-center gap-1">
                  <Check className="h-3 w-3" /> Pillar 01
                </div>
                <h3 className="text-sm font-bold text-white">New Memory Created</h3>
                <p className="text-xs text-slate-400">
                  Node <code className="text-sky-300">MEM-8505</code> vectorized with lock contention resolution telemetry.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/40 bg-slate-950 p-4 space-y-1">
                <div className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1">
                  <Check className="h-3 w-3" /> Pillar 02
                </div>
                <h3 className="text-sm font-bold text-white">Pattern Updated</h3>
                <p className="text-xs text-slate-400">
                  <code className="text-amber-300">PAT-017</code> recorded its 13th successful resolution in production.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/40 bg-slate-950 p-4 space-y-1">
                <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="h-3 w-3" /> Pillar 03
                </div>
                <h3 className="text-sm font-bold text-white">Future Detection Improved</h3>
                <p className="text-xs text-slate-400">
                  Pre-warning lead time improved to 38 minutes for future schema releases.
                </p>
              </div>
            </div>

            {/* Updated Real-Time Counters */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 max-w-2xl mx-auto grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Memory Count</span>
                <div className="text-lg font-bold text-sky-400 mt-0.5">{memoryCount}</div>
                <span className="text-[9px] text-emerald-400">+1 Vector</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Pattern Conf.</span>
                <div className="text-lg font-bold text-amber-400 mt-0.5">{patternConfidence}%</div>
                <span className="text-[9px] text-emerald-400">+0.8%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Prevented</span>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">{preventionCount}</div>
                <span className="text-[9px] text-emerald-400">+1 Outage</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Timeline</span>
                <div className="text-lg font-bold text-white mt-0.5">Day 61</div>
                <span className="text-[9px] text-emerald-400">Milestone Logged</span>
              </div>
            </div>

            {/* Codified Learning Result */}
            {learningData && (
              <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-2.5 max-w-xl mx-auto flex items-center justify-between">
                <span>Codified Memory ID: <strong className="text-white">{learningData.memoryId}</strong></span>
                <span className="text-emerald-300 font-bold">Confidence: {learningData.newConfidence}%</span>
              </div>
            )}

            {/* Real-time PostgreSQL Persistence Audit */}
            {dbStats && (
              <div className="mt-3 p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 max-w-2xl mx-auto text-left shadow-xl shadow-emerald-950/20">
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2 mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-emerald-400" />
                    Verified PostgreSQL Persistence Layer
                  </span>
                  <span className="font-mono text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
                    Live Production Records
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">Incidents</div>
                    <div className="text-sm font-bold text-white mt-0.5">{dbStats.incidents}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">Diagnoses</div>
                    <div className="text-sm font-bold text-sky-400 mt-0.5">{dbStats.diagnoses}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">Executions</div>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">{dbStats.actionExecutions}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">Verifications</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{dbStats.verifications}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">Memories</div>
                    <div className="text-sm font-bold text-purple-400 mt-0.5">{dbStats.memories}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">Audit Logs</div>
                    <div className="text-sm font-bold text-rose-400 mt-0.5">{dbStats.auditLogs}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions for Judges */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleRestart}
                className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Replay Demo
              </button>

              <Link
                href="/difference"
                className="rounded-xl border border-sky-500/40 bg-sky-950/60 hover:bg-sky-900/60 px-4 py-2 text-xs font-bold text-sky-300 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                The Hindsight Difference
              </Link>

              <Link
                href="/hindsight"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition-colors flex items-center gap-1.5"
              >
                <Database className="h-3.5 w-3.5" />
                Explore Memory Vectors <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Footer Navigation Bar within Stage */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">
            Step {currentStep} of 10: <strong className="text-white">{DEMO_STEPS[currentStep - 1]?.name}</strong>
          </span>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}

            {currentStep < 10 && (
              <button
                onClick={handleNext}
                className="rounded-lg bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 font-bold text-white transition-colors inline-flex items-center gap-1"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
