import { PreventionGuardrail, PreventionRecommendation } from "@/types";

export const MOCK_PREVENTIONS: PreventionGuardrail[] = [
  {
    id: "prv-01",
    ruleCode: "PRV-104",
    title: "Enforce Hedged Deadlines & gRPC Context Propagation",
    category: "CI/CD Gate",
    enforcementMode: "automated-block",
    appliedCount: 1420,
    preventedFailuresCount: 38,
    estimatedSavedCost: 1940000,
    status: "active",
    lastTriggered: "14 minutes ago",
    derivedFromIncident: "INC-8942"
  },
  {
    id: "prv-02",
    ruleCode: "PRV-014",
    title: "Postgres Zero-Downtime Safe DDL Lock Timeout Enforcement",
    category: "Architecture Policy",
    enforcementMode: "automated-block",
    appliedCount: 890,
    preventedFailuresCount: 22,
    estimatedSavedCost: 1250000,
    status: "active",
    lastTriggered: "42 minutes ago",
    derivedFromIncident: "INC-8891"
  },
  {
    id: "prv-03",
    ruleCode: "PRV-210",
    title: "NodeLocal DNSCache Daemonset Presence & NXDOMAIN Guard",
    category: "Config Validator",
    enforcementMode: "canary-gate",
    appliedCount: 340,
    preventedFailuresCount: 14,
    estimatedSavedCost: 820000,
    status: "active",
    lastTriggered: "2 hours ago",
    derivedFromIncident: "INC-8760"
  },
  {
    id: "prv-04",
    ruleCode: "PRV-089",
    title: "Distributed Credential Renewal Randomized Jitter Buffer",
    category: "Architecture Policy",
    enforcementMode: "canary-gate",
    appliedCount: 512,
    preventedFailuresCount: 19,
    estimatedSavedCost: 460000,
    status: "active",
    lastTriggered: "1 day ago",
    derivedFromIncident: "INC-8615"
  },
  {
    id: "prv-05",
    ruleCode: "PRV-033",
    title: "Redis Key Serialization Payload Quota (< 16KB Limit)",
    category: "Runtime Circuit Breaker",
    enforcementMode: "alert-advisory",
    appliedCount: 2840,
    preventedFailuresCount: 45,
    estimatedSavedCost: 980000,
    status: "active",
    lastTriggered: "3 hours ago",
    derivedFromIncident: "INC-8520"
  }
];

