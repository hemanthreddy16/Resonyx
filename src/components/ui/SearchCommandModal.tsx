"use client";

import React, { useState, useEffect } from "react";
import { Search, X, FileText, Network, ShieldCheck, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_INCIDENTS } from "@/data/mockIncidents";
import { MOCK_PATTERNS } from "@/data/mockPatterns";
import { MOCK_HINDSIGHT_MEMORIES } from "@/data/mockHindsightMemory";

interface SearchCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchCommandModal({ isOpen, onClose }: SearchCommandModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Listen for keyboard escape
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

  if (!isOpen) return null;

  const filteredIncidents = MOCK_INCIDENTS.filter(
    (i) =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.code.toLowerCase().includes(query.toLowerCase()) ||
      i.service.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredPatterns = MOCK_PATTERNS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.patternCode.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredMemories = MOCK_HINDSIGHT_MEMORIES.filter(
    (m) =>
      m.extractedRule.toLowerCase().includes(query.toLowerCase()) ||
      m.knowledgeDomain.toLowerCase().includes(query.toLowerCase()) ||
      m.sourceIncidentCode.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 2);

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-700/80 bg-[#0e1626] shadow-2xl shadow-black/80 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-sky-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organizational failures, patterns, Hindsight vectors, or guardrails... (Esc to exit)"
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

        {/* Content results */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Categories */}
          {query === "" && (
            <div className="p-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Suggested Quick Jumps
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavigate("/patterns")}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-left text-xs text-slate-300 hover:border-sky-500/30 hover:bg-slate-800/80 transition-colors"
                >
                  <Network className="h-4 w-4 text-sky-400" />
                  <span>Explore Pattern Intelligence</span>
                </button>
                <button
                  onClick={() => handleNavigate("/hindsight")}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-left text-xs text-slate-300 hover:border-sky-500/30 hover:bg-slate-800/80 transition-colors"
                >
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <span>Hindsight Memory Bank</span>
                </button>
                <button
                  onClick={() => handleNavigate("/risk-detection")}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-left text-xs text-slate-300 hover:border-sky-500/30 hover:bg-slate-800/80 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Pre-Deploy Risk Detection</span>
                </button>
                <button
                  onClick={() => handleNavigate("/prevention")}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-left text-xs text-slate-300 hover:border-sky-500/30 hover:bg-slate-800/80 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Prevention Policy Center</span>
                </button>
              </div>
            </div>
          )}

          {/* Incidents Section */}
          {filteredIncidents.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>Historical Incidents</span>
              </div>
              <div className="mt-1 space-y-1">
                {filteredIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => handleNavigate(`/incidents`)}
                    className="group flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-sky-400">{inc.code}</span>
                      <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                        {inc.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 group-hover:text-sky-300 flex items-center gap-1">
                      {inc.service}
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patterns Section */}
          {filteredPatterns.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Network className="h-3.5 w-3.5 text-sky-400" />
                <span>Recurring Failure Patterns</span>
              </div>
              <div className="mt-1 space-y-1">
                {filteredPatterns.map((pat) => (
                  <div
                    key={pat.id}
                    onClick={() => handleNavigate(`/patterns`)}
                    className="group flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-sky-950 px-1.5 py-0.5 text-[10px] font-mono text-sky-300">
                        {pat.patternCode}
                      </span>
                      <span className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-1">
                        {pat.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 shrink-0">
                      {pat.confidenceScore}% confidence
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hindsight Memory Vectors */}
          {filteredMemories.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>Hindsight Memory Rules</span>
              </div>
              <div className="mt-1 space-y-1">
                {filteredMemories.map((mem) => (
                  <div
                    key={mem.id}
                    onClick={() => handleNavigate(`/hindsight`)}
                    className="group flex cursor-pointer flex-col rounded-lg p-2 hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-cyan-300">
                        {mem.knowledgeDomain}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {mem.vectorId}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300 line-clamp-1">
                      {mem.extractedRule}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/60 px-4 py-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="rounded border border-slate-700 bg-slate-800 px-1 text-[10px]">↑</kbd>
            <kbd className="rounded border border-slate-700 bg-slate-800 px-1 text-[10px]">↓</kbd>
            <kbd className="rounded border border-slate-700 bg-slate-800 px-1 text-[10px]">Enter</kbd>
          </div>
          <span className="font-mono text-sky-400">RESONYX Hindsight Index v3.4</span>
        </div>
      </div>
    </div>
  );
}
