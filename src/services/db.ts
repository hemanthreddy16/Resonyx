import { Pool, PoolClient } from "pg";
import {
  Incident,
  AIDiagnosisResult,
  ActionExecutionRecord,
  VerificationRecord,
  AuditLogRecord,
  AllowedRecoveryActionType,
} from "@/types";
import { MOCK_INCIDENTS } from "@/data/mockIncidents";

/**
 * ==============================================================================
 * RESONYX POSTGRESQL PERSISTENCE & DATA ACCESS LAYER
 * ==============================================================================
 *
 * Provides connection pooling, automatic schema creation, transactional safety,
 * and robust graceful fallback to high-fidelity mock data if DATABASE_URL is not
 * configured or currently offline.
 */

let pool: Pool | null = null;
let isSchemaInitialized = false;
let dbConnectionFailed = false;

// In-memory fallback stores when DB is offline or in demo mode
const memoryStore = {
  incidents: new Map<string, Incident>(),
  diagnoses: new Map<string, AIDiagnosisResult & { id: string; incidentId: string; createdAt: string }>(),
  actionExecutions: new Map<string, ActionExecutionRecord>(),
  verifications: new Map<string, VerificationRecord>(),
  auditLogs: [] as AuditLogRecord[],
};

// Pre-seed memory store with mock incidents
MOCK_INCIDENTS.forEach((inc) => {
  memoryStore.incidents.set(inc.id, inc);
  memoryStore.incidents.set(inc.code.toLowerCase(), inc);
});

export function getDbPool(): Pool | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === "" || dbUrl.includes("localhost:5432/resonyx_prod") && dbConnectionFailed) {
    return null;
  }

  if (!pool) {
    try {
      pool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
        max: 10,
        idleTimeoutMillis: 30000,
      });

      pool.on("error", (err) => {
        console.warn("[PostgreSQL] Unexpected pool client error (falling back to memory):", err.message);
        dbConnectionFailed = true;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] Pool initialization failed:", msg);
      dbConnectionFailed = true;
      pool = null;
    }
  }

  return pool;
}

export async function isDatabaseConnected(): Promise<boolean> {
  const p = getDbPool();
  if (!p) return false;

  try {
    const client = await p.connect();
    try {
      await client.query("SELECT 1;");
      return true;
    } finally {
      client.release();
    }
  } catch {
    dbConnectionFailed = true;
    return false;
  }
}

/**
 * Initializes the full Resonyx PostgreSQL database schema.
 * Creates tables: users, incidents, diagnoses, recovery_actions, action_executions, verifications, audit_logs
 */
