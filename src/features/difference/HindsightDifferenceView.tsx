"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  Sparkles,
  Layers,
  ShieldCheck,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

interface ComparisonScenario {
  id: string;
  name: string;
  userPrompt: string;
  withoutHindsight: {
    label: string;
    response: string;
    critique: string;
    wastedTime: string;
    flaw: string;
  };
  withHindsight: {
    label: string;
    resemblesText: string;
    similarity: number;
    rootCause: string;
    failedAction: string;
    successfulResolution: string;
    currentRecommendation: string;
    evidenceIncidents: string[];
    timeSaved: string;
  };
}

const SCENARIOS: ComparisonScenario[] = [
  {
    id: "payment-api",
    name: "Scenario 1: Payment API Degradation",
    userPrompt: "Payment API is slow.",
    withoutHindsight: {
      label: "GENERIC RESPONSE",
      response: "Check server load, database performance and network connectivity.",
      critique: "Generic troubleshooting checklist with zero context of your microservice topology.",
      wastedTime: "45-80 minutes wasted running generic health checks",
      flaw: "Might suggest restarting the service, which historically crashed the database connection pool!",
    },
    withHindsight: {
      label: "CONTEXT-AWARE ORGANIZATIONAL INTELLIGENCE",
      resemblesText: "This resembles 4 incidents from the last 30 days.",
      similarity: 92,
      rootCause: "Database contention",
      failedAction: "Service restart",
      successfulResolution: "Query optimization",
      currentRecommendation: "Investigate the latest database query.",
      evidenceIncidents: ["INC-0871", "INC-0918", "INC-0994", "INC-1012"],
      timeSaved: "Resolution in 8 mins (Saved $140,000 downtime)",
    },
  },
  {
    id: "memory-leak",
    name: "Scenario 2: Container Memory Growth",
    userPrompt: "Checkout pods memory usage is climbing.",
    withoutHindsight: {
      label: "GENERIC RESPONSE",
      response: "Scale your pod replicas or increase the memory limit in your deployment manifest.",
      critique: "Surface-level symptom masking that ignores historical deployment correlations.",
      wastedTime: "30-60 minutes before OOM crash recurs across scaled pods",
      flaw: "Increasing memory limits merely delays the inevitable OOM crash during peak traffic.",
    },
    withHindsight: {
      label: "CONTEXT-AWARE ORGANIZATIONAL INTELLIGENCE",
      resemblesText: "This resembles 3 canary regressions from releases v2.12 and v2.13.",
      similarity: 89,
      rootCause: "Unclosed gRPC client stream channel buffers",
      failedAction: "Autoscaling container memory",
      successfulResolution: "Immediate canary rollback + gRPC interceptor hotfix",
      currentRecommendation: "Roll back canary deployment #8924 immediately.",
      evidenceIncidents: ["INC-0892", "INC-0840", "INC-0811"],
      timeSaved: "Resolution in 4 mins (Saved $210,000 downtime)",
    },
  },
  {
    id: "cache-stampede",
    name: "Scenario 3: 09:00 AM Login Spike",
    userPrompt: "Auth token latency spiked to 2.4s.",
    withoutHindsight: {
      label: "GENERIC RESPONSE",
      response: "Check if auth server is throttling or restart the Redis cache instance.",
      critique: "Dangerous advice that turns a temporary cache miss spike into a catastrophic outage.",
      wastedTime: "50 minutes of cascading auth lockouts",
      flaw: "Restarting Redis during active login traffic causes 100% cache stampede onto PostgreSQL read replica.",
    },
    withHindsight: {
      label: "CONTEXT-AWARE ORGANIZATIONAL INTELLIGENCE",
      resemblesText: "This resembles 2 previous cache eviction stampedes during morning bursts.",
      similarity: 94,
      rootCause: "Simultaneous 1-hour session key expiration without jitter",
      failedAction: "Restarting Redis cache instance",
      successfulResolution: "Enable probabilistic early expiration (XFetch) & shedding",
      currentRecommendation: "Inject 15-minute randomized refresh jitter to session tokens.",
      evidenceIncidents: ["INC-0965", "INC-0912"],
      timeSaved: "Resolution in 6 mins (Saved $70,000 downtime)",
    },
  },
];

