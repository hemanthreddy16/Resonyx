export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

export interface IncidentTimelineEvent {
  time: string;
  description: string;
  type?: "traffic" | "db" | "latency" | "error" | "ai" | "generic";
}

export interface SimilarIncidentMatch {
  code: string;
  title: string;
  similarity: number; // e.g. 92%
  vectorId: string;
  date: string;
  resolutionTime: string;
  mitigation: string;
}

export interface Incident {
  id: string;
  code: string; // e.g. INC-1047
  title: string; // e.g. Payment API Performance Degradation
  service: string;
  environment: "Production" | "Staging" | "Canary" | "Global";
  severity: SeverityLevel;
  status: "investigating" | "mitigated" | "resolved" | "learning-indexed";
  detectedTime: string; // e.g. "09:41 AM"
  occurredAt: string;
  resolvedAt: string;
  mttrMinutes: number;
  impactCost: number;
  affectedUsers: number;
  rootCauseDomain: "Database Concurrency" | "Cascading Timeout" | "Config Drift" | "Memory Leak" | "IAM Race Condition" | "Network Partition";
  patternMatch?: {
    patternCode: string;
    name: string;
    confidence: number;
  };
  riskLevel: SeverityLevel;
  hindsightVectorId: string;
  similarityMatchCount: number;
  summary: string;
  timelineEvents: IncidentTimelineEvent[];
  aiRootCause: {
    likelyCause: string;
    confidence: number;
    investigationDetails?: string;
  };
  hindsightRecall: SimilarIncidentMatch[];
  evidence: {
    queryDiff?: string;
    logSnippet?: string;
    metricAnomaly?: string;
    affectedTraceId?: string;
  };
  keyLearnings: string[];
  preventativeMeasures: string[];
  tags: string[];
}

export interface FailurePattern {
  id: string;
  patternCode: string; // e.g. PAT-017
  name: string; // e.g. High Traffic + Database Contention
  category: "Architectural" | "Operational" | "Deployment" | "Concurrency" | "Dependency";
  confidenceScore: number; // e.g. 94%
  observedCount: number; // e.g. 17 times
  recurringCount: number;
  successfulResolutions: number; // e.g. 12
  failedResolutions: number; // e.g. 5
  commonConditions: string[]; // e.g. ["Traffic > 80%", "Database CPU > 90%", "Recent deployment"]
  typicalOutcome: string; // e.g. Payment API degradation.
  recommendedPrevention: string; // e.g. Run database health validation before deployment.
  lastObserved: string;
  blastRadius: "Global Multi-Region" | "Critical Path" | "Isolated Service" | "Data Layer";
  affectedServices: string[];
  rootCauses: string[];
  actionsTaken: string[];
  successfulActions: string[];
  failedActions: string[];
  learnedLesson: string;
  financialImpactAverted: number;
  rootCauseFingerprint: string;
  preventionPlaybook: string;
  trend: "increasing" | "stable" | "declining";
  historicalIncidents: string[];
  description: string;
  remedyAction: string;
}

export interface HindsightMemoryRecord {
  id: string;
  memoryCode: string; // e.g. MEM-8421
  vectorId: string;
  sourceIncident: string; // e.g. Payment API failure
  sourceIncidentCode: string; // e.g. INC-1047
  knowledgeDomain: string;
  context: string[]; // e.g. ["High traffic", "Database CPU > 90%", "Recent deployment"]
  action: string; // e.g. "Service restart"
  outcome: "Failed" | "Recovered" | "Mitigated" | "Ineffective" | "Prevented";
  outcomeDetail: string;
  learnedInsight: string; // e.g. "Restarting the service is ineffective under high database contention."
  rootCause: string;
  decision: string;
  patternCode: string;
  confidence: number; // e.g. 87%
  relatedMemories: string[]; // e.g. ["MEM-8119", "MEM-7940"]
  extractedRule: string;
  antiPatternSignature: string;
  failureMechanism: string;
  semanticTags: string[];
  recallCount: number;
  lastRecalledAt: string;
  indexingDate: string;
}