export async function initDbSchema(): Promise<boolean> {
  if (isSchemaInitialized) return true;
  const p = getDbPool();
  if (!p) return false;

  let client: PoolClient | null = null;
  try {
    client = await p.connect();

    const ddl = `
      -- 1. Users Table
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(64) DEFAULT 'sre_engineer',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 2. Incidents Table
      CREATE TABLE IF NOT EXISTS incidents (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(64) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        service VARCHAR(128) NOT NULL,
        environment VARCHAR(64) DEFAULT 'Production',
        severity VARCHAR(32) NOT NULL,
        status VARCHAR(64) NOT NULL,
        detected_time VARCHAR(64),
        occurred_at TIMESTAMPTZ DEFAULT NOW(),
        resolved_at TIMESTAMPTZ,
        mttr_minutes INTEGER DEFAULT 0,
        impact_cost NUMERIC DEFAULT 0,
        affected_users INTEGER DEFAULT 0,
        root_cause_domain VARCHAR(128),
        hindsight_vector_id VARCHAR(128),
        summary TEXT,
        telemetry_metrics JSONB DEFAULT '{}',
        timeline_events JSONB DEFAULT '[]',
        evidence JSONB DEFAULT '{}',
        key_learnings JSONB DEFAULT '[]',
        preventative_measures JSONB DEFAULT '[]',
        tags JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 3. Diagnoses Table
      CREATE TABLE IF NOT EXISTS diagnoses (
        id VARCHAR(64) PRIMARY KEY,
        incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
        diagnosis TEXT NOT NULL,
        root_cause TEXT NOT NULL,
        confidence NUMERIC NOT NULL,
        severity VARCHAR(32) NOT NULL,
        contributing_factors JSONB DEFAULT '[]',
        recommended_actions JSONB DEFAULT '[]',
        reasoning TEXT,
        required_information JSONB DEFAULT '[]',
        raw_ai_response TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 4. Controlled Recovery Actions Whitelist Table
      CREATE TABLE IF NOT EXISTS recovery_actions (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(64) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        risk_level VARCHAR(32) NOT NULL,
        is_automated BOOLEAN DEFAULT TRUE,
        requires_human_approval BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 5. Action Executions Table
      CREATE TABLE IF NOT EXISTS action_executions (
        id VARCHAR(64) PRIMARY KEY,
        incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
        action VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL,
        result TEXT,
        error TEXT,
        execution_duration_ms INTEGER DEFAULT 0,
        executed_by VARCHAR(128) DEFAULT 'Resonyx Autonomous Agent',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 6. Verifications Table
      CREATE TABLE IF NOT EXISTS verifications (
        id VARCHAR(64) PRIMARY KEY,
        incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
        action_execution_id VARCHAR(64) REFERENCES action_executions(id) ON DELETE SET NULL,
        verification_status VARCHAR(64) NOT NULL,
        verification_result TEXT NOT NULL,
        metrics JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 7. Audit Logs Table
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE SET NULL,
        event_type VARCHAR(64) NOT NULL,
        actor VARCHAR(128) NOT NULL,
        details JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Pre-populate default permitted actions if empty
      INSERT INTO recovery_actions (id, name, description, risk_level, is_automated, requires_human_approval)
      VALUES
        ('act-01', 'retry_request', 'Execute controlled retry with exponential randomized backoff jitter.', 'low', true, false),
        ('act-02', 'restart_service', 'Perform graceful rolling restart of stateless application pods.', 'medium', true, false),
        ('act-03', 'clear_cache', 'Evict corrupted or volatile Redis cache keys for specific namespaces.', 'low', true, false),
        ('act-04', 'rollback_deployment', 'Roll back active canary or service deployment to prior verified SHA.', 'high', true, false),
        ('act-05', 'disable_feature', 'Toggle LaunchDarkly / Unleash feature flag to bypass failing code paths.', 'medium', true, false),
        ('act-06', 'escalate_to_human', 'Page tier-3 on-call SRE and dispatch incident alert payload to Slack/Teams.', 'low', true, false),
        ('act-07', 'isolate_bulkhead', 'Enforce client bulkhead threadpool isolation to shed 25% non-critical queue volume.', 'medium', true, false),
        ('act-08', 'apply_rate_limit', 'Temporarily throttle inbound RPS on saturated gateway routes.', 'medium', true, false),
        ('act-09', 'cancel_blocking_query', 'Cancel long-running transactional lock holders exceeding threshold.', 'high', true, false)
      ON CONFLICT (name) DO NOTHING;
    `;

    await client.query(ddl);
    isSchemaInitialized = true;
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[PostgreSQL] Schema initialization warning (falling back to memory):", msg);
    return false;
  } finally {
    if (client) client.release();
  }
}

// -----------------------------------------------------------------------------
// REPOSITORY METHODS (Dual-mode: Real PostgreSQL with Memory Store fallback)
// -----------------------------------------------------------------------------

export async function insertIncident(incident: Incident): Promise<Incident> {
  const p = getDbPool();
  if (p && !dbConnectionFailed) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const query = `
        INSERT INTO incidents (
          id, code, title, service, environment, severity, status,
          detected_time, occurred_at, resolved_at, mttr_minutes, impact_cost,
          affected_users, root_cause_domain, hindsight_vector_id, summary,
          telemetry_metrics, timeline_events, evidence, key_learnings, preventative_measures, tags
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          summary = EXCLUDED.summary,
          updated_at = NOW()
        RETURNING *;
      `;
      const values = [
        incident.id,
        incident.code,
        incident.title,
        incident.service,
        incident.environment,
        incident.severity,
        incident.status,
        incident.detectedTime,
        incident.occurredAt || new Date().toISOString(),
        incident.resolvedAt === "In Progress" ? null : incident.resolvedAt,
        incident.mttrMinutes || 0,
        incident.impactCost || 0,
        incident.affectedUsers || 0,
        incident.rootCauseDomain,
        incident.hindsightVectorId,
        incident.summary,
        JSON.stringify(incident.evidence || {}),
        JSON.stringify(incident.timelineEvents || []),
        JSON.stringify(incident.evidence || {}),
        JSON.stringify(incident.keyLearnings || []),
        JSON.stringify(incident.preventativeMeasures || []),
        JSON.stringify(incident.tags || []),
      ];

      await client.query(query, values);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] insertIncident fallback:", msg);
    } finally {
      if (client) client.release();
    }
  }

  // Always update memory store as fallback
  memoryStore.incidents.set(incident.id, incident);
  memoryStore.incidents.set(incident.code.toLowerCase(), incident);

  await insertAuditLog({
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    incidentId: incident.id,
    eventType: "incident_created",
    actor: "Resonyx Telemetry Sentinel",
    details: { code: incident.code, title: incident.title, service: incident.service, severity: incident.severity },
    timestamp: new Date().toISOString(),
  });

  return incident;
}

