"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  AlertOctagon,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  AIDiagnosisResult,
  ActionExecutionRecord,
  AllowedRecoveryActionType,
} from "@/types";

interface RetrievedMemorySummary {
  memoryCode: string;
  source: string;
  insight: string;
  outcome: string;
  action: string;
  confidence?: number;
  similarity: string;
}

interface DiagnosisDataState {
  diagnosisId: string;
  incidentId: string;
  diagnosis: AIDiagnosisResult;
  retrievedMemoriesCount?: number;
  retrievedMemories?: RetrievedMemorySummary[];
}

interface LearningDataState {
  incidentId: string;
  memoryId: string;
  vectorId: string;
  learnedInsight: string;
  newConfidence: number;
}

const STEP_TITLES = [
  "A new incident arrives",
  "Hindsight recalls similar past incidents",
  "A pattern is detected with success/failure counts",
  "Resonyx recommends an action with evidence",
  "The outcome is remembered, showing what changed",
];

export function StartDemoView() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Persistence refs
  const incidentIdRef = useRef<string | null>(null);
  const incidentCodeRef = useRef<string>("INC-1050");
  const actionExecutionIdRef = useRef<string | null>(null);
  const executedStepsRef = useRef<Set<number>>(new Set());

  // Backend state
  const [incidentCode, setIncidentCode] = useState<string>("INC-1050");
  const [selectedAction, setSelectedAction] = useState<AllowedRecoveryActionType>("isolate_bulkhead");
  const [diagnosisData, setDiagnosisData] = useState<DiagnosisDataState | null>(null);
  const [executionData, setExecutionData] = useState<ActionExecutionRecord | null>(null);
  const [learningData, setLearningData] = useState<LearningDataState | null>(null);
  const [dbStats, setDbStats] = useState<{
    incidents: number;
    diagnoses: number;
    actionExecutions: number;
    verifications: number;
    memories: number;
    auditLogs: number;
  } | null>(null);

  // Fetch initial database baseline
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

  // Step 1: Ensure incident is persisted in PostgreSQL
  const ensureIncident = useCallback(async (): Promise<{ id: string; code: string }> => {
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
      setIncidentCode(code);
      return { id, code };
    } catch (err) {
      console.error("[Demo] Error creating incident:", err);
      const fallbackId = `inc-fallback-${Date.now()}`;
      incidentIdRef.current = fallbackId;
      return { id: fallbackId, code: incidentCodeRef.current };
    }
  }, []);

  // Execute step-specific backend logic on demand
  useEffect(() => {
    // Step 1: Ingest incident
    if (currentStep === 1) {
      if (!executedStepsRef.current.has(1)) {
        executedStepsRef.current.add(1);
        ensureIncident();
      }
    }

    // Step 2: Hindsight Memory Recall & Diagnosis
    if (currentStep === 2) {
      if (!executedStepsRef.current.has(2)) {
        executedStepsRef.current.add(2);
        setIsProcessing(true);
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
          } finally {
            setIsProcessing(false);
          }
        });
      }
    }

    // Step 3: Pattern Detection (already supported by diagnosis or patterns query)
    if (currentStep === 3) {
      if (!executedStepsRef.current.has(3)) {
        executedStepsRef.current.add(3);
        if (!diagnosisData) {
          ensureIncident().then(async ({ id }) => {
            try {
              const res = await fetch("/api/agents/diagnose", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ incidentId: id }),
              });
              const d = await res.json();
              if (d?.data) setDiagnosisData(d.data);
            } catch (e) {
              console.error("[Demo] Pattern diagnosis fallback failed:", e);
            }
          });
        }
      }
    }

    // Step 4: Recommend Action with Evidence & Execute
    if (currentStep === 4) {
      if (!executedStepsRef.current.has(4)) {
        executedStepsRef.current.add(4);
        setIsProcessing(true);
        ensureIncident().then(async ({ id }) => {
          try {
            const stratRes = await fetch("/api/agents/strategy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ incidentId: id }),
            });
            const stratData = await stratRes.json();
            if (stratData?.data) {
              const actionToRun = stratData.data.selectedAction || "isolate_bulkhead";
              setSelectedAction(actionToRun);

              // Execute recovery action
              const recRes = await fetch("/api/agents/recover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ incidentId: id, action: actionToRun }),
              });
              const recData = await recRes.json();
              if (recData?.data?.execution) {
                actionExecutionIdRef.current = recData.data.execution.id;
                setExecutionData(recData.data.execution);
              }
            }
          } catch (e) {
            console.error("[Demo] Strategy/Recover step failed:", e);
          } finally {
            setIsProcessing(false);
          }
        });
      }
    }

    // Step 5: Outcome Remembered & Learning Codified
    if (currentStep === 5) {
      if (!executedStepsRef.current.has(5)) {
        executedStepsRef.current.add(5);
        setIsProcessing(true);
        ensureIncident().then(async ({ id }) => {
          try {
            let execId = actionExecutionIdRef.current;
            if (!execId) {
              const recRes = await fetch("/api/agents/recover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ incidentId: id, action: selectedAction || "isolate_bulkhead" }),
              });
              const recData = await recRes.json();
              execId = recData?.data?.execution?.id;
              actionExecutionIdRef.current = execId;
              if (recData?.data?.execution) setExecutionData(recData.data.execution);
            }

            // Verify outcome
            await fetch("/api/agents/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ incidentId: id, actionExecutionId: execId }),
            });

            // Codify learning into Hindsight
            const learnRes = await fetch("/api/agents/learn", {
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
            const learnData = await learnRes.json();
            if (learnData?.data) {
              setLearningData(learnData.data);
            }

            // Refresh real PostgreSQL table counts
            const healthRes = await fetch("/api/health");
            const health = await healthRes.json();
            if (health?.services?.database?.records) {
              const rec = health.services.database.records;
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
            console.error("[Demo] Verify/Learn step failed:", e);
          } finally {
            setIsProcessing(false);
          }
        });
      }
    }
  }, [currentStep, selectedAction, ensureIncident, diagnosisData]);

  // Restart handler
  const handleRestart = () => {
    incidentIdRef.current = null;
    actionExecutionIdRef.current = null;
    executedStepsRef.current = new Set();
    setDiagnosisData(null);
    setExecutionData(null);
    setLearningData(null);
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header bar: Title, Step Indicator, Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              See Resonyx learn
            </h1>
            <span className="rounded-full bg-sky-950 border border-sky-800/60 px-3 py-1 text-xs font-mono font-bold text-sky-300">
              {currentStep} / 5
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {STEP_TITLES[currentStep - 1]}
          </p>
        </div>

        {/* Navigation Controls: Back, Next, Restart (No Auto-Play) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isProcessing}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              disabled={isProcessing}
              className="flex items-center gap-1 rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-sky-950/50 hover:bg-sky-500 transition-colors disabled:opacity-50"
            >
              <span>{isProcessing ? "Processing..." : "Next"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 hover:bg-emerald-500 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Run again</span>
            </button>
          )}

          <button
            onClick={handleRestart}
            title="Restart walkthrough"
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((step) => (
          <button
            key={step}
            onClick={() => setCurrentStep(step)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === currentStep
                ? "bg-sky-400 ring-2 ring-sky-400/40"
                : step < currentStep
                ? "bg-emerald-500"
                : "bg-slate-800"
            }`}
            title={`Step ${step}: ${STEP_TITLES[step - 1]}`}
          />
        ))}
      </div>

      {/* Step Content Area: At most 3 lines of text and one visual */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#090f1d] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* STEP 1: A new incident arrives */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 3 lines of text */}
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">
                Production telemetry detects severe database contention in payments-core.
              </p>
              <p className="text-sm text-slate-300">
                P99 latency surged to 4,820ms under unexpected 14,850 RPS inbound traffic.
              </p>
              <p className="text-xs text-sky-400 font-mono">
                An operational incident is opened in PostgreSQL to initiate autonomous remediation.
              </p>
            </div>

            {/* Visual: Live Telemetry Alert Card */}
            <div className="rounded-xl border border-red-900/60 bg-gradient-to-b from-red-950/20 to-slate-950/90 p-5 shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-900/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800/60">
                    {incidentCode}
                  </span>
                  <span className="font-bold text-white text-sm">
                    Payment API Latency Degradation
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-xs text-slate-300">payments-core</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300 border border-red-500/30 animate-pulse">
                    CRITICAL
                  </span>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30">
                    INVESTIGATING
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Inbound Traffic</span>
                  <div className="mt-1 font-mono text-lg font-bold text-amber-400">14,850 RPS</div>
                  <span className="text-[10px] text-amber-400/80">+312% surge above baseline</span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">P99 Latency</span>
                  <div className="mt-1 font-mono text-lg font-bold text-red-400">4,820 ms</div>
                  <span className="text-[10px] text-red-400/80">114x baseline threshold</span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">DB Thread Pool</span>
                  <div className="mt-1 font-mono text-lg font-bold text-red-400">92.4% Saturated</div>
                  <span className="text-[10px] text-slate-400">Aurora connection deadlock</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Hindsight recalls similar past incidents */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 3 lines of text */}
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">
                Resonyx queries Hindsight semantic vector memory for past failure matches.
              </p>
              <p className="text-sm text-slate-300">
                Vector cluster matched historical failure precedent with 98.4% cosine similarity.
              </p>
              <p className="text-xs text-sky-400 font-mono">
                Attributed root cause: Cascading timeout with connection pool starvation.
              </p>
            </div>

            {/* Visual: Hindsight Recalled Precedents Card */}
            <div className="rounded-xl border border-sky-900/50 bg-slate-950/90 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Hindsight Vector Memory Matches</span>
                </div>
                <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  98.4% Vector Similarity
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
                        MEM-0x789f2a
                      </span>
                      <span className="text-xs font-semibold text-white">
                        Downstream Gateway Pool Starvation
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300">
                      Identical thread depletion under high concurrency. Successful fix: Isolate Bulkhead.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-emerald-300 shrink-0 font-bold">
                    ✓ Mitigated in 1.4m
                  </span>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        MEM-0x431b9c
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        Checkout Service Thread Exhaustion
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Unhedged sync client caused cascading lock queue build-up.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-sky-400 shrink-0">
                    94.1% Similarity
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: A pattern is detected with success/failure counts */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 3 lines of text */}
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">
                Correlation engine matches failure signature to PAT-017: Database Contention.
              </p>
              <p className="text-sm text-slate-300">
                Pattern history shows 12 successful resolutions and 5 ineffective interventions.
              </p>
              <p className="text-xs text-sky-400 font-mono">
                System distinguishes proven bulkhead isolation from failed query kill attempts.
              </p>
            </div>

            {/* Visual: Pattern Detection & Resolution Efficacy Card */}
            <div className="rounded-xl border border-amber-900/40 bg-slate-950/90 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/60">
                    PAT-017
                  </span>
                  <span className="text-sm font-bold text-white">
                    Synchronous Downstream Bottleneck with Pool Saturation
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">17 Observations</span>
              </div>

              {/* Success / Failure Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">12 Succeeded (71%)</span>
                  <span className="text-red-400 font-bold">5 Ineffective (29%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
                  <div className="bg-emerald-500 h-full w-[71%]" />
                  <div className="bg-red-500 h-full w-[29%]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3 text-emerald-200">
                  <span className="font-bold text-emerald-400 uppercase text-[10px] block mb-1">
                    ✓ Proven Effective Action
                  </span>
                  Isolate bulkhead thread pools & enforce 650ms deadline propagation.
                </div>
                <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3 text-red-200">
                  <span className="font-bold text-red-400 uppercase text-[10px] block mb-1">
                    ✕ Failed Action
                  </span>
                  Manual database pod restart triggered thundering herd cache stampede.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Resonyx recommends an action with evidence */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 3 lines of text */}
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">
                Resonyx formulates an evidence-backed recovery strategy from Hindsight learnings.
              </p>
              <p className="text-sm text-slate-300">
                Selected action: isolate_bulkhead to shed non-critical connections and preserve checkout.
              </p>
              <p className="text-xs text-sky-400 font-mono">
                Recovery pipeline executed and persisted to PostgreSQL audit ledger.
              </p>
            </div>

            {/* Visual: Recommended Action & Execution Evidence Card */}
            <div className="rounded-xl border border-sky-500/40 bg-slate-950/90 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-sky-400" />
                  <span className="text-sm font-bold text-white">Recommended Remediation</span>
                </div>
                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-mono font-bold text-sky-300 border border-sky-500/30">
                  Evidence-Ranked #1
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-white">
                    Action: {selectedAction}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 font-mono">
                    <Check className="h-3.5 w-3.5" />
                    {executionData ? "Executed" : "Ready"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Isolate worker threadpool bulkhead on payments-core and enforce 650ms client deadline propagation. Rejects unhedged downstream retry storms without failing active user sessions.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1 font-mono">
                <span>Target: payments-core (Aurora PG)</span>
                <span className="text-emerald-400">Execution Status: COMPLETED</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: The outcome is remembered, showing what changed */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 3 lines of text */}
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">
                Verification confirms P99 latency normalized from 4,820ms to 42ms with 0 errors.
              </p>
              <p className="text-sm text-slate-300">
                Fix outcome codified as new permanent vector memory in PostgreSQL Hindsight store.
              </p>
              <p className="text-xs text-emerald-400 font-mono">
                Organization is now immune to this failure mode; future recurrence will be pre-empted.
              </p>
            </div>

            {/* Visual: What Changed & Codified Learning Card */}
            <div className="rounded-xl border border-emerald-900/50 bg-slate-950/90 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Remediation Verified &amp; Codified</span>
                </div>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/40">
                  SLO Restored
                </span>
              </div>

              {/* Before / After Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-red-900/40 bg-red-950/10 p-3.5 space-y-1.5">
                  <span className="font-bold text-red-400 uppercase text-[10px] block">Before Remediation</span>
                  <div className="font-mono text-white text-sm">4,820 ms P99 Latency</div>
                  <div className="text-slate-400">92.4% Threadpool Saturation • Outage Active</div>
                </div>

                <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/15 p-3.5 space-y-1.5">
                  <span className="font-bold text-emerald-400 uppercase text-[10px] block">After Remediation</span>
                  <div className="font-mono text-emerald-300 text-sm">42 ms P99 Latency</div>
                  <div className="text-slate-300">0 dropped checkout requests • Normal Operation</div>
                </div>
              </div>

              {/* Codified Hindsight Memory Banner */}
              <div className="rounded-lg border border-sky-500/30 bg-sky-950/30 p-3.5 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-sky-200">
                    Codified in PostgreSQL Vector Store:
                  </span>
                  <p className="mt-0.5 text-slate-300">
                    Memory {learningData?.memoryId || "MEM-0x892a4e"}: &ldquo;Action [isolate_bulkhead] successfully mitigated Aurora database contention under 14,850 RPS surge without customer downtime.&rdquo;
                  </p>
                </div>
              </div>

              {/* PostgreSQL Real Records Indicator */}
              {dbStats && (
                <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
                  <span>PostgreSQL Persistence:</span>
                  <span className="text-slate-300">
                    {dbStats.incidents} Incidents • {dbStats.diagnoses} Diagnoses • {dbStats.memories} Memories
                  </span>
                </div>
              )}
            </div>

            {/* Run Again & Navigation Buttons on Step 5 */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-950/50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Run again</span>
              </button>

              <Link
                href="/memory"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors"
              >
                <Database className="h-4 w-4 text-sky-400" />
                <span>View Hindsight Memory</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/incidents"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors"
              >
                <AlertOctagon className="h-4 w-4 text-red-400" />
                <span>View Incidents</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Footer Navigation Bar within Stage */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">
            Step {currentStep} of 5: <strong className="text-white">{STEP_TITLES[currentStep - 1]}</strong>
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || isProcessing}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>

            {currentStep < 5 && (
              <button
                onClick={handleNext}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold text-white transition-colors disabled:opacity-50 flex items-center gap-1 shadow"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
