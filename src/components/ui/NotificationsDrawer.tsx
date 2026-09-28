"use client";

import React, { useRef, useEffect, useState } from "react";
import { Bell, AlertTriangle, X, Loader2 } from "lucide-react";
import Link from "next/link";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActiveIncident {
  id: string;
  code: string;
  title: string;
  service: string;
  severity: string;
  status: string;
  occurredAt?: string;
}

const ACTIVE_STATUSES = new Set(["investigating", "mitigated", "learning-indexed"]);

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [activeIncidents, setActiveIncidents] = useState<ActiveIncident[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

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

  // Alerts are derived from incidents that are not yet resolved.
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);
    setFailed(false);

    fetch("/api/incidents", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("request failed"))))
      .then((json) => {
        if (cancelled) return;
        const rows: ActiveIncident[] = Array.isArray(json?.data) ? json.data : [];
        setActiveIncidents(
          rows
            .filter((i) => ACTIVE_STATUSES.has(String(i.status).toLowerCase()))
            .sort((a, b) =>
              String(b.occurredAt || "").localeCompare(String(a.occurredAt || ""))
            )
        );
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={drawerRef}
      className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-xl border border-slate-700/80 bg-[#0d1524] shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-sky-400" />
          <span className="text-sm font-semibold tracking-wide text-white">
            Unresolved Incidents
          </span>
          <span className="rounded px-1.5 py-0.5 text-sm font-semibold text-sky-300 border border-sky-800/60">
            {activeIncidents.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
        {loading && (
          <div className="flex items-center gap-2 p-4 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
            <span>Loading incidents...</span>
          </div>
        )}

        {!loading && failed && (
          <p className="p-4 text-sm text-slate-400">
            Could not reach the incident API.
          </p>
        )}

        {!loading && !failed && activeIncidents.length === 0 && (
          <p className="p-4 text-sm text-slate-400">
            No unresolved incidents in the database.
          </p>
        )}

        {activeIncidents.map((inc) => (
          <Link
            key={inc.id}
            href={`/incidents/${inc.id}`}
            onClick={onClose}
            className="flex items-start gap-3 p-3.5 hover:bg-slate-800/40 transition-colors block"
          >
            <div className="mt-0.5 shrink-0">
              <div className="rounded-lg bg-sky-500/10 p-1.5 text-sky-400 border border-sky-500/20">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-100">
                  {inc.title}
                </span>
                <span className="font-mono text-sm text-sky-400 shrink-0">{inc.code}</span>
              </div>
              <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                {inc.service} &middot; {inc.severity} &middot; {inc.status}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t border-slate-800/80 bg-slate-950/60 p-2.5 text-center">
        <Link
          href="/incidents"
          onClick={onClose}
          className="text-sm font-medium text-sky-400 hover:text-sky-300"
        >
          View all incidents
        </Link>
      </div>
    </div>
  );
}
