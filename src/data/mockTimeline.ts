export interface LearningDayMilestone {
  id: string;
  dayLabel: string; // "DAY 1", "DAY 7", "DAY 14", "DAY 21", "DAY 30", "DAY 45", "DAY 60"
  dayNumber: number;
  badge: string; // e.g. "1 incident stored", "First recurring pattern discovered"
  title: string;
  subtitle: string;
  description: string;
  type: "ingestion" | "pattern" | "confidence" | "prediction" | "prevention" | "maturity";
  metrics: { label: string; value: string }[];
  details: {
    system: string;
    keyInsight: string;
    associatedPattern?: string;
    associatedMemory?: string;
    vectorSimilarity?: string;
    telemetrySignature: string;
    outcomeRecorded: string;
    experienceGain: string;
  };
}

export const LEARNING_DAY_MILESTONES: LearningDayMilestone[] = [
  {
    id: "milestone-day-1",
    dayLabel: "DAY 1",
    dayNumber: 1,
    badge: "1 incident stored",
    title: "Initial Cold Start: First Failure Vector Ingested",
    subtitle: "Payment API Performance Degradation (INC-1047)",
    description:
      "Resonyx is initialized in observation mode. The first production postmortem is ingested, vectorizing database query lock metrics and traffic volume into a 1536-dimensional semantic memory.",
    type: "ingestion",
    metrics: [
      { label: "Stored Incidents", value: "1" },
      { label: "Memory Embeddings", value: "8 Vectors" },
      { label: "Learned Patterns", value: "0" },
    ],
    details: {
      system: "payments-core / postgres-primary",
      keyInsight:
        "Database CPU reached 94% under 14.8k RPS. The first memory node MEM-8421 was created with execution traces.",
      associatedMemory: "MEM-8421",
      telemetrySignature: "Inbound RPS: +312% • DB CPU: 94.6% • Lock queue: 48 threads",
      outcomeRecorded:
        "Manual restart attempted by engineer; failed to alleviate contention. Manual index hotfix applied after 34 mins.",
      experienceGain: "Baseline semantic schema established for lock contention signatures.",
    },
  },
  {
    id: "milestone-day-7",
    dayLabel: "DAY 7",
    dayNumber: 7,
    badge: "8 incidents stored",
    title: "Graph Clustering: Connecting Disparate Service Outages",
    subtitle: "Cross-service telemetry correlation across 5 repositories",
    description:
      "With 8 incidents stored across Checkout, Auth, and Billing, Hindsight detects overlapping vector clusters. Resonyx discovers that failures in different microservices frequently share identical database connection exhaustion mechanics.",
    type: "ingestion",
    metrics: [
      { label: "Stored Incidents", value: "8" },
      { label: "Memory Embeddings", value: "64 Vectors" },
      { label: "Cross-Cluster Edges", value: "19 Links" },
    ],
    details: {
      system: "auth-broker, checkout-api, billing-worker",
      keyInsight:
        "Identified semantic cluster between INC-1039 and INC-1047: both triggered ACCESS EXCLUSIVE locks during unannounced marketing blasts.",
      associatedMemory: "MEM-8119",
      vectorSimilarity: "89.4% Cosine Proximity",
      telemetrySignature: "Threadpool backlog saturation in 4 out of 8 incidents.",
      outcomeRecorded:
        "Documented that service restarts consistently exacerbated DB connection pool exhaustion in 3 separate incidents.",
      experienceGain: "Cross-service topology mapping active.",
    },
  },
  {
    id: "milestone-day-14",
    dayLabel: "DAY 14",
    dayNumber: 14,
    badge: "First recurring pattern discovered",
    title: "Pattern Crystallization: PAT-017 Formed",
    subtitle: "High Traffic + Database Contention Invariant Recognized",
    description:
      "Statistical threshold reached: 6 recurring incidents exhibit the exact tri-state invariant (Traffic > 80%, DB CPU > 90%, Recent DDL migration). Resonyx formally declares PAT-017 as an organizational failure pattern.",
    type: "pattern",
    metrics: [
      { label: "Pattern Code", value: "PAT-017" },
      { label: "Supporting Incidents", value: "6 Events" },
      { label: "Initial Confidence", value: "64.8%" },
    ],
    details: {
      system: "PostgreSQL Database Cluster & Checkout Ingress",
      keyInsight:
        "Discovered invariant: ALTER TABLE statements executed concurrently with traffic > 8,000 RPS possess a 66% deterministic probability of service failure.",
      associatedPattern: "PAT-017",
      associatedMemory: "MEM-7940",
      vectorSimilarity: "92.1% Invariant Convergence",
      telemetrySignature: "Connection queue depth > 40 within 180 seconds of migration release.",
      outcomeRecorded: "First automated pattern entry catalogued in organizational knowledge base.",
      experienceGain: "Transitioned from reactive postmortem recording to structural invariant discovery.",
    },
  },
  {
    id: "milestone-day-21",
    dayLabel: "DAY 21",
    dayNumber: 21,
    badge: "Pattern confidence increased",
    title: "Bayesian Reinforcement: Confidence Jumps to 84%",
    subtitle: "Observing similar incidents confirms and refines the pattern hypothesis",
    description:
      "A staging load test triggers identical database lock queues. Resonyx matches the real-time telemetry against PAT-017 with 91.8% vector similarity, reinforcing pattern confidence from 64.8% up to 84.2%.",
    type: "confidence",
    metrics: [
      { label: "Pattern Confidence", value: "84.2% (+19.4%)" },
      { label: "Total Incidents", value: "19 Stored" },
      { label: "Identified Anti-Patterns", value: "4 Actions" },
    ],
    details: {
      system: "Staging Cluster & Aurora Read Replicas",
      keyInsight:
        "Learned that 'Service restart' has an 82% failure rate under this pattern, while 'Pausing migration + rate shedding' has an 89% success rate.",
      associatedPattern: "PAT-017",
      vectorSimilarity: "91.8% Staging Confirmation",
      telemetrySignature: "Query lock timeout exceeded; synthetic shedding stabilized replica latency in 4 mins.",
      outcomeRecorded: "Codified 'Do not restart service under high lock contention' rule.",
      experienceGain: "The platform now knows what actions fail and what actions succeed.",
    },
  },
  {
    id: "milestone-day-30",
    dayLabel: "DAY 30",
    dayNumber: 30,
    badge: "Pattern used for risk prediction",
    title: "Predictive Radar Activated: Real-Time Risk Pre-Warning",
    subtitle: "Predicted RSK-409 before production outage could manifest",
    description:
      "During a marketing flash sale deployment, Resonyx detects incoming traffic spikes combined with an un-timed migration script. The system triggers RSK-409 with an 84/100 Elevated Risk score 32 minutes before failure would occur.",
    type: "prediction",
    metrics: [
      { label: "Predicted Risk Score", value: "84 / 100" },
      { label: "Lead Time Provided", value: "32 Minutes" },
      { label: "Blast Radius Assessed", value: "Tier-1 Checkout" },
    ],
    details: {
      system: "payment-gateway / aurora-postgres",
      keyInsight:
        "Issued prescription: 'Delay the database migration until traffic decreases and run query performance validation.'",
      associatedPattern: "PAT-017",
      associatedMemory: "MEM-8421",
      vectorSimilarity: "94.2% Telemetry Match",
      telemetrySignature: "Traffic +312% above baseline; connection pool at 78% capacity.",
      outcomeRecorded:
        "On-call engineering team accepted the recommendation and deferred migration to 03:00 UTC off-peak window.",
      experienceGain: "First time Resonyx predicted an operational failure before it impacted users.",
    },
  },
  {
    id: "milestone-day-45",
    dayLabel: "DAY 45",
    dayNumber: 45,
    badge: "3 incidents prevented",
    title: "Compounding Immunity: Multi-System Failure Avoidance",
    subtitle: "3 catastrophic outages prevented across payment, auth, and messaging",
    description:
      "Resonyx reaches milestone: 3 severe production outages fully averted. Automated CI/CD guardrails intercept bad migrations, rate-shedding triggers prevent cascade timeouts, and Redis cache pre-warming halts stampedes.",
    type: "prevention",
    metrics: [
      { label: "Prevented Outages", value: "3 Events" },
      { label: "Saved Capital", value: "$385,000" },
      { label: "Avoided Downtime", value: "114 Minutes" },
    ],
    details: {
      system: "payments-core, auth-broker, kafka-event-stream",
      keyInsight:
        "Interventions on RSK-409, RSK-402, and RSK-372 verified. Mean Time To Detect (MTTD) dropped from 42 mins to 14 seconds.",
      associatedPattern: "PAT-017, PAT-038, PAT-023",
      telemetrySignature: "Zero SLA breaches recorded across all 3 protected clusters during promotion surge.",
      outcomeRecorded: "Executive sign-off achieved: Platform upgraded to autonomous pre-commit enforcement.",
      experienceGain: "Demonstrated clear ROI: Experience compounding prevents repetitive engineering mistakes.",
    },
  },
  {
    id: "milestone-day-60",
    dayLabel: "DAY 60 / PRESENT",
    dayNumber: 60,
    badge: "127 incidents prevented",
    title: "Organizational Immune System: Full Production Autonomy",
    subtitle: "1,284 incidents stored • 43 patterns active • $1.84M downtime averted",
    description:
      "Resonyx operates as an enterprise organizational brain. Every pull request, Terraform plan, and Helm chart is pre-screened against 8,492 historical failure memories, creating enduring architectural immunity.",
    type: "maturity",
    metrics: [
      { label: "Prevented Outages", value: "127 Events" },
      { label: "Total Capital Saved", value: "$1.84 Million" },
      { label: "Memory Records", value: "8,492 Vectors" },
    ],
    details: {
      system: "Enterprise-wide (42 Microservices & Global Cloud Clusters)",
      keyInsight:
        "Organizational knowledge no longer disappears when engineers leave the company. Every failure is remembered and perpetually prevented.",
      associatedPattern: "43 High-Confidence Patterns",
      associatedMemory: "8,492 Indexed Memories",
      telemetrySignature: "Continuous 24/7 blast radius radar across all cloud regions.",
      outcomeRecorded: "Zero repeat P1 incidents for any failure pattern indexed more than 14 days.",
      experienceGain: "The organization never makes the same catastrophic failure twice.",
    },
  },
];

