"use client";

import React, { useState } from "react";
import {
  Plus,
  CheckCircle2,
  X,
  Sliders,
  RefreshCw,
} from "lucide-react";
import { MOCK_INTEGRATIONS } from "@/data/mockIntegrations";
import { IntegrationService } from "@/types";

export function IntegrationsView() {
  const [integrations, setIntegrations] = useState<IntegrationService[]>(MOCK_INTEGRATIONS);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [configureIntegration, setConfigureIntegration] = useState<IntegrationService | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Webhook form state
  const [webhookName, setWebhookName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("whsec_live_9x81f20489c");
  const [webhookEvents, setWebhookEvents] = useState({
    incidents: true,
    recommendations: true,
    outcomes: true,
  });

  // Toast notification
  const [toast, setToast] = useState<{ message: string; subtext?: string } | null>(null);

  const showToast = (message: string, subtext?: string) => {
    setToast({ message, subtext });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookName.trim() || !webhookUrl.trim()) return;

    const newIntegration: IntegrationService = {
      id: `wh-${Date.now()}`,
      name: webhookName,
      category: "Telemetry",
      iconName: "webhook",
      status: "connected",
      description: `Custom inbound/outbound webhook sending incident triggers and receiving postmortem events at ${webhookUrl}.`,
      lastSync: "Just now",
      eventsProcessed: "0 events",
      endpointUrl: webhookUrl,
    };

    setIntegrations((prev) => [newIntegration, ...prev]);
    setShowWebhookModal(false);
    setWebhookName("");
    setWebhookUrl("");
    showToast(
      `Custom Webhook "${newIntegration.name}" Connected`,
      "HMAC signature verification enabled with zero-trust envelope."
    );
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult("HTTP 200 OK — Latency 14.2ms, TLS 1.3 verified, payload accepted.");
    }, 900);
  };

  const handleSaveConfiguration = () => {
    if (!configureIntegration) return;
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === configureIntegration.id ? configureIntegration : item
      )
    );
    showToast(
      `${configureIntegration.name} Configuration Saved`,
      "Connection parameters and sync interval updated."
    );
    setConfigureIntegration(null);
  };

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "connected" ? "available" : "connected";
          showToast(
            `${item.name} ${nextStatus === "connected" ? "Connected" : "Disconnected"}`,
            nextStatus === "connected"
              ? "Telemetry stream active and indexed into Hindsight."
              : "Telemetry polling paused."
          );
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-xl border border-sky-500/40 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md max-w-md animate-in slide-in-from-bottom">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white">{toast.message}</h4>
            {toast.subtext && <p className="text-[11px] text-slate-300">{toast.subtext}</p>}
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Telemetry & Ecosystem Integrations
            </h1>
            <span className="rounded-md bg-sky-950/80 px-2 py-0.5 text-xs font-mono text-sky-400 border border-sky-800/60 font-semibold">
              {connectedCount} Connected
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Connect incident responders, APM telemetry, CI/CD code repositories, and cloud providers to power continuous failure learning.
          </p>
        </div>

        <button
          onClick={() => setShowWebhookModal(true)}
          className="flex items-center gap-2 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-sky-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Webhook</span>
        </button>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => {
          const isConnected = item.status === "connected";

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-sm hover:border-slate-700 transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {item.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.category}
                    </span>
                  </div>

                  {isConnected ? (
                    <span className="flex items-center gap-1.5 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-700">
                      Available
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 border-t border-slate-800/80 pt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                  <span>Processed: <strong className="text-slate-200">{item.eventsProcessed}</strong></span>
                  <span>Sync: {item.lastSync}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setConfigureIntegration(item);
                      setTestResult(null);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-800/80 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => toggleConnection(item.id)}
                    className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                      isConnected
                        ? "border border-red-500/30 bg-red-950/30 text-red-300 hover:bg-red-900/40"
                        : "bg-sky-600 text-white hover:bg-sky-500"
                    }`}
                  >
                    {isConnected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-sky-500/40 bg-slate-950 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Add Custom Webhook</h3>
              </div>
              <button
                onClick={() => setShowWebhookModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Webhook Name</label>
                <input
                  type="text"
                  placeholder="e.g. Internal Canary Telemetry Webhook"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Payload URL</label>
                <input
                  type="url"
                  placeholder="https://api.internal.corp/webhooks/resonyx"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 font-mono text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Secret Token (HMAC-SHA256)</label>
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 font-mono text-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-2">Subscribed Event Triggers</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookEvents.incidents}
                      onChange={(e) => setWebhookEvents({ ...webhookEvents, incidents: e.target.checked })}
                      className="rounded accent-sky-500"
                    />
                    <span>Incident Lifecycles (Triggered, Mitigated, Resolved)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookEvents.recommendations}
                      onChange={(e) => setWebhookEvents({ ...webhookEvents, recommendations: e.target.checked })}
                      className="rounded accent-sky-500"
                    />
                    <span>Predictive Risk Alerts & Guardrail Recommendations</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookEvents.outcomes}
                      onChange={(e) => setWebhookEvents({ ...webhookEvents, outcomes: e.target.checked })}
                      className="rounded accent-sky-500"
                    />
                    <span>Empirical Outcome Updates & Pattern Crystallization</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500 shadow"
                >
                  Create & Activate Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Integration Modal */}
      {configureIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-sky-500/40 bg-slate-950 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  Configure {configureIntegration.name}
                </h3>
              </div>
              <button
                onClick={() => setConfigureIntegration(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Service Category</label>
                <input
                  type="text"
                  readOnly
                  value={configureIntegration.category}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 font-mono text-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">API Endpoint / Connection URL</label>
                <input
                  type="text"
                  value={configureIntegration.endpointUrl || `https://api.${configureIntegration.id}.internal/v1`}
                  readOnly
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 font-mono text-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Synchronization Frequency</label>
                <select className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-slate-200 focus:outline-none">
                  <option value="realtime">Real-time Webhook Streaming (Sub-second)</option>
                  <option value="1min">Polling Every 1 Minute</option>
                  <option value="5min">Polling Every 5 Minutes</option>
                </select>
              </div>

              {/* Live Test Connection */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Connectivity Check</span>
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-950/60 px-3 py-1 text-xs font-mono font-bold text-sky-300 hover:bg-sky-900/60 transition-colors"
                  >
                    <RefreshCw className={`h-3 w-3 ${isTesting ? "animate-spin" : ""}`} />
                    <span>{isTesting ? "Testing..." : "Test Connection"}</span>
                  </button>
                </div>
                {testResult && (
                  <div className="rounded border border-emerald-500/30 bg-emerald-950/40 p-2 text-[11px] font-mono text-emerald-300 animate-in fade-in">
                    ✓ {testResult}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfigureIntegration(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfiguration}
                className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500 shadow"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
