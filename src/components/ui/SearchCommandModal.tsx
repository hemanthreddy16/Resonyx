"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  FileText,
  Network,
  ShieldCheck,
  Zap,
  ArrowRight,
  Loader2,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IncidentHit {
  id: string;
  code: string;
  title: string;
  service: string;
}

interface MemoryHit {
  id: string;
  memoryId: string;
  incidentTitle: string;
  rootCause: string;
  outcome: string;
}

const QUICK_JUMPS: Array<{
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}> = [
  { label: "Overview", path: "/", icon: LayoutDashboard, accent: "text-sky-400" },
  { label: "Incidents", path: "/incidents", icon: FileText, accent: "text-sky-400" },
  { label: "Hindsight Memory", path: "/memory", icon: Zap, accent: "text-sky-400" },
  { label: "Patterns", path: "/patterns", icon: Network, accent: "text-sky-400" },
  { label: "Prevention", path: "/prevention", icon: ShieldCheck, accent: "text-sky-400" },
  { label: "Demo", path: "/demo", icon: Sparkles, accent: "text-sky-400" },
];

export function SearchCommandModal({ isOpen, onClose }: SearchCommandModalProps) {
  const [query, setQuery] = useState("");
  const [incidents, setIncidents] = useState<IncidentHit[]>([]);
  const [memories, setMemories] = useState<MemoryHit[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load real records from the live API endpoints on first open.
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const [incRes, memRes] = await Promise.all([
          fetch("/api/incidents", { cache: "no-store" }),
          fetch("/api/memories", { cache: "no-store" }),
        ]);

        const incJson = incRes.ok ? await incRes.json() : null;
        const memJson = memRes.ok ? await memRes.json() : null;

        if (cancelled) return;

        if (Array.isArray(incJson?.data)) {
          setIncidents(
            incJson.data.map((i: IncidentHit) => ({
              id: i.id,
              code: i.code,
              title: i.title,
              service: i.service,
            }))
          );
        }
        if (Array.isArray(memJson?.data?.memories)) {
          setMemories(
            memJson.data.memories.map((m: MemoryHit) => ({
              id: m.id,
              memoryId: m.memoryId,
              incidentTitle: m.incidentTitle,
              rootCause: m.rootCause,
              outcome: m.outcome,
            }))
          );
        }
      } catch {
        // Search stays empty if the API is unreachable.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredIncidents = q
    ? incidents
        .filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.code.toLowerCase().includes(q) ||
            i.service.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];

  const filteredMemories = q
    ? memories
        .filter(
          (m) =>
            (m.incidentTitle || "").toLowerCase().includes(q) ||
            (m.rootCause || "").toLowerCase().includes(q) ||
            (m.memoryId || "").toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-700/80 bg-[#0e1626] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-sky-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search incidents and memory... (Esc to exit)"
            className="ml-3 w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {query === "" && (
            <div className="p-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Quick Jumps
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {QUICK_JUMPS.map((jump) => {
                  const Icon = jump.icon;
                  return (
                    <button
                      key={jump.label}
                      onClick={() => handleNavigate(jump.path)}
                      className="flex items-center gap-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-left text-sm text-slate-300 hover:border-sky-500/30 hover:bg-slate-800/80 transition-colors"
                    >
                      <Icon className={`h-4 w-4 ${jump.accent}`} />
                      <span>{jump.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {loading && query === "" && (
            <div className="flex items-center gap-2 px-2 py-4 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
              <span>Loading records from the database...</span>
            </div>
          )}

          {q !== "" && filteredIncidents.length === 0 && filteredMemories.length === 0 && (
            <div className="px-2 py-6 text-center text-sm text-slate-400">
              No records match &quot;{query}&quot;.
            </div>
          )}

          {filteredIncidents.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                <FileText className="h-4 w-4 text-slate-400" />
                <span>Incidents</span>
              </div>
              <div className="mt-1 space-y-1">
                {filteredIncidents.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => handleNavigate(`/incidents/${inc.id}`)}
                    className="group flex w-full cursor-pointer items-center justify-between rounded-lg p-2 text-left hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-sky-400">{inc.code}</span>
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                        {inc.title}
                      </span>
                    </div>
                    <span className="text-sm text-slate-400 group-hover:text-sky-300 flex items-center gap-1">
                      {inc.service}
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredMemories.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                <Zap className="h-4 w-4 text-sky-400" />
                <span>Hindsight Memory</span>
              </div>
              <div className="mt-1 space-y-1">
                {filteredMemories.map((mem) => (
                  <button
                    key={mem.id}
                    onClick={() => handleNavigate("/memory")}
                    className="group flex w-full cursor-pointer flex-col rounded-lg p-2 text-left hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-sky-300">
                        {mem.memoryId}
                      </span>
                      <span className="font-mono text-sm text-slate-400">
                        {mem.outcome}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300 line-clamp-1">
                      {mem.incidentTitle}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/60 px-4 py-2 text-sm text-slate-400">
          <span>Search runs against the live database.</span>
        </div>
      </div>
    </div>
  );
}
