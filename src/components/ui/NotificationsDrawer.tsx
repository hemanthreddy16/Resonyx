"use client";

import React, { useRef, useEffect } from "react";
import { Bell, AlertTriangle, ShieldCheck, Zap, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const notifications = [
    {
      id: "n-1",
      type: "risk",
      title: "Critical Deployment Blast Radius Detected",
      description: "PR #4892 introduces unbounded sync gRPC client matching INC-8942 failure vector.",
      time: "8 mins ago",
      target: "/risk-detection",
      severity: "critical",
    },
    {
      id: "n-2",
      type: "pattern",
      title: "New Failure Pattern Crystallized",
      description: "PAT-CASCADING-QUEUE-01 confidence elevated to 98% based on latest cluster telemetry.",
      time: "24 mins ago",
      target: "/patterns",
      severity: "high",
    },
    {
      id: "n-3",
      type: "prevention",
      title: "Automated Guardrail Blocked Production Outage",
      description: "PRV-104 intercepted un-hedged timeout in checkout-v2.14 before staging rollout.",
      time: "1 hour ago",
      target: "/prevention",
      severity: "success",
    },
    {
      id: "n-4",
      type: "hindsight",
      title: "Hindsight Memory Index Sync Completed",
      description: "14,820 organizational failure vectors re-indexed with zero drift.",
      time: "3 hours ago",
      target: "/hindsight",
      severity: "info",
    }
  ];

  return (
    <div
      ref={drawerRef}
      className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-xl border border-slate-700/80 bg-[#0d1524] shadow-2xl shadow-black/80 ring-1 ring-white/10 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-semibold tracking-wide text-white">
            Operational Intelligence Alerts
          </span>
          <span className="rounded-full bg-red-500/20 px-1.5 py-0.2 text-[10px] font-bold text-red-400 border border-red-500/30">
            3 New
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
        {notifications.map((n) => (
          <Link
            key={n.id}
            href={n.target}
            onClick={onClose}
            className="flex items-start gap-3 p-3.5 hover:bg-slate-800/40 transition-colors block"
          >
            <div className="mt-0.5 shrink-0">
              {n.type === "risk" && (
                <div className="rounded-lg bg-red-500/10 p-1.5 text-red-400 border border-red-500/20">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              )}
              {n.type === "pattern" && (
                <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400 border border-amber-500/20">
                  <Zap className="h-4 w-4" />
                </div>
              )}
              {n.type === "prevention" && (
                <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              )}
              {n.type === "hindsight" && (
                <div className="rounded-lg bg-sky-500/10 p-1.5 text-sky-400 border border-sky-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-100">
                  {n.title}
                </span>
                <span className="text-[10px] text-slate-400">{n.time}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {n.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t border-slate-800/80 bg-slate-950/60 p-2.5 text-center">
        <Link
          href="/risk-detection"
          onClick={onClose}
          className="text-[11px] font-medium text-sky-400 hover:text-sky-300"
        >
          View All System Anomaly Feeds →
        </Link>
      </div>
    </div>
  );
}
