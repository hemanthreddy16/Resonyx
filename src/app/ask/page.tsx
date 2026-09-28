"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquareText,
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Database,
  ArrowRight,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: {
    memoryCodes?: string[];
    incidentCodes?: string[];
  };
  dataSource?: string;
  timestamp: string;
}

const EXAMPLE_QUESTIONS = [
  "Have we seen this failure before?",
  "What fixed payment API latency last time, and what failed?",
  "Which action has the worst track record for database contention?",
];

export default function AskResonyxPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q || loading) return;

    setError(null);
    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: "user",
        text: q,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setMessages(newMessages);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to query failure intelligence.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          text: data.answer || "I have no stored memory about that.",
          citations: data.citations || { memoryCodes: [], incidentCodes: [] },
          dataSource: data.dataSource || "Live Hindsight",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to reach failure intelligence assistant.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ask Resonyx
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            Query organizational failure intelligence, verified mitigations, and past root causes directly from Hindsight memory.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Hindsight Connected</span>
        </div>
      </div>

      {/* Main Interaction Card */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 backdrop-blur-sm shadow-xl flex flex-col min-h-[520px]">
        {/* Chat Thread Area */}
        <div className="flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-500/30 text-sky-400 shadow-inner">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-semibold text-white">
                  Organizational Failure Intelligence
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Ask any question about historical outages, effective recovery actions, or recurring failure patterns across your services.
                </p>
              </div>

              {/* Example Question Chips */}
              <div className="w-full max-w-lg pt-4 space-y-2 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center mb-2.5">
                  Suggested Questions
                </p>
                {EXAMPLE_QUESTIONS.map((eq, i) => (
                  <button
                    key={i}
                    onClick={() => handleAsk(eq)}
                    className="w-full flex items-center justify-between gap-3 text-left rounded-lg border border-slate-800 bg-slate-950/70 px-3.5 py-2.5 text-xs text-slate-300 hover:border-sky-500/50 hover:bg-slate-900 hover:text-white transition-all group"
                  >
                    <span>&ldquo;{eq}&rdquo;</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-sky-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-xl px-4 py-3 max-w-[85%] sm:max-w-[75%] space-y-2.5 ${
                      msg.sender === "user"
                        ? "bg-sky-600 text-white shadow-md self-end text-sm"
                        : "bg-slate-950/80 border border-slate-800 text-slate-200 text-sm shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 font-mono">
                      <span>{msg.sender === "user" ? "You" : "Resonyx Assistant"}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* Citations & Source Footer for Assistant Messages */}
                    {msg.sender === "assistant" && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                        {/* Cited Entities */}
                        {(msg.citations?.memoryCodes?.length || 0) > 0 ||
                        (msg.citations?.incidentCodes?.length || 0) > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-slate-500 text-[11px] font-medium mr-1">
                              Citations:
                            </span>
                            {msg.citations?.memoryCodes?.map((code) => (
                              <Link
                                key={code}
                                href="/memory"
                                className="inline-flex items-center gap-1 rounded bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 font-mono text-[11px] text-cyan-300 hover:border-cyan-500 hover:text-cyan-200 transition-colors"
                              >
                                <Database className="h-2.5 w-2.5" />
                                <span>{code}</span>
                              </Link>
                            ))}
                            {msg.citations?.incidentCodes?.map((code) => (
                              <Link
                                key={code}
                                href={`/incidents/${code.toLowerCase()}`}
                                className="inline-flex items-center gap-1 rounded bg-sky-950/80 border border-sky-800/60 px-2 py-0.5 font-mono text-[11px] text-sky-300 hover:border-sky-500 hover:text-sky-200 transition-colors"
                              >
                                <span>{code}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            ))}
                          </div>
                        ) : null}

                        {/* Data Source Badge */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          <span>
                            Data source:{" "}
                            <strong className="text-slate-300">
                              {msg.dataSource || "Live Hindsight"}
                            </strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.sender === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-300 shadow">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow animate-pulse">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-xl px-4 py-3 bg-slate-950/80 border border-slate-800 text-slate-300 text-sm shadow-sm flex items-center gap-2">
                    <span className="text-xs text-sky-400 font-mono">Recalling Hindsight vectors...</span>
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-bounce"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-5 mb-2 flex items-center gap-2 rounded-lg bg-red-950/60 border border-red-800/60 px-3.5 py-2 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-slate-800 bg-slate-950/60 p-4 rounded-b-xl">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about historical incidents, failure patterns, or recovery actions..."
              maxLength={500}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-60"
            />
            <button
              onClick={() => handleAsk()}
              disabled={!question.trim() || loading}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 transition-colors shrink-0"
            >
              <span>Send</span>
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Quick example chips beneath input if chat has started */}
          {messages.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-[11px] text-slate-500 font-medium">Try asking:</span>
              {EXAMPLE_QUESTIONS.map((eq, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(eq)}
                  disabled={loading}
                  className="rounded-md border border-slate-800 bg-slate-900/90 px-2 py-0.5 text-[11px] text-slate-300 hover:border-sky-500/40 hover:text-white transition-colors"
                >
                  {eq}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
