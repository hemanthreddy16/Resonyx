"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  Brain,
  ShieldCheck,
  Activity,
  Terminal,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Layers,
  Check,
  ChevronRight,
} from "lucide-react";
import { SIMULATION_SCENARIOS, SimulationScenarioConfig } from "@/data/mockSimulations";

type SimulationStage =
  | "idle"
  | "analyzing"
  | "searching_memory"
  | "comparing_incidents"
  | "pattern_detected"
  | "generating_recommendation"
  | "ready"
  | "accepted";

const PROCESSING_STEPS = [
  { stage: "analyzing", label: "Analyzing incident...", sub: "Ingesting real-time metrics, lock wait depth, and ingress RPS..." },
  { stage: "searching_memory", label: "Searching organizational memory...", sub: "Querying 8,492 Hindsight vector embeddings in 1536-dim space..." },
  { stage: "comparing_incidents", label: "Comparing historical incidents...", sub: "Computing cosine similarities across past production postmortems..." },
  { stage: "pattern_detected", label: "Pattern detected...", sub: "Matching topological invariants against 43 catalogued failure patterns..." },
  { stage: "generating_recommendation", label: "Generating recommendation...", sub: "Synthesizing causal prevention playbook and blast radius reduction..." },
];

export function IncidentSimulatorView() {
  const [selectedKey, setSelectedKey] = useState<string>("payment");
  const [stage, setStage] = useState<SimulationStage>("ready");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(4);
  const [progressPercent, setProgressPercent] = useState<number>(100);

  // Live updated statistics
  const [kpiState, setKpiState] = useState({
    activeIncidents: 1,
    preventedFailures: 127,
    savedCapitalM: 1.84,
    memoryCount: 8492,
  });

  const simIncidentIdRef = React.useRef<string | null>(null);

  // Fetch real stats on mount
  React.useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((h) => {
        if (h?.services?.database?.records) {
          const rec = h.services.database.records;
          setKpiState((prev) => ({
            ...prev,
            memoryCount: rec.memories || prev.memoryCount,
            preventedFailures: rec.verifications || prev.preventedFailures,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const scenario: SimulationScenarioConfig = SIMULATION_SCENARIOS[selectedKey] || SIMULATION_SCENARIOS.payment;

  // Run the phased simulation sequence with realistic timers and real backend persistence
  const runSimulation = (key: string) => {
    setSelectedKey(key);
    setStage("analyzing");
    setCurrentStepIndex(0);
    setProgressPercent(15);
    setKpiState((prev) => ({ ...prev, activeIncidents: 1 }));

    const scen = SIMULATION_SCENARIOS[key] || SIMULATION_SCENARIOS.payment;

    // Ingest incident into PostgreSQL in background
    fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: scen.incidentTitle,
        service: scen.service,
        environment: "Production",
        severity: scen.severity.toLowerCase(),
        summary: scen.initialTelemetry.description,
        rootCauseDomain: scen.patternName,
        evidence: {
          metrics: scen.initialTelemetry.spikeValue,
        },
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.id) {
          simIncidentIdRef.current = d.data.id;
          // Trigger diagnosis
          fetch("/api/agents/diagnose", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ incidentId: d.data.id }),
          }).catch(() => {});
        }
      })
      .catch((e) => console.error("[Simulator] Incident creation failed:", e));

    // Step 1 -> Step 2
    setTimeout(() => {
      setStage("searching_memory");
      setCurrentStepIndex(1);
      setProgressPercent(35);
    }, 700);

    // Step 2 -> Step 3
    setTimeout(() => {
      setStage("comparing_incidents");
      setCurrentStepIndex(2);
      setProgressPercent(60);
    }, 1400);

    // Step 3 -> Step 4
    setTimeout(() => {
      setStage("pattern_detected");
      setCurrentStepIndex(3);
      setProgressPercent(80);
    }, 2100);

    // Step 4 -> Step 5
    setTimeout(() => {
      setStage("generating_recommendation");
      setCurrentStepIndex(4);
      setProgressPercent(95);
    }, 2700);

    // Step 5 -> Ready
    setTimeout(() => {
      setStage("ready");
      setProgressPercent(100);
    }, 3400);
  };

  // When user clicks "Accept Recommendation"
  const handleAccept = async () => {
    setStage("accepted");
    const incId = simIncidentIdRef.current;

    if (incId) {
      try {
        // Execute recovery
        const recRes = await fetch("/api/agents/recover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ incidentId: incId, action: "isolate_bulkhead" }),
        });
        const recData = await recRes.json();
        const execId = recData?.data?.execution?.id;

        // Verify
        await fetch("/api/agents/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ incidentId: incId, actionExecutionId: execId }),
        });

        // Learn
        await fetch("/api/agents/learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incidentId: incId,
            recoveryAction: "isolate_bulkhead",
            actionSucceeded: true,
            importantLessons: [
              `Mitigated ${scenario.incidentTitle} using isolated bulkhead guardrail under high load.`,
            ],
          }),
        });

        // Refresh counts
        const healthRes = await fetch("/api/health");
        const health = await healthRes.json();
        if (health?.services?.database?.records) {
          const rec = health.services.database.records;
          setKpiState((prev) => ({
            ...prev,
            activeIncidents: 0,
            preventedFailures: rec.verifications || prev.preventedFailures + 1,
            savedCapitalM: parseFloat((prev.savedCapitalM + 0.14).toFixed(2)),
            memoryCount: rec.memories || prev.memoryCount + 1,
          }));
          return;
        }
      } catch (e) {
        console.error("[Simulator] Accept pipeline error:", e);
      }
    }

    // Fallback UI update
    setKpiState((prev) => ({
      activeIncidents: 0,
      preventedFailures: prev.preventedFailures + 1,
      savedCapitalM: parseFloat((prev.savedCapitalM + 0.14).toFixed(2)),
      memoryCount: prev.memoryCount + 1,
    }));
  };

  const isProcessing =
    stage === "analyzing" ||
    stage === "searching_memory" ||
    stage === "comparing_incidents" ||
    stage === "pattern_detected" ||
    stage === "generating_recommendation";

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-mono font-bold text-amber-400 border border-amber-500/30 uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                Interactive Mission Control Simulator
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300 border border-emerald-500/30">
                Live Simulation Engine
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Incident Simulator
            </h1>

            <p className="text-sm sm:text-base font-medium text-sky-200">
              Experience how Resonyx investigates, recalls, predicts, and prevents catastrophic failures in real time.
            </p>

            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Click any scenario below to trigger a live production failure simulation. Watch the AI investigate the
              telemetry, query Hindsight organizational memory, match historical invariants, and generate an actionable
              remedial guardrail.
            </p>
          </div>

          {/* Real-time KPI Tracker */}
          <div className="grid grid-cols-2 gap-2.5 shrink-0 self-start lg:self-auto border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6 text-xs font-mono">
            <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Active Outages</div>
              <div className={`text-lg font-bold ${kpiState.activeIncidents > 0 ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                {kpiState.activeIncidents} Active
              </div>
            </div>
            <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Prevented Failures</div>
              <div className="text-lg font-bold text-emerald-400">
                {kpiState.preventedFailures} Total
              </div>
            </div>
            <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Saved Capital</div>
              <div className="text-lg font-bold text-white">
                ${kpiState.savedCapitalM}M
              </div>
            </div>
            <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Memory Vectors</div>
              <div className="text-lg font-bold text-sky-400">
                {kpiState.memoryCount} Nodes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SIMULATION TRIGGER BUTTONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-sky-400" />
            Select Failure Scenario to Simulate:
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Real-time simulated telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(SIMULATION_SCENARIOS).map((sc) => {
            const isSelected = selectedKey === sc.id;

            return (
              <button
                key={sc.id}
                onClick={() => runSimulation(sc.id)}
                disabled={isProcessing}
                className={`rounded-2xl border p-4 text-left transition-all duration-200 relative overflow-hidden group ${
                  isSelected
                    ? "border-sky-500/80 bg-gradient-to-br from-sky-950/60 to-slate-900 shadow-xl shadow-sky-950/50"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {sc.incidentCode}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isSelected ? "bg-rose-400 animate-ping" : "bg-slate-600"
                    }`}
                  />
                </div>

                <div className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                  {sc.buttonLabel}
                </div>

                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  {sc.service}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PROCESSING PROGRESS & AI INVESTIGATION ANIMATION */}
      {isProcessing && (
        <div className="rounded-2xl border border-sky-500/50 bg-slate-950 p-6 shadow-2xl backdrop-blur-md space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-sky-500/20 p-2.5 text-sky-400 border border-sky-500/40">
                <Brain className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>AI Investigation &amp; Hindsight Recall In Progress</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-xs text-sky-300 font-mono mt-0.5">
                  Target: {scenario.incidentCode} — {scenario.incidentTitle}
                </p>
              </div>
            </div>

            <div className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-lg border border-sky-800/60 self-start sm:self-auto">
              {progressPercent}% Complete
            </div>
          </div>

          {/* Animated Multi-Stage Progress Bar */}
          <div className="space-y-2">
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] font-mono pt-2">
              {PROCESSING_STEPS.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isDone = idx < currentStepIndex;

                return (
                  <div
                    key={step.stage}
                    className={`rounded-lg border p-2.5 transition-all ${
                      isActive
                        ? "border-sky-500 bg-sky-950/60 text-white shadow-md shadow-sky-950/40 scale-102"
                        : isDone
                        ? "border-emerald-900/60 bg-emerald-950/20 text-emerald-300"
                        : "border-slate-800/60 bg-slate-900/40 text-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {isDone ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : isActive ? (
                        <Sparkles className="h-3 w-3 text-sky-400 animate-spin" />
                      ) : (
                        <span className="text-[10px] text-slate-500">{idx + 1}.</span>
                      )}
                      <span>{step.label}</span>
                    </div>
                    <div className="text-[9px] mt-1 text-slate-400 line-clamp-2 leading-tight">
                      {step.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FULL OPERATIONAL EVENT DISPLAY (STAGES 1-13 VISUALLY SHOWN) */}
      {!isProcessing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Simulated Incident Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
            {/* Header: Incident Code, Title, Severity, Risk Gauge */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-md bg-rose-950/80 border border-rose-800/70 px-2.5 py-0.5 text-xs font-mono font-bold text-rose-300 flex items-center gap-1">
                    <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
                    SIMULATED INCIDENT {scenario.incidentCode}
                  </span>
                  <span className="rounded bg-slate-950 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-800">
                    {scenario.service}
                  </span>
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-xs font-mono font-bold border ${
                      stage === "accepted"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : "bg-rose-950 text-rose-300 border-rose-800 animate-pulse"
                    }`}
                  >
                    {stage === "accepted" ? "RESOLVED & PREVENTED" : "ELEVATED RISK"}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {scenario.incidentTitle}
                </h2>
              </div>

              {/* Dynamic Risk Gauge Box */}
              <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    Calculated Blast Radius
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {stage === "accepted" ? "Mitigated by Guardrail" : "Pre-Mitigation Risk"}
                  </div>
                </div>
                <div
                  className={`rounded-xl px-3 py-2 font-mono font-black text-xl border ${
                    stage === "accepted"
                      ? "bg-emerald-950/80 border-emerald-700/60 text-emerald-400"
                      : "bg-rose-950/80 border-rose-700/60 text-rose-400"
                  }`}
                >
                  {stage === "accepted"
                    ? `${scenario.riskScore - scenario.recommendation.estimatedRiskDrop} / 100`
                    : `${scenario.riskScore} / 100`}
                </div>
              </div>
            </div>

            {/* 13-STEP OPERATIONAL SEQUENCE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Telemetry & Memory Search (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Step 1 & 2: Telemetry Ingestion & AI Investigation */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase">
                      <Activity className="h-4 w-4 text-sky-400" />
                      1. Telemetry Ingestion &amp; 2. AI Investigation
                    </span>
                    <span className="font-mono text-[10px] text-rose-400 font-bold">
                      Anomaly Detected
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {scenario.investigationText}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="rounded-lg border border-rose-900/50 bg-rose-950/20 p-2.5">
                      <div className="text-[10px] font-mono text-slate-400">Observed Spike Value</div>
                      <div className="font-mono text-xs font-bold text-rose-300 mt-0.5">
                        {scenario.initialTelemetry.spikeValue}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                      <div className="text-[10px] font-mono text-slate-400">Nominal 30-Day Baseline</div>
                      <div className="font-mono text-xs font-bold text-slate-300 mt-0.5">
                        {scenario.initialTelemetry.baselineValue}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 & 4: Hindsight Memory Recall & Similar Incidents */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase">
                      <Brain className="h-4 w-4 text-purple-400" />
                      3. Hindsight Memory Recall &amp; 4. Similar Incidents
                    </span>
                    <span className="font-mono text-[10px] text-purple-300 font-bold">
                      Cosine Match: {scenario.memoryMatches[0]?.similarity}%
                    </span>
                  </div>

                  {/* Memory Vectors */}
                  <div className="space-y-2">
                    {scenario.memoryMatches.map((mem) => (
                      <div
                        key={mem.memoryId}
                        className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-3 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-purple-400">{mem.memoryId}</span>
                          <span className="font-mono text-emerald-400 font-bold">{mem.similarity}% Proximity</span>
                        </div>
                        <p className="text-white italic">&ldquo;{mem.insight}&rdquo;</p>
                        <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                          Historical Outcome: <strong className="text-rose-400">{mem.historicalOutcome}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Supporting Incidents */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">
                      Correlated Historical Incidents
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {scenario.similarIncidents.map((inc) => (
                        <Link
                          key={inc.id}
                          href={`/incidents/${inc.id}`}
                          className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-left hover:border-sky-500/50 transition-colors group"
                        >
                          <div className="flex items-center justify-between font-mono text-[11px] font-bold text-sky-400">
                            <span className="group-hover:underline">{inc.id}</span>
                            <ExternalLink className="h-3 w-3 text-slate-500" />
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">{inc.name}</div>
                          <div className="text-[9px] font-mono text-slate-500 mt-1">{inc.downtime} MTTR</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Pattern, Recommendation & Reactive Outcome (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* Step 5 & 6: Simulated Risk Score & Pattern Identified */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase">
                      <Layers className="h-4 w-4 text-amber-400" />
                      5. Risk Score &amp; 6. Pattern Identified
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/60">
                      {scenario.patternCode}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white">
                      {scenario.patternName}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Statistical Confidence: <strong className="text-emerald-400">{scenario.patternConfidence}%</strong>
                    </div>
                  </div>
                </div>

                {/* Step 7 & 8: Preventive Recommendation & Action Button */}
                <div
                  className={`rounded-2xl border p-5 space-y-4 transition-all duration-300 ${
                    stage === "accepted"
                      ? "border-emerald-800/60 bg-emerald-950/20"
                      : "border-sky-500/50 bg-gradient-to-b from-sky-950/30 to-slate-950 shadow-xl"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <span className="font-mono text-xs font-bold text-sky-300 flex items-center gap-1.5 uppercase">
                      <Sparkles className="h-4 w-4 text-sky-400" />
                      7. Generated Recommendation
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      Averts {scenario.recommendation.savedCapital}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {scenario.recommendation.action}
                  </p>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-300">
                    <strong className="text-slate-400 font-mono text-[10px] uppercase block mb-1">
                      Why This Recommendation:
                    </strong>
                    {scenario.recommendation.why}
                  </div>

                  {/* Step 8: Action Button */}
                  <div className="pt-2">
                    {stage !== "accepted" ? (
                      <button
                        onClick={handleAccept}
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 px-4 text-xs sm:text-sm font-black text-white shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        8. Accept Recommendation &amp; Enforce Guardrail
                      </button>
                    ) : (
                      <div className="rounded-xl bg-emerald-950/80 border border-emerald-700/60 p-3.5 text-center text-xs font-mono text-emerald-300 font-bold flex items-center justify-center gap-2">
                        <Check className="h-4 w-4 text-emerald-400" />
                        Recommendation Enforced in Production
                      </div>
                    )}
                  </div>
                </div>

                {/* Steps 9, 10, 11, 12, 13: Recorded Outcome & Live System Updates */}
                {stage === "accepted" && (
                  <div className="rounded-2xl border border-emerald-500/50 bg-slate-950 p-5 space-y-3.5 animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        9–13. Continuous Learning Cycle Complete
                      </span>
                      <span className="font-mono text-[10px] text-emerald-300 font-bold">
                        MTTR: {scenario.postAcceptanceOutcome.resolutionTime}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* 9: Outcome */}
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-slate-400 font-bold shrink-0">9. Outcome:</span>
                        <span className="text-slate-200">{scenario.postAcceptanceOutcome.statusSummary}</span>
                      </div>

                      {/* 10: Memory Update */}
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-purple-400 font-bold shrink-0">10. Memory Update:</span>
                        <span className="font-mono text-purple-200">{scenario.postAcceptanceOutcome.newMemoryId}</span>
                      </div>

                      {/* 11: Pattern Update */}
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-amber-400 font-bold shrink-0">11. Pattern Stat:</span>
                        <span className="text-amber-200">{scenario.postAcceptanceOutcome.patternStatUpdate}</span>
                      </div>

                      {/* 12: Timeline Update */}
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-sky-400 font-bold shrink-0">12. Timeline:</span>
                        <span className="text-sky-200">{scenario.postAcceptanceOutcome.timelineEventTitle}</span>
                      </div>

                      {/* 13: Dashboard KPIs */}
                      <div className="flex items-start gap-2 pt-1 border-t border-slate-800/80">
                        <span className="font-mono text-emerald-400 font-bold shrink-0">13. Dashboard KPIs:</span>
                        <span className="font-mono font-bold text-emerald-300">{scenario.postAcceptanceOutcome.kpiDeltaText}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <Link
                        href="/memory"
                        className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1"
                      >
                        View in Hindsight Memory <ChevronRight className="h-3.5 w-3.5" />
                      </Link>

                      <button
                        onClick={() => runSimulation(selectedKey)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="h-3 w-3" /> Re-Simulate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
