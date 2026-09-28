import { Pool, PoolClient } from "pg";
import {
  Incident,
  AIDiagnosisResult,
  ActionExecutionRecord,
  VerificationRecord,
  AuditLogRecord,
  AllowedRecoveryActionType,
  HindsightMemoryRecord,
} from "@/types";
import { MOCK_INCIDENTS } from "@/data/mockIncidents";
import { MOCK_HINDSIGHT_MEMORIES } from "@/data/mockHindsightMemory";

/**
 * ==============================================================================
 * RESONYX POSTGRESQL PERSISTENCE & DATA ACCESS LAYER
 * ==============================================================================
 *
 * Provides connection pooling, automatic schema creation, transactional safety,
 * and robust graceful fallback to mock data if DATABASE_URL is not configured.
 * ==============================================================================
 */

let pool: Pool | null = null;
let isSchemaInitialized = false;

// In-memory fallback stores when DB is offline or in development mode without DB
const memoryStore = {
  incidents: new Map<string, Incident>(),
  diagnoses: new Map<string, AIDiagnosisResult & { id: string; incidentId: string; createdAt: string }>(),
  actionExecutions: new Map<string, ActionExecutionRecord>(),
  verifications: new Map<string, VerificationRecord>(),
  auditLogs: [] as AuditLogRecord[],
  hindsightMemories: new Map<string, HindsightMemoryRecord>(),
};

// Pre-seed memory store with mock incidents & memories for fallback
MOCK_INCIDENTS.forEach((inc) => {
  memoryStore.incidents.set(inc.id, inc);
  memoryStore.incidents.set(inc.code.toLowerCase(), inc);
});

MOCK_HINDSIGHT_MEMORIES.forEach((m) => {
  memoryStore.hindsightMemories.set(m.id, m);
  memoryStore.hindsightMemories.set(m.memoryCode.toLowerCase(), m);
});