export const MOCK_RECOMMENDATIONS: PreventionRecommendation[] = [
  {
    id: "REC-031",
    title: "Run database validation before tonight's deployment",
    reason: "Similar deployments caused 3 incidents in the past month.",
    estimatedRiskReduction: 63,
    targetSystem: "aurora-postgres-primary / payment-ledger",
    category: "Database & Storage",
    status: "recommended",
    evidence: {
      supportingIncidents: [
        {
          id: "INC-1039",
          name: "Database Connection Pool Saturation",
          date: "28 days ago",
          impact: "48m downtime ($180K revenue loss)",
          rootCause: "Migration script held exclusive ACCESS EXCLUSIVE lock on transactions table during marketing blast",
        },
        {
          id: "INC-1047",
          name: "Payment API Performance Degradation",
          date: "14 days ago",
          impact: "34m degradation ($140K revenue loss)",
          rootCause: "Unindexed foreign key lock contention during traffic surge exhausted pool threads",
        },
        {
          id: "INC-0918",
          name: "Checkout Service Deadlock Storm",
          date: "62 days ago",
          impact: "41m downtime ($160K revenue loss)",
          rootCause: "Simultaneous schema patch and concurrent customer checkout transactions",
        },
      ],
      learnedPattern: "PAT-017 (High Traffic + Database Contention)",
      patternConfidence: 94,
      vectorSimilarity: 94.2,
      recommendedActionDetails:
        "Execute synthetic dry-run validation against staging replica with lock timeouts capped at 3s and foreign key index coverage assertion before release #8924 merge.",
    },
    metricsAverted: {
      estimatedSavedCapital: "$140,000",
      mttrReduction: "38 mins",
    },
  },
  {
    id: "REC-028",
    title: "Enforce adaptive token-bucket rate shedding at Checkout Ingress",
    reason: "Inbound traffic spikes triggered 4 cascade timeouts across checkout microservices.",
    estimatedRiskReduction: 74,
    targetSystem: "edge-ingress / envoy-proxy-cluster",
    category: "Traffic & Gateway",
    status: "recommended",
    evidence: {
      supportingIncidents: [
        {
          id: "INC-1028",
          name: "API Timeout Spike",
          date: "18 days ago",
          impact: "28m degraded checkout ($85K loss)",
          rootCause: "Gateway backlog saturated worker pool threads when traffic reached 300% of nominal baseline",
        },
        {
          id: "INC-0994",
          name: "Cascading API Gateway Timeout",
          date: "45 days ago",
          impact: "22m full 504 outage ($115K loss)",
          rootCause: "Unbounded HTTP client queue cascaded upstream into customer web application",
        },
      ],
      learnedPattern: "PAT-031 (API Timeout During Traffic Spike)",
      patternConfidence: 96,
      vectorSimilarity: 92.5,
      recommendedActionDetails:
        "Arm adaptive rate shedding with priority tiering: allow critical checkout mutations, shed background telemetry to 429 Retry-After.",
    },
    metricsAverted: {
      estimatedSavedCapital: "$115,000",
      mttrReduction: "25 mins",
    },
  },
  {
    id: "REC-024",
    title: "Inject 45-minute staging soak test in Canary CI pipeline",
    reason: "Uncaught memory leak in recent releases caused 2 OOM container crashes in v2.12 and v2.13.",
    estimatedRiskReduction: 81,
    targetSystem: "checkout-v2 / container-heap",
    category: "Runtime & Memory",
    status: "recommended",
    evidence: {
      supportingIncidents: [
        {
          id: "INC-0892",
          name: "OOM Container Restarts in Checkout Pods",
          date: "52 days ago",
          impact: "38m degraded queue ($95K loss)",
          rootCause: "Monotonic heap growth from unclosed gRPC client channel buffers",
        },
        {
          id: "INC-0840",
          name: "Memory Heap Saturation Post-Deployment",
          date: "78 days ago",
          impact: "19m failover lag ($60K loss)",
          rootCause: "Circular buffer reference in JSON parser holding 800MB heap memory",
        },
      ],
      learnedPattern: "PAT-023 (Memory Leak After Deployment)",
      patternConfidence: 89,
      vectorSimilarity: 90.8,
      recommendedActionDetails:
        "Mandate automated 45-minute synthetic traffic soak with heap gradient regression testing in GitHub Actions before promoting canary to production.",
    },
    metricsAverted: {
      estimatedSavedCapital: "$95,000",
      mttrReduction: "32 mins",
    },
  },
  {
    id: "REC-019",
    title: "Pre-warm Redis session cache cluster before morning traffic surge",
    reason: "Cold cache misses degraded primary Postgres read replicas 3 times last month.",
    estimatedRiskReduction: 58,
    targetSystem: "redis-cluster-session / auth-broker",
    category: "Cache & Session",
    status: "recommended",
    evidence: {
      supportingIncidents: [
        {
          id: "INC-0965",
          name: "Redis Cache Eviction Thrash",
          date: "39 days ago",
          impact: "24m auth slowdown ($70K loss)",
          rootCause: "Simultaneous key expiry unleashed stampede queries onto PostgreSQL read replica",
        },
        {
          id: "INC-0912",
          name: "Auth Token Latency Degradation",
          date: "65 days ago",
          impact: "16m login queue ($45K loss)",
          rootCause: "Cache miss rate climbed from 2% to 38% after cluster restart",
        },
      ],
      learnedPattern: "PAT-038 (Cache Failure During High Traffic)",
      patternConfidence: 91,
      vectorSimilarity: 88.4,
      recommendedActionDetails:
        "Trigger asynchronous key pre-warming cron at 06:30 UTC and enable probabilistic early expiration (XFetch algorithm) on session keys.",
    },
    metricsAverted: {
      estimatedSavedCapital: "$70,000",
      mttrReduction: "20 mins",
    },
  },
  {
    id: "REC-015",
    title: "Enforce connection pool bulkhead limits for background workers",
    reason: "Settlement jobs starved customer checkout queries during high-volume periods.",
    estimatedRiskReduction: 69,
    targetSystem: "billing-worker-pool / postgres-pool",
    category: "Async & Messaging",
    status: "recommended",
    evidence: {
      supportingIncidents: [
        {
          id: "INC-1039",
          name: "Database Connection Pool Saturation",
          date: "28 days ago",
          impact: "48m downtime ($180K loss)",
          rootCause: "Background batch workers acquired 70% of total Postgres connections, leaving 30% for checkout API",
        },
        {
          id: "INC-0742",
          name: "Order Processing Batch Latency",
          date: "110 days ago",
          impact: "15m customer checkout lag ($40K loss)",
          rootCause: "Lock queue built up on settlement records without bulkhead isolation",
        },
      ],
      learnedPattern: "PAT-017 (High Traffic + Database Contention)",
      patternConfidence: 93,
      vectorSimilarity: 89.1,
      recommendedActionDetails:
        "Segregate connection pools: allocate maximum 20 connections to background settlement jobs, reserve 80 dedicated connections for front-end API.",
    },
    metricsAverted: {
      estimatedSavedCapital: "$180,000",
      mttrReduction: "30 mins",
    },
  }
];

