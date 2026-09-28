import { NextRequest, NextResponse } from "next/server";
import { hindsightService } from "@/services/hindsightEngine";
import { getAllHindsightMemories, getAllIncidents } from "@/services/db";
import { HindsightMemoryRecord, Incident } from "@/types";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Rate limiter: sliding window, 10 req / 60 s per client IP
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(clientIp) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(clientIp, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(clientIp, timestamps);
  return false;
}

// ---------------------------------------------------------------------------
// Relevance check
// Returns true only when at least one recalled item is meaningfully related
// to the question (not just the highest-confidence item in the DB).
// ---------------------------------------------------------------------------
const STOP_WORDS = new Set([
  "the","a","an","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall","can",
  "i","we","you","he","she","they","it","this","that","which","who","what",
  "how","why","when","where","our","your","their","its","there","here","and",
  "or","but","not","no","so","if","in","on","at","to","for","of","with","by",
  "from","as","about","than","more","any","all","some","been","very","just",
  "also","than","then","than","use","used","using","show","tell","give","list",
  "see","find","get","has","have","had","we","seen","ever",
]);

function keywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[\s,._\-/]+/)
      .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
  );
}

function overlap(queryKw: Set<string>, text: string): number {
  if (!queryKw.size) return 0;
  const textKw = keywords(text);
  let hits = 0;
  for (const w of queryKw) {
    if (textKw.has(w)) hits++;
  }
  return hits / queryKw.size; // ratio 0–1
}

// A memory is relevant if keyword overlap with any meaningful field exceeds threshold.
const MEMORY_RELEVANCE_THRESHOLD = 0.15; // at least ~15% of query keywords found
// An incident is relevant if keyword overlap exceeds threshold.
const INCIDENT_RELEVANCE_THRESHOLD = 0.15;

function isMemoryRelevant(m: HindsightMemoryRecord, queryKw: Set<string>): boolean {
  const searchText = [
    m.knowledgeDomain,
    m.rootCause,
    m.learnedInsight,
    m.extractedRule,
    m.action,
    m.outcome,
    m.outcomeDetail,
    m.sourceIncident,
    m.antiPatternSignature,
    ...(m.semanticTags || []),
  ]
    .filter(Boolean)
    .join(" ");
  return overlap(queryKw, searchText) >= MEMORY_RELEVANCE_THRESHOLD;
}

function isIncidentRelevant(inc: Incident, queryKw: Set<string>): boolean {
  const searchText = [
    inc.title,
    inc.service,
    inc.rootCauseDomain,
    inc.summary,
    ...(Array.isArray(inc.keyLearnings) ? inc.keyLearnings : []),
    ...(Array.isArray(inc.tags) ? inc.tags : []),
  ]
    .filter(Boolean)
    .join(" ");
  return overlap(queryKw, searchText) >= INCIDENT_RELEVANCE_THRESHOLD;
}

// ---------------------------------------------------------------------------
// Citation extractor — scans LLM answer text for MEM-XXXX / INC-XXXX codes
// ---------------------------------------------------------------------------
function extractCitations(
  text: string,
  contextMemories: HindsightMemoryRecord[],
  contextIncidents: Incident[]
) {
  const memoryCodes = new Set<string>();
  const incidentCodes = new Set<string>();

  for (const m of (text.match(/MEM-[A-Za-z0-9-]+/gi) || [])) {
    memoryCodes.add(m.toUpperCase());
  }
  for (const c of (text.match(/INC-[A-Za-z0-9-]+/gi) || [])) {
    incidentCodes.add(c.toUpperCase());
  }

  // Also add codes that appeared in the context and whose code appears in the answer
  for (const cm of contextMemories) {
    if (text.toLowerCase().includes(cm.memoryCode.toLowerCase())) {
      memoryCodes.add(cm.memoryCode);
    }
    if (cm.sourceIncidentCode && text.toLowerCase().includes(cm.sourceIncidentCode.toLowerCase())) {
      incidentCodes.add(cm.sourceIncidentCode);
    }
  }
  for (const ci of contextIncidents) {
    if (text.toLowerCase().includes(ci.code.toLowerCase())) {
      incidentCodes.add(ci.code);
    }
  }

  return {
    memoryCodes: Array.from(memoryCodes),
    incidentCodes: Array.from(incidentCodes),
  };
}