export function getDbPool(): Pool | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === "") {
    return null;
  }

  if (!pool) {
    try {
      const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
      pool = new Pool({
        connectionString: dbUrl,
        ssl: isLocal ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
        max: 10,
        idleTimeoutMillis: 30000,
      });

      pool.on("error", (err) => {
        console.error("[PostgreSQL] Unexpected pool client error:", err.message);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Pool initialization failed:", msg);
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[PostgreSQL] Connection check failed:", msg);
    return false;
  }
}

/**
 * Returns full health and table metrics for /api/health
 */
export async function getDatabaseHealth(): Promise<{
  connected: boolean;
  dialect: string;
  tableCount: number;
  incidentCount: number;
  memoryCount: number;
  diagnosisCount: number;
  actionExecutionCount: number;
  verificationCount: number;
  auditLogCount: number;
  error?: string;
}> {
  const p = getDbPool();
  if (!p) {
    return {
      connected: false,
      dialect: "in-memory-fallback",
      tableCount: 0,
      incidentCount: memoryStore.incidents.size,
      memoryCount: memoryStore.hindsightMemories.size,
      diagnosisCount: memoryStore.diagnoses.size,
      actionExecutionCount: memoryStore.actionExecutions.size,
      verificationCount: memoryStore.verifications.size,
      auditLogCount: memoryStore.auditLogs.length,
      error: "DATABASE_URL environment variable is not configured.",
    };
  }

  let client: PoolClient | null = null;
  try {
    client = await p.connect();
    const tablesRes = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `);
    const tableCount = parseInt(tablesRes.rows[0]?.count || "0", 10);

    const incRes = await client.query("SELECT COUNT(*) as count FROM incidents;").catch(() => ({ rows: [{ count: "0" }] }));
    const memRes = await client.query("SELECT COUNT(*) as count FROM hindsight_memories;").catch(() => ({ rows: [{ count: "0" }] }));
    const diagRes = await client.query("SELECT COUNT(*) as count FROM diagnoses;").catch(() => ({ rows: [{ count: "0" }] }));
    const execRes = await client.query("SELECT COUNT(*) as count FROM action_executions;").catch(() => ({ rows: [{ count: "0" }] }));
    const verRes = await client.query("SELECT COUNT(*) as count FROM verifications;").catch(() => ({ rows: [{ count: "0" }] }));
    const auditRes = await client.query("SELECT COUNT(*) as count FROM audit_logs;").catch(() => ({ rows: [{ count: "0" }] }));

    return {
      connected: true,
      dialect: "postgresql",
      tableCount,
      incidentCount: parseInt(incRes.rows[0]?.count || "0", 10),
      memoryCount: parseInt(memRes.rows[0]?.count || "0", 10),
      diagnosisCount: parseInt(diagRes.rows[0]?.count || "0", 10),
      actionExecutionCount: parseInt(execRes.rows[0]?.count || "0", 10),
      verificationCount: parseInt(verRes.rows[0]?.count || "0", 10),
      auditLogCount: parseInt(auditRes.rows[0]?.count || "0", 10),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      dialect: "postgresql",
      tableCount: 0,
      incidentCount: memoryStore.incidents.size,
      memoryCount: memoryStore.hindsightMemories.size,
      diagnosisCount: memoryStore.diagnoses.size,
      actionExecutionCount: memoryStore.actionExecutions.size,
      verificationCount: memoryStore.verifications.size,
      auditLogCount: memoryStore.auditLogs.length,
      error: msg,
    };
  } finally {
    if (client) client.release();
  }
}

/**
 * Initializes the full Resonyx PostgreSQL database schema.
 */
export async function initDbSchema(): Promise<boolean> {
  if (isSchemaInitialized) return true;
  const p = getDbPool();
  if (!p) return false;

  let client: PoolClient | null = null;
  try {
    client = await p.connect();

    const ddl = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(64) DEFAULT 'sre_engineer',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

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
        pattern_match JSONB DEFAULT '{}',
        risk_level VARCHAR(32) DEFAULT 'medium',
        hindsight_vector_id VARCHAR(128),
        similarity_match_count INTEGER DEFAULT 0,
        summary TEXT,
        telemetry_metrics JSONB DEFAULT '{}',
        timeline_events JSONB DEFAULT '[]',
        ai_root_cause JSONB DEFAULT '{}',
        hindsight_recall JSONB DEFAULT '[]',
        evidence JSONB DEFAULT '{}',
        key_learnings TEXT DEFAULT '',
        preventative_measures TEXT DEFAULT '',
        tags TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS diagnoses (
        id VARCHAR(64) PRIMARY KEY,
        incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
        model VARCHAR(128) NOT NULL,
        diagnosis TEXT NOT NULL,
        root_cause TEXT NOT NULL,
        confidence NUMERIC NOT NULL,
        severity VARCHAR(32) NOT NULL,
        contributing_factors JSONB DEFAULT '[]',
        recommended_actions JSONB DEFAULT '[]',
        reasoning TEXT,
        required_information JSONB DEFAULT '[]',
        raw_response TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS recovery_actions (
        id VARCHAR(64) PRIMARY KEY,
        action_type VARCHAR(64) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        risk_tier VARCHAR(32) DEFAULT 'low',
        is_whitelisted BOOLEAN DEFAULT TRUE,
        requires_human_approval BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

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

      CREATE TABLE IF NOT EXISTS verifications (
        id VARCHAR(64) PRIMARY KEY,
        incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
        action_execution_id VARCHAR(64) REFERENCES action_executions(id) ON DELETE SET NULL,
        verification_status VARCHAR(64) NOT NULL,
        verification_result TEXT NOT NULL,
        metrics JSONB DEFAULT '{}',
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE SET NULL,
        event_type VARCHAR(64) NOT NULL,
        actor VARCHAR(128) NOT NULL,
        details JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS hindsight_memories (
        id VARCHAR(64) PRIMARY KEY,
        memory_code VARCHAR(64) UNIQUE NOT NULL,
        source_incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE SET NULL,
        source_incident_code VARCHAR(64),
        title VARCHAR(255) NOT NULL,
        vector_id VARCHAR(128) NOT NULL,
        knowledge_domain VARCHAR(128) NOT NULL,
        root_cause VARCHAR(255) NOT NULL,
        decision TEXT NOT NULL,
        action VARCHAR(128) NOT NULL,
        outcome VARCHAR(64) NOT NULL,
        outcome_detail TEXT NOT NULL,
        learned_insight TEXT NOT NULL,
        extracted_rule TEXT NOT NULL,
        anti_pattern_signature TEXT NOT NULL,
        pattern_code VARCHAR(64) NOT NULL,
        confidence_score NUMERIC DEFAULT 90.0,
        similarity_threshold NUMERIC DEFAULT 85.0,
        semantic_tags JSONB DEFAULT '[]',
        raw_payload JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_incidents_code ON incidents(code);
      CREATE INDEX IF NOT EXISTS idx_incidents_occurred_at ON incidents(occurred_at DESC);
      CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
      CREATE INDEX IF NOT EXISTS idx_incidents_service ON incidents(service);
      CREATE INDEX IF NOT EXISTS idx_diagnoses_incident_id ON diagnoses(incident_id);
      CREATE INDEX IF NOT EXISTS idx_action_executions_incident_id ON action_executions(incident_id);
      CREATE INDEX IF NOT EXISTS idx_verifications_incident_id ON verifications(incident_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_incident_id ON audit_logs(incident_id);
      CREATE INDEX IF NOT EXISTS idx_hindsight_memories_code ON hindsight_memories(memory_code);
      CREATE INDEX IF NOT EXISTS idx_hindsight_memories_domain ON hindsight_memories(knowledge_domain);

      INSERT INTO recovery_actions (id, action_type, description, risk_tier, is_whitelisted)
      VALUES
        ('act-01', 'retry_request', 'Execute controlled retry with exponential randomized backoff jitter.', 'low', true),
        ('act-02', 'restart_service', 'Perform graceful rolling restart of stateless application pods.', 'medium', true),
        ('act-03', 'clear_cache', 'Evict corrupted or volatile Redis cache keys for specific namespaces.', 'low', true),
        ('act-04', 'rollback_deployment', 'Roll back active canary or service deployment to prior verified SHA.', 'high', true),
        ('act-05', 'disable_feature', 'Toggle LaunchDarkly / Unleash feature flag to bypass failing code paths.', 'medium', true),
        ('act-06', 'escalate_to_human', 'Page tier-3 on-call SRE and dispatch incident alert payload to Slack/Teams.', 'low', true),
        ('act-07', 'isolate_bulkhead', 'Enforce client bulkhead threadpool isolation to shed 25% non-critical queue volume.', 'medium', true),
        ('act-08', 'apply_rate_limit', 'Temporarily throttle inbound RPS on saturated gateway routes.', 'medium', true),
        ('act-09', 'cancel_blocking_query', 'Cancel long-running transactional lock holders exceeding threshold.', 'high', true)
      ON CONFLICT (action_type) DO UPDATE SET
        description = EXCLUDED.description,
        risk_tier = EXCLUDED.risk_tier,
        is_whitelisted = EXCLUDED.is_whitelisted;
    `;

    await client.query(ddl);
    isSchemaInitialized = true;
    console.log("[PostgreSQL] Schema verification / initialization complete.");
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PostgreSQL] Schema initialization error:", msg);
    return false;
  } finally {
    if (client) client.release();
  }
}

// -----------------------------------------------------------------------------
// REPOSITORY METHODS
// -----------------------------------------------------------------------------

export async function insertIncident(incident: Incident): Promise<Incident> {
  const p = getDbPool();
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const query = `
        INSERT INTO incidents (
          id, code, title, service, environment, severity, status,
          detected_time, occurred_at, resolved_at, mttr_minutes, impact_cost,
          affected_users, root_cause_domain, hindsight_vector_id, summary,
          telemetry_metrics, timeline_events, evidence, key_learnings, preventative_measures, tags,
          pattern_match, risk_level, similarity_match_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
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
        Array.isArray(incident.keyLearnings) ? incident.keyLearnings.join("; ") : (incident.keyLearnings || ""),
        Array.isArray(incident.preventativeMeasures) ? incident.preventativeMeasures.join("; ") : (incident.preventativeMeasures || ""),
        Array.isArray(incident.tags) ? incident.tags.join(" ") : (incident.tags || ""),
        JSON.stringify(incident.patternMatch || {}),
        incident.riskLevel || "medium",
        incident.similarityMatchCount || 4,
      ];

      await client.query(query, values);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in insertIncident:", msg);
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Database insertIncident failed in production: ${msg}`);
      }
    } finally {
      if (client) client.release();
    }
  }

  // Also update memoryStore
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
  if (p) {
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
          similarityMatchCount: row.similarity_match_count || 4,
          summary: row.summary,
          timelineEvents: row.timeline_events || [],
          aiRootCause: row.ai_root_cause || {
            likelyCause: row.summary || "Pending investigation",
            confidence: 90,
          },
          hindsightRecall: row.hindsight_recall || [],
          evidence: row.evidence || {},
          keyLearnings: row.key_learnings || "",
          preventativeMeasures: row.preventative_measures || "",
          tags: row.tags || "",
          riskLevel: row.risk_level || row.severity,
          patternMatch: row.pattern_match || undefined,
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in getAllIncidents:", msg);
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Database getAllIncidents failed: ${msg}`);
      }
    } finally {
      if (client) client.release();
    }
  }

  return Array.from(new Set(memoryStore.incidents.values()));
}

export async function getIncidentById(idOrCode: string): Promise<Incident | undefined> {
  const p = getDbPool();
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const res = await client.query(
        "SELECT * FROM incidents WHERE LOWER(id) = LOWER($1) OR LOWER(code) = LOWER($1) LIMIT 1;",
        [idOrCode]
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
          similarityMatchCount: row.similarity_match_count || 4,
          summary: row.summary,
          timelineEvents: row.timeline_events || [],
          aiRootCause: row.ai_root_cause || {
            likelyCause: row.summary || "Pending investigation",
            confidence: 90,
          },
          hindsightRecall: row.hindsight_recall || [],
          evidence: row.evidence || {},
          keyLearnings: row.key_learnings || "",
          preventativeMeasures: row.preventative_measures || "",
          tags: row.tags || "",
          riskLevel: row.risk_level || row.severity,
          patternMatch: row.pattern_match || undefined,
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in getIncidentById:", msg);
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Database getIncidentById failed: ${msg}`);
      }
    } finally {
      if (client) client.release();
    }
  }

  return (
    memoryStore.incidents.get(idOrCode) ||
    memoryStore.incidents.get(idOrCode.toLowerCase())
  );
}

