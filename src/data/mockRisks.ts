import { RiskDetectionItem, HistoricalRiskPrediction } from "@/types";

export const MOCK_RISKS: RiskDetectionItem[] = [
  {
    id: "risk-01",
    targetSystem: "payments-core / checkout-v2.14.0",
    changeType: "API Breaking Change",
    riskLevel: "critical",
    probabilityScore: 92,
    similarHistoricalIncident: "INC-8942 (Cascading Thread Pool Exhaustion)",
    blastRadiusImpact: "High (Estimated 140K Checkout Sessions / Min)",
    detectedAt: "12 minutes ago",
    detectionSource: "CI/CD Pipeline",
    suggestedGuardrail: "PRV-104: Enforce 500ms Hedged Timeout and Bulkhead isolation before merge approval.",
    status: "active-warning"
  },
  {
    id: "risk-02",
    targetSystem: "infra-provisioning / terraform-db-cluster",
    changeType: "DB Schema Alteration",
    riskLevel: "high",
    probabilityScore: 86,
    similarHistoricalIncident: "INC-8891 (Postgres Connection Pool Starvation)",
    blastRadiusImpact: "Tier-1 Ledger Storage (Global Read/Write Latency)",
    detectedAt: "38 minutes ago",
    detectionSource: "Terraform Plan",
    suggestedGuardrail: "PRV-014: Replace direct ALTER TABLE with pg_repack or CONCURRENTLY modifier.",
    status: "active-warning"
  },
  {
    id: "risk-03",
    targetSystem: "edge-ingress / coredns-values.yaml",
    changeType: "Infrastructure Migration",
    riskLevel: "high",
    probabilityScore: 79,
    similarHistoricalIncident: "INC-8760 (CoreDNS Memory Thrashing)",
    blastRadiusImpact: "Multi-Region Cluster Ingress & External Traffic",
    detectedAt: "2 hours ago",
    detectionSource: "Kubernetes Helm Diff",
    suggestedGuardrail: "PRV-210: Verify NodeLocal DNSCache daemonset is healthy before scaling replicas.",
    status: "active-warning"
  },
  {
    id: "risk-04",
    targetSystem: "user-session-service / auth-token-gen",
    changeType: "Auth Token Rotation",
    riskLevel: "medium",
    probabilityScore: 68,
    similarHistoricalIncident: "INC-8615 (IAM Role Race Condition on STS Token)",
    blastRadiusImpact: "Ephemeral Token Consumers across 4 Regional Clusters",
    detectedAt: "5 hours ago",
    detectionSource: "Traffic Anomaly",
    suggestedGuardrail: "PRV-089: Inject 15-minute randomized jitter to prevent token synchronicity shock.",
    status: "mitigated"
  },
  {
    id: "risk-05",
    targetSystem: "stream-processing / event-consumer-group",
    changeType: "Kafka Consumer Scale",
    riskLevel: "low",
    probabilityScore: 42,
    similarHistoricalIncident: "INC-7940 (Kafka Rebalance Storm)",
    blastRadiusImpact: "Background Analytics Pipeline (Non-Critical)",
    detectedAt: "1 day ago",
    detectionSource: "CI/CD Pipeline",
    suggestedGuardrail: "PRV-052: Enforce cooperative rebalance protocol and max.poll.interval.ms headroom.",
    status: "mitigated"
  }
];

export interface RiskTimelinePoint {
  time: string;
  riskScore: number;
  baseline: number;
  thresholdWarning: number;
  thresholdCritical: number;
  annotation?: string;
}