export const MOCK_INITIAL_APPLIED: PreventionRecommendation[] = [
  {
    id: "REC-012",
    title: "Enforce 500ms Hedged Timeout and Bulkhead isolation on Payment Gateway",
    reason: "Cascading thread pool exhaustion caused INC-8942 during upstream provider slowdown.",
    estimatedRiskReduction: 85,
    targetSystem: "payments-core / checkout-service",
    category: "Traffic & Gateway",
    status: "applied",
    appliedAt: "2 days ago by SRE Lead",
    evidence: {
      supportingIncidents: [
        {
          id: "INC-8942",
          name: "Cascading Thread Pool Exhaustion",
          date: "4 months ago",
          impact: "52m downtime ($240K loss)",
          rootCause: "Upstream third-party processor latency degraded to 4s, holding threads indefinitely",
        },
      ],
      learnedPattern: "PAT-031",
      patternConfidence: 97,
      vectorSimilarity: 95.0,
      recommendedActionDetails: "Cut off downstream gRPC requests at 500ms with fallback circuit breaker.",
    },
    metricsAverted: {
      estimatedSavedCapital: "$240,000",
      mttrReduction: "45 mins",
    },
  },
  {
    id: "REC-008",
    title: "Postgres Zero-Downtime Safe DDL Lock Timeout Enforcement",
    reason: "Unindexed table alterations blocked write queries for 32 minutes in past release.",
    estimatedRiskReduction: 78,
    targetSystem: "database-cluster / pg-primary",
    category: "Database & Storage",
    status: "applied",
    appliedAt: "5 days ago via CI/CD Policy Gate",
    evidence: {
      supportingIncidents: [
        {
          id: "INC-8891",
          name: "Postgres Connection Pool Starvation",
          date: "5 months ago",
          impact: "32m downtime ($160K loss)",
          rootCause: "ALTER TABLE migration script queued behind long-running query, blocking all subsequent reads",
        },
      ],
      learnedPattern: "PAT-017",
      patternConfidence: 95,
      vectorSimilarity: 93.4,
      recommendedActionDetails: "Require statement_timeout = 2s and lock_timeout = 3s on all migration scripts.",
    },
    metricsAverted: {
      estimatedSavedCapital: "$160,000",
      mttrReduction: "32 mins",
    },
  },
];