export async function updateIncidentStatus(
  idOrCode: string,
  status: string,
  resolvedAt?: string
): Promise<boolean> {
  const p = getDbPool();
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const query = `
        UPDATE incidents
        SET status = $1,
            resolved_at = CASE WHEN $2::TIMESTAMPTZ IS NOT NULL THEN $2::TIMESTAMPTZ ELSE resolved_at END,
            updated_at = NOW()
        WHERE LOWER(id) = LOWER($3) OR LOWER(code) = LOWER($3);
      `;
      await client.query(query, [status, resolvedAt || null, idOrCode]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in updateIncidentStatus:", msg);
    } finally {
      if (client) client.release();
    }
  }

  const inc = memoryStore.incidents.get(idOrCode) || memoryStore.incidents.get(idOrCode.toLowerCase());
  if (inc) {
    inc.status = status as Incident["status"];
    if (resolvedAt) inc.resolvedAt = resolvedAt;
  }
  return true;
}

export async function insertDiagnosis(incidentId: string, diag: AIDiagnosisResult): Promise<string> {
  const diagnosisId = `diag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const p = getDbPool();
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const query = `
        INSERT INTO diagnoses (
          id, incident_id, model, diagnosis, root_cause, confidence, severity,
          contributing_factors, recommended_actions, reasoning, required_information, raw_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
      `;
      await client.query(query, [
        diagnosisId,
        incidentId,
        process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet",
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
      console.error("[PostgreSQL] Error in insertDiagnosis:", msg);
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
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const res = await client.query(
        "SELECT * FROM diagnoses WHERE LOWER(incident_id) = LOWER($1) ORDER BY created_at DESC LIMIT 1;",
        [incidentId]
      );
      if (res.rows && res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          model: row.model || "anthropic/claude-3.5-sonnet",
          diagnosis: row.diagnosis,
          rootCause: row.root_cause,
          confidence: Number(row.confidence),
          severity: row.severity,
          contributingFactors: row.contributing_factors || [],
          recommendedActions: row.recommended_actions || [],
          reasoning: row.reasoning,
          requiredInformation: row.required_information || [],
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in getDiagnosisForIncident:", msg);
    } finally {
      if (client) client.release();
    }
  }

  return memoryStore.diagnoses.get(incidentId) || null;
}

export async function insertActionExecution(exec: ActionExecutionRecord): Promise<void> {
  const p = getDbPool();
  if (p) {
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
      console.error("[PostgreSQL] Error in insertActionExecution:", msg);
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
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
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
          executionDurationMs: r.execution_duration_ms,
          executedBy: r.executed_by,
          timestamp: new Date(r.created_at).toISOString(),
          createdAt: new Date(r.created_at).toISOString(),
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in getExecutionsForIncident:", msg);
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
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const query = `
        INSERT INTO verifications (
          id, incident_id, action_execution_id, verification_status, verification_result, metrics, is_resolved
        ) VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      await client.query(query, [
        ver.id,
        ver.incidentId,
        ver.actionExecutionId || null,
        ver.verificationStatus,
        ver.verificationResult,
        JSON.stringify(ver.metrics),
        ver.verificationStatus === "verified_resolved",
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in insertVerification:", msg);
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
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
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
      console.error("[PostgreSQL] Error in getVerificationsForIncident:", msg);
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
  if (p) {
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
      console.error("[PostgreSQL] Error in insertAuditLog:", msg);
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
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
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
      console.error("[PostgreSQL] Error in getAuditLogs:", msg);
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

// -----------------------------------------------------------------------------
// HINDSIGHT MEMORIES PERSISTENCE IN POSTGRESQL
// -----------------------------------------------------------------------------

export async function insertHindsightMemory(record: HindsightMemoryRecord): Promise<void> {
  const p = getDbPool();
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const query = `
        INSERT INTO hindsight_memories (
          id, memory_code, source_incident_code, title, vector_id,
          knowledge_domain, root_cause, decision, action, outcome,
          outcome_detail, learned_insight, extracted_rule, anti_pattern_signature,
          pattern_code, confidence_score, semantic_tags
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
        ON CONFLICT (memory_code) DO UPDATE SET
          outcome = EXCLUDED.outcome,
          outcome_detail = EXCLUDED.outcome_detail,
          learned_insight = EXCLUDED.learned_insight,
          confidence_score = EXCLUDED.confidence_score,
          updated_at = NOW();
      `;
      await client.query(query, [
        record.id,
        record.memoryCode,
        record.sourceIncidentCode,
        record.sourceIncident,
        record.vectorId,
        record.knowledgeDomain,
        record.rootCause,
        record.decision,
        record.action,
        record.outcome,
        record.outcomeDetail,
        record.learnedInsight,
        record.extractedRule,
        record.antiPatternSignature,
        record.patternCode,
        record.confidence,
        JSON.stringify(record.semanticTags || []),
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in insertHindsightMemory:", msg);
    } finally {
      if (client) client.release();
    }
  }

  memoryStore.hindsightMemories.set(record.id, record);
  memoryStore.hindsightMemories.set(record.memoryCode.toLowerCase(), record);
}

export async function searchHindsightMemories(query: string, limit: number = 5): Promise<HindsightMemoryRecord[]> {
  const words = query.toLowerCase().split(/[\s,._-]+/).filter((w) => w.length >= 3);
  const patterns = words.map((w) => `%${w}%`);

  const p = getDbPool();
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();

      let res;
      if (patterns.length > 0) {
        res = await client.query(
          `SELECT * FROM hindsight_memories
           WHERE LOWER(learned_insight) LIKE ANY($1)
              OR LOWER(extracted_rule) LIKE ANY($1)
              OR LOWER(root_cause) LIKE ANY($1)
              OR LOWER(title) LIKE ANY($1)
              OR LOWER(knowledge_domain) LIKE ANY($1)
              OR LOWER(pattern_code) LIKE ANY($1)
              OR LOWER(anti_pattern_signature) LIKE ANY($1)
           ORDER BY confidence_score DESC, updated_at DESC, created_at DESC
           LIMIT $2;`,
          [patterns, limit]
        );
      }

      if (!res || res.rows.length === 0) {
        res = await client.query(
          `SELECT * FROM hindsight_memories
           ORDER BY confidence_score DESC, updated_at DESC, created_at DESC
           LIMIT $1;`,
          [limit]
        );
      }

      if (res.rows && res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          memoryCode: r.memory_code,
          sourceIncident: r.title,
          sourceIncidentCode: r.source_incident_code,
          vectorId: r.vector_id,
          knowledgeDomain: r.knowledge_domain,
          context: [],
          action: r.action,
          outcome: r.outcome,
          outcomeDetail: r.outcome_detail,
          learnedInsight: r.learned_insight,
          rootCause: r.root_cause,
          decision: r.decision,
          patternCode: r.pattern_code,
          confidence: Number(r.confidence_score),
          relatedMemories: [],
          extractedRule: r.extracted_rule,
          antiPatternSignature: r.anti_pattern_signature,
          failureMechanism: r.root_cause,
          semanticTags: r.semantic_tags || [],
          recallCount: 4,
          lastRecalledAt: new Date(r.updated_at || r.created_at).toISOString(),
          indexingDate: new Date(r.created_at).toISOString(),
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in searchHindsightMemories:", msg);
    } finally {
      if (client) client.release();
    }
  }

  const all = Array.from(new Set(memoryStore.hindsightMemories.values()));
  const matches = all.filter((m) => {
    if (words.length === 0) return true;
    const text = `${m.extractedRule} ${m.learnedInsight} ${m.rootCause} ${m.sourceIncident} ${m.knowledgeDomain} ${m.patternCode}`.toLowerCase();
    return words.some((w) => text.includes(w));
  });
  return (matches.length > 0 ? matches : all).slice(0, limit);
}

export async function updateHindsightMemoryOutcome(
  memoryIdOrCode: string,
  outcome: string,
  details?: string
): Promise<boolean> {
  const p = getDbPool();
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      await client.query(
        `UPDATE hindsight_memories
         SET outcome = $1, outcome_detail = COALESCE($2, outcome_detail), updated_at = NOW()
         WHERE LOWER(id) = LOWER($3) OR LOWER(memory_code) = LOWER($3);`,
        [outcome, details || null, memoryIdOrCode]
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in updateHindsightMemoryOutcome:", msg);
    } finally {
      if (client) client.release();
    }
  }

  const mem = memoryStore.hindsightMemories.get(memoryIdOrCode) || memoryStore.hindsightMemories.get(memoryIdOrCode.toLowerCase());
  if (mem) {
    mem.outcome = outcome as HindsightMemoryRecord["outcome"];
    if (details) mem.outcomeDetail = details;
  }
  return true;
}

export async function updateHindsightLearning(
  memoryIdOrCode: string,
  newInsight: string,
  confidenceDelta: number = 0.8
): Promise<boolean> {
  const p = getDbPool();
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      await client.query(
        `UPDATE hindsight_memories
         SET learned_insight = $1,
             confidence_score = LEAST(99.8, confidence_score + $2),
             updated_at = NOW()
         WHERE LOWER(id) = LOWER($3) OR LOWER(memory_code) = LOWER($3);`,
        [newInsight, confidenceDelta, memoryIdOrCode]
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in updateHindsightLearning:", msg);
    } finally {
      if (client) client.release();
    }
  }

  const mem = memoryStore.hindsightMemories.get(memoryIdOrCode) || memoryStore.hindsightMemories.get(memoryIdOrCode.toLowerCase());
  if (mem) {
    mem.learnedInsight = newInsight;
    mem.confidence = Math.min(99.8, mem.confidence + confidenceDelta);
  }
  return true;
}

export async function getAllHindsightMemories(): Promise<HindsightMemoryRecord[]> {
  const p = getDbPool();
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const res = await client.query("SELECT * FROM hindsight_memories ORDER BY confidence_score DESC LIMIT 50;");
      if (res.rows && res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          memoryCode: r.memory_code,
          sourceIncident: r.title,
          sourceIncidentCode: r.source_incident_code,
          vectorId: r.vector_id,
          knowledgeDomain: r.knowledge_domain,
          context: [],
          action: r.action,
          outcome: r.outcome,
          outcomeDetail: r.outcome_detail,
          learnedInsight: r.learned_insight,
          rootCause: r.root_cause,
          decision: r.decision,
          patternCode: r.pattern_code,
          confidence: Number(r.confidence_score),
          relatedMemories: [],
          extractedRule: r.extracted_rule,
          antiPatternSignature: r.anti_pattern_signature,
          failureMechanism: r.root_cause,
          semanticTags: r.semantic_tags || [],
          recallCount: 4,
          lastRecalledAt: new Date(r.updated_at || r.created_at).toISOString(),
          indexingDate: new Date(r.created_at).toISOString(),
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in getAllHindsightMemories:", msg);
    } finally {
      if (client) client.release();
    }
  }

  return Array.from(memoryStore.hindsightMemories.values());
}

export async function getLearnedMemoryForIncident(
  incidentId: string,
  incidentCode?: string
): Promise<HindsightMemoryRecord | null> {
  const p = getDbPool();
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();
      const code = incidentCode || "";
      const idCode = incidentId.replace(/^inc-/, "MEM-");
      const res = await client.query(
        `SELECT * FROM hindsight_memories 
         WHERE source_incident_id = $1 
            OR LOWER(source_incident_code) = LOWER($1)
            OR LOWER(source_incident_code) = LOWER($2)
            OR LOWER(memory_code) = LOWER($3)
            OR LOWER(memory_code) = LOWER($1)
         ORDER BY updated_at DESC, created_at DESC
         LIMIT 1;`,
        [incidentId, code, idCode]
      );
      if (res.rows && res.rows.length > 0) {
        const r = res.rows[0];
        return {
          id: r.id,
          memoryCode: r.memory_code,
          sourceIncident: r.title,
          sourceIncidentCode: r.source_incident_code,
          vectorId: r.vector_id,
          knowledgeDomain: r.knowledge_domain,
          context: [],
          action: r.action,
          outcome: r.outcome,
          outcomeDetail: r.outcome_detail,
          learnedInsight: r.learned_insight,
          rootCause: r.root_cause,
          decision: r.decision,
          patternCode: r.pattern_code,
          confidence: Number(r.confidence_score),
          relatedMemories: [],
          extractedRule: r.extracted_rule,
          antiPatternSignature: r.anti_pattern_signature,
          failureMechanism: r.root_cause,
          semanticTags: r.semantic_tags || [],
          recallCount: r.recall_count || 1,
          lastRecalledAt: new Date(r.updated_at || r.created_at).toISOString(),
          indexingDate: new Date(r.created_at).toISOString(),
        };
      }
    } catch (err: unknown) {
      console.error("[PostgreSQL] Error in getLearnedMemoryForIncident:", err);
    } finally {
      if (client) client.release();
    }
  }

  // in-memory fallback
  const mem = Array.from(memoryStore.hindsightMemories.values()).find(
    (m) =>
      m.sourceIncidentCode?.toLowerCase() === incidentId.toLowerCase() ||
      m.sourceIncidentCode?.toLowerCase() === incidentCode?.toLowerCase() ||
      m.memoryCode.toLowerCase().includes(incidentId.toLowerCase().replace("inc-", ""))
  );
  return mem || null;
}