export const MOCK_RISK_TIMELINE: RiskTimelinePoint[] = [
  { time: "24h ago", riskScore: 18, baseline: 20, thresholdWarning: 60, thresholdCritical: 80 },
  { time: "21h ago", riskScore: 22, baseline: 20, thresholdWarning: 60, thresholdCritical: 80 },
  { time: "18h ago", riskScore: 25, baseline: 22, thresholdWarning: 60, thresholdCritical: 80 },
  { time: "15h ago", riskScore: 31, baseline: 22, thresholdWarning: 60, thresholdCritical: 80 },
  { time: "12h ago", riskScore: 54, baseline: 25, thresholdWarning: 60, thresholdCritical: 80, annotation: "Deploy Canary v2.13.9" },
  { time: "9h ago", riskScore: 46, baseline: 25, thresholdWarning: 60, thresholdCritical: 80 },
  { time: "6h ago", riskScore: 38, baseline: 24, thresholdWarning: 60, thresholdCritical: 80 },
  { time: "4h ago", riskScore: 42, baseline: 25, thresholdWarning: 60, thresholdCritical: 80 },
  { time: "2h ago", riskScore: 61, baseline: 26, thresholdWarning: 60, thresholdCritical: 80, annotation: "Traffic Spike +180%" },
  { time: "1h ago", riskScore: 69, baseline: 26, thresholdWarning: 60, thresholdCritical: 80 },
  { time: "30m ago", riskScore: 74, baseline: 27, thresholdWarning: 60, thresholdCritical: 80 },
  { time: "Now", riskScore: 78, baseline: 28, thresholdWarning: 60, thresholdCritical: 80, annotation: "Elevated Risk Detected" },
];

export const MOCK_HISTORICAL_PREDICTIONS: HistoricalRiskPrediction[] = [
  {
    id: "RSK-409",
    targetSystem: "payment-gateway / aurora-postgres",
    predictionTitle: "Database Connection Pool Starvation Risk",
    riskScore: 84,
    confidence: 93,
    memorySource: "PAT-017 / MEM-8421",
    timestamp: "Yesterday, 14:20 UTC",
    actionTaken: "Throttled ingress rate limit by 20% & queued migration job",
    actionType: "Accepted",
    outcome: "Prevented Outage",
    outcomeDetail: "Postgres connection pool peaked at 76% (remained safe). Prevented cascading thread exhaustion across 14 payment services.",
    savedCapital: "$140,000"
  },
  {
    id: "RSK-402",
    targetSystem: "auth-broker / redis-session-cache",
    predictionTitle: "Cache Eviction Stampede Post-Release",
    riskScore: 79,
    confidence: 89,
    memorySource: "PAT-038 / MEM-7940",
    timestamp: "3 days ago, 09:15 UTC",
    actionTaken: "Pre-warmed Redis session keys and enabled probabilistic early expiration",
    actionType: "Accepted",
    outcome: "Prevented Degradation",
    outcomeDetail: "Cache hit ratio remained at 98.4%. Avoided database read-replica spike during morning login burst.",
    savedCapital: "$65,000"
  },
  {
    id: "RSK-385",
    targetSystem: "order-ingestion / worker-pool",
    predictionTitle: "Worker Thread Pool Starvation During Flash Event",
    riskScore: 82,
    confidence: 91,
    memorySource: "PAT-031 / MEM-6812",
    timestamp: "6 days ago, 18:40 UTC",
    actionTaken: "Dismissed by on-call engineer (classified as false alert)",
    actionType: "Dismissed",
    outcome: "Outage Occurred (Ignored)",
    outcomeDetail: "INC-1028 occurred 42 minutes later. API gateway timeouts reached 12% for 28 minutes until emergency scale was triggered.",
    savedCapital: "Loss: $85,000"
  },
  {
    id: "RSK-372",
    targetSystem: "event-stream / kafka-consumer-group",
    predictionTitle: "Kafka Consumer Rebalance Storm Exposure",
    riskScore: 71,
    confidence: 86,
    memorySource: "PAT-023 / MEM-5419",
    timestamp: "11 days ago, 11:05 UTC",
    actionTaken: "Automated guardrail enforced cooperative sticky rebalance and increased poll interval",
    actionType: "Automated",
    outcome: "Prevented Outage",
    outcomeDetail: "Zero consumer lag during rolling container restarts. All 64 partitions remained assigned without partition thrashing.",
    savedCapital: "$95,000"
  },
  {
    id: "RSK-360",
    targetSystem: "checkout-v2 / container-heap",
    predictionTitle: "Progressive Memory Leak in Canary Pods",
    riskScore: 88,
    confidence: 94,
    memorySource: "PAT-023 / MEM-8119",
    timestamp: "15 days ago, 08:30 UTC",
    actionTaken: "Automated canary rollback executed upon heap gradient breach",
    actionType: "Automated",
    outcome: "Prevented Outage",
    outcomeDetail: "Rollback halted canary before OOM killer terminated pods in production. Root cause later isolated to unclosed gRPC streams.",
    savedCapital: "$210,000"
  },
  {
    id: "RSK-344",
    targetSystem: "ledger-db / cross-region-sync",
    predictionTitle: "Cross-Region Replication Lag Cascade",
    riskScore: 68,
    confidence: 84,
    memorySource: "PAT-017 / MEM-4902",
    timestamp: "21 days ago, 16:10 UTC",
    actionTaken: "Deferred bulk reconciliation pipeline until off-peak window",
    actionType: "Accepted",
    outcome: "Prevented Degradation",
    outcomeDetail: "Replication lag normalized to <80ms. Avoided stale read errors on European customer portal.",
    savedCapital: "$45,000"
  }
];