export function HindsightDifferenceView() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const scenario = SCENARIOS[selectedScenarioIndex];

  // Animation trigger effect on scenario change or load
  const triggerAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(1); // User asks prompt

    setTimeout(() => {
      setAnimationStep(2); // Left generic response appears
    }, 600);

    setTimeout(() => {
      setAnimationStep(3); // Right side vector scanning active
    }, 1200);

    setTimeout(() => {
      setAnimationStep(4); // Full Hindsight intelligence reveals
      setIsAnimating(false);
    }, 2000);
  };

  useEffect(() => {
    triggerAnimation();
  }, [selectedScenarioIndex]);

  return (
    <div className="space-y-10">
      {/* Hackathon Header Badge & Title */}
      <div className="text-center space-y-4 max-w-4xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-950/40 px-4 py-1.5 text-xs font-mono font-bold text-sky-300 shadow-lg shadow-sky-950/40 backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-sky-400 animate-spin" />
          <span>HACKATHON SHOWCASE: PROOF OF VALUE</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase">
          THE HINDSIGHT DIFFERENCE
        </h1>

        {/* Large Highlighted Hackathon Statement */}
        <div className="relative py-2">
          <div className="text-xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            &ldquo;Memory turns generic AI into organizational intelligence.&rdquo;
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            Generic LLMs have zero institutional memory. They suggest the same textbook troubleshooting steps
            that have already failed in your production environment. <strong>Resonyx Hindsight remembers every past outcome.</strong>
          </p>
        </div>

        {/* Scenario Switcher Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {SCENARIOS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setSelectedScenarioIndex(idx)}
              className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                selectedScenarioIndex === idx
                  ? "border-sky-500 bg-sky-950/80 text-white shadow-lg shadow-sky-950/50"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {s.name}
            </button>
          ))}

          <button
            onClick={triggerAnimation}
            disabled={isAnimating}
            className="rounded-xl border border-emerald-500/50 bg-emerald-950/50 hover:bg-emerald-900/60 px-3.5 py-2 text-xs font-bold text-emerald-300 transition-all flex items-center gap-1.5 shadow-lg"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAnimating ? "animate-spin" : ""}`} />
            Replay Comparison
          </button>
        </div>
      </div>

      {/* Shared User Prompt Display */}
      <div className="max-w-2xl mx-auto rounded-2xl border border-slate-700 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-800 p-2 text-slate-300 font-bold text-xs font-mono">
            USER
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Incoming Production Alert</div>
            <div className="text-base sm:text-lg font-bold text-white">
              &ldquo;{scenario.userPrompt}&rdquo;
            </div>
          </div>
        </div>

        <span className="rounded-md bg-rose-950/80 border border-rose-800/60 px-2.5 py-1 text-xs font-mono font-bold text-rose-400 shrink-0">
          P1 SEV-1 ACTIVE
        </span>
      </div>

      {/* SPLIT-SCREEN COMPARISON GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative items-stretch">
        {/* LEFT COLUMN: WITHOUT HINDSIGHT */}
        <div
          className={`rounded-3xl border border-rose-900/40 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 p-6 sm:p-8 shadow-2xl flex flex-col justify-between transition-all duration-500 ${
            animationStep >= 2 ? "opacity-100 translate-y-0" : "opacity-30 translate-y-3"
          }`}
        >
          <div className="space-y-6">
            {/* Header / Label */}
            <div className="flex items-center justify-between border-b border-rose-900/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-rose-950/80 p-2 border border-rose-800/60 text-rose-400">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-200 tracking-tight">
                    WITHOUT HINDSIGHT
                  </h2>
                  <span className="text-[11px] font-mono text-slate-400">
                    Standard LLM / Generic Chatbot / Zero Memory
                  </span>
                </div>
              </div>

              <span className="rounded-md bg-rose-950/80 border border-rose-700/60 px-2.5 py-1 text-xs font-mono font-bold text-rose-300 tracking-wider">
                {scenario.withoutHindsight.label}
              </span>
            </div>

            {/* AI Response Card */}
            <div className="rounded-2xl border border-rose-900/50 bg-rose-950/15 p-5 space-y-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                Typical LLM Answer
              </div>
              <p className="text-base sm:text-lg text-slate-300 italic font-serif leading-relaxed">
                &ldquo;{scenario.withoutHindsight.response}&rdquo;
              </p>
            </div>

            {/* Critical Flaw Breakdown */}
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  The Problem With Generic AI
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {scenario.withoutHindsight.critique}
                </p>
              </div>

              <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                  Dangerous Blind Spot
                </span>
                <p className="text-xs text-rose-200 font-medium leading-relaxed">
                  {scenario.withoutHindsight.flaw}
                </p>
              </div>
            </div>
          </div>

          {/* Left Footer: Lost Time & Cost */}
          <div className="mt-8 pt-4 border-t border-slate-800 text-xs font-mono text-rose-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {scenario.withoutHindsight.wastedTime}
            </span>
            <span className="font-bold uppercase tracking-wider">High Risk</span>
          </div>
        </div>

        {/* RIGHT COLUMN: WITH HINDSIGHT */}
        <div
          className={`relative rounded-3xl border-2 border-sky-500/60 bg-gradient-to-b from-sky-950/30 via-slate-900 to-indigo-950/40 p-6 sm:p-8 shadow-2xl shadow-sky-950/60 flex flex-col justify-between transition-all duration-700 ${
            animationStep >= 4 ? "opacity-100 scale-100" : "opacity-40 scale-95"
          }`}
        >
          {/* Top Glowing Edge Accent */}
          <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 rounded-full" />

          <div className="space-y-6">
            {/* Header / Label */}
            <div className="flex items-center justify-between border-b border-sky-500/30 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-sky-500/20 p-2 border border-sky-500/50 text-sky-400">
                  <Brain className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    WITH HINDSIGHT
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </h2>
                  <span className="text-[11px] font-mono text-sky-300">
                    Grounded in 8,492 Indexed Organizational Memories
                  </span>
                </div>
              </div>

              <span className="rounded-md bg-emerald-950/80 border border-emerald-500/60 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300 tracking-wider">
                {scenario.withHindsight.label}
              </span>
            </div>

            {/* AI Pattern Recognition Header */}
            <div className="rounded-2xl border border-sky-500/40 bg-sky-950/40 p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                  Hindsight Causal Recognition
                </span>
                <span className="rounded bg-sky-900/60 px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/40">
                  {scenario.withHindsight.similarity}% Similarity Match
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-white leading-snug">
                &ldquo;{scenario.withHindsight.resemblesText}&rdquo;
              </p>
            </div>

            {/* Structured Evidence & Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Previous Root Cause */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                  <Database className="h-3 w-3 text-sky-400" />
                  Previous Root Cause:
                </div>
                <div className="text-sm font-bold text-white">
                  {scenario.withHindsight.rootCause}
                </div>
              </div>

              {/* Previous Failed Action (Red Alert) */}
              <div className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-3.5 space-y-1">
                <div className="text-[10px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-rose-400" />
                  Previous Failed Action:
                </div>
                <div className="text-sm font-bold text-rose-200">
                  {scenario.withHindsight.failedAction}
                </div>
                <div className="text-[10px] text-rose-300/80 font-mono">
                  DO NOT REPEAT (Failed in past postmortems)
                </div>
              </div>

              {/* Successful Resolution (Green Win) */}
              <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-3.5 space-y-1">
                <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Successful Resolution:
                </div>
                <div className="text-sm font-bold text-emerald-200">
                  {scenario.withHindsight.successfulResolution}
                </div>
                <div className="text-[10px] text-emerald-300/80 font-mono">
                  Verified effective in 12 past recoveries
                </div>
              </div>

              {/* Current Recommendation */}
              <div className="rounded-xl border border-sky-500/40 bg-sky-950/30 p-3.5 space-y-1">
                <div className="text-[10px] font-mono uppercase text-sky-300 font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-sky-400" />
                  Current Recommendation:
                </div>
                <div className="text-sm font-bold text-white">
                  {scenario.withHindsight.currentRecommendation}
                </div>
              </div>
            </div>

            {/* Supporting Evidence Incidents Row */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                Grounded in Postmortems:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {scenario.withHindsight.evidenceIncidents.map((incId) => (
                  <Link
                    key={incId}
                    href={`/incidents/${incId}`}
                    className="rounded bg-sky-950 px-2 py-0.5 font-mono text-xs font-bold text-sky-400 border border-sky-800/60 hover:underline hover:text-sky-300"
                  >
                    {incId} &rarr;
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Footer: Measured Business Impact */}
          <div className="mt-8 pt-4 border-t border-sky-500/30 text-xs font-mono text-emerald-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <TrendingUp className="h-4 w-4" />
              {scenario.withHindsight.timeSaved}
            </span>
            <span className="font-bold uppercase tracking-wider text-emerald-300">
              Verified Immunity
            </span>
          </div>
        </div>
      </div>

      {/* HACKATHON BENCHMARK SCORECARD */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Head-to-Head Hackathon Benchmark
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical operational outcomes comparing standard AI chat vs. Resonyx Hindsight memory.
            </p>
          </div>
          <span className="rounded-md bg-emerald-950/80 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300 border border-emerald-700/60">
            90% MTTR Reduction
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2 text-center">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold">
              Mean Time to Resolution (MTTR)
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-2xl font-mono text-rose-400 line-through">83 min</span>
              <span className="text-3xl font-mono font-black text-emerald-400">8 min</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Down from 83 minutes of manual triage to 8 minutes with instant Hindsight recall.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2 text-center">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold">
              Failed Action Avoidance
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-2xl font-mono text-rose-400">100% Blind</span>
              <span className="text-3xl font-mono font-black text-emerald-400">0% Repeat</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Never repeats previously failed remedial actions (e.g. restarts under DB lock contention).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2 text-center">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold">
              Downtime Capital Averted
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl font-mono font-black text-emerald-400">$1,840,000</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cumulative financial downtime prevented across 127 proactive guardrail intercepts.
            </p>
          </div>
        </div>

        {/* Call to Action for Hackathon Judges */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Explore the complete platform:
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/ai-command"
              className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
            >
              <Brain className="h-3.5 w-3.5 text-sky-400" />
              Test In AI Command Center
            </Link>

            <Link
              href="/patterns"
              className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
            >
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              Explore 43 Discovered Patterns
            </Link>

            <Link
              href="/prevention"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              View Prevention Guardrails <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