// ---------------------------------------------------------------------------
// POST /api/ask
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    // --- Rate limit ---
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Rate limit exceeded (max 10 questions/min). Please wait a moment before trying again.",
        },
        { status: 429 }
      );
    }

    // --- Validate input ---
    const body = await req.json().catch(() => ({}));
    const question = typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question is required and cannot be empty." },
        { status: 400 }
      );
    }
    if (question.length > 500) {
      return NextResponse.json(
        { success: false, error: "Question is too long (maximum 500 characters)." },
        { status: 400 }
      );
    }

    // --- Recall: fetch more candidates to support aggregate questions ---
    let allRecalledMemories: HindsightMemoryRecord[] = [];
    let allRecalledIncidents: Incident[] = [];

    try {
      allRecalledMemories = await hindsightService.getRelevantMemories(question, 8);
      const recallResults = await hindsightService.recallSimilarIncidents(question, 6);
      allRecalledIncidents = recallResults.map((r) => r.incident);
    } catch {
      // Fallback: keyword filter over full DB — NO unconditional top-N grab
      const allMems = await getAllHindsightMemories();
      const allIncs = await getAllIncidents();
      const qLower = question.toLowerCase();
      allRecalledMemories = allMems.filter(
        (m) =>
          m.sourceIncident.toLowerCase().includes(qLower) ||
          m.knowledgeDomain.toLowerCase().includes(qLower) ||
          m.rootCause.toLowerCase().includes(qLower) ||
          m.learnedInsight.toLowerCase().includes(qLower)
      );
      allRecalledIncidents = allIncs.filter(
        (inc) =>
          inc.title.toLowerCase().includes(qLower) ||
          inc.service.toLowerCase().includes(qLower) ||
          inc.rootCauseDomain.toLowerCase().includes(qLower)
      );
    }

    // --- Relevance gate: filter recalled items against query keywords ---
    const queryKw = keywords(question);
    const relevantMemories = allRecalledMemories.filter((m) =>
      isMemoryRelevant(m, queryKw)
    );
    const relevantIncidents = allRecalledIncidents.filter((inc) =>
      isIncidentRelevant(inc, queryKw)
    );

    // If nothing relevant was found, short-circuit here — do NOT call the LLM.
    if (relevantMemories.length === 0 && relevantIncidents.length === 0) {
      return NextResponse.json({
        success: true,
        answer: "I have no stored memory about that.",
        citations: { memoryCodes: [], incidentCodes: [] },
        dataSource: "Live Hindsight",
        timestamp: new Date().toISOString(),
      });
    }

    // --- Build context bundle ---
    const memoriesContext = relevantMemories
      .map(
        (m) =>
          `[Memory: ${m.memoryCode}] (Source: ${m.sourceIncidentCode || "N/A"} — ${m.sourceIncident})\n` +
          `  Domain:          ${m.knowledgeDomain}\n` +
          `  Root Cause:      ${m.rootCause}\n` +
          `  Action Taken:    ${m.action}\n` +
          `  Outcome:         ${m.outcome}\n` +
          `  Outcome Detail:  ${m.outcomeDetail}\n` +
          `  Learned Insight: ${m.learnedInsight}\n` +
          `  Extracted Rule:  ${m.extractedRule}`
      )
      .join("\n\n");

    const incidentsContext = relevantIncidents
      .map(
        (inc) =>
          `[Incident: ${inc.code}] ${inc.title}\n` +
          `  Service:    ${inc.service} | Severity: ${inc.severity}\n` +
          `  Root Cause: ${inc.rootCauseDomain}\n` +
          `  Summary:    ${inc.summary}\n` +
          `  Learnings:  ${Array.isArray(inc.keyLearnings) ? inc.keyLearnings.join("; ") : inc.keyLearnings}`
      )
      .join("\n\n");

    const systemPrompt = `You are the Resonyx Failure Intelligence Assistant.
Answer ONLY from the memory records and incidents provided below. Do NOT invent facts.
When you cite a memory or incident, use its code exactly as given (e.g. MEM-2001, INC-2017).
If the provided context does not contain enough information to answer, reply exactly:
I have no stored memory about that.
Keep answers factual, concise, and comparative where the question asks for comparison.

=== HINDSIGHT MEMORIES ===
${memoriesContext}

=== INCIDENTS ===
${incidentsContext}`;

    // --- Call OpenRouter LLM (mandatory — no templated fallback) ---
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";

    if (!apiKey || !apiKey.trim()) {
      // No key configured — return a clear error, not a fake answer
      return NextResponse.json(
        {
          success: false,
          error:
            "OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your environment to enable AI answers.",
        },
        { status: 503 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    let answer = "";
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://resonyx.ai",
          "X-Title": "Resonyx Ask Assistant",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        // Parse error body — OpenRouter returns JSON with an `error.message` field
        const rawBody = await response.text().catch(() => "");
        let upstreamMessage = rawBody;
        try {
          const parsed = JSON.parse(rawBody) as { error?: { message?: string; code?: number } };
          if (parsed?.error?.message) upstreamMessage = parsed.error.message;
        } catch {
          // keep rawBody as-is
        }

        // Log status + model + upstream reason. NEVER log the API key.
        console.error(
          `[Ask API] OpenRouter error — status=${response.status} model=${model} reason=${upstreamMessage}`
        );

        // Give the client a clear, actionable message for common status codes.
        let clientError: string;
        if (response.status === 404) {
          clientError = `Model unavailable (${model}). Check the OPENROUTER_MODEL environment variable or use the default anthropic/claude-3.5-sonnet.`;
        } else if (response.status === 401 || response.status === 403) {
          clientError = "OpenRouter rejected the API key. Verify that OPENROUTER_API_KEY is correct and active.";
        } else if (response.status === 429) {
          clientError = "OpenRouter rate limit reached. Please wait a moment and try again.";
        } else {
          clientError = `AI service error (HTTP ${response.status}): ${upstreamMessage.slice(0, 200)}`;
        }

        return NextResponse.json(
          { success: false, error: clientError },
          { status: 502 }
        );
      }

      const json = await response.json();
      answer = json?.choices?.[0]?.message?.content?.trim() || "";
    } catch (err: unknown) {
      const isAbort =
        err instanceof Error && (err.name === "AbortError" || err.message.includes("abort"));
      console.error("[Ask API] OpenRouter call failed:", err);
      return NextResponse.json(
        {
          success: false,
          error: isAbort
            ? "The AI service timed out. Please try again."
            : "Unable to reach the AI service. Please try again.",
        },
        { status: 504 }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!answer) {
      answer = "I have no stored memory about that.";
    }

    const citations = extractCitations(answer, relevantMemories, relevantIncidents);

    return NextResponse.json({
      success: true,
      answer,
      citations,
      dataSource: "Live Hindsight",
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Ask API] Unexpected error:", msg);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to process failure intelligence query. Please try again.",
        details: msg,
      },
      { status: 500 }
    );
  }
}
