import { Incident, HindsightMemoryRecord, FailurePattern } from "@/types";
import { MOCK_INCIDENTS } from "@/data/mockIncidents";
import { MOCK_HINDSIGHT_MEMORIES } from "@/data/mockHindsightMemory";
import { MOCK_PATTERNS } from "@/data/mockPatterns";

/**
 * ==============================================================================
 * RESONYX HINDSIGHT SERVICE LAYER
 * ==============================================================================
 *
 * THE 9-STEP COGNITIVE DATA FLOW:
 * ------------------------------------------------------------------------------
 *  1. New Incident                  -> Ingests live telemetry & error stack
 *  2. Store Experience              -> Encodes postmortem into 1536-dim vector
 *  3. Hindsight Memory              -> Persists embedding in vector graph index
 *  4. Recall Similar Experiences    -> Cosine similarity search (top-k neighbors)
 *  5. Pattern Detection             -> Clusters incidents into recurring invariants
 *  6. Recommendation                -> Synthesizes prescriptive mitigation guardrail
 *  7. Outcome                       -> Operator executes action or circuit breaker
 *  8. Store Outcome                 -> Records whether the action succeeded or failed
 *  9. Updated Learning              -> Adjusts pattern confidence & updates playbooks
 * ------------------------------------------------------------------------------
 */

export interface HindsightConfig {
  apiUrl?: string;
  apiKey?: string;
  isDemoMode: boolean;
}

export interface StoreMemoryResponse {
  memoryId: string;
  vectorId: string;
  status: "indexed" | "queued";
  timestamp: string;
}

export interface RecallResult {
  incident: Incident;
  similarity: number;
  vectorId: string;
  relevanceExplanation: string;
}

export interface StoreOutcomeResponse {
  success: boolean;
  memoryId: string;
  feedbackRecorded: boolean;
  previousOutcome?: string;
  newOutcome: string;
  details?: string;
  updatedAt: string;
}

export interface UpdateLearningResponse {
  updated: boolean;
  memoryId: string;
  newConfidence: number;
  learnedInsight: string;
}

export interface MemoryEvidenceResult {
  patternCode: string;
  primaryInvariant: string;
  supportingMemories: HindsightMemoryRecord[];
  correlatedIncidents: Incident[];
  confidenceScore: number;
  provenEffectiveActions: string[];
  provenIneffectiveActions: string[];
}

export class HindsightEngineService {
  private static instance: HindsightEngineService;
  private config: HindsightConfig;

  private constructor() {
    // Check if real credentials are provided (server-side only)
    const apiKey = typeof process !== "undefined" ? process.env?.HINDSIGHT_API_KEY : undefined;
    const apiUrl = typeof process !== "undefined" ? process.env?.HINDSIGHT_API_URL : undefined;

    this.config = {
      apiUrl: apiUrl || "",
      apiKey: apiKey || "",
      isDemoMode: !Boolean(apiKey && apiKey.trim().length > 0),
    };
  }

  public static getInstance(): HindsightEngineService {
    if (!HindsightEngineService.instance) {
      HindsightEngineService.instance = new HindsightEngineService();
    }
    return HindsightEngineService.instance;
  }

  /**
   * Returns current connection state: "CONNECTED" (live API) vs "DEMO MODE" (local vectors).
   */
  public getConnectionStatus(): { status: "CONNECTED" | "DEMO MODE"; isDemoMode: boolean } {
    return {
      status: this.config.isDemoMode ? "DEMO MODE" : "CONNECTED",
      isDemoMode: this.config.isDemoMode,
    };
  }