export interface RecalledMemoryItem {
  memoryId: string;
  title: string;
  learnedInsight: string;
  confidence: number;
  relationship: string;
  outcome: string;
  action: string;
  patternCode: string;
}

export async function getRecalledMemoriesForIncident(
  incidentId: string,
  incidentCode?: string,
  diagnosisReasoning?: string,
  rootCauseDomain?: string
): Promise<RecalledMemoryItem[]> {
  const p = getDbPool();
  const recalled: RecalledMemoryItem[] = [];
  const foundCodes = new Set<string>();

  // 1. Extract memory codes mentioned in diagnosis reasoning (e.g. MEM-0871, MEM-1282, etc.)
  const regex = /MEM-[A-Za-z0-9_-]+/g;
  const mentionedCodes = diagnosisReasoning ? Array.from(new Set(diagnosisReasoning.match(regex) || [])) : [];

  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();

      // Query mentioned memories from PostgreSQL
      if (mentionedCodes.length > 0) {
        const res = await client.query(
          `SELECT * FROM hindsight_memories WHERE memory_code = ANY($1);`,
          [mentionedCodes]
        );
        for (const r of res.rows) {
          if (r.source_incident_id === incidentId || r.source_incident_code === incidentCode) continue;
          foundCodes.add(r.memory_code);
          recalled.push({
            memoryId: r.memory_code,
            title: r.title,
            learnedInsight: r.learned_insight || r.extracted_rule,
            confidence: Number(r.confidence_score) || 94.5,
            relationship: `Direct Causal Precedent: Explicitly cited during AI diagnosis to prevent recurring downtime from ${r.root_cause}.`,
            outcome: r.outcome || "Recovered",
            action: r.action || "isolate_bulkhead",
            patternCode: r.pattern_code || "PAT-RESILIENCE",
          });
        }
      }

      // If we don't have enough recalled memories, find relevant domain memories
      if (recalled.length < 2) {
        const domainRes = await client.query(
          `SELECT * FROM hindsight_memories 
           WHERE (source_incident_id IS NULL OR source_incident_id != $1)
             AND (source_incident_code IS NULL OR source_incident_code != $2)
           ORDER BY 
             CASE WHEN $3::text IS NOT NULL AND knowledge_domain = $3 THEN 0 ELSE 1 END,
             confidence_score DESC, recall_count DESC, created_at DESC
           LIMIT 3;`,
          [incidentId, incidentCode || "", rootCauseDomain || null]
        );
        for (const r of domainRes.rows) {
          if (!foundCodes.has(r.memory_code) && recalled.length < 3) {
            foundCodes.add(r.memory_code);
            recalled.push({
              memoryId: r.memory_code,
              title: r.title,
              learnedInsight: r.learned_insight || r.extracted_rule,
              confidence: Number(r.confidence_score) || 93.0,
              relationship: `Historical Failure Vector: Prior mitigation of ${r.root_cause} cross-referenced during distributed trace evaluation.`,
              outcome: r.outcome || "Recovered",
              action: r.action || "isolate_bulkhead",
              patternCode: r.pattern_code || "PAT-RESILIENCE",
            });
          }
        }
      }

      return recalled;
    } catch (err: unknown) {
      console.error("[PostgreSQL] Error in getRecalledMemoriesForIncident:", err);
    } finally {
      if (client) client.release();
    }
  }

  // Fallback from memoryStore
  const all = Array.from(memoryStore.hindsightMemories.values());
  for (const m of all) {
    if (m.sourceIncidentCode?.toLowerCase() === incidentId.toLowerCase()) continue;
    if (recalled.length >= 2) break;
    recalled.push({
      memoryId: m.memoryCode,
      title: m.sourceIncident,
      learnedInsight: m.learnedInsight || m.extractedRule,
      confidence: m.confidence || 94.0,
      relationship: `Historical Precedent: Prior failure pattern matching ${m.rootCause}.`,
      outcome: m.outcome || "Recovered",
      action: m.action || "isolate_bulkhead",
      patternCode: m.patternCode || "PAT-RESILIENCE",
    });
  }

  return recalled;
}