export async function getAllIncidents(): Promise<Incident[]> {
  const p = getDbPool();
  if (p && !dbConnectionFailed) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const res = await client.query("SELECT * FROM incidents ORDER BY occurred_at DESC LIMIT 50;");
      if (res.rows && res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: row.id,
          code: row.code,
          title: row.title,
          service: row.service,
          environment: row.environment,
          severity: row.severity,
          status: row.status,
          detectedTime: row.detected_time,
          occurredAt: row.occurred_at ? new Date(row.occurred_at).toISOString() : new Date().toISOString(),
          resolvedAt: row.resolved_at ? new Date(row.resolved_at).toISOString() : "In Progress",
          mttrMinutes: row.mttr_minutes || 0,
          impactCost: Number(row.impact_cost) || 0,
          affectedUsers: Number(row.affected_users) || 0,
          rootCauseDomain: row.root_cause_domain,
          hindsightVectorId: row.hindsight_vector_id || "vec_default",
          similarityMatchCount: 4,
          summary: row.summary,
          timelineEvents: row.timeline_events || [],
          aiRootCause: {
            likelyCause: row.summary || "Pending investigation",
            confidence: 90,
          },
          hindsightRecall: [],
          evidence: row.evidence || {},
          keyLearnings: row.key_learnings || [],
          preventativeMeasures: row.preventative_measures || [],
          tags: row.tags || [],
          riskLevel: row.severity,
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] getAllIncidents fallback:", msg);
    } finally {
      if (client) client.release();
    }
  }

  // Memory fallback
  return Array.from(new Set(Array.from(memoryStore.incidents.values())));
}

export async function getIncidentById(id: string): Promise<Incident | undefined> {
  const normalized = id.toLowerCase();
  const p = getDbPool();
  if (p && !dbConnectionFailed) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const res = await client.query(
        "SELECT * FROM incidents WHERE LOWER(id) = $1 OR LOWER(code) = $1 LIMIT 1;",
        [normalized]
      );
      if (res.rows && res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          code: row.code,
          title: row.title,
          service: row.service,
          environment: row.environment,
          severity: row.severity,
          status: row.status,
          detectedTime: row.detected_time,
          occurredAt: row.occurred_at ? new Date(row.occurred_at).toISOString() : new Date().toISOString(),
          resolvedAt: row.resolved_at ? new Date(row.resolved_at).toISOString() : "In Progress",
          mttrMinutes: row.mttr_minutes || 0,
          impactCost: Number(row.impact_cost) || 0,
          affectedUsers: Number(row.affected_users) || 0,
          rootCauseDomain: row.root_cause_domain,
          hindsightVectorId: row.hindsight_vector_id || "vec_default",
          similarityMatchCount: 4,
          summary: row.summary,
          timelineEvents: row.timeline_events || [],
          aiRootCause: {
            likelyCause: row.summary || "Pending investigation",
            confidence: 92,
          },
          hindsightRecall: [],
          evidence: row.evidence || {},
          keyLearnings: row.key_learnings || [],
          preventativeMeasures: row.preventative_measures || [],
          tags: row.tags || [],
          riskLevel: row.severity,
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] getIncidentById fallback:", msg);
    } finally {
      if (client) client.release();
    }
  }

  return memoryStore.incidents.get(id) || memoryStore.incidents.get(normalized);
}