  /**
   * 1. storeIncidentMemory()
   * Step 2 & 3 in Data Flow: Encodes a resolved postmortem into a 1536-dimensional Hindsight memory vector.
   *
   * REAL API INTEGRATION POINT:
   * ----------------------------------------------------------------------------
   * POST `${HINDSIGHT_API_URL}/v1/memories`
   * Headers: { "Authorization": `Bearer ${HINDSIGHT_API_KEY}`, "Content-Type": "application/json" }
   * Body: { incidentId, title, service, rootCause, telemetry, actionTaken, outcome }
   * ----------------------------------------------------------------------------
   */
  public async storeIncidentMemory(incident: Partial<Incident>): Promise<StoreMemoryResponse> {
    if (!this.config.isDemoMode && this.config.apiUrl) {
      /*
       * REAL HINDSIGHT CLUSTER CALL:
       * const response = await fetch(`${this.config.apiUrl}/v1/memories`, {
       *   method: "POST",
       *   headers: {
       *     "Authorization": `Bearer ${this.config.apiKey}`,
       *     "Content-Type": "application/json",
       *   },
       *   body: JSON.stringify({
       *     incidentId: incident.id,
       *     title: incident.title,
       *     service: incident.service,
       *     rootCause: incident.rootCauseDomain,
       *     severity: incident.severity,
       *     telemetryMetrics: incident.telemetryMetrics,
       *   }),
       * });
       * return await response.json();
       */
    }

    // Local Demo Mode Implementation:
    const memoryId = incident?.id
      ? `MEM-${incident.id.replace(/\D/g, "") || "9000"}`
      : `MEM-${Math.floor(8500 + Math.random() * 500)}`;
    const vectorId = `vec_0x${Math.random().toString(16).substring(2, 8)}`;

    return {
      memoryId,
      vectorId,
      status: "indexed",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 2. recallSimilarIncidents()
   * Step 4 in Data Flow: Executes cosine vector search across historical incident postmortems.
   *
   * REAL API INTEGRATION POINT:
   * ----------------------------------------------------------------------------
   * POST `${HINDSIGHT_API_URL}/v1/recall`
   * Headers: { "Authorization": `Bearer ${HINDSIGHT_API_KEY}`, "Content-Type": "application/json" }
   * Body: { queryVector: [0.024, -0.019, ...], topK: 4, threshold: 0.80 }
   * ----------------------------------------------------------------------------
   */
  public async recallSimilarIncidents(
    queryOrVector: string,
    topK: number = 4
  ): Promise<RecallResult[]> {
    if (!this.config.isDemoMode && this.config.apiUrl) {
      /*
       * REAL HINDSIGHT CLUSTER CALL:
       * const response = await fetch(`${this.config.apiUrl}/v1/recall`, {
       *   method: "POST",
       *   headers: { "Authorization": `Bearer ${this.config.apiKey}` },
       *   body: JSON.stringify({ query: queryOrVector, topK }),
       * });
       * return await response.json();
       */
    }

    // Local Demo Mode Implementation:
    const q = queryOrVector.toLowerCase();
    const matches = MOCK_INCIDENTS.filter(
      (inc) =>
        inc.title.toLowerCase().includes(q) ||
        inc.service.toLowerCase().includes(q) ||
        inc.rootCauseDomain.toLowerCase().includes(q) ||
        q === ""
    ).slice(0, topK);

    const defaultSimilarities = [94.2, 91.5, 88.7, 86.4];
    return matches.map((inc, idx) => ({
      incident: inc,
      similarity: defaultSimilarities[idx] ?? 82.0,
      vectorId: inc.hindsightVectorId,
      relevanceExplanation: `Matched on shared root cause '${inc.rootCauseDomain}' under comparable ingress traffic surge.`,
    }));
  }

  /**
   * 3. storeOutcome()
   * Step 8 in Data Flow: Records action outcome (succeeded/failed) to train future recovery playbooks.
   *
   * REAL API INTEGRATION POINT:
   * ----------------------------------------------------------------------------
   * PATCH `${HINDSIGHT_API_URL}/v1/memories/${memoryId}/outcome`
   * Headers: { "Authorization": `Bearer ${HINDSIGHT_API_KEY}`, "Content-Type": "application/json" }
   * Body: { outcome: "Recovered", resolutionTimeSeconds: 134, details: "Rate shedding normalized pool" }
   * ----------------------------------------------------------------------------
   */
  public async storeOutcome(
    memoryId: string,
    outcome: "Failed" | "Recovered" | "Mitigated" | "Ineffective" | "Prevented",
    details?: string
  ): Promise<StoreOutcomeResponse> {
    if (!this.config.isDemoMode && this.config.apiUrl) {
      /*
       * REAL HINDSIGHT CLUSTER CALL:
       * const response = await fetch(`${this.config.apiUrl}/v1/memories/${memoryId}/outcome`, {
       *   method: "PATCH",
       *   headers: { "Authorization": `Bearer ${this.config.apiKey}` },
       *   body: JSON.stringify({ outcome, details }),
       * });
       * return await response.json();
       */
    }

    // Local Demo Mode Implementation:
    return {
      success: true,
      memoryId,
      feedbackRecorded: true,
      newOutcome: outcome,
      details: details || "Outcome successfully stored to Hindsight vector store.",
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 4. retrieveLearnedPatterns()
   * Step 5 in Data Flow: Returns crystallized organizational patterns mined from historical outcomes.
   *
   * REAL API INTEGRATION POINT:
   * ----------------------------------------------------------------------------
   * GET `${HINDSIGHT_API_URL}/v1/patterns?minConfidence=0.85`
   * Headers: { "Authorization": `Bearer ${HINDSIGHT_API_KEY}` }
   * ----------------------------------------------------------------------------
   */
  public async retrieveLearnedPatterns(domain?: string): Promise<FailurePattern[]> {
    if (!this.config.isDemoMode && this.config.apiUrl) {
      /*
       * REAL HINDSIGHT CLUSTER CALL:
       * const response = await fetch(`${this.config.apiUrl}/v1/patterns?domain=${domain || ""}`, {
       *   headers: { "Authorization": `Bearer ${this.config.apiKey}` },
       * });
       * return await response.json();
       */
    }

    // Local Demo Mode Implementation:
    if (!domain || domain === "all") {
      return MOCK_PATTERNS;
    }
    return MOCK_PATTERNS.filter(
      (pat) => pat.category.toLowerCase() === domain.toLowerCase()
    );
  }

  /**
   * 5. updateLearning()
   * Step 9 in Data Flow: Calibrates pattern confidence when new telemetry verifies or disproves a hypothesis.
   *
   * REAL API INTEGRATION POINT:
   * ----------------------------------------------------------------------------
   * PUT `${HINDSIGHT_API_URL}/v1/learning/${memoryId}`
   * Headers: { "Authorization": `Bearer ${HINDSIGHT_API_KEY}`, "Content-Type": "application/json" }
   * Body: { newInsight, confidenceDelta: +0.8, validationSource: "INC-1050" }
   * ----------------------------------------------------------------------------
   */
  public async updateLearning(
    memoryId: string,
    newInsight: string,
    confidenceDelta: number = 0.8
  ): Promise<UpdateLearningResponse> {
    if (!this.config.isDemoMode && this.config.apiUrl) {
      /*
       * REAL HINDSIGHT CLUSTER CALL:
       * const response = await fetch(`${this.config.apiUrl}/v1/learning/${memoryId}`, {
       *   method: "PUT",
       *   headers: { "Authorization": `Bearer ${this.config.apiKey}` },
       *   body: JSON.stringify({ newInsight, confidenceDelta }),
       * });
       * return await response.json();
       */
    }

    // Local Demo Mode Implementation:
    return {
      updated: true,
      memoryId,
      newConfidence: Math.min(99.4, 94.2 + confidenceDelta),
      learnedInsight: newInsight,
    };
  }

  /**
   * 6. getRelevantMemories()
   * Step 3 & 4 in Data Flow: Returns top semantic memory records matching an incident signature.
   *
   * REAL API INTEGRATION POINT:
   * ----------------------------------------------------------------------------
   * POST `${HINDSIGHT_API_URL}/v1/memories/search`
   * Headers: { "Authorization": `Bearer ${HINDSIGHT_API_KEY}`, "Content-Type": "application/json" }
   * Body: { query, semanticFilters: ["database", "payment"] }
   * ----------------------------------------------------------------------------
   */
  public async getRelevantMemories(
    query: string,
    limit: number = 5
  ): Promise<HindsightMemoryRecord[]> {
    if (!this.config.isDemoMode && this.config.apiUrl) {
      /*
       * REAL HINDSIGHT CLUSTER CALL:
       * const response = await fetch(`${this.config.apiUrl}/v1/memories/search`, {
       *   method: "POST",
       *   headers: { "Authorization": `Bearer ${this.config.apiKey}` },
       *   body: JSON.stringify({ query, limit }),
       * });
       * return await response.json();
       */
    }

    // Local Demo Mode Implementation:
    const q = query.toLowerCase();
    const filtered = MOCK_HINDSIGHT_MEMORIES.filter(
      (m) =>
        m.extractedRule.toLowerCase().includes(q) ||
        m.antiPatternSignature.toLowerCase().includes(q) ||
        m.knowledgeDomain.toLowerCase().includes(q) ||
        m.learnedInsight.toLowerCase().includes(q) ||
        m.action.toLowerCase().includes(q) ||
        m.rootCause.toLowerCase().includes(q) ||
        m.decision.toLowerCase().includes(q) ||
        m.semanticTags.some((t) => t.toLowerCase().includes(q))
    );

    return filtered.slice(0, limit);
  }

  /**
   * 7. getMemoryEvidence()
   * Step 6 in Data Flow: Assembles the complete evidence bundle supporting an AI recommendation.
   *
   * REAL API INTEGRATION POINT:
   * ----------------------------------------------------------------------------
   * GET `${HINDSIGHT_API_URL}/v1/evidence/${patternCode}`
   * Headers: { "Authorization": `Bearer ${HINDSIGHT_API_KEY}` }
   * ----------------------------------------------------------------------------
   */
  public async getMemoryEvidence(patternCode: string): Promise<MemoryEvidenceResult> {
    if (!this.config.isDemoMode && this.config.apiUrl) {
      /*
       * REAL HINDSIGHT CLUSTER CALL:
       * const response = await fetch(`${this.config.apiUrl}/v1/evidence/${patternCode}`, {
       *   headers: { "Authorization": `Bearer ${this.config.apiKey}` },
       * });
       * return await response.json();
       */
    }

    // Local Demo Mode Implementation:
    const pattern = MOCK_PATTERNS.find((p) => p.patternCode === patternCode) || MOCK_PATTERNS[0];
    const incidents = pattern.historicalIncidents || [];
    const supportingMemories = MOCK_HINDSIGHT_MEMORIES.filter((m) =>
      incidents.includes(m.sourceIncidentCode) || m.patternCode === patternCode
    );
    const correlatedIncidents = MOCK_INCIDENTS.filter((inc) =>
      incidents.includes(inc.id)
    );

    return {
      patternCode: pattern.patternCode,
      primaryInvariant: pattern.name,
      supportingMemories,
      correlatedIncidents,
      confidenceScore: pattern.confidenceScore,
      provenEffectiveActions: pattern.successfulActions || [
        "Pause in-flight migrations",
        "Enforce 25% ingress rate shedding",
        "Verify foreign key index coverage",
      ],
      provenIneffectiveActions: pattern.failedActions || [
        "Blind service restart (crashes connection pool)",
        "Autoscaling container memory (merely delays OOM)",
      ],
    };
  }
}

// Export singleton instance
export const hindsightService = HindsightEngineService.getInstance();
