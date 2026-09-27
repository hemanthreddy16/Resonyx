export interface SimulationScenarioConfig {
  id: "payment" | "database" | "deployment" | "api";
  buttonLabel: string;
  incidentCode: string;
  incidentTitle: string;
  service: string;
  severity: "critical" | "high";
  initialTelemetry: {
    metricName: string;
    spikeValue: string;
    baselineValue: string;
    description: string;
  };
  investigationText: string;
  memoryMatches: {
    memoryId: string;
    similarity: number;
    insight: string;
    historicalOutcome: string;
  }[];
  similarIncidents: {
    id: string;
    name: string;
    downtime: string;
    similarity: number;
  }[];
  riskScore: number;
  patternCode: string;
  patternName: string;
  patternConfidence: number;
  recommendation: {
    action: string;
    why: string;
    estimatedRiskDrop: number;
    savedCapital: string;
  };
  postAcceptanceOutcome: {
    resolutionTime: string;
    statusSummary: string;
    newMemoryId: string;
    patternStatUpdate: string;
    timelineEventTitle: string;
    kpiDeltaText: string;
  };
}

export const SIMULATION_SCENARIOS: Record<string, SimulationScenarioConfig> = {
  payment: {
    id: "payment",
    buttonLabel: "Simulate Payment Failure",
    incidentCode: "SIM-1052",
    incidentTitle: "Payment Gateway Transaction Lock Contention",
    service: "payments-core / aurora-postgres",
    severity: "critical",
    initialTelemetry: {
      metricName: "Inbound RPS & Threadpool Queue",
      spikeValue: "15,400 req/sec (Lock Queue: 52 threads)",
      baselineValue: "3,600 req/sec (< 2 threads)",
      description: "Sudden promotion surge triggered simultaneous foreign key lock contention on ledger_transactions.",
    },
    investigationText:
      "Telemetry analyzer detected threadpool saturation on pg-primary-01. Aurora connection pool queue depth exceeded 50 waiting workers. Downstream checkout mutations stalling with p99 latency at 4,800ms.",
    memoryMatches: [
      {
        memoryId: "MEM-8421",
        similarity: 94.2,
        insight: "Restarting the service is ineffective under high database contention.",
        historicalOutcome: "Failed (Caused cluster-wide crash)",
      },
      {
        memoryId: "MEM-8119",
        similarity: 91.5,
        insight: "Missing covering index on ledger_events causes full table lock during burst traffic.",
        historicalOutcome: "Resolved by hotfix index deployment",
      },
    ],
    similarIncidents: [
      { id: "INC-1047", name: "Payment API Performance Degradation", downtime: "34 min", similarity: 94.2 },
      { id: "INC-1039", name: "Database Connection Pool Saturation", downtime: "48 min", similarity: 91.5 },
      { id: "INC-0918", name: "Checkout Service Deadlock Storm", downtime: "41 min", similarity: 86.4 },
    ],
    riskScore: 88,
    patternCode: "PAT-017",
    patternName: "High Traffic + Database Contention",
    patternConfidence: 94.8,
    recommendation: {
      action: "Pause background settlement worker migration and apply 25% adaptive rate shedding at ingress proxy.",
      why: "Organizational memory confirms service restarts fail 82% of the time, while rate shedding normalizes DB pool within 180 seconds.",
      estimatedRiskDrop: 64,
      savedCapital: "$140,000",
    },
    postAcceptanceOutcome: {
      resolutionTime: "2m 14s",
      statusSummary: "Lock contention resolved. Aurora CPU normalized to 38%. Zero checkout transactions dropped.",
      newMemoryId: "MEM-8501 (Indexed)",
      patternStatUpdate: "PAT-017: Success count increased to 13 (Confidence 95.2%)",
      timelineEventTitle: "Day 61 — Automated Ingress Shedding Intercepted Payment Lock Freeze",
      kpiDeltaText: "+1 Failure Prevented • $140K Capital Preserved • Active Incidents: 0",
    },
  },

  database: {
    id: "database",
    buttonLabel: "Simulate Database Failure",
    incidentCode: "SIM-1053",
    incidentTitle: "Postgres Migration ACCESS EXCLUSIVE Lock Queue",
    service: "account-ledger / pg-replica-pool",
    severity: "critical",
    initialTelemetry: {
      metricName: "Postgres Lock Timeout & Buffer Cache",
      spikeValue: "840 queries blocked (CPU: 96.8%)",
      baselineValue: "0 queries blocked (CPU: 24%)",
      description: "Un-timed ALTER TABLE statement queued behind long-running analytical query, halting all write operations.",
    },
    investigationText:
      "Active query inspector detected table 'accounts' locked in ACCESS EXCLUSIVE mode by migration process PID 44109. All subsequent read/write transactions queued in memory.",
    memoryMatches: [
      {
        memoryId: "MEM-7940",
        similarity: 96.1,
        insight: "Always enforce lock_timeout = '3s' when running production schema migrations.",
        historicalOutcome: "Mitigated by statement cancellation",
      },
      {
        memoryId: "MEM-8891",
        similarity: 93.4,
        insight: "Direct ALTER TABLE without CONCURRENTLY locks out customer ledger storage.",
        historicalOutcome: "Led to INC-8891 ($195K loss)",
      },
    ],
    similarIncidents: [
      { id: "INC-8891", name: "Postgres Connection Pool Starvation", downtime: "32 min", similarity: 96.1 },
      { id: "INC-1039", name: "Database Connection Pool Saturation", downtime: "48 min", similarity: 91.5 },
      { id: "INC-0742", name: "Order Processing Batch Latency", downtime: "15 min", similarity: 84.0 },
    ],
    riskScore: 92,
    patternCode: "PAT-017",
    patternName: "Non-Concurrent DDL Migration on High-Traffic Tables",
    patternConfidence: 96.0,
    recommendation: {
      action: "Execute pg_cancel_backend on PID 44109 and re-queue migration with lock_timeout = '3s' and CONCURRENTLY modifier.",
      why: "Historical precedent INC-8891 proves waiting for locks causes cascade pool starvation across all application tiers.",
      estimatedRiskDrop: 72,
      savedCapital: "$195,000",
    },
    postAcceptanceOutcome: {
      resolutionTime: "1m 45s",
      statusSummary: "Exclusive lock released. 840 queued transactions cleared in 12 seconds. Ledger DB latency restored to 14ms.",
      newMemoryId: "MEM-8502 (Indexed)",
      patternStatUpdate: "PAT-017: Verified safe DDL enforcement rule enforced across CI/CD",
      timelineEventTitle: "Day 61 — Lock Contention Terminated Before Ledger Outage Occurred",
      kpiDeltaText: "+1 Failure Prevented • $195K Capital Preserved • Active Incidents: 0",
    },
  },

  deployment: {
    id: "deployment",
    buttonLabel: "Simulate Deployment Failure",
    incidentCode: "SIM-1054",
    incidentTitle: "Canary Memory Heap Gradient Monotonic Leak",
    service: "checkout-v2 / container-heap",
    severity: "high",
    initialTelemetry: {
      metricName: "JVM/Node Heap Growth & GC Pauses",
      spikeValue: "Heap: +48MB/min (GC Pause: 1.8s)",
      baselineValue: "Heap: Flat (GC Pause: 12ms)",
      description: "Release v2.14.0 canary pods exhibiting positive linear memory slope under 10% traffic routing.",
    },
    investigationText:
      "Real-time heap profiler identified unclosed gRPC client channel buffers inside payment webhook listener. Container memory reached 88% of limit with OOM kill expected in 18 minutes.",
    memoryMatches: [
      {
        memoryId: "MEM-8119",
        similarity: 94.8,
        insight: "Monotonic heap growth during canary deployment indicates unclosed gRPC client streams.",
        historicalOutcome: "Mitigated by immediate canary rollback",
      },
      {
        memoryId: "MEM-8924",
        similarity: 89.2,
        insight: "Autoscaling pods with memory leaks merely delays OOM restarts and multiplies pod crash loops.",
        historicalOutcome: "Failed (Caused INC-0892)",
      },
    ],
    similarIncidents: [
      { id: "INC-0892", name: "OOM Container Restarts in Checkout Pods", downtime: "38 min", similarity: 94.8 },
      { id: "INC-0840", name: "Memory Heap Saturation Post-Deployment", downtime: "19 min", similarity: 89.0 },
    ],
    riskScore: 84,
    patternCode: "PAT-023",
    patternName: "Memory Leak After Deployment",
    patternConfidence: 91.2,
    recommendation: {
      action: "Trigger automated canary rollback to v2.13.9 and isolate git commit #d84a1e for stream cleanup.",
      why: "Past experience proves scaling container memory fails 100% of the time. Early rollback prevents cluster-wide OOM restart storms.",
      estimatedRiskDrop: 68,
      savedCapital: "$210,000",
    },
    postAcceptanceOutcome: {
      resolutionTime: "3m 10s",
      statusSummary: "Canary rolled back cleanly. Heap usage normalized to stable 240MB baseline. Zero user sessions dropped.",
      newMemoryId: "MEM-8503 (Indexed)",
      patternStatUpdate: "PAT-023: Canary soak evaluation guardrail added to GitHub Actions",
      timelineEventTitle: "Day 61 — Predictive Canary Rollback Prevented Cluster OOM Crash",
      kpiDeltaText: "+1 Failure Prevented • $210K Capital Preserved • Active Incidents: 0",
    },
  },

  api: {
    id: "api",
    buttonLabel: "Simulate API Outage",
    incidentCode: "SIM-1055",
    incidentTitle: "Cascading Edge Ingress Timeout Storm",
    service: "edge-gateway / envoy-mesh",
    severity: "critical",
    initialTelemetry: {
      metricName: "HTTP 504 Gateway Timeouts & Worker Backpressure",
      spikeValue: "504 Error Rate: 14.8% (Queue: 180 reqs)",
      baselineValue: "504 Error Rate: 0.01% (Queue: 0 reqs)",
      description: "Third-party fraud validation provider latency degraded to 6.2s, exhausting edge Envoy client connection threads.",
    },
    investigationText:
      "Edge gateway worker thread saturation detected. Inbound checkout calls to /v2/checkout/process timing out at reverse proxy due to unbounded downstream HTTP timeouts.",
    memoryMatches: [
      {
        memoryId: "MEM-6812",
        similarity: 95.4,
        insight: "Enforce 500ms hedged timeouts and bulkhead thread isolation on all third-party provider calls.",
        historicalOutcome: "Resolved by circuit breaker trip",
      },
      {
        memoryId: "MEM-9940",
        similarity: 92.0,
        insight: "Upstream HTTP 504 surges must be intercepted at the gateway with priority load shedding.",
        historicalOutcome: "Saved $115K in INC-0994",
      },
    ],
    similarIncidents: [
      { id: "INC-1028", name: "API Timeout Spike", downtime: "28 min", similarity: 95.4 },
      { id: "INC-0994", name: "Cascading API Gateway Timeout", downtime: "22 min", similarity: 92.0 },
    ],
    riskScore: 90,
    patternCode: "PAT-031",
    patternName: "API Timeout During Traffic Spike",
    patternConfidence: 96.0,
    recommendation: {
      action: "Activate PRV-104 Circuit Breaker: Trip fraud provider fallback to cached evaluation and enforce 500ms hedged timeout.",
      why: "Tripping the circuit breaker instantly restores gateway latency from 6,200ms to 42ms, preventing checkout pipeline deadlock.",
      estimatedRiskDrop: 76,
      savedCapital: "$115,000",
    },
    postAcceptanceOutcome: {
      resolutionTime: "1m 18s",
      statusSummary: "Circuit breaker tripped. Fallback scoring active. Gateway HTTP 504 rate dropped to 0.00%. Checkout latency back to 38ms.",
      newMemoryId: "MEM-8504 (Indexed)",
      patternStatUpdate: "PAT-031: Breaker tripped successfully with zero checkout abandonments",
      timelineEventTitle: "Day 61 — Edge Circuit Breaker Intercepted Third-Party Cascading Timeout",
      kpiDeltaText: "+1 Failure Prevented • $115K Capital Preserved • Active Incidents: 0",
    },
  },
};