export interface RiskDetectionItem {
  id: string;
  targetSystem: string;
  changeType: "Infrastructure Migration" | "API Breaking Change" | "Kafka Consumer Scale" | "DB Schema Alteration" | "Auth Token Rotation";
  riskLevel: SeverityLevel;
  probabilityScore: number;
  similarHistoricalIncident: string;
  blastRadiusImpact: string;
  detectedAt: string;
  detectionSource: "CI/CD Pipeline" | "Terraform Plan" | "Kubernetes Helm Diff" | "Traffic Anomaly";
  suggestedGuardrail: string;
  status: "active-warning" | "mitigated" | "overridden";
}

export interface HistoricalRiskPrediction {
  id: string;
  targetSystem: string;
  predictionTitle: string;
  riskScore: number;
  confidence: number;
  memorySource: string; // e.g. "PAT-017 / MEM-8421"
  timestamp: string;
  actionTaken: string;
  actionType: "Accepted" | "Dismissed" | "Automated";
  outcome: "Prevented Outage" | "Prevented Degradation" | "Outage Occurred (Ignored)" | "No Impact Detected";
  outcomeDetail: string;
  savedCapital?: string;
}

export interface PreventionGuardrail {
  id: string;
  ruleCode: string;
  title: string;
  category: "CI/CD Gate" | "Architecture Policy" | "Runtime Circuit Breaker" | "Config Validator";
  enforcementMode: "automated-block" | "canary-gate" | "alert-advisory";
  appliedCount: number;
  preventedFailuresCount: number;
  estimatedSavedCost: number;
  status: "active" | "shadow" | "draft";
  lastTriggered: string;
  derivedFromIncident: string;
}

export interface PreventionRecommendation {
  id: string;
  title: string;
  reason: string;
  estimatedRiskReduction: number;
  targetSystem: string;
  category: "Database & Storage" | "Traffic & Gateway" | "Runtime & Memory" | "Cache & Session" | "Async & Messaging";
  status: "recommended" | "applied" | "scheduled" | "completed";
  appliedAt?: string;
  scheduledFor?: string;
  scheduleDetails?: {
    window: string;
    environment: string;
    recurring: boolean;
  };
  evidence: {
    supportingIncidents: {
      id: string;
      name: string;
      date: string;
      impact: string;
      rootCause: string;
    }[];
    learnedPattern: string;
    patternConfidence: number;
    vectorSimilarity: number;
    recommendedActionDetails: string;
  };
  metricsAverted?: {
    estimatedSavedCapital: string;
    mttrReduction: string;
  };
}

export interface TimelineMilestone {
  id: string;
  date: string;
  type: "incident" | "pattern_discovered" | "prevention_deployed" | "hindsight_indexed";
  title: string;
  subtitle: string;
  description: string;
  severity?: SeverityLevel;
  metrics?: { label: string; value: string }[];
  impactDelta?: string;
}

export interface IntegrationService {
  id: string;
  name: string;
  category: "Telemetry" | "Incident Management" | "CI/CD & SCM" | "Cloud Infrastructure";
  iconName: string;
  status: "connected" | "syncing" | "available" | "error";
  lastSync: string;
  eventsProcessed: string;
  description: string;
  endpointUrl?: string;
}

export interface HindsightEngineStatus {
  state: "Optimal" | "Syncing" | "Indexing";
  indexedVectors: number;
  recalledPatterns: number;
  model: string;
  latencyMs: number;
  accuracyRate: number;
}

export interface AiEvidenceIncident {
  id: string;
  name: string;
  date: string;
  outcome: "Failed Attempt" | "Successful Mitigation" | "Severe Outage";
  rootCause: string;
  vectorSimilarity: number;
}

export interface AiMemoryEvidence {
  memoryId: string;
  title: string;
  learnedInsight: string;
  historicalAction: string;
  historicalOutcome: string;
  confidence: number;
  similarity: number;
}

export interface AiCommandMessage {
  id: string;
  role: "user" | "assistant";
  timestamp: string;
  query?: string;
  historicalPattern?: {
    patternCode: string;
    patternName: string;
    summary: string;
    resemblanceText: string;
    contentionFactor: string;
    failedAttemptsText: string;
  };
  recommendation?: {
    actionText: string;
    rationale: string;
    priority: "Immediate" | "High" | "Advisory";
  };
  evidenceIncidents?: AiEvidenceIncident[];
  influencingMemories?: AiMemoryEvidence[];
  confidenceScore?: number;
  deductionTrace?: string[];
}

export * from "./ai";

