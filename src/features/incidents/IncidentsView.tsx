"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { MOCK_INCIDENTS } from "@/data/mockIncidents";
import { SeverityBadge } from "@/components/ui/Badge";

export function IncidentsView() {
  const router = useRouter();

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedPattern, setSelectedPattern] = useState("all");

  // Distinct services
  const allServices = Array.from(new Set(MOCK_INCIDENTS.map((i) => i.service)));

  // Filter evaluation
  const filteredIncidents = MOCK_INCIDENTS.filter((inc) => {
    // Search
    const matchesSearch =
      search === "" ||
      inc.code.toLowerCase().includes(search.toLowerCase()) ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.service.toLowerCase().includes(search.toLowerCase()) ||
      inc.summary.toLowerCase().includes(search.toLowerCase()) ||
      (inc.patternMatch?.patternCode && inc.patternMatch.patternCode.toLowerCase().includes(search.toLowerCase()));

    // Severity filter
    const matchesSeverity =
      selectedSeverity === "all" || inc.severity === selectedSeverity;

    // Status filter
    const matchesStatus =
      selectedStatus === "all" || inc.status === selectedStatus;

    // Service filter
    const matchesService =
      selectedService === "all" || inc.service === selectedService;

    // Pattern detected filter
    const matchesPattern =
      selectedPattern === "all"
        ? true
        : selectedPattern === "matched-only"
        ? Boolean(inc.patternMatch)
        : inc.patternMatch?.patternCode === selectedPattern;

    // Date filter
    let matchesDate = true;
    if (selectedDate === "today") {
      matchesDate = inc.detectedTime.includes("AM") || inc.detectedTime.includes("PM");
    } else if (selectedDate === "historical") {
      matchesDate = !inc.detectedTime.includes("AM") && !inc.detectedTime.includes("PM");
    }

    return (
      matchesSearch &&
      matchesSeverity &&
      matchesStatus &&
      matchesService &&
      matchesPattern &&
      matchesDate
    );
  });

  const resetFilters = () => {
    setSearch("");
    setSelectedSeverity("all");
    setSelectedStatus("all");
    setSelectedService("all");
    setSelectedDate("all");
    setSelectedPattern("all");
  };

  const hasActiveFilters =
    search !== "" ||
    selectedSeverity !== "all" ||
    selectedStatus !== "all" ||
    selectedService !== "all" ||
    selectedDate !== "all" ||
    selectedPattern !== "all";

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Incident Management & Failure Repository
            </h1>
            <span className="rounded-md bg-sky-950 px-2 py-0.5 text-xs font-mono text-sky-400 border border-sky-800/60 font-semibold">
              {filteredIncidents.length} of {MOCK_INCIDENTS.length} Incidents
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time incident triage, root cause attribution, pattern detection, and vector-mapped postmortems.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/incidents/inc-1047")}
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-sky-500 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Open Latest: INC-1047</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Controls Toolbar */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-sm space-y-3">
        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code (e.g. INC-1047), title, service, root cause, or pattern..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors self-end sm:self-auto"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
          {/* 1. Severity Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Severity
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical (P1)</option>
              <option value="high">High (P2)</option>
              <option value="medium">Medium (P3)</option>
              <option value="low">Low (P4)</option>
            </select>
          </div>

          {/* 2. Status Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="investigating">Investigating</option>
              <option value="mitigated">Mitigated</option>
              <option value="resolved">Resolved</option>
              <option value="learning-indexed">Learning-Indexed</option>
            </select>
          </div>

          {/* 3. Service Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Service
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none truncate"
            >
              <option value="all">All Services</option>
              {allServices.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Date Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Detection Window
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today (Last 24h)</option>
              <option value="historical">Historical Archive</option>
            </select>
          </div>

          {/* 5. Pattern Detected Filter */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Pattern Match
            </label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none"
            >
              <option value="all">All Patterns</option>
              <option value="matched-only">Pattern Matched Only</option>
              <option value="PAT-CASCADING-QUEUE-01">PAT-CASCADING-QUEUE-01</option>
              <option value="PAT-DB-LOCK-DDL-02">PAT-DB-LOCK-DDL-02</option>
              <option value="PAT-MEM-SERIALIZE-03">PAT-MEM-SERIALIZE-03</option>
              <option value="PAT-RETRY-STORM-04">PAT-RETRY-STORM-04</option>
            </select>
          </div>
        </div>
      </div>

      {/* Professional Incident Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800/90 bg-slate-900/60 backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Incident</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Pattern Match</th>
                <th className="py-3.5 px-4">Risk</th>
                <th className="py-3.5 px-4">Detected</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => router.push(`/incidents/${inc.id}`)}
                    className="group cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Incident: Code + Title */}
                    <td className="py-4 px-4 max-w-xs sm:max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400 group-hover:text-sky-300">
                          {inc.code}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="font-semibold text-white group-hover:text-sky-200 line-clamp-1">
                          {inc.title}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                        {inc.summary}
                      </p>
                    </td>

                    {/* Service */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {inc.service}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <SeverityBadge severity={inc.severity} />
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          inc.status === "investigating"
                            ? "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse"
                            : inc.status === "mitigated"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : inc.status === "resolved"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-sky-500/20 text-sky-300 border-sky-500/30"
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>

                    {/* Pattern Match */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {inc.patternMatch ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/60">
                            {inc.patternMatch.patternCode}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-400 font-mono">
                            {inc.patternMatch.confidence}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No signature</span>
                      )}
                    </td>

                    {/* Risk */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold uppercase text-[11px] ${
                          inc.riskLevel === "critical"
                            ? "text-red-400"
                            : inc.riskLevel === "high"
                            ? "text-amber-400"
                            : "text-sky-400"
                        }`}
                      >
                        {inc.riskLevel}
                      </span>
                    </td>

                    {/* Detected */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{inc.detectedTime}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/incidents/${inc.id}`);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-200 group-hover:border-sky-500 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm"
                      >
                        <span>Details</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No incidents match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