export const MEMORY_GROWTH_CHART_DATA = [
  { day: "Day 1", incidents: 1, memories: 8, patterns: 0 },
  { day: "Day 7", incidents: 8, memories: 64, patterns: 0 },
  { day: "Day 14", incidents: 24, memories: 210, patterns: 1 },
  { day: "Day 21", incidents: 68, memories: 620, patterns: 3 },
  { day: "Day 30", incidents: 184, memories: 1650, patterns: 8 },
  { day: "Day 45", incidents: 540, memories: 4200, patterns: 22 },
  { day: "Day 60", incidents: 1284, memories: 8492, patterns: 43 },
];

export const PATTERN_CONFIDENCE_CHART_DATA = [
  { day: "Day 14", pat017: 64.8, pat023: 58.2, pat031: 62.0, avg: 61.6 },
  { day: "Day 21", pat017: 84.2, pat023: 71.5, pat031: 76.4, avg: 77.3 },
  { day: "Day 30", pat017: 88.5, pat023: 79.8, pat031: 85.1, avg: 84.4 },
  { day: "Day 45", pat017: 92.4, pat023: 86.1, pat031: 91.8, avg: 90.1 },
  { day: "Day 60", pat017: 94.2, pat023: 89.0, pat031: 96.0, avg: 93.1 },
];

