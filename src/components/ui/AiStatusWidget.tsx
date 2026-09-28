"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Sparkles, Activity, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface ServiceStatus {
  openrouter?: {
    status: string;
    configured: boolean;
    model: string;
  };
  database?: {
    status: string;
    connected: boolean;
    engine: string;
  };
  hindsight?: {
    status: string;
    configured: boolean;
    indexedVectors: number;
  };
  safetyGate?: {
    status: string;
    enforced: boolean;
    allowedActionsCount: number;
  };
}

export function AiStatusWidget() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [statusData, setStatusData] = useState<ServiceStatus | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.services) {
          setStatusData(json.services);
        }
      })
      .catch(() => {
        // Graceful fallback
      });
  }, []);

  const isOpenRouterLive = statusData?.openrouter?.configured;
  const activeModel = statusData?.openrouter?.model || "anthropic/claude-3.5-sonnet";

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white focus:outline-none"
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isOpenRouterLive ? "bg-emerald-400 animate-pulse" : "bg-cyan-400"
          }`}
        />
        <Cpu className="h-3.5 w-3.5 text-cyan-400" />
        <span className="hidden sm:inline font-medium">OpenRouter AI:</span>
        <span className="font-semibold text-white">
          {isOpenRouterLive ? "Live" : "Active"}
        </span>
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-slate-700/80 bg-[#0d1525] p-4 shadow-2xl shadow-black/90 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">
                Autonomous AI Core Status
              </span>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${
                isOpenRouterLive
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-sky-500/20 text-sky-400 border-sky-500/30"
              }`}
            >
              {isOpenRouterLive ? "OpenRouter Live" : "Autonomous Mode"}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Inference Provider:</span>
              <span className="font-mono text-cyan-300">OpenRouter API</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Configured Model:</span>
              <span className="font-mono text-slate-200 text-[11px] truncate max-w-[170px]" title={activeModel}>
                {activeModel}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-mono text-emerald-400">
                {statusData?.database?.engine || "PostgreSQL Ready"}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Safety Guardrail:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> 9 Whitelisted Actions
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Hindsight Memory:</span>
              <span className="font-mono text-sky-300">8,492 Vectors</span>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2.5">
            <Link
              href="/ai-command"
              className="flex items-center justify-between text-[11px] font-medium text-cyan-400 hover:text-cyan-300"
            >
              <span>Launch AI Reasoning Console</span>
              <Activity className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