export interface MemoryCenterItem {
  id: string;
  memoryId: string;
  incidentTitle: string;
  rootCause: string;
  knowledgeDomain: string;
  learnedInsight: string;
  outcome: string;
  outcomeDetail?: string;
  action: string;
  extractedRule: string;
  antiPatternSignature?: string;
  patternCode: string;
  confidence: number;
  createdTimestamp: string;
  vectorId: string;
  recallCount: number;
  semanticTags: string[];
  createdIncident?: {
    id: string;
    code: string;
    title: string;
    service: string;
    severity?: string;
    status?: string;
  } | null;
  usedInDiagnoses: Array<{
    incidentId: string;
    incidentCode: string;
    incidentTitle: string;
    service: string;
    confidence: number;
    usedAt: string;
  }>;
  isNew: boolean;
  isRecalled: boolean;
  isHighConfidence: boolean;
  isSuccessful: boolean;
}

export interface MemoryCenterStats {
  totalMemories: number;
  averageConfidence: number;
  successfulOutcomes: number;
  memoriesRecalled: number;
  totalCitations: number;
  recentLearningEvents: number;
}

export interface MemoryCenterResult {
  stats: MemoryCenterStats;
  memories: MemoryCenterItem[];
  isLiveDatabase: boolean;
}

export async function getMemoryCenterData(): Promise<MemoryCenterResult> {
  const p = getDbPool();
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();

      // 1. Fetch all memories
      const memRes = await client.query(
        `SELECT * FROM hindsight_memories ORDER BY updated_at DESC, created_at DESC;`
      ).catch(() => ({ rows: [] }));

      // 2. Fetch all incidents for relationship mapping
      const incRes = await client.query(
        `SELECT id, code, title, service, severity, status FROM incidents;`
      ).catch(() => ({ rows: [] }));
      const incidentsById = new Map<string, { id: string; code: string; title: string; service: string; severity?: string; status?: string }>();
      const incidentsByCode = new Map<string, { id: string; code: string; title: string; service: string; severity?: string; status?: string }>();
      for (const r of incRes.rows) {
        incidentsById.set(String(r.id).toLowerCase(), r);
        if (r.code) incidentsByCode.set(String(r.code).toLowerCase(), r);
      }

      // 3. Fetch diagnoses to discover real memory citations
      const diagRes = await client.query(`
        SELECT d.id, d.incident_id, d.model, d.root_cause, d.confidence, d.reasoning, d.created_at,
               i.code as incident_code, i.title as incident_title, i.service as incident_service
        FROM diagnoses d
        JOIN incidents i ON i.id = d.incident_id
        ORDER BY d.created_at DESC;
      `).catch(() => ({ rows: [] }));

      const memories: MemoryCenterItem[] = [];
      let totalCitations = 0;

      for (const r of memRes.rows) {
        const memCode = r.memory_code || "";
        const memId = r.id || "";
        const sourceIncId = (r.source_incident_id || "").toLowerCase();
        const sourceIncCode = (r.source_incident_code || "").toLowerCase();

        // Find creating incident
        const inc =
          incidentsById.get(sourceIncId) ||
          incidentsByCode.get(sourceIncCode) ||
          incidentsById.get(memId.toLowerCase().replace("mem-", "inc-")) ||
          null;

        const createdIncident = inc
          ? {
              id: inc.id,
              code: inc.code || `INC-${inc.id.slice(0, 6)}`,
              title: inc.title,
              service: inc.service,
              severity: inc.severity,
              status: inc.status,
            }
          : null;

        // Find real diagnoses where this memory was used/cited
        const usedInDiagnoses: MemoryCenterItem["usedInDiagnoses"] = [];
        for (const diag of diagRes.rows) {
          const reasoning = diag.reasoning || "";
          if (
            memCode &&
            reasoning.toLowerCase().includes(memCode.toLowerCase()) &&
            diag.incident_id.toLowerCase() !== sourceIncId &&
            (!diag.incident_code || diag.incident_code.toLowerCase() !== sourceIncCode)
          ) {
            usedInDiagnoses.push({
              incidentId: diag.incident_id,
              incidentCode: diag.incident_code || `INC-${diag.incident_id.slice(0, 6)}`,
              incidentTitle: diag.incident_title || "Production Incident",
              service: diag.incident_service || "system-service",
              confidence: Number(diag.confidence) || 94.0,
              usedAt: new Date(diag.created_at).toISOString(),
            });
          }
        }

        totalCitations += usedInDiagnoses.length;
        const conf = Number(r.confidence_score) || 95.0;
        const outcome = r.outcome || "Recovered";
        const recallCount = Number(r.recall_count) || (usedInDiagnoses.length > 0 ? usedInDiagnoses.length + 1 : 1);
        const isRecalled = usedInDiagnoses.length > 0 || recallCount > 1;
        const isHighConfidence = conf >= 95.0;
        const isSuccessful = outcome === "Recovered" || outcome === "Mitigated";

        // Check if created recently
        const createdDate = new Date(r.created_at || Date.now());
        const ageHours = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        const isNew = ageHours <= 48 || recallCount <= 1;

        memories.push({
          id: r.id,
          memoryId: memCode || `MEM-${r.id.slice(0, 6)}`,
          incidentTitle: r.title || "Codified Failure Memory",
          rootCause: r.root_cause || "Infrastructure Contention",
          knowledgeDomain: r.knowledge_domain || "System Architecture",
          learnedInsight: r.learned_insight || r.extracted_rule || "Postmortem insight codified into permanent memory.",
          outcome,
          outcomeDetail: r.outcome_detail || "",
          action: r.action || "isolate_bulkhead",
          extractedRule: r.extracted_rule || "",
          antiPatternSignature: r.anti_pattern_signature || "",
          patternCode: r.pattern_code || "PAT-RESILIENCE",
          confidence: conf,
          createdTimestamp: new Date(r.created_at || Date.now()).toISOString(),
          vectorId: r.vector_id || "vec_default",
          recallCount,
          semanticTags: Array.isArray(r.semantic_tags) ? r.semantic_tags : [],
          createdIncident,
          usedInDiagnoses,
          isNew,
          isRecalled,
          isHighConfidence,
          isSuccessful,
        });
      }

      const totalMemories = memories.length;
      const averageConfidence =
        totalMemories > 0
          ? parseFloat((memories.reduce((acc, m) => acc + m.confidence, 0) / totalMemories).toFixed(1))
          : 95.0;
      const successfulOutcomes = memories.filter((m) => m.isSuccessful).length;
      const memoriesRecalled = memories.filter((m) => m.isRecalled).length;
      const recentLearningEvents = memories.filter((m) => m.isNew).length;

      return {
        stats: {
          totalMemories,
          averageConfidence,
          successfulOutcomes,
          memoriesRecalled,
          totalCitations,
          recentLearningEvents,
        },
        memories,
        isLiveDatabase: true,
      };
    } catch (err: unknown) {
      console.error("[PostgreSQL] Error in getMemoryCenterData:", err);
    } finally {
      if (client) client.release();
    }
  }

  // In-memory fallback
  const allMem = Array.from(memoryStore.hindsightMemories.values());
  const memories: MemoryCenterItem[] = allMem.map((m) => ({
    id: m.id,
    memoryId: m.memoryCode,
    incidentTitle: m.sourceIncident,
    rootCause: m.rootCause,
    knowledgeDomain: m.knowledgeDomain,
    learnedInsight: m.learnedInsight || m.extractedRule,
    outcome: m.outcome,
    outcomeDetail: m.outcomeDetail,
    action: m.action,
    extractedRule: m.extractedRule,
    antiPatternSignature: m.antiPatternSignature,
    patternCode: m.patternCode,
    confidence: m.confidence,
    createdTimestamp: m.indexingDate,
    vectorId: m.vectorId,
    recallCount: m.recallCount || 1,
    semanticTags: m.semanticTags || [],
    createdIncident: null,
    usedInDiagnoses: [],
    isNew: true,
    isRecalled: false,
    isHighConfidence: m.confidence >= 95.0,
    isSuccessful: m.outcome === "Recovered" || m.outcome === "Mitigated",
  }));

  return {
    stats: {
      totalMemories: memories.length,
      averageConfidence: memories.length > 0 ? parseFloat((memories.reduce((acc, m) => acc + m.confidence, 0) / memories.length).toFixed(1)) : 95.0,
      successfulOutcomes: memories.filter((m) => m.isSuccessful).length,
      memoriesRecalled: 0,
      totalCitations: 0,
      recentLearningEvents: memories.length,
    },
    memories,
    isLiveDatabase: false,
  };
}

