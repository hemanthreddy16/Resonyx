export type AllowedRecoveryActionType =
  | "retry_request"
  | "restart_service"
  | "clear_cache"
  | "rollback_deployment"
  | "disable_feature"
  | "escalate_to_human"
  | "isolate_bulkhead"
  | "apply_rate_limit"
  | "cancel_blocking_query";

export interface AIDiagnosisResult {
  diagnosis: string;
  rootCause: string;
  confidence: number;
  severity: "critical" | "high" | "medium" | "low";
  contributingFactors: string[];
  recommendedActions: AllowedRecoveryActionType[];
  reasoning: string;
  requiredInformation?: string[];
  rawResponse?: string;
}

export interface AIRecoveryStrategy {
  strategy: string;
  actions: AllowedRecoveryActionType[];
  expectedOutcome: string;
  risk: string;
  confidence: number;
  selectedAction?: AllowedRecoveryActionType;
  rawResponse?: string;
}

export interface ActionExecutionRecord {
  id: string;
  incidentId: string;
  action: AllowedRecoveryActionType;
  timestamp: string;
  status: "pending" | "running" | "success" | "failed";
  result: string;
  error?: string | null;
  executionDuration: number; // in milliseconds
  executedBy: string;
}

export interface VerificationRecord {
  id: string;
  incidentId: string;
  actionExecutionId?: string;
  verificationStatus: "verified_resolved" | "partially_mitigated" | "failed" | "unverified";
  verificationResult: string;
  metrics: {
    p99LatencyMs: number;
    errorRatePercent: number;
    cpuUtilizationPercent: number;
    activeConnections: number;
    isHealthy: boolean;
  };
  timestamp: string;
}

export interface HindsightLearningPayload {
  failureType: string;
  symptoms: string[];
  rootCause: string;
  diagnosis: string;
  recoveryAction: AllowedRecoveryActionType;
  actionSucceeded: boolean;
  verificationResult: string;
  importantLessons: string[];
}

export interface AuditLogRecord {
  id: string;
  incidentId?: string;
  eventType:
    | "incident_created"
    | "memory_retrieved"
    | "ai_diagnosed"
    | "strategy_generated"
    | "action_validated"
    | "action_executed"
    | "recovery_verified"
    | "hindsight_learned"
    | "human_escalation";
  actor: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface PipelineStageInfo {
  status: "idle" | "running" | "completed" | "failed" | "skipped";
  timestamp?: string;
  title: string;
  summary?: string;
  data?: unknown;
}

export interface AutonomousRecoveryPipelineResult {
  incidentId: string;
  currentStage: "DETECT" | "DIAGNOSE" | "PREDICT" | "STRATEGY" | "POLICY" | "RECOVER" | "VERIFY" | "LEARN";
  stages: {
    detect: PipelineStageInfo;
    diagnose: PipelineStageInfo;
    predict: PipelineStageInfo;
    strategy: PipelineStageInfo;
    policy: PipelineStageInfo;
    recover: PipelineStageInfo;
    verify: PipelineStageInfo;
    learn: PipelineStageInfo;
  };
  diagnosis?: AIDiagnosisResult;
  strategy?: AIRecoveryStrategy;
  execution?: ActionExecutionRecord;
  verification?: VerificationRecord;
  hindsightLearning?: HindsightLearningPayload;
  success: boolean;
  message: string;
}
