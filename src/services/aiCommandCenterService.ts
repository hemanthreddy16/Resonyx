import { AiCommandMessage } from "@/types";

export interface QueryHindsightOptions {
  query: string;
  temperature?: number;
  topKMemories?: number;
  streamCallback?: (partial: string) => void;
}

export class AiCommandCenterService {
  private static instance: AiCommandCenterService;

  public static getInstance(): AiCommandCenterService {
    if (!AiCommandCenterService.instance) {
      AiCommandCenterService.instance = new AiCommandCenterService();
    }
    return AiCommandCenterService.instance;
  }

  /**
   * Primary entry point for querying organizational failure memory.
   * Currently retrieves structured responses backed by realistic Hindsight vectors,
   * architected with clean interfaces to plug in real LLM provider endpoints (Gemini, Claude, GPT-4).
   */
  public async queryOrganizationalMemory(options: QueryHindsightOptions): Promise<AiCommandMessage> {
    const { query } = options;
    const normalized = query.toLowerCase().trim();

    // Simulate vector search & cognitive inference latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")} UTC`;

    // 1. "What caused the last payment failure?"
    if (normalized.includes("last payment failure") || normalized.includes("caused the last payment")) {
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        timestamp,
        query,
        historicalPattern: {
          patternCode: "PAT-017",
          patternName: "High Traffic + Database Contention",
          summary: "This incident resembles 4 previous payment degradation events.",
          resemblanceText: "This incident resembles 4 previous incidents.",
          contentionFactor: "3 involved high database contention after deployment.",
          failedAttemptsText: "2 previous attempts to restart the service failed.",
        },
        recommendation: {
          actionText: "Investigate the database query introduced in the latest deployment.",
          rationale:
            "Unindexed foreign key lookups under > 8,000 RPS exhaust connection pool threads within 180 seconds. Avoid service restart; apply read-replica shedding instead.",
          priority: "Immediate",
        },
        evidenceIncidents: [
          {
            id: "INC-0871",
            name: "DB Read-Replica Lag Degrade",
            date: "81 days ago",
            outcome: "Successful Mitigation",
            rootCause: "Temporary query buffer bloat; mitigated early by pausing migration runner.",
            vectorSimilarity: 82.3,
          },
          {
            id: "INC-0918",
            name: "Checkout Service Deadlock Storm",
            date: "62 days ago",
            outcome: "Severe Outage",
            rootCause: "Simultaneous schema patch and concurrent customer checkout transactions.",
            vectorSimilarity: 86.4,
          },
          {
            id: "INC-0994",
            name: "Cascading API Gateway Timeout",
            date: "45 days ago",
            outcome: "Severe Outage",
            rootCause: "Upstream PostgreSQL write lock stalled worker threads, causing HTTP 504 surge.",
            vectorSimilarity: 88.7,
          },
          {
            id: "INC-1012",
            name: "Transaction Queue Thread Starvation",
            date: "31 days ago",
            outcome: "Failed Attempt",
            rootCause: "Restarting service under database lock contention crashed connection pool.",
            vectorSimilarity: 91.0,
          },
        ],
        influencingMemories: [
          {
            memoryId: "MEM-8421",
            title: "Payment API Contention Under Burst",
            learnedInsight: "Restarting the service is ineffective under high database contention.",
            historicalAction: "Service restart",
            historicalOutcome: "Failed (Caused cluster-wide crash)",
            confidence: 87,
            similarity: 94.2,
          },
          {
            memoryId: "MEM-8119",
            title: "Unindexed Foreign Key Cascade Lock",
            learnedInsight: "Missing covering index on ledger_events causes full table lock during migrations.",
            historicalAction: "Hotfix index deployment with CONCURRENTLY",
            historicalOutcome: "Successful Mitigation",
            confidence: 93,
            similarity: 91.5,
          },
        ],
        confidenceScore: 94.2,
        deductionTrace: [
          "Queried 8,492 memory embeddings for semantic matches to 'payment-api' and 'connection saturation'.",
          "Calculated 0.058 cosine distance match against pattern PAT-017.",
          "Identified 4 historical incidents with > 80% vector proximity.",
          "Isolated that restarting the pod had 0% success across 2 attempts.",
          "Synthesized prescriptive query validation recommendation.",
        ],
      };
    }