export async function updateIncidentStatus(
  id: string,
  status: "investigating" | "mitigated" | "resolved" | "learning-indexed",
  resolvedAt?: string
): Promise<boolean> {
  const p = getDbPool();
  if (p && !dbConnectionFailed) {
    let client: PoolClient | null = null;
    try {
      client = await p.connect();
      await client.query(
        "UPDATE incidents SET status = $1, resolved_at = $2, updated_at = NOW() WHERE LOWER(id) = LOWER($3) OR LOWER(code) = LOWER($3);",
        [status, resolvedAt || new Date().toISOString(), id]
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] updateIncidentStatus fallback:", msg);
    } finally {
      if (client) client.release();
    }
  }

  const existing = memoryStore.incidents.get(id) || memoryStore.incidents.get(id.toLowerCase());
  if (existing) {
    existing.status = status;
    if (resolvedAt) existing.resolvedAt = resolvedAt;
  }
  return true;
}

export async function insertDiagnosis(
  incidentId: string,
  diag: AIDiagnosisResult
): Promise<string> {
  const diagnosisId = `diag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const p = getDbPool();
  if (p && !dbConnectionFailed) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const query = `
        INSERT INTO diagnoses (
          id, incident_id, diagnosis, root_cause, confidence, severity,
          contributing_factors, recommended_actions, reasoning, required_information, raw_ai_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
      `;
      await client.query(query, [
        diagnosisId,
        incidentId,
        diag.diagnosis,
        diag.rootCause,
        diag.confidence,
        diag.severity,
        JSON.stringify(diag.contributingFactors),
        JSON.stringify(diag.recommendedActions),
        diag.reasoning,
        JSON.stringify(diag.requiredInformation || []),
        diag.rawResponse || "",
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] insertDiagnosis fallback:", msg);
    } finally {
      if (client) client.release();
    }
  }

  memoryStore.diagnoses.set(incidentId, {
    ...diag,
    id: diagnosisId,
    incidentId,
    createdAt: new Date().toISOString(),
  });

  await insertAuditLog({
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    incidentId,
    eventType: "ai_diagnosed",
    actor: "OpenRouter AI Engine",
    details: { diagnosis: diag.diagnosis, rootCause: diag.rootCause, confidence: diag.confidence },
    timestamp: new Date().toISOString(),
  });

  return diagnosisId;
}

export async function getDiagnosisForIncident(incidentId: string): Promise<AIDiagnosisResult | null> {
  const p = getDbPool();
  if (p && !dbConnectionFailed) {
    let client: PoolClient | null = null;
    try {
      client = await p.connect();
      const res = await client.query(
        "SELECT * FROM diagnoses WHERE LOWER(incident_id) = LOWER($1) ORDER BY created_at DESC LIMIT 1;",
        [incidentId]
      );
      if (res.rows && res.rows.length > 0) {
        const row = res.rows[0];
        return {
          diagnosis: row.diagnosis,
          rootCause: row.root_cause,
          confidence: Number(row.confidence),
          severity: row.severity,
          contributingFactors: row.contributing_factors || [],
          recommendedActions: row.recommended_actions || [],
          reasoning: row.reasoning,
          requiredInformation: row.required_information || [],
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] getDiagnosisForIncident fallback:", msg);
    } finally {
      if (client) client.release();
    }
  }

  return memoryStore.diagnoses.get(incidentId) || null;
}

export async function insertActionExecution(exec: ActionExecutionRecord): Promise<void> {
  const p = getDbPool();
  if (p && !dbConnectionFailed) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const query = `
        INSERT INTO action_executions (
          id, incident_id, action, status, result, error, execution_duration_ms, executed_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `;
      await client.query(query, [
        exec.id,
        exec.incidentId,
        exec.action,
        exec.status,
        exec.result,
        exec.error || null,
        exec.executionDuration,
        exec.executedBy,
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] insertActionExecution fallback:", msg);
    } finally {
      if (client) client.release();
    }
  }

  memoryStore.actionExecutions.set(exec.id, exec);

  await insertAuditLog({
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    incidentId: exec.incidentId,
    eventType: "action_executed",
    actor: exec.executedBy,
    details: { action: exec.action, status: exec.status, durationMs: exec.executionDuration, result: exec.result },
    timestamp: new Date().toISOString(),
  });
}

export async function getExecutionsForIncident(incidentId: string): Promise<ActionExecutionRecord[]> {
  const p = getDbPool();
  if (p && !dbConnectionFailed) {
    let client: PoolClient | null = null;
    try {
      client = await p.connect();
      const res = await client.query(
        "SELECT * FROM action_executions WHERE LOWER(incident_id) = LOWER($1) ORDER BY created_at DESC;",
        [incidentId]
      );
      if (res.rows && res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          incidentId: r.incident_id,
          action: r.action as AllowedRecoveryActionType,
          status: r.status,
          result: r.result,
          error: r.error,
          executionDuration: r.execution_duration_ms,
          executedBy: r.executed_by,
          timestamp: new Date(r.created_at).toISOString(),
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] getExecutionsForIncident fallback:", msg);
    } finally {
      if (client) client.release();
    }
  }

  return Array.from(memoryStore.actionExecutions.values()).filter(
    (e) => e.incidentId.toLowerCase() === incidentId.toLowerCase()
  );
}

export async function insertVerification(ver: VerificationRecord): Promise<void> {
  const p = getDbPool();
  if (p && !dbConnectionFailed) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const query = `
        INSERT INTO verifications (
          id, incident_id, action_execution_id, verification_status, verification_result, metrics
        ) VALUES ($1, $2, $3, $4, $5, $6);
      `;
      await client.query(query, [
        ver.id,
        ver.incidentId,
        ver.actionExecutionId || null,
        ver.verificationStatus,
        ver.verificationResult,
        JSON.stringify(ver.metrics),
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] insertVerification fallback:", msg);
    } finally {
      if (client) client.release();
    }
  }

  memoryStore.verifications.set(ver.id, ver);

  await insertAuditLog({
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    incidentId: ver.incidentId,
    eventType: "recovery_verified",
    actor: "Resonyx Health Prober",
    details: { status: ver.verificationStatus, result: ver.verificationResult, metrics: ver.metrics },
    timestamp: new Date().toISOString(),
  });
}

export async function getVerificationsForIncident(incidentId: string): Promise<VerificationRecord[]> {
  const p = getDbPool();
  if (p && !dbConnectionFailed) {
    let client: PoolClient | null = null;
    try {
      client = await p.connect();
      const res = await client.query(
        "SELECT * FROM verifications WHERE LOWER(incident_id) = LOWER($1) ORDER BY created_at DESC;",
        [incidentId]
      );
      if (res.rows && res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          incidentId: r.incident_id,
          actionExecutionId: r.action_execution_id,
          verificationStatus: r.verification_status,
          verificationResult: r.verification_result,
          metrics: r.metrics || {},
          timestamp: new Date(r.created_at).toISOString(),
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] getVerificationsForIncident fallback:", msg);
    } finally {
      if (client) client.release();
    }
  }

  return Array.from(memoryStore.verifications.values()).filter(
    (v) => v.incidentId.toLowerCase() === incidentId.toLowerCase()
  );
}

export async function insertAuditLog(log: AuditLogRecord): Promise<void> {
  const p = getDbPool();
  if (p && !dbConnectionFailed) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      await client.query(
        "INSERT INTO audit_logs (id, incident_id, event_type, actor, details) VALUES ($1, $2, $3, $4, $5);",
        [log.id, log.incidentId || null, log.eventType, log.actor, JSON.stringify(log.details)]
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] insertAuditLog fallback:", msg);
    } finally {
      if (client) client.release();
    }
  }

  memoryStore.auditLogs.unshift(log);
  if (memoryStore.auditLogs.length > 200) {
    memoryStore.auditLogs.pop();
  }
}

export async function getAuditLogsForIncident(incidentId?: string): Promise<AuditLogRecord[]> {
  const p = getDbPool();
  if (p && !dbConnectionFailed) {
    let client: PoolClient | null = null;
    try {
      client = await p.connect();
      const query = incidentId
        ? "SELECT * FROM audit_logs WHERE LOWER(incident_id) = LOWER($1) ORDER BY created_at DESC LIMIT 50;"
        : "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50;";
      const params = incidentId ? [incidentId] : [];
      const res = await client.query(query, params);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          incidentId: r.incident_id,
          eventType: r.event_type,
          actor: r.actor,
          details: r.details || {},
          timestamp: new Date(r.created_at).toISOString(),
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PostgreSQL] getAuditLogs fallback:", msg);
    } finally {
      if (client) client.release();
    }
  }

  if (incidentId) {
    return memoryStore.auditLogs.filter(
      (l) => l.incidentId && l.incidentId.toLowerCase() === incidentId.toLowerCase()
    );
  }
  return memoryStore.auditLogs;
}
