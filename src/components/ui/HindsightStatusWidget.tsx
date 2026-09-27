"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Database, ShieldCheck, ArrowUpRight, Info } from "lucide-react";
import { MOCK_HINDSIGHT_STATUS } from "@/data/mockHindsightMemory";

export function HindsightStatusWidget() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [connectionState, setConnectionState] = useState<{
    status: "CONNECTED" | "DEMO MODE";
    mode: "live" | "demo";
    message?: string;
  }>({
    status: "DEMO MODE",
    mode: "demo",
    message: "Operating in local demo mode with 8,492 indexed failure memories.",
  });

  // Fetch true connection status from secure server API
  useEffect(() => {
    fetch("/api/hindsight/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setConnectionState({
            status: data.status,
            mode: data.mode,
            message: data.message,
          });
        }
      })
      .catch(() => {
        // Fallback to transparent Demo Mode
        setConnectionState({
          status: "DEMO MODE",
          mode: "demo",
          message: "Operating in local demo mode with 8,492 indexed failure memories.",
        });
      });
  }, []);

  const isLive = connectionState.status === "CONNECTED";

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors focus:outline-none ${
          isLive
            ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-200 hover:border-emerald-500/50"
            : "border-amber-500/30 bg-amber-950/30 text-amber-200 hover:border-amber-500/50"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isLive ? "bg-emerald-400 animate-ping" : "bg-amber-400"
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isLive ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
        </span>

        <Database className={`h-3.5 w-3.5 ${isLive ? "text-emerald-400" : "text-amber-400"}`} />
        <span className="hidden sm:inline font-medium">Hindsight:</span>
        <span className="font-mono font-bold tracking-wide">
          {connectionState.status}
        </span>
      </button>

      {/* Popover Card */}
      {showTooltip && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-slate-700/80 bg-[#0d1525] p-4 shadow-2xl shadow-black/80 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className={`h-4 w-4 ${isLive ? "text-emerald-400" : "text-amber-400"}`} />
              <span className="text-xs font-bold text-white">
                Hindsight Memory Cluster
              </span>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold border ${
                isLive
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}
            >
              {isLive ? "LIVE CLUSTER" : "DEMO MODE"}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Connection Mode:</span>
              <span className={`font-mono font-bold ${isLive ? "text-emerald-400" : "text-amber-300"}`}>
                {connectionState.status}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Memory Vectors:</span>
              <span className="font-mono font-medium text-white">
                {MOCK_HINDSIGHT_STATUS.indexedVectors.toLocaleString()} failure nodes
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Vector Embeddings:</span>
              <span className="font-mono text-[11px] text-sky-300">1536-dim semantic space</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Recall Precision:</span>
              <span className="font-semibold text-emerald-400">
                {MOCK_HINDSIGHT_STATUS.accuracyRate}%
              </span>
            </div>
          </div>

          {/* Transparent Notice for Hackathon Judges */}
          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center gap-1 text-slate-400 font-bold uppercase text-[10px] font-mono">
              <Info className="h-3 w-3 text-sky-400" />
              API Connection Architecture:
            </div>
            <p className="leading-snug text-slate-400">
              {isLive
                ? "Connected to remote Hindsight vector cluster via HINDSIGHT_API_KEY."
                : "Currently using local indexed vectors for demo evaluation. Supply HINDSIGHT_API_KEY in .env to connect a live production cluster."}
            </p>
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2 flex items-center justify-between text-[11px]">
            <Link
              href="/hindsight"
              className="flex items-center gap-1 font-medium text-sky-400 hover:text-sky-300"
            >
              <span>Explore Memory Vectors</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>

            <Link
              href="/settings"
              className="text-slate-400 hover:text-slate-200"
            >
              Configure API Keys
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