    // 2. "Have we seen this problem before?"
    if (normalized.includes("seen this problem before") || normalized.includes("seen this before")) {
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        timestamp,
        query,
        historicalPattern: {
          patternCode: "PAT-017",
          patternName: "High Traffic + Database Contention",
          summary: "Yes. This exact operational signature has been observed 17 times in the past 12 months.",
          resemblanceText: "17 historical occurrences documented across checkout and billing services.",
          contentionFactor: "12 occurrences were resolved successfully via rate shedding; 5 failed after manual service restarts.",
          failedAttemptsText: "Last observed 14 days ago during INC-1047 (34 mins downtime).",
        },
        recommendation: {
          actionText: "Enforce automated pre-deployment query lock validation and pause in-flight migrations.",
          rationale:
            "Historical outcomes demonstrate that proactive lock checking prevents the recurring threadpool freeze with 94% statistical confidence.",
          priority: "Immediate",
        },
        evidenceIncidents: [
          {
            id: "INC-1047",
            name: "Payment API Performance Degradation",
            date: "14 days ago",
            outcome: "Severe Outage",
            rootCause: "Database threadpool exhaustion due to unindexed foreign key lock contention.",
            vectorSimilarity: 94.2,
          },
          {
            id: "INC-1039",
            name: "Database Connection Pool Saturation",
            date: "28 days ago",
            outcome: "Severe Outage",
            rootCause: "Migration script held exclusive ACCESS EXCLUSIVE lock on transactions table.",
            vectorSimilarity: 91.5,
          },
          {
            id: "INC-0918",
            name: "Checkout Service Deadlock Storm",
            date: "62 days ago",
            outcome: "Severe Outage",
            rootCause: "Simultaneous schema patch and concurrent customer checkout transactions.",
            vectorSimilarity: 86.4,
          },
        ],
        influencingMemories: [
          {
            memoryId: "MEM-8421",
            title: "Payment API Failure Under DB Contention",
            learnedInsight: "Restarting the service is ineffective under high database contention.",
            historicalAction: "Service restart",
            historicalOutcome: "Failed",
            confidence: 87,
            similarity: 94.2,
          },
          {
            memoryId: "MEM-7940",
            title: "PostgreSQL ACCESS EXCLUSIVE Lock Storm",
            learnedInsight: "Always use lock_timeout = '3s' when running production schema migrations.",
            historicalAction: "Enforced statement timeout",
            historicalOutcome: "Successful Mitigation",
            confidence: 95,
            similarity: 92.1,
          },
        ],
        confidenceScore: 94.0,
        deductionTrace: [
          "Matched active telemetry against 17 historical incidents in cluster PAT-017.",
          "Identified root cause overlap: Aurora PostgreSQL primary write lock saturation.",
          "Corroborated 12 successful mitigations vs 5 failed manual restarts.",
        ],
      };
    }

    // 3. "What patterns are increasing?"
    if (normalized.includes("patterns are increasing") || normalized.includes("increasing patterns")) {
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        timestamp,
        query,
        historicalPattern: {
          patternCode: "PAT-031 & PAT-023",
          patternName: "Traffic Spike Timeouts & Canary Memory Leaks",
          summary: "Two failure patterns have increased in frequency over the last 30 days.",
          resemblanceText: "PAT-031 (API Timeout During Traffic Spike) frequency increased by +28%.",
          contentionFactor: "PAT-023 (Memory Leak After Deployment) observed 3 times across recent v2.13 and v2.14 releases.",
          failedAttemptsText: "Unbounded HTTP client pools and unclosed gRPC streams are the primary culprits.",
        },
        recommendation: {
          actionText: "Mandate PRV-104 (Hedged Timeouts) and 45-minute staging soak tests in CI/CD pipeline.",
          rationale:
            "Applying PRV-104 historically halted 38 potential incidents across 42 repositories.",
          priority: "High",
        },
        evidenceIncidents: [
          {
            id: "INC-1028",
            name: "API Timeout Spike",
            date: "18 days ago",
            outcome: "Severe Outage",
            rootCause: "Gateway backlog saturated worker pool threads when traffic reached 300% baseline.",
            vectorSimilarity: 92.5,
          },
          {
            id: "INC-0892",
            name: "OOM Container Restarts in Checkout Pods",
            date: "52 days ago",
            outcome: "Severe Outage",
            rootCause: "Monotonic heap growth from unclosed gRPC client channel buffers.",
            vectorSimilarity: 90.8,
          },
        ],
        influencingMemories: [
          {
            memoryId: "MEM-6812",
            title: "Worker Thread Pool Starvation During Flash Event",
            learnedInsight: "Adaptive rate shedding at ingress level is 4x more effective than autoscaling pods.",
            historicalAction: "Ingress rate shedding",
            historicalOutcome: "Successful Mitigation",
            confidence: 91,
            similarity: 93.0,
          },
          {
            memoryId: "MEM-8119",
            title: "Progressive Heap Leak in Canary Pods",
            learnedInsight: "Heap allocation slope must be profiled for minimum 45 minutes to catch async leaks.",
            historicalAction: "Canary rollback",
            historicalOutcome: "Successful Mitigation",
            confidence: 94,
            similarity: 90.4,
          },
        ],
        confidenceScore: 92.8,
        deductionTrace: [
          "Aggregated frequency deltas across all 43 catalogued failure patterns.",
          "Identified upward velocity in PAT-031 (+28%) and PAT-023 (+14%).",
          "Cross-referenced recent pull requests with gRPC client modifications.",
        ],
      };
    }

    // 4. "Which failures are most likely to repeat?"
    if (normalized.includes("likely to repeat") || normalized.includes("most likely to repeat")) {
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        timestamp,
        query,
        historicalPattern: {
          patternCode: "PAT-017 & PAT-038",
          patternName: "Database Lock Saturation & Cache Stampedes",
          summary: "Database lock contention during peak traffic carries the highest recurrence probability (78%).",
          resemblanceText: "Historical probability model indicates 78% likelihood of repetition without automated CI/CD guardrail.",
          contentionFactor: "Simultaneous schema migrations scheduled near marketing campaigns.",
          failedAttemptsText: "Cache stampedes on Redis clusters during morning login windows rank second (64%).",
        },
        recommendation: {
          actionText: "Enforce automated CI/CD guardrail PRV-014: block schema migrations missing lock_timeout parameters.",
          rationale:
            "Enforcing lock_timeout = 3s has a 100% historical track record of preventing full catalog table locks.",
          priority: "Immediate",
        },
        evidenceIncidents: [
          {
            id: "INC-1039",
            name: "Database Connection Pool Saturation",
            date: "28 days ago",
            outcome: "Severe Outage",
            rootCause: "Migration script held exclusive lock during marketing blast.",
            vectorSimilarity: 91.5,
          },
          {
            id: "INC-0965",
            name: "Redis Cache Eviction Thrash",
            date: "39 days ago",
            outcome: "Severe Outage",
            rootCause: "Simultaneous key expiry unleashed stampede queries onto read replica.",
            vectorSimilarity: 88.4,
          },
        ],
        influencingMemories: [
          {
            memoryId: "MEM-7940",
            title: "Postgres Safe DDL Lock Timeout",
            learnedInsight: "Un-timed ALTER TABLE statements cause 78% of data outages.",
            historicalAction: "PRV-014 Safe DDL Gate",
            historicalOutcome: "Successful Mitigation",
            confidence: 95,
            similarity: 93.6,
          },
        ],
        confidenceScore: 95.0,
        deductionTrace: [
          "Calculated recurrent exposure scores across 8,492 memory records.",
          "Isolated unmitigated architectural gaps in upcoming release pipelines.",
          "Identified PAT-017 as highest risk blast radius vector.",
        ],
      };
    }

    // 5. "What did we learn from the last 10 incidents?"
    if (normalized.includes("last 10 incidents") || normalized.includes("learn from the last 10")) {
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        timestamp,
        query,
        historicalPattern: {
          patternCode: "CROSS-SYSTEM SYNTHESIS",
          patternName: "Post-Incident Synthesis Across 10 Events",
          summary: "Three fundamental architectural axioms crystallized from the last 10 incidents.",
          resemblanceText: "1. Service restarts under database contention fail 82% of the time.",
          contentionFactor: "2. Bulkhead connection pools between front-end and workers eliminate 85% of cascade lockouts.",
          failedAttemptsText: "3. Synthetic canary soak tests catch 100% of progressive memory leaks before production merge.",
        },
        recommendation: {
          actionText: "Transition on-call runbooks from reactive pod recycling to automated traffic shedding.",
          rationale:
            "Organizational memory confirms that throttling incoming load preserves database availability while pod restarts trigger thundering herd crashes.",
          priority: "High",
        },
        evidenceIncidents: [
          {
            id: "INC-1047",
            name: "Payment API Degradation",
            date: "14 days ago",
            outcome: "Severe Outage",
            rootCause: "Unindexed foreign key lock contention.",
            vectorSimilarity: 94.2,
          },
          {
            id: "INC-1028",
            name: "API Timeout Spike",
            date: "18 days ago",
            outcome: "Severe Outage",
            rootCause: "Worker threadpool exhausted by upstream gateway delay.",
            vectorSimilarity: 92.5,
          },
          {
            id: "INC-0892",
            name: "OOM Container Restarts",
            date: "52 days ago",
            outcome: "Severe Outage",
            rootCause: "Unclosed gRPC client buffers.",
            vectorSimilarity: 90.8,
          },
        ],
        influencingMemories: [
          {
            memoryId: "MEM-8421",
            title: "Pod Restart Anti-Pattern",
            learnedInsight: "Restarting services during DB contention prolongs MTTR by 22 minutes.",
            historicalAction: "Enforced runbook policy against pod recycling",
            historicalOutcome: "Successful Mitigation",
            confidence: 87,
            similarity: 92.0,
          },
        ],
        confidenceScore: 93.5,
        deductionTrace: [
          "Retrieved last 10 resolved postmortems from Hindsight repository.",
          "Clustered successful remedial actions vs ineffective interventions.",
          "Synthesized 3 institutional rules for operational playbooks.",
        ],
      };
    }

    // 6. "Why are you recommending this action?"
    if (normalized.includes("recommending this action") || normalized.includes("why are you recommending")) {
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        timestamp,
        query,
        historicalPattern: {
          patternCode: "PAT-017",
          patternName: "Causal Grounding Rationale",
          summary: "This recommendation is grounded in 4 previous failure postmortems and 2 documented failed attempts.",
          resemblanceText: "Historical evidence demonstrates that deploying during traffic bursts caused 34-48 minutes of downtime in identical conditions.",
          contentionFactor: "Running query performance validation before deployment has an 83.7% verified success rate.",
          failedAttemptsText: "Proceeding without validation caused $480K in aggregate downtime revenue losses.",
        },
        recommendation: {
          actionText: "Delay migration until traffic decreases below 4,000 RPS and run synthetic query validation.",
          rationale:
            "This action reduces current operational blast radius from 78/100 (ELEVATED) to 26/100 (NORMAL) without risking user checkout sessions.",
          priority: "Immediate",
        },
        evidenceIncidents: [
          {
            id: "INC-1039",
            name: "Database Connection Pool Saturation",
            date: "28 days ago",
            outcome: "Severe Outage",
            rootCause: "Migration script held exclusive lock during marketing blast.",
            vectorSimilarity: 91.5,
          },
          {
            id: "INC-1047",
            name: "Payment API Degradation",
            date: "14 days ago",
            outcome: "Severe Outage",
            rootCause: "Unindexed foreign key lock contention during traffic peak.",
            vectorSimilarity: 94.2,
          },
        ],
        influencingMemories: [
          {
            memoryId: "MEM-8421",
            title: "Memory Grounding Verification",
            learnedInsight: "Postponing migrations to off-peak hours eliminated 100% of lock contention incidents.",
            historicalAction: "Scheduled off-peak window",
            historicalOutcome: "Successful Mitigation",
            confidence: 94,
            similarity: 95.1,
          },
        ],
        confidenceScore: 94.8,
        deductionTrace: [
          "Audited decision path against 8,492 Hindsight failure vectors.",
          "Calculated expected outage probability without intervention: 66.7%.",
          "Calculated expected outage probability with recommended intervention: 4.2%.",
        ],
      };
    }

    // 7. "Show me similar incidents." (or default fallback)
    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      timestamp,
      query,
      historicalPattern: {
        patternCode: "PAT-017 / PAT-031",
        patternName: "Historical Similarity Cluster",
        summary: "Retrieved 4 highly correlated incidents from Hindsight organizational memory.",
        resemblanceText: "All 4 incidents match current telemetry with > 82% vector cosine similarity.",
        contentionFactor: "Involved high database CPU (> 90%), elevated ingress RPS, and threadpool wait queues.",
        failedAttemptsText: "Historical resolution average: 34 minutes MTTR when unassisted.",
      },
      recommendation: {
        actionText: "Review postmortems for INC-1047 and INC-1039 to align on proven mitigation procedures.",
        rationale:
          "Cross-referencing verified resolution steps prevents repeating historical exploratory missteps.",
        priority: "High",
      },
      evidenceIncidents: [
        {
          id: "INC-1047",
          name: "Payment API Performance Degradation",
          date: "14 days ago",
          outcome: "Severe Outage",
          rootCause: "Database threadpool exhaustion due to unindexed foreign key lock contention.",
          vectorSimilarity: 94.2,
        },
        {
          id: "INC-1039",
          name: "Database Connection Pool Saturation",
          date: "28 days ago",
          outcome: "Severe Outage",
          rootCause: "Migration script held exclusive ACCESS EXCLUSIVE lock on transactions table.",
          vectorSimilarity: 91.5,
        },
        {
          id: "INC-0994",
          name: "Cascading API Gateway Timeout",
          date: "45 days ago",
          outcome: "Severe Outage",
          rootCause: "Upstream PostgreSQL write lock stalled worker threads.",
          vectorSimilarity: 88.7,
        },
        {
          id: "INC-0918",
          name: "Checkout Service Deadlock Storm",
          date: "62 days ago",
          outcome: "Severe Outage",
          rootCause: "Simultaneous schema patch and concurrent customer checkout transactions.",
          vectorSimilarity: 86.4,
        },
      ],
      influencingMemories: [
        {
          memoryId: "MEM-8421",
          title: "Payment API Contention Under Burst",
          learnedInsight: "Restarting the service is ineffective under high database contention.",
          historicalAction: "Service restart",
          historicalOutcome: "Failed",
          confidence: 87,
          similarity: 94.2,
        },
        {
          memoryId: "MEM-8119",
          title: "Unindexed Foreign Key Cascade Lock",
          learnedInsight: "Missing covering index on ledger_events causes full table lock.",
          historicalAction: "Hotfix index deployment with CONCURRENTLY",
          historicalOutcome: "Successful Mitigation",
          confidence: 93,
          similarity: 91.5,
        },
      ],
      confidenceScore: 91.8,
      deductionTrace: [
        "Retrieved top-k semantic neighbors for query from vector database.",
        "Filtered by domain: relational databases, payment processors, ingress gateways.",
        "Sorted by cosine similarity descending.",
      ],
    };
  }
}

export const aiCommandService = AiCommandCenterService.getInstance();