export interface SimilarIncidentEvidence {
  id: string;
  name: string;
  detectedDate: string;
  vectorSimilarity: number;
  resultedInOutage: boolean;
  downtimeMinutes: number;
  rootCause: string;
  trafficLoad: string;
  dbCpuPeak: string;
}

export const EVIDENCE_INCIDENTS: SimilarIncidentEvidence[] = [
  {
    id: "INC-1047",
    name: "Payment API Performance Degradation",
    detectedDate: "14 days ago",
    vectorSimilarity: 94.2,
    resultedInOutage: true,
    downtimeMinutes: 34,
    rootCause: "Database threadpool exhaustion due to unindexed foreign key lock contention during traffic peak",
    trafficLoad: "15,200 RPS (+320%)",
    dbCpuPeak: "94.6%"
  },
  {
    id: "INC-1039",
    name: "Database Connection Pool Saturation",
    detectedDate: "28 days ago",
    vectorSimilarity: 91.5,
    resultedInOutage: true,
    downtimeMinutes: 48,
    rootCause: "Migration script held exclusive ACCESS EXCLUSIVE lock on transactions table during marketing blast",
    trafficLoad: "13,900 RPS (+290%)",
    dbCpuPeak: "96.1%"
  },
  {
    id: "INC-0994",
    name: "Cascading API Gateway Timeout",
    detectedDate: "45 days ago",
    vectorSimilarity: 88.7,
    resultedInOutage: true,
    downtimeMinutes: 22,
    rootCause: "Upstream PostgreSQL write lock stalled worker threads, causing HTTP 504 surge",
    trafficLoad: "14,100 RPS (+300%)",
    dbCpuPeak: "91.8%"
  },
  {
    id: "INC-0918",
    name: "Checkout Service Deadlock Storm",
    detectedDate: "62 days ago",
    vectorSimilarity: 86.4,
    resultedInOutage: true,
    downtimeMinutes: 41,
    rootCause: "Simultaneous schema patch and high concurrent customer checkout volume",
    trafficLoad: "16,400 RPS (+340%)",
    dbCpuPeak: "95.2%"
  },
  {
    id: "INC-0871",
    name: "DB Read-Replica Lag Degrade",
    detectedDate: "81 days ago",
    vectorSimilarity: 82.3,
    resultedInOutage: false,
    downtimeMinutes: 0,
    rootCause: "Temporary query buffer bloat; mitigated early by pausing migration runner",
    trafficLoad: "11,800 RPS (+210%)",
    dbCpuPeak: "86.5%"
  },
  {
    id: "INC-0742",
    name: "Order Processing Batch Latency",
    detectedDate: "110 days ago",
    vectorSimilarity: 80.1,
    resultedInOutage: false,
    downtimeMinutes: 0,
    rootCause: "Lock queue built up on settlement records; auto-shedding prevented full crash",
    trafficLoad: "12,200 RPS (+230%)",
    dbCpuPeak: "87.0%"
  }
];