export const PREVENTED_FAILURES_CHART_DATA = [
  { period: "Days 1-10", prevented: 0, capitalK: 0 },
  { period: "Days 11-20", prevented: 0, capitalK: 0 },
  { period: "Days 21-30", prevented: 1, capitalK: 65 },
  { period: "Days 31-40", prevented: 2, capitalK: 140 },
  { period: "Days 41-50", prevented: 8, capitalK: 390 },
  { period: "Days 51-60", prevented: 24, capitalK: 780 },
  { period: "Overall Total", prevented: 127, capitalK: 1840 },
];

export interface OrganizationalLearningQuote {
  id: string;
  quote: string;
  confidence: number;
  patternCode: string;
  sourceIncidentsCount: number;
  learnedAt: string;
  impactDomain: string;
  preventiveGuidance: string;
}

export const LATEST_ORGANIZATIONAL_LEARNINGS: OrganizationalLearningQuote[] = [
  {
    id: "lrn-01",
    quote: "High database contention after deployments is strongly associated with payment API degradation.",
    confidence: 94,
    patternCode: "PAT-017",
    sourceIncidentsCount: 17,
    learnedAt: "Day 21 (Reinforced on Day 45)",
    impactDomain: "Relational Storage & Payment APIs",
    preventiveGuidance: "Mandate dry-run index lock assertion before promoting migration jobs in CI/CD.",
  },
  {
    id: "lrn-02",
    quote: "Immediate service restart has a low success rate during database saturation.",
    confidence: 87,
    patternCode: "MEM-8421",
    sourceIncidentsCount: 8,
    learnedAt: "Day 7 (Validated on Day 21)",
    impactDomain: "Cluster Incident Remediation",
    preventiveGuidance: "Suppress automatic container restart loops; apply adaptive load shedding instead.",
  },
  {
    id: "lrn-03",
    quote: "Traffic spikes combined with cache failures frequently precede API timeouts.",
    confidence: 91,
    patternCode: "PAT-038",
    sourceIncidentsCount: 13,
    learnedAt: "Day 30",
    impactDomain: "Distributed In-Memory Caching",
    preventiveGuidance: "Enforce probabilistic early key expiration (XFetch) and distributed single-flight locks.",
  },
  {
    id: "lrn-04",
    quote: "Bulkhead isolation between checkout write operations and batch settlement jobs prevents cascade pool starvation.",
    confidence: 93,
    patternCode: "PAT-031",
    sourceIncidentsCount: 24,
    learnedAt: "Day 38",
    impactDomain: "Connection Pool Management",
    preventiveGuidance: "Hard-limit background worker pools to 20% of Postgres max_connections.",
  },
  {
    id: "lrn-05",
    quote: "Monotonic heap growth during canary deployment indicates unclosed gRPC client channel buffers.",
    confidence: 89,
    patternCode: "PAT-023",
    sourceIncidentsCount: 9,
    learnedAt: "Day 42",
    impactDomain: "Container Runtime & JVM/Node Memory",
    preventiveGuidance: "Automate canary rollbacks upon detecting a 45-minute positive heap allocation slope.",
  },
];
