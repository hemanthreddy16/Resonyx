"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Database, ShieldCheck, ArrowUpRight, Info } from "lucide-react";

export function HindsightStatusWidget() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [connectionState, setConnectionState] = useState<{
    status: "CONNECTED" | "DEMO MODE";
    mode: "live" | "demo";
    message?: string;
  } | null>(null);

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
        setConnectionState(null);
      });
  }, []);

  const isLive = connectionState?.status === "CONNECTED";
  const label = connectionState ? connectionState.status : "CHECKING";

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors focus:outline-none ${
          isLive
            ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-200 hover:border-emerald-500/50"
            : "border-amber-500/30 bg-amber-950/30 text-amber-200 hover:border-amber-500/50"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isLive ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />

        <Database className={`h-4 w-4 ${isLive ? "text-emerald-400" : "text-amber-400"}`} />
        <span className="hidden sm:inline">Hindsight:</span>
        <span className="font-mono font-semibold tracking-wide">{label}</span>
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-slate-700/80 bg-[#0d1525] p-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className={`h-4 w-4 ${isLive ? "text-emerald-400" : "text-amber-400"}`} />
              <span className="text-sm font-bold text-white">
                Hindsight Memory Cluster
              </span>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-sm font-semibold border ${
                isLive
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}
            >
              {isLive ? "CONNECTED" : "DEMO MODE"}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Connection Mode:</span>
              <span className={`font-mono font-semibold ${isLive ? "text-emerald-400" : "text-amber-300"}`}>
                {label}
              </span>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-sm text-slate-300">
            <div className="flex items-center gap-1 text-slate-400 font-bold uppercase text-sm font-mono">
              <Info className="h-3 w-3 text-sky-400" />
              API Connection Architecture:
            </div>
            <p className="mt-1 leading-snug text-slate-400">
              {isLive
                ? "Connected to remote Hindsight vector cluster via HINDSIGHT_API_KEY."
                : "Using the local PostgreSQL memory store. Supply HINDSIGHT_API_KEY in .env to connect a live production cluster."}
            </p>
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2 flex items-center justify-between text-sm">
            <Link
              href="/memory"
              className="flex items-center gap-1 font-medium text-sky-400 hover:text-sky-300"
            >
              <span>Explore Memory</span>
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
