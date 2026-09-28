"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Shield,
  Database,
  Save,
  Check,
  Building2,
  Key,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";

type HealthReport = {
  status: string;
  environment: string;
  services: {
    database: {
      status: string;
      connected: boolean;
      dialect?: string;
      tableCount?: number;
      error?: string;
    };
    hindsight: { status: string; configured: boolean; storageMode: string };
    openrouter: { status: string; configured: boolean; model: string };
  };
};

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<"workspace" | "vector" | "security" | "api">("workspace");
  const [saved, setSaved] = useState(false);
  const [similarityThreshold, setSimilarityThreshold] = useState("0.88");
  const [vectorRetention, setVectorRetention] = useState("indefinite");
  const [autoBlockP1, setAutoBlockP1] = useState(true);
  const [autoShedTraffic, setAutoShedTraffic] = useState(true);
  const [isVerifyingCluster, setIsVerifyingCluster] = useState(false);
  const [clusterStatus, setClusterStatus] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthReport | null>(null);

  const readHealth = useCallback(async () => {
    const res = await fetch("/api/health", { cache: "no-store" });
    const json = (await res.json()) as HealthReport;
    setHealth(json);
    return json;
  }, []);

  useEffect(() => {
    readHealth().catch(() => setHealth(null));
  }, [readHealth]);

  // Toast
  const [toast, setToast] = useState<{ message: string; subtext?: string } | null>(null);

  const showToast = (message: string, subtext?: string) => {
    setToast({ message, subtext });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = () => {
    setSaved(true);
    showToast(
      "Settings Updated",
      "Changes are held in this session. No settings persist to the database in this build."
    );
    setTimeout(() => setSaved(false), 2000);
  };

  // Verification reads the real health endpoint; no numbers are invented here.
  const handleVerifyCluster = async () => {
    setIsVerifyingCluster(true);
    setClusterStatus(null);
    try {
      const json = await readHealth();
      const db = json.services.database;
      if (db.connected) {
        setClusterStatus(
          `Database connected (${db.dialect ?? "unknown"}). Hindsight: ${json.services.hindsight.status} via ${json.services.hindsight.storageMode}. Model: ${json.services.openrouter.model}.`
        );
      } else {
        setClusterStatus(`Database not connected${db.error ? `: ${db.error}` : "."}`);
      }
    } catch {
      setClusterStatus("Could not reach the health endpoint.");
    } finally {
      setIsVerifyingCluster(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-xl border border-sky-500/40 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md max-w-md animate-in slide-in-from-bottom">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-white">{toast.message}</h4>
            {toast.subtext && <p className="text-sm text-slate-300">{toast.subtext}</p>}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div>
            <h1 className="text-[30px] font-bold tracking-tight text-white">
              Settings
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Inspect the live services this workspace depends on. Credentials are read from the environment and are
              never displayed here.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500 transition-colors"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{saved ? "Saved" : "Save Changes"}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("workspace")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "workspace"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Organization Profile</span>
        </button>
        <button
          onClick={() => setActiveTab("vector")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "vector"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Hindsight Vector Memory</span>
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "security"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Automated Guardrails</span>
        </button>
        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "api"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Key className="h-3.5 w-3.5" />
          <span>Service Configuration</span>
        </button>
      </div>

      {/* Tab 1: Organization Profile */}
      {activeTab === "workspace" && (
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-5 animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="h-4 w-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-white">Runtime Environment</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-slate-400 font-medium">Environment</label>
              <div className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200">
                {health?.environment ?? "Loading..."}
              </div>
            </div>
            <div>
              <label className="text-slate-400 font-medium">Overall Status</label>
              <div className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200">
                {health?.status ?? "Loading..."}
              </div>
            </div>
            <div>
              <label className="text-slate-400 font-medium">Database</label>
              <div className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-slate-300">
                {health
                  ? `${health.services.database.status}${
                      health.services.database.dialect ? ` (${health.services.database.dialect})` : ""
                    }`
                  : "Loading..."}
              </div>
            </div>
            <div>
              <label className="text-slate-400 font-medium">Hindsight Memory</label>
              <div className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-slate-300">
                {health
                  ? `${health.services.hindsight.status} — ${health.services.hindsight.storageMode}`
                  : "Loading..."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hindsight Vector Engine Settings */}
      {activeTab === "vector" && (
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Hindsight Vector Memory Configuration</h2>
            </div>
            <button
              onClick={handleVerifyCluster}
              disabled={isVerifyingCluster}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/60 px-3 py-1 text-sm font-medium text-cyan-300 hover:bg-cyan-900/60 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${isVerifyingCluster ? "animate-spin" : ""}`} />
              <span>{isVerifyingCluster ? "Verifying..." : "Verify Cluster Health"}</span>
            </button>
          </div>

          {clusterStatus && (
            <div className="rounded border border-emerald-500/30 bg-emerald-950/40 p-2.5 text-sm text-emerald-300 animate-in fade-in">
              ✓ {clusterStatus}
            </div>
          )}

          <div className="space-y-4 text-sm">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium">Cosine Similarity Match Threshold</label>
                <span className="font-mono text-sky-400 font-bold">{similarityThreshold}</span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                Minimum vector similarity score required to trigger proactive pre-deployment alerts.
              </p>
              <input
                type="range"
                min="0.70"
                max="0.99"
                step="0.01"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(e.target.value)}
                className="mt-2 w-full accent-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-slate-300 font-medium">Memory Vector Retention Period</label>
                <select
                  value={vectorRetention}
                  onChange={(e) => setVectorRetention(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:outline-none"
                >
                  <option value="indefinite">Indefinite (Recommended for organizational learning)</option>
                  <option value="5years">5 Years</option>
                  <option value="3years">3 Years</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Memory Storage Mode</label>
                <div className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300 font-mono">
                  {health?.services.hindsight.storageMode ?? "Loading..."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Automated Prevention Enforcement */}
      {activeTab === "security" && (
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Automated Guardrail Enforcement</h2>
          </div>

          <div className="space-y-3 text-sm">
            <label className="flex items-start justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 cursor-pointer">
              <div className="pr-4">
                <div className="font-semibold text-slate-200">
                  Auto-Block High Probability P1 Anti-Patterns
                </div>
                <div className="text-sm text-slate-400 mt-0.5">
                  Automatically fail CI/CD build gates if a change matches a known critical failure vector with ≥ 90% confidence.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoBlockP1}
                onChange={(e) => setAutoBlockP1(e.target.checked)}
                className="h-4 w-4 rounded accent-sky-500 mt-1"
              />
            </label>

            <label className="flex items-start justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 cursor-pointer">
              <div className="pr-4">
                <div className="font-semibold text-slate-200">
                  Automated Bulkhead Rate-Shedding Activation
                </div>
                <div className="text-sm text-slate-400 mt-0.5">
                  Dynamically activate 25% traffic shedding on upstream ingress gateways when database lock contention exceeds 2 seconds.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoShedTraffic}
                onChange={(e) => setAutoShedTraffic(e.target.checked)}
                className="h-4 w-4 rounded accent-sky-500 mt-1"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 4: Service Configuration */}
      {activeTab === "api" && (
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-5 animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Key className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Service Configuration</h2>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Hindsight Cluster</label>
              <div className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300 font-mono">
                {health
                  ? health.services.hindsight.configured
                    ? "Configured — API key loaded from the server environment"
                    : "Not configured — using the PostgreSQL vector store"
                  : "Loading..."}
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Reasoning Model</label>
              <div className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300 font-mono">
                {health
                  ? `${health.services.openrouter.model} (${
                      health.services.openrouter.configured
                        ? "configured"
                        : "deterministic fallback in use"
                    })`
                  : "Loading..."}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
              <span className="font-mono text-sm font-bold uppercase text-sky-400 block">
                Required Environment Variables
              </span>
              <p className="text-sm text-slate-300">
                These are read from the server environment. Values are never fetched by or rendered in the browser —
                supply them via <code className="text-sky-300">.env</code> as described in{" "}
                <code className="text-sky-300">.env.example</code>.
              </p>
              <pre className="rounded bg-slate-900 p-3 font-mono text-sm text-slate-300 overflow-x-auto border border-slate-800">
{`HINDSIGHT_API_URL   # optional, enables the Hindsight REST API
HINDSIGHT_API_KEY   # optional, required for the Hindsight REST API
DATABASE_URL        # PostgreSQL connection string
AI_API_KEY          # optional, enables the hosted reasoning model`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
