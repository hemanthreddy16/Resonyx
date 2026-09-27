"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Shield,
  Clock,
  Calendar,
  CheckCircle2,
  Check,
  ExternalLink,
  Sparkles,
  X,
  FileText,
  Database,
  Activity,
  Layers,
  Search,
} from "lucide-react";
import {
  MOCK_RECOMMENDATIONS,
  MOCK_INITIAL_APPLIED,
  MOCK_INITIAL_SCHEDULED,
  MOCK_INITIAL_COMPLETED,
} from "@/data/mockPreventions";
import { PreventionRecommendation } from "@/types";

interface TimelineAuditItem {
  id: string;
  time: string;
  action: string;
  recId: string;
  detail: string;
}

export function PreventionView() {
  // Recommendations state
  const [recommendations, setRecommendations] = useState<PreventionRecommendation[]>(
    MOCK_RECOMMENDATIONS
  );
  const [appliedActions, setAppliedActions] = useState<PreventionRecommendation[]>(
    MOCK_INITIAL_APPLIED
  );
  const [scheduledActions, setScheduledActions] = useState<PreventionRecommendation[]>(
    MOCK_INITIAL_SCHEDULED
  );
  const [completedActions] = useState<PreventionRecommendation[]>(
    MOCK_INITIAL_COMPLETED
  );

  // Active view section tab
  const [activeSection, setActiveSection] = useState<
    "all" | "recommended" | "applied" | "scheduled" | "completed"
  >("all");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [evidenceModalRec, setEvidenceModalRec] = useState<PreventionRecommendation | null>(null);
  const [schedulingModalRec, setSchedulingModalRec] = useState<PreventionRecommendation | null>(null);

  // Scheduling form inputs
  const [scheduleWindow, setScheduleWindow] = useState("Tonight, 22:00 UTC (Pre-Deployment)");
  const [scheduleEnvironment, setScheduleEnvironment] = useState("Production (US-East & EU-West)");
  const [scheduleRecurring, setScheduleRecurring] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{
    id: string;
    message: string;
    subtext: string;
  } | null>(null);

  // Stats counters (reactive)
  const [stats, setStats] = useState({
    activeGuardrails: 18,
    failuresPrevented: 127,
    avgRiskReduction: 68.4,
    capitalSavedM: 1.84,
  });

  // Prevention activity timeline
  const [activityTimeline, setActivityTimeline] = useState<TimelineAuditItem[]>([
    {
      id: "act-01",
      time: "10 mins ago",
      action: "Guardrail Enforced",
      recId: "REC-012",
      detail: "Hedged deadline filter intercepted slow gRPC connection from payment processor.",
    },
    {
      id: "act-02",
      time: "2 hours ago",
      action: "Policy Scheduled",
      recId: "REC-022",
      detail: "NodeLocal DNSCache daemonset rollout queued for 23:00 UTC maintenance window.",
    },
    {
      id: "act-03",
      time: "5 hours ago",
      action: "Validation Gate Executed",
      recId: "REC-008",
      detail: "Postgres safe DDL validation verified 0 lock wait timeouts on schema patch #4410.",
    },
  ]);

  // Handler: When Apply is clicked
  const handleApply = (rec: PreventionRecommendation) => {
    // 1. Remove from recommendations
    setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));

    // 2. Add to applied actions
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")} UTC`;

    const updatedRec: PreventionRecommendation = {
      ...rec,
      status: "applied",
      appliedAt: `Just now (${timeStr}) by SRE Operator`,
    };

    setAppliedActions((prev) => [updatedRec, ...prev]);

    // 3. Update dashboard statistics
    setStats((prev) => ({
      activeGuardrails: prev.activeGuardrails + 1,
      failuresPrevented: prev.failuresPrevented + 1,
      avgRiskReduction: parseFloat(((prev.avgRiskReduction * 5 + rec.estimatedRiskReduction) / 6).toFixed(1)),
      capitalSavedM: parseFloat((prev.capitalSavedM + 0.14).toFixed(2)),
    }));

    // 4. Create a timeline event
    const newTimelineItem: TimelineAuditItem = {
      id: `act-${Date.now()}`,
      time: "Just now",
      action: "Guardrail Applied",
      recId: rec.id,
      detail: `Operator applied prevention policy: "${rec.title}". Enforced across ${rec.targetSystem}.`,
    };
    setActivityTimeline((prev) => [newTimelineItem, ...prev]);

    // 5. Show success toast
    setToast({
      id: `toast-${Date.now()}`,
      message: `Action Applied: ${rec.id} is now Active`,
      subtext: `Automated guardrail enforced on ${rec.targetSystem}. Estimated risk reduced by ${rec.estimatedRiskReduction}%.`,
    });
  };

  // Handler: Open Schedule Modal
  const handleOpenSchedule = (rec: PreventionRecommendation) => {
    setSchedulingModalRec(rec);
  };

  // Handler: Confirm Schedule
  const handleConfirmSchedule = () => {
    if (!schedulingModalRec) return;

    const rec = schedulingModalRec;
    setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));

    const updatedRec: PreventionRecommendation = {
      ...rec,
      status: "scheduled",
      scheduledFor: scheduleWindow,
      scheduleDetails: {
        window: scheduleWindow,
        environment: scheduleEnvironment,
        recurring: scheduleRecurring,
      },
    };

    setScheduledActions((prev) => [updatedRec, ...prev]);

    // Add timeline event
    const newTimelineItem: TimelineAuditItem = {
      id: `act-${Date.now()}`,
      time: "Just now",
      action: "Action Scheduled",
      recId: rec.id,
      detail: `Scheduled "${rec.title}" for ${scheduleWindow} (${scheduleEnvironment}).`,
    };
    setActivityTimeline((prev) => [newTimelineItem, ...prev]);

    // Show toast
    setToast({
      id: `toast-${Date.now()}`,
      message: `Scheduled: ${rec.id}`,
      subtext: `Queued execution for ${scheduleWindow}. Guardrail will activate automatically.`,
    });

    setSchedulingModalRec(null);
  };

  // Filter recommendations based on search
  const filterList = (list: PreventionRecommendation[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.targetSystem.toLowerCase().includes(q)
    );
  };

  const filteredRecommended = filterList(recommendations);
  const filteredApplied = filterList(appliedActions);
  const filteredScheduled = filterList(scheduledActions);
  const filteredCompleted = filterList(completedActions);

  return (
    <div className="space-y-8">
      {/* Top Banner: Cognitive Purpose */}
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-sky-950/40 p-4 sm:p-5 shadow-lg shadow-emerald-950/20 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="rounded-lg bg-emerald-500/10 p-2.5 border border-emerald-500/30 text-emerald-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                  Organizational Learning In Action
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300 border border-emerald-500/30">
                  Adaptive Immunity Active
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                Every Past Failure Becomes Future Immunity
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Resonyx doesn&apos;t just monitor or identify problems after they break production. It synthesizes
                every postmortem into <span className="text-white font-semibold">executable prevention guardrails</span>,
                turning hard-earned historical lessons into verifiable architectural immunity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <span className="font-mono text-xs text-slate-400">
              Active Gates: <strong className="text-emerald-400">{stats.activeGuardrails}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header & Subtitle */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Prevention Center
              </h1>
              <span className="rounded-md bg-emerald-950/80 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-700/60">
                {recommendations.length} Actions Ready
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Actions generated from organizational learning — transforming historical postmortems into preventive policies.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search prevention actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-xl border border-emerald-500/50 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md max-w-md animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm text-white">{toast.message}</div>
            <div className="text-xs text-slate-300 mt-0.5">{toast.subtext}</div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Dashboard Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
            <span>Enforced Guardrails</span>
            <Shield className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {stats.activeGuardrails}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Active in CI/CD &amp; runtime proxies
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
            <span>Prevented Failures</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {stats.failuresPrevented}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/80">
            +3 in last 7 calendar days
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
            <span>Avg Risk Reduction</span>
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {stats.avgRiskReduction}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Measured pre vs post deployment
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
            <span>Capital Downtime Averted</span>
            <Database className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            ${stats.capitalSavedM}M
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Based on historical SLA MTTR baseline
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSection("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeSection === "all"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          All Actions (
          {recommendations.length +
            appliedActions.length +
            scheduledActions.length +
            completedActions.length}
          )
        </button>
        <button
          onClick={() => setActiveSection("recommended")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSection === "recommended"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Recommended Actions ({recommendations.length})
        </button>
        <button
          onClick={() => setActiveSection("applied")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSection === "applied"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Applied Actions ({appliedActions.length})
        </button>
        <button
          onClick={() => setActiveSection("scheduled")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSection === "scheduled"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Clock className="h-3.5 w-3.5 text-indigo-400" />
          Scheduled Actions ({scheduledActions.length})
        </button>
        <button
          onClick={() => setActiveSection("completed")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSection === "completed"
              ? "bg-slate-700/50 text-slate-200 border border-slate-600"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Check className="h-3.5 w-3.5 text-slate-400" />
          Completed Prevention Actions ({completedActions.length})
        </button>
      </div>

      {/* SECTION 1: RECOMMENDED ACTIONS */}
      {(activeSection === "all" || activeSection === "recommended") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Recommended Actions
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {filteredRecommended.length} pending review
            </span>
          </div>

          {filteredRecommended.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400 text-xs">
              No pending recommendations matching your criteria. All organizational actions applied or scheduled!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecommended.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
                >
                  <div>
                    {/* Card Header: Code & Category */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/50">
                          {rec.id}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {rec.category}
                        </span>
                      </div>
                      <span className="rounded bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
                        {rec.targetSystem}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white mt-3 group-hover:text-sky-300 transition-colors">
                      {rec.title}
                    </h3>

                    {/* Reason */}
                    <div className="mt-2.5 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Reason
                      </div>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>

                    {/* Estimated Risk Reduction Meter */}
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2">
                      <span className="text-xs text-slate-400 font-medium">
                        Estimated Risk Reduction:
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-400 h-2 rounded-full"
                            style={{ width: `${rec.estimatedRiskReduction}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {rec.estimatedRiskReduction}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons: Apply, Schedule, Review Evidence */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApply(rec)}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-950/40 transition-all inline-flex items-center gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Apply
                      </button>

                      <button
                        onClick={() => handleOpenSchedule(rec)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors inline-flex items-center gap-1.5"
                      >
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        Schedule
                      </button>
                    </div>

                    <button
                      onClick={() => setEvidenceModalRec(rec)}
                      className="rounded-lg border border-sky-500/30 bg-sky-950/30 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-900/40 hover:text-sky-200 transition-colors inline-flex items-center gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5 text-sky-400" />
                      Review Evidence
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: APPLIED ACTIONS */}
      {(activeSection === "all" || activeSection === "applied") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Applied Actions
              </h2>
            </div>
            <span className="rounded-md bg-emerald-950/80 px-2 py-0.5 text-xs font-mono font-bold text-emerald-300 border border-emerald-800/60">
              {filteredApplied.length} Enforced in Production
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApplied.map((rec) => (
              <div
                key={rec.id}
                className="rounded-2xl border border-emerald-900/40 bg-slate-900/70 p-5 backdrop-blur-md shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                        {rec.id}
                      </span>
                      <span className="flex items-center gap-1 rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-800/50">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        Status: Applied
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {rec.appliedAt}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-3">
                    {rec.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {rec.reason}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs">
                    <span className="text-slate-400">Target System:</span>
                    <span className="font-mono text-slate-200">{rec.targetSystem}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-mono font-bold">
                    Risk Reduction: -{rec.estimatedRiskReduction}%
                  </span>
                  <button
                    onClick={() => setEvidenceModalRec(rec)}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1"
                  >
                    View Supporting Evidence &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: SCHEDULED ACTIONS */}
      {(activeSection === "all" || activeSection === "scheduled") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Scheduled Actions
              </h2>
            </div>
            <span className="rounded-md bg-indigo-950/80 px-2 py-0.5 text-xs font-mono font-bold text-indigo-300 border border-indigo-800/60">
              {filteredScheduled.length} Queued
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScheduled.map((rec) => (
              <div
                key={rec.id}
                className="rounded-2xl border border-indigo-900/40 bg-slate-900/70 p-5 backdrop-blur-md shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                        {rec.id}
                      </span>
                      <span className="flex items-center gap-1 rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-800/50">
                        <Clock className="h-3 w-3 text-indigo-400" />
                        Scheduled
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-300 font-bold">
                      {rec.scheduledFor}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-3">
                    {rec.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {rec.reason}
                  </p>

                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Execution Window:</span>
                      <span className="text-slate-200 font-mono">
                        {rec.scheduleDetails?.window || rec.scheduledFor}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Target Env:</span>
                      <span className="text-slate-200 font-mono">
                        {rec.scheduleDetails?.environment || "Production"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleApply(rec)}
                    className="rounded bg-sky-600 hover:bg-sky-500 px-3 py-1 text-xs font-bold text-white transition-colors"
                  >
                    Apply Now
                  </button>
                  <button
                    onClick={() => setEvidenceModalRec(rec)}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                  >
                    Review Evidence &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: COMPLETED PREVENTION ACTIONS */}
      {(activeSection === "all" || activeSection === "completed") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Completed Prevention Actions
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Verified Failure Avoidance Ledger
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md shadow-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase bg-slate-950/60">
                  <th className="p-4">Action ID &amp; Guardrail</th>
                  <th className="p-4">Derived Pattern</th>
                  <th className="p-4">Execution Date</th>
                  <th className="p-4">Risk Reduction</th>
                  <th className="p-4">Downtime Capital Saved</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCompleted.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-400">{rec.id}</span>
                        <span className="text-slate-200 font-semibold">{rec.title}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        {rec.targetSystem}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      <span className="rounded bg-slate-950 px-2 py-0.5 border border-slate-800 text-[11px]">
                        {rec.evidence.learnedPattern}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{rec.appliedAt}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      -{rec.estimatedRiskReduction}%
                    </td>
                    <td className="p-4 font-mono font-bold text-white">
                      {rec.metricsAverted?.estimatedSavedCapital || "$90,000"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setEvidenceModalRec(rec)}
                        className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        Evidence
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prevention Activity Audit Feed */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-sky-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Prevention Audit Log &amp; Activity Timeline
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Live CI/CD Policy Stream</span>
        </div>

        <div className="mt-4 space-y-3">
          {activityTimeline.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-slate-800/60 bg-slate-950/60 p-3.5 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-500/20 p-1 text-emerald-400">
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.action}</span>
                    <span className="font-mono text-[10px] text-sky-400 bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-800/40">
                      {item.recId}
                    </span>
                  </div>
                  <p className="mt-0.5 text-slate-400 leading-snug">{item.detail}</p>
                </div>
              </div>
              <span className="font-mono text-[11px] text-slate-500 shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SCHEDULING MODAL */}
      {schedulingModalRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Schedule Prevention Action
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {schedulingModalRec.id} • {schedulingModalRec.targetSystem}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSchedulingModalRec(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Selected Action
                </label>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-semibold text-white">
                  {schedulingModalRec.title}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Execution Window
                </label>
                <select
                  value={scheduleWindow}
                  onChange={(e) => setScheduleWindow(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
                >
                  <option>Tonight, 22:00 UTC (Pre-Deployment)</option>
                  <option>Tonight, 23:30 UTC (Low Traffic Window)</option>
                  <option>Tomorrow, 03:00 UTC (Global Minimum)</option>
                  <option>Next CI/CD Release Pipeline Trigger</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Target Environment
                </label>
                <select
                  value={scheduleEnvironment}
                  onChange={(e) => setScheduleEnvironment(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
                >
                  <option>Production (US-East &amp; EU-West)</option>
                  <option>Staging Pre-Release Soak Cluster</option>
                  <option>Canary 10% Traffic Bucket</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={scheduleRecurring}
                  onChange={(e) => setScheduleRecurring(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="recurringCheck" className="text-slate-300 cursor-pointer">
                  Persist as recurring pre-deployment guardrail for future releases
                </label>
              </div>
            </div>

            <div className="border-t border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setSchedulingModalRec(null)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-950/50 transition-colors inline-flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                Confirm &amp; Queue Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW EVIDENCE MODAL */}
      {evidenceModalRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-sky-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Supporting Historical Evidence
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {evidenceModalRec.id} • {evidenceModalRec.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEvidenceModalRec(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Pattern Grounding */}
              <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                    Underlying Pattern Citation
                  </span>
                  <span className="rounded bg-sky-950 px-2 py-0.5 font-mono text-sky-300 border border-sky-800/60 font-semibold">
                    {evidenceModalRec.evidence.vectorSimilarity}% Vector Match
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  {evidenceModalRec.evidence.learnedPattern}
                </div>
                <p className="mt-1.5 text-slate-300 leading-relaxed">
                  {evidenceModalRec.evidence.recommendedActionDetails}
                </p>
              </div>

              {/* Supporting Incidents */}
              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                  Historical Incidents That Caused Outages
                </h4>
                <div className="space-y-3">
                  {evidenceModalRec.evidence.supportingIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/incidents/${inc.id}`}
                          className="font-mono font-bold text-sky-400 hover:underline flex items-center gap-1"
                        >
                          {inc.id} — {inc.name}
                          <ExternalLink className="h-3 w-3 text-slate-400" />
                        </Link>
                        <span className="text-slate-500 font-mono text-[11px]">{inc.date}</span>
                      </div>
                      <div className="text-rose-400 font-mono font-semibold text-[11px]">
                        Historical Impact: {inc.impact}
                      </div>
                      <p className="text-slate-300 leading-snug">
                        <strong>Root Cause:</strong> {inc.rootCause}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capital & MTTR Impact */}
              {evidenceModalRec.metricsAverted && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-center">
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      Estimated Saved Outage Loss
                    </span>
                    <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                      {evidenceModalRec.metricsAverted.estimatedSavedCapital}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-center">
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      Expected MTTR Reduction
                    </span>
                    <div className="text-lg font-bold font-mono text-sky-400 mt-0.5">
                      {evidenceModalRec.metricsAverted.mttrReduction}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 bg-slate-950 px-6 py-3.5 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Grounding Source: Hindsight Organizational Memory
              </span>
              <button
                onClick={() => setEvidenceModalRec(null)}
                className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Close Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
