import { FailurePattern } from "@/types";

export const MOCK_PATTERNS: FailurePattern[] = [
  {
    id: "pat-017",
    patternCode: "PAT-017",
    name: "High Traffic + Database Contention",
    category: "Concurrency",
    confidenceScore: 94,
    observedCount: 17,
    recurringCount: 17,
    successfulResolutions: 12,
    failedResolutions: 5,
    commonConditions: [
      "Traffic > 80%",
      "Database CPU > 90%",
      "Recent deployment",
    ],
    typicalOutcome: "Payment API degradation and upstream threadpool saturation.",
    recommendedPrevention: "Run database health validation before deployment and mandate lock_timeout = 2000ms.",
    lastObserved: "2026-09-27",
    blastRadius: "Global Multi-Region",
    affectedServices: ["payment-api-gateway", "checkout-orchestrator", "account-ledger-db", "billing-worker"],
    rootCauses: [
      "Unindexed SQL query deployed into transaction verification path",
      "ACCESS EXCLUSIVE table lock acquired during active traffic bursts",
      "PgBouncer connection pool depletion under long-running shared read locks"
    ],
    actionsTaken: [
      "Container pod rolling restart",
      "Scaling PgBouncer max connections to 2000",
      "Automated pg_cancel_backend on blocking lock holders",
      "Enforcing 650ms gRPC context deadline propagation"
    ],
    successfulActions: [
      "Automated cancellation of blocking sequential queries via lock_timeout = 2000ms",
      "Enforcing gRPC context deadlines to shed upstream queued transactions"
    ],
    failedActions: [
      "Restarting container pods (immediately re-entered saturated queues and failed liveness probes)",
      "Scaling connection limits without addressing unindexed lock contention (triggered DB kernel OOM)"
    ],
    learnedLesson: "Restarting services under database contention merely accelerates connection storms; queries must be canceled at the database layer with automated lock timeouts.",
    financialImpactAverted: 1850000,
    rootCauseFingerprint: "Query sequential scan -> shared buffer contention -> lock backlog > 80 -> thread exhaustion.",
    preventionPlaybook: "PB-RES-017: Pre-Deploy Database Health & Safe Lock Guard",
    trend: "declining",
    historicalIncidents: ["INC-1047", "INC-0871", "INC-0784", "INC-0622"],
    description: "Occurs when high-traffic spikes coincide with newly deployed unindexed queries or schema migrations, saturating database process queues and locking upstream client threads.",
    remedyAction: "Pre-check DDL migrations via Resonyx CI linting; enforce lock_timeout = '2s' and automated retry backoff."
  },
  {
    id: "pat-023",
    patternCode: "PAT-023",
    name: "Memory Leak After Deployment",
    category: "Deployment",
    confidenceScore: 92,
    observedCount: 14,
    recurringCount: 14,
    successfulResolutions: 11,
    failedResolutions: 3,
    commonConditions: [
      "Unbounded payload serialization",
      "Canary rollout to live traffic",
      "Garbage collection pause > 800ms",
    ],
    typicalOutcome: "Worker pod OOMKill cascade across cluster.",
    recommendedPrevention: "Automate heap allocation quota gate and strict payload validation in CI/CD (PRV-033).",
    lastObserved: "2026-09-27",
    blastRadius: "Critical Path",
    affectedServices: ["checkout-cart-service", "user-session-service", "cache-tier-session"],
    rootCauses: [
      "Full user metadata object serialized into session payload without compression",
      "Volatile-LRU mass eviction pushing cryptographic JWT keys out of RAM",
      "JVM / Go runtime heap allocation monotonic growth under constant QPS"
    ],
    actionsTaken: [
      "Increasing Kubernetes pod memory limit from 2Gi to 8Gi",
      "Manual Redis flushall on shard 3",
      "Canary automated rollback",
      "Payload compression middleware"
    ],
    successfulActions: [
      "Immediate automated canary halt triggered by Resonyx Pre-Deploy Gate",
      "Snappy compression middleware reducing item payloads by 78%"
    ],
    failedActions: [
      "Manual cache flushall (caused immediate database stampede blackout)",
      "Increasing pod RAM limits without payload guards (delayed crash by only 6 minutes)"
    ],
    learnedLesson: "Increasing pod memory limits without serialization payload guards merely delays inevitable OOMKill cascades by minutes.",
    financialImpactAverted: 1420000,
    rootCauseFingerprint: "JSON payload expansion > 32KB -> volatile-lru triggers -> session thrashing -> heap exhaustion.",
    preventionPlaybook: "PB-RES-023: Payload Quota & Canary Memory Halt Guard",
    trend: "declining",
    historicalIncidents: ["INC-1032", "INC-0852", "INC-0663"],
    description: "Feature releases expand cached entity schemas without memory budgeting, saturating container memory and triggering cluster-wide OOMKill loops.",
    remedyAction: "Implement key-size telemetry middleware and configure dedicated isolation clusters for cryptographic tokens."
  },
  {
    id: "pat-031",
    patternCode: "PAT-031",
    name: "API Timeout During Traffic Spike",
    category: "Architectural",
    confidenceScore: 96,
    observedCount: 19,
    recurringCount: 19,
    successfulResolutions: 15,
    failedResolutions: 4,
    commonConditions: [
      "Downstream latency > 2,000ms",
      "Unhedged synchronous HTTP/gRPC",
      "Retry amplification > 3x",
    ],
    typicalOutcome: "Ingress threadpool saturation and 504 Gateway Timeout cascade.",
    recommendedPrevention: "Enforce 650ms deadline propagation and client bulkhead isolation (PRV-104).",
    lastObserved: "2026-09-27",
    blastRadius: "Global Multi-Region",
    affectedServices: ["payment-api-gateway", "order-fulfillment-router", "api-gateway-edge"],
    rootCauses: [
      "Third-party shipping and payment APIs experiencing transient latency stalls",
      "Synchronous blocking clients without bulkhead thread isolation",
      "Clients retrying immediately with zero randomized backoff jitter"
    ],
    actionsTaken: [
      "Horizontal Pod Autoscaler replica scaling",
      "Immediate unjittered retries",
      "Client bulkhead queue isolation",
      "Full jitter randomized backoff"
    ],
    successfulActions: [
      "Client bulkhead queue isolation confining stalls to dedicated thread pools",
      "Full jitter randomized backoff preventing synchronized traffic waves"
    ],
    failedActions: [
      "Immediate unjittered client retries (amplified inbound traffic by 5.2x)",
      "Horizontal Pod Autoscaling (multiplied outbound queue volume into downstream bottleneck)"
    ],
    learnedLesson: "Without client bulkhead queues, downstream stalls consume 100% of upstream worker threads in under 90 seconds regardless of pod count.",
    financialImpactAverted: 2150000,
    rootCauseFingerprint: "Client timeout absent -> queue monotonic growth -> thread starvation -> 504 storm.",
    preventionPlaybook: "PB-RES-031: Adaptive Bulkhead & Jitter Circuit Breaker",
    trend: "declining",
    historicalIncidents: ["INC-1028", "INC-0894", "INC-0812", "INC-0680"],
    description: "Occurs when upstream services synchronously await downstream I/O without bulkhead thread isolation or hedged deadlines, causing rapid queue backups.",
    remedyAction: "Isolate client execution threads with Bulkhead, enforce strict deadlines, and use token-bucket rate limiters."
  },
  {
    id: "pat-038",
    patternCode: "PAT-038",
    name: "Cache Failure During High Traffic",
    category: "Operational",
    confidenceScore: 89,
    observedCount: 11,
    recurringCount: 11,
    successfulResolutions: 8,
    failedResolutions: 3,
    commonConditions: [
      "Hot shard memory > 90%",
      "Volatile-LRU active",
      "Shared cryptographic tokens in cache",
    ],
    typicalOutcome: "Mass cache eviction and cascading database read stampede.",
    recommendedPrevention: "Deploy dedicated cache isolation clusters and enforce 8KB item quotas (PRV-033).",
    lastObserved: "2026-08-20",
    blastRadius: "Data Layer",
    affectedServices: ["cache-tier-session", "product-catalog-cache", "account-ledger-db"],
    rootCauses: [
      "Mixing security verification keys with unbudgeted user profile data",
      "Cache payload size jumping from 1.2KB to 84KB on new releases",
      "Lack of tenant quotas separating transient data from critical sessions"
    ],
    actionsTaken: [
      "Manual cache flush",
      "Hot shard memory expansion",
      "Dedicated security cluster isolation",
      "8KB payload middleware validator"
    ],
    successfulActions: [
      "Isolating JWT verification tokens into independent memory clusters",
      "8KB payload size validator rejecting oversized cache writes"
    ],
    failedActions: [
      "Flushing the cache during live peak traffic (caused total DB read stampede)",
      "Increasing shard maxmemory without addressing payload schema bloat"
    ],
    learnedLesson: "Never mix critical authentication keys with general user profile data in shared volatile cache clusters.",
    financialImpactAverted: 980000,
    rootCauseFingerprint: "Payload bloat -> volatile-LRU eviction -> security key loss -> 45K QPS DB stampede.",
    preventionPlaybook: "PB-RES-038: Cache Tenancy & Isolation Standard",
    trend: "declining",
    historicalIncidents: ["INC-0852", "INC-0791", "INC-0519"],
    description: "Shared caching clusters experience sudden volatile-LRU evictions due to payload schema expansion, exposing the underlying database to catastrophic stampedes.",
    remedyAction: "Separate security verification keys into dedicated isolated Redis cluster and enforce payload compression."
  }
];