export const MOCK_INITIAL_SCHEDULED: PreventionRecommendation[] = [
  {
    id: "REC-022",
    title: "Deploy NodeLocal DNSCache daemonset to edge ingress nodes",
    reason: "DNS lookup latency spikes caused timeout failures during region failover.",
    estimatedRiskReduction: 66,
    targetSystem: "kubernetes / edge-ingress-nodes",
    category: "Traffic & Gateway",
    status: "scheduled",
    scheduledFor: "Tonight, 23:00 UTC",
    scheduleDetails: {
      window: "Maintenance Window 23:00-01:00 UTC",
      environment: "Production (US-East & EU-West)",
      recurring: false,
    },
    evidence: {
      supportingIncidents: [
        {
          id: "INC-8760",
          name: "CoreDNS Memory Thrashing",
          date: "3 months ago",
          impact: "27m degradation ($90K loss)",
          rootCause: "CoreDNS pods throttled by upstream conntrack table exhaustion during pod burst",
        },
      ],
      learnedPattern: "PAT-031",
      patternConfidence: 88,
      vectorSimilarity: 87.2,
      recommendedActionDetails: "Deploy local caching DNS daemonset on every node to bypass cluster CoreDNS IPVS hops.",
    },
    metricsAverted: {
      estimatedSavedCapital: "$90,000",
      mttrReduction: "25 mins",
    },
  },
];

export const MOCK_INITIAL_COMPLETED: PreventionRecommendation[] = [
  {
    id: "REC-004",
    title: "Implement cooperative sticky assignor protocol on Kafka consumer groups",
    reason: "Rebalance storms previously caused 14m streaming ingestion lag.",
    estimatedRiskReduction: 92,
    targetSystem: "event-stream / kafka-cluster",
    category: "Async & Messaging",
    status: "completed",
    appliedAt: "12 days ago",
    evidence: {
      supportingIncidents: [
        {
          id: "INC-7940",
          name: "Kafka Rebalance Storm",
          date: "6 months ago",
          impact: "14m ingestion stall ($65K loss)",
          rootCause: "Eager partition rebalance revoked all 64 partitions during single pod restart",
        },
      ],
      learnedPattern: "PAT-023",
      patternConfidence: 94,
      vectorSimilarity: 91.0,
      recommendedActionDetails: "Enforce CooperativeStickyAssignor and tune max.poll.interval.ms headroom.",
    },
    metricsAverted: {
      estimatedSavedCapital: "$65,000",
      mttrReduction: "18 mins",
    },
  },
  {
    id: "REC-001",
    title: "Inject 15-minute randomized jitter to IAM STS token renewal cycle",
    reason: "Simultaneous token refresh created thundering herd spike on AWS STS endpoint.",
    estimatedRiskReduction: 89,
    targetSystem: "user-session-service / auth-token-gen",
    category: "Runtime & Memory",
    status: "completed",
    appliedAt: "24 days ago",
    evidence: {
      supportingIncidents: [
        {
          id: "INC-8615",
          name: "IAM Role Race Condition on STS Token",
          date: "7 months ago",
          impact: "35m auth lockouts ($120K loss)",
          rootCause: "Synchronized 1-hour expiration caused 4,000 containers to request STS tokens simultaneously",
        },
      ],
      learnedPattern: "PAT-038",
      patternConfidence: 93,
      vectorSimilarity: 90.2,
      recommendedActionDetails: "Add +/- 15 minute pseudo-random jitter buffer to all client-side token refresh timers.",
    },
    metricsAverted: {
      estimatedSavedCapital: "$120,000",
      mttrReduction: "35 mins",
    },
  },
];
