"use client";

import React, { useState } from "react";
import { Cpu, Sparkles, Activity } from "lucide-react";
import Link from "next/link";

export function AiStatusWidget() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white focus:outline-none"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <Cpu className="h-3.5 w-3.5 text-cyan-400" />
        <span className="hidden sm:inline font-medium">AI Engine:</span>
        <span className="font-semibold text-white">Nominal</span>
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-slate-700/80 bg-[#0d1525] p-3.5 shadow-xl shadow-black/80 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-white">
                Failure Reasoning Core
              </span>
            </div>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              Healthy
            </span>
          </div>

          <div className="mt-2.5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Synthesis Engine:</span>
              <span className="font-mono text-cyan-300">Resonyx-RCA-v4</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Inference Latency:</span>
              <span className="font-mono text-slate-200">18ms (p95)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Root Cause Accuracy:</span>
              <span className="font-semibold text-emerald-400">97.8%</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Active Synthesizers:</span>
              <span className="font-mono text-slate-200">12 Workers</span>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2">
            <Link
              href="/ai-command"
              className="flex items-center justify-between text-[11px] font-medium text-cyan-400 hover:text-cyan-300"
            >
              <span>Launch AI Command Center</span>
              <Activity className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