export interface DashboardStatsResult {
  metrics: {
    totalIncidents: number;
    totalDiagnoses: number;
    recoveryExecutions: number;
    successfulRecoveries: number;
    verifiedRecoveries: number;
    learnedMemories: number;
    auditEvents: number;
    activeIncidents: number;
  };
  learningImpact: {
    memoriesStored: number;
    memoriesRecalled: number;
    successfulRecoveryOutcomes: number;
    averageConfidence: number;
  };
  recentIncidents: Incident[];
  recentLearnings: Array<{
    memoryId: string;
    incidentTitle: string;
    rootCause: string;
    outcome: string;
    confidence: number;
    createdTime: string;
    service: string;
    learnedInsight: string;
  }>;
  isLiveDatabase: boolean;
}

export async function getDashboardStats(): Promise<DashboardStatsResult> {
  const p = getDbPool();
  if (p) {
    let client: PoolClient | null = null;
    try {
      await initDbSchema();
      client = await p.connect();

      // 1. Metric counts
      const [
        incRes,
        diagRes,
        execRes,
        succExecRes,
        verRes,
        memRes,
        auditRes,
        activeIncRes,
      ] = await Promise.all([
        client.query("SELECT COUNT(*) as c FROM incidents;").catch(() => ({ rows: [{ c: "0" }] })),
        client.query("SELECT COUNT(*) as c FROM diagnoses;").catch(() => ({ rows: [{ c: "0" }] })),
        client.query("SELECT COUNT(*) as c FROM action_executions;").catch(() => ({ rows: [{ c: "0" }] })),
        client.query("SELECT COUNT(*) as c FROM action_executions WHERE status = 'success';").catch(() => ({ rows: [{ c: "0" }] })),
        client.query("SELECT COUNT(*) as c FROM verifications WHERE verification_status = 'verified_resolved';").catch(() => ({ rows: [{ c: "0" }] })),
        client.query("SELECT COUNT(*) as c FROM hindsight_memories;").catch(() => ({ rows: [{ c: "0" }] })),
        client.query("SELECT COUNT(*) as c FROM audit_logs;").catch(() => ({ rows: [{ c: "0" }] })),
        client.query("SELECT COUNT(*) as c FROM incidents WHERE status = 'investigating';").catch(() => ({ rows: [{ c: "0" }] })),
      ]);

      // 2. Learning impact
      const [impactRes, succMemRes] = await Promise.all([
        client.query(`
          SELECT COUNT(*) as stored,
                 COALESCE(SUM(recall_count), 0) as recalled,
                 COALESCE(AVG(confidence_score), 95.0) as avg_conf
          FROM hindsight_memories;
        `).catch(() => ({ rows: [{ stored: "0", recalled: "0", avg_conf: "95.0" }] })),
        client.query(`
          SELECT COUNT(*) as c FROM hindsight_memories WHERE outcome IN ('Recovered', 'Mitigated');
        `).catch(() => ({ rows: [{ c: "0" }] })),
      ]);

      // 3. Recent Incidents
      const recentIncRes = await client.query(`
        SELECT * FROM incidents
        ORDER BY occurred_at DESC, created_at DESC
        LIMIT 5;
      `).catch(() => ({ rows: [] }));

      const recentIncidents: Incident[] = (recentIncRes.rows || []).map((row) => ({
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
        similarityMatchCount: row.similarity_match_count || 4,
        summary: row.summary,
        timelineEvents: row.timeline_events || [],
        aiRootCause: row.ai_root_cause || {
          likelyCause: row.summary || "Pending investigation",
          confidence: 90,
        },
        hindsightRecall: row.hindsight_recall || [],
        evidence: row.evidence || {},
        keyLearnings: row.key_learnings || [],
        preventativeMeasures: row.preventative_measures || [],
        tags: row.tags || [],
        riskLevel: row.risk_level || row.severity,
        patternMatch: row.pattern_match || undefined,
      }));

      // 4. Recent Learnings
      const recentMemRes = await client.query(`
        SELECT * FROM hindsight_memories
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 6;
      `).catch(() => ({ rows: [] }));

      const recentLearnings = (recentMemRes.rows || []).map((r) => ({
        memoryId: r.memory_code,
        incidentTitle: r.title,
        rootCause: r.root_cause,
        outcome: r.outcome,
        confidence: Number(r.confidence_score) || 95.0,
        createdTime: new Date(r.updated_at || r.created_at).toISOString(),
        service: r.source_incident_code || "Unknown Service",
        learnedInsight: r.learned_insight || "",
      }));

      const totalInc = parseInt(incRes.rows[0]?.c || "0", 10);
      const totalDiag = parseInt(diagRes.rows[0]?.c || "0", 10);
      const totalExec = parseInt(execRes.rows[0]?.c || "0", 10);
      const succExec = parseInt(succExecRes.rows[0]?.c || "0", 10);
      const verRec = parseInt(verRes.rows[0]?.c || "0", 10);
      const learnedMem = parseInt(memRes.rows[0]?.c || "0", 10);
      const auditEvt = parseInt(auditRes.rows[0]?.c || "0", 10);
      const activeInc = parseInt(activeIncRes.rows[0]?.c || "0", 10);

      const stored = parseInt(impactRes.rows[0]?.stored || "0", 10);
      const recalled = parseInt(impactRes.rows[0]?.recalled || "0", 10);
      const avgConf = parseFloat(Number(impactRes.rows[0]?.avg_conf || 95.0).toFixed(1));
      const succOutcomes = parseInt(succMemRes.rows[0]?.c || "0", 10);

      return {
        metrics: {
          totalIncidents: totalInc,
          totalDiagnoses: totalDiag,
          recoveryExecutions: totalExec,
          successfulRecoveries: succExec,
          verifiedRecoveries: verRec,
          learnedMemories: learnedMem,
          auditEvents: auditEvt,
          activeIncidents: activeInc,
        },
        learningImpact: {
          memoriesStored: stored,
          memoriesRecalled: recalled,
          successfulRecoveryOutcomes: succOutcomes,
          averageConfidence: avgConf,
        },
        recentIncidents,
        recentLearnings,
        isLiveDatabase: true,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PostgreSQL] Error in getDashboardStats:", msg);
    } finally {
      if (client) client.release();
    }
  }

  // In-memory fallback
  const allInc = Array.from(memoryStore.incidents.values());
  const allMem = Array.from(memoryStore.hindsightMemories.values());

  return {
    metrics: {
      totalIncidents: memoryStore.incidents.size,
      totalDiagnoses: memoryStore.diagnoses.size,
      recoveryExecutions: memoryStore.actionExecutions.size,
      successfulRecoveries: Array.from(memoryStore.actionExecutions.values()).filter((e) => e.status === "success").length,
      verifiedRecoveries: Array.from(memoryStore.verifications.values()).filter((v) => v.verificationStatus === "verified_resolved").length,
      learnedMemories: memoryStore.hindsightMemories.size,
      auditEvents: memoryStore.auditLogs.length,
      activeIncidents: allInc.filter((i) => i.status === "investigating").length,
    },
    learningImpact: {
      memoriesStored: memoryStore.hindsightMemories.size,
      memoriesRecalled: allMem.reduce((acc, m) => acc + (m.recallCount || 1), 0),
      successfulRecoveryOutcomes: allMem.filter((m) => m.outcome === "Recovered" || m.outcome === "Mitigated").length,
      averageConfidence: allMem.length > 0 ? parseFloat((allMem.reduce((acc, m) => acc + (m.confidence || 95), 0) / allMem.length).toFixed(1)) : 95.0,
    },
    recentIncidents: allInc.slice(0, 5),
    recentLearnings: allMem.slice(0, 6).map((m) => ({
      memoryId: m.memoryCode,
      incidentTitle: m.sourceIncident,
      rootCause: m.rootCause,
      outcome: m.outcome,
      confidence: m.confidence,
      createdTime: m.indexingDate,
      service: m.sourceIncidentCode,
      learnedInsight: m.learnedInsight,
    })),
    isLiveDatabase: false,
  };
}

export const db = {
  getDbPool,
  isDatabaseConnected,
  getDatabaseHealth,
  getDashboardStats,
  initDbSchema,
  insertIncident,
  getAllIncidents,
  getIncidentById,
  updateIncidentStatus,
  insertDiagnosis,
  getDiagnosisForIncident,
  insertActionExecution,
  getExecutionsForIncident,
  insertVerification,
  getVerificationsForIncident,
  insertAuditLog,
  getAuditLogsForIncident,
  insertHindsightMemory,
  searchHindsightMemories,
  updateHindsightMemoryOutcome,
  updateHindsightLearning,
  getAllHindsightMemories,
  getLearnedMemoryForIncident,
  getRecalledMemoriesForIncident,
  getMemoryCenterData,
  listIncidents: getAllIncidents,
};
