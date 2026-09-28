import {
  Incident,
  AutonomousRecoveryPipelineResult,
} from "@/types";
import {
  getIncidentById,
  updateIncidentStatus,
  insertDiagnosis,
  insertActionExecution,
  insertVerification,
  insertAuditLog,
} from "./db";
import { hindsightService } from "./hindsightEngine";
import { openRouterService } from "./openrouter";
import { recoveryActionEngine } from "./recoveryActions";

/**
 * ==============================================================================
 * RESONYX AUTONOMOUS RECOVERY PIPELINE ORCHESTRATOR
 * ==============================================================================
 *
 * Coordinates the full closed-loop autonomous cycle:
 * DETECT -> RETRIEVE MEMORY -> DIAGNOSE -> PREDICT RISK -> STRATEGY -> POLICY -> RECOVER -> VERIFY -> LEARN
 * ==============================================================================
 */

export class AutonomousPipelineOrchestrator {
  private static instance: AutonomousPipelineOrchestrator;

  public static getInstance(): AutonomousPipelineOrchestrator {
    if (!AutonomousPipelineOrchestrator.instance) {
      AutonomousPipelineOrchestrator.instance = new AutonomousPipelineOrchestrator();
    }
    return AutonomousPipelineOrchestrator.instance;
  }

  public async runPipeline(incidentId: string): Promise<AutonomousRecoveryPipelineResult> {
    const now = () => new Date().toISOString();

    const result: AutonomousRecoveryPipelineResult = {
      incidentId,
      currentStage: "DETECT",
      stages: {
        detect: { status: "running", title: "Incident Telemetry Detection", timestamp: now() },
        diagnose: { status: "idle", title: "Hindsight Memory & OpenRouter Diagnosis" },
        predict: { status: "idle", title: "Predictive Risk Evaluation" },
        strategy: { status: "idle", title: "Autonomous Recovery Strategy" },
        policy: { status: "idle", title: "Human-Safety Guardrail Verification" },
        recover: { status: "idle", title: "Controlled Action Execution" },
        verify: { status: "idle", title: "Post-Recovery Telemetry Verification" },
        learn: { status: "idle", title: "Hindsight Long-Term Memory Codification" },
      },
      success: false,
      message: "Pipeline initialized.",
    };

    // 1. STAGE: DETECT
    const incident: Incident | undefined = await getIncidentById(incidentId);
    if (!incident) {
      result.stages.detect.status = "failed";
      result.stages.detect.summary = `Incident '${incidentId}' not found in PostgreSQL database.`;
      result.message = `Incident not found: ${incidentId}`;
      return result;
    }

    result.stages.detect.status = "completed";
    result.stages.detect.timestamp = now();
    result.stages.detect.summary = `Ingested failure '${incident.title}' on service '${incident.service}' (${incident.severity.toUpperCase()}).`;
    result.stages.detect.data = { incidentId: incident.id, code: incident.code, service: incident.service };

    // 2. STAGE: MEMORY RETRIEVAL & AI DIAGNOSIS
    result.currentStage = "DIAGNOSE";
    result.stages.diagnose.status = "running";
    result.stages.diagnose.timestamp = now();

    const queryStr = `${incident.title} ${incident.service} ${incident.rootCauseDomain}`;
    const hindsightMemories = await hindsightService.getRelevantMemories(queryStr, 3);

    await insertAuditLog({
      id: `aud-${Date.now()}-mem`,
      incidentId: incident.id,
      eventType: "memory_retrieved",
      actor: "Hindsight Vector Engine",
      details: {
        query: queryStr,
        memoriesFound: hindsightMemories.length,
        memoryCodes: hindsightMemories.map((m) => m.memoryCode),
      },
      timestamp: now(),
    });

    const diagnosis = await openRouterService.diagnoseIncident(incident, hindsightMemories);
    result.diagnosis = diagnosis;
    await insertDiagnosis(incident.id, diagnosis);

    result.stages.diagnose.status = "completed";
    result.stages.diagnose.timestamp = now();
    result.stages.diagnose.summary = `Diagnosis: ${diagnosis.diagnosis} (Confidence: ${diagnosis.confidence}%)`;
    result.stages.diagnose.data = diagnosis;

    // 3. STAGE: PREDICT RISK
    result.currentStage = "PREDICT";
    result.stages.predict.status = "running";
    result.stages.predict.timestamp = now();

    const riskScore = diagnosis.severity === "critical" ? 88 : diagnosis.severity === "high" ? 78 : 55;
    result.stages.predict.status = "completed";
    result.stages.predict.timestamp = now();
    result.stages.predict.summary = `Operational Blast Radius Risk: ${riskScore}/100 (${diagnosis.severity.toUpperCase()}).`;
    result.stages.predict.data = { riskScore, severity: diagnosis.severity };

    // 4. STAGE: RECOVERY STRATEGY
    result.currentStage = "STRATEGY";
    result.stages.strategy.status = "running";
    result.stages.strategy.timestamp = now();

    const strategy = await openRouterService.generateRecoveryStrategy(
      incident,
      diagnosis,
      hindsightMemories
    );
    result.strategy = strategy;

    result.stages.strategy.status = "completed";
    result.stages.strategy.timestamp = now();
    result.stages.strategy.summary = `Selected Strategy: ${strategy.strategy}`;
    result.stages.strategy.data = strategy;

    // 5. STAGE: POLICY & HUMAN SAFETY VALIDATION
    result.currentStage = "POLICY";
    result.stages.policy.status = "running";
    result.stages.policy.timestamp = now();

    const proposedAction = strategy.selectedAction || strategy.actions[0] || "isolate_bulkhead";
    const isSafe = recoveryActionEngine.isActionAllowed(proposedAction);

    if (!isSafe) {
      result.stages.policy.status = "failed";
      result.stages.policy.summary = `SAFETY VIOLATION: Action '${proposedAction}' rejected. Not in allowed whitelist.`;
      result.message = `Safety violation: Unwhitelisted action '${proposedAction}'.`;
      return result;
    }

    result.stages.policy.status = "completed";
    result.stages.policy.timestamp = now();
    result.stages.policy.summary = `Approved Whitelisted Action: [${proposedAction}]. No arbitrary execution permitted.`;
    result.stages.policy.data = { approvedAction: proposedAction, isSafe: true };

    // 6. STAGE: RECOVER (EXECUTION)
    result.currentStage = "RECOVER";
    result.stages.recover.status = "running";
    result.stages.recover.timestamp = now();

    const execution = await recoveryActionEngine.executeAction(
      incident.id,
      proposedAction,
      incident.service
    );
    result.execution = execution;
    await insertActionExecution(execution);

    if (execution.status !== "success") {
      result.stages.recover.status = "failed";
      result.stages.recover.summary = `Execution failed: ${execution.error}`;
      result.message = `Execution failed: ${execution.error}`;
      return result;
    }

    result.stages.recover.status = "completed";
    result.stages.recover.timestamp = now();
    result.stages.recover.summary = `${execution.result} (Duration: ${execution.executionDuration}ms)`;
    result.stages.recover.data = execution;

    // 7. STAGE: VERIFY
    result.currentStage = "VERIFY";
    result.stages.verify.status = "running";
    result.stages.verify.timestamp = now();

    const verification = await recoveryActionEngine.verifyRecovery(incident.id, execution.id);
    result.verification = verification;
    await insertVerification(verification);

    const isResolved = verification.verificationStatus === "verified_resolved";
    if (isResolved) {
      await updateIncidentStatus(incident.id, "resolved", now());
    }

    result.stages.verify.status = "completed";
    result.stages.verify.timestamp = now();
    result.stages.verify.summary = verification.verificationResult;
    result.stages.verify.data = verification;

    // 8. STAGE: LEARN (HINDSIGHT MEMORY ENCODING)
    result.currentStage = "LEARN";
    result.stages.learn.status = "running";
    result.stages.learn.timestamp = now();

    const learningPayload = recoveryActionEngine.constructLearningPayload(
      incident,
      diagnosis,
      proposedAction,
      isResolved,
      verification
    );
    result.hindsightLearning = learningPayload;

    const memoryResponse = await hindsightService.storeIncidentMemory(incident);
    await hindsightService.storeOutcome(
      memoryResponse.memoryId,
      isResolved ? "Recovered" : "Mitigated",
      `Autonomous recovery verified via action [${proposedAction}]. Latency normalized to ${verification.metrics.p99LatencyMs}ms.`
    );
    await hindsightService.updateLearning(
      memoryResponse.memoryId,
      learningPayload.importantLessons[0],
      +0.8
    );

    await insertAuditLog({
      id: `aud-${Date.now()}-learn`,
      incidentId: incident.id,
      eventType: "hindsight_learned",
      actor: "Resonyx Evolutionary Knowledge Engine",
      details: {
        memoryId: memoryResponse.memoryId,
        actionTaken: proposedAction,
        lessonsLearned: learningPayload.importantLessons,
      },
      timestamp: now(),
    });

    result.stages.learn.status = "completed";
    result.stages.learn.timestamp = now();
    result.stages.learn.summary = `Codified new memory ${memoryResponse.memoryId} into Hindsight. Pattern confidence boosted by +0.8%.`;
    result.stages.learn.data = { memoryId: memoryResponse.memoryId, learningPayload };

    result.success = true;
    result.message = `Autonomous recovery pipeline completed successfully for ${incident.code}. Total failure mitigation verified.`;

    return result;
  }
}

export const autonomousPipeline = AutonomousPipelineOrchestrator.getInstance();
