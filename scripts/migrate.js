#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * ==============================================================================
 * RESONYX DATABASE MIGRATION SCRIPT
 * ==============================================================================
 *
 * Runs idempotent schema migrations against the PostgreSQL database defined by
 * DATABASE_URL. Can be executed locally or as part of Render deployment.
 *
 * Usage:
 *   node scripts/migrate.js
 *   npm run db:migrate
 * ==============================================================================
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// Simple .env / .env.local loader for local CLI execution
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  try {
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"') || val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch (err) {
    console.warn(`[Migrate] Warning loading ${filePath}:`, err.message);
  }
}

// Load env files if running outside container with pre-set env
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : "";

  console.log("=================================================");
  console.log("RESONYX POSTGRESQL MIGRATION RUNNER");
  console.log("=================================================");
  console.log("Timestamp:", new Date().toISOString());

  if (!dbUrl || dbUrl.trim() === "") {
    if (process.env.NODE_ENV === "production") {
      console.error("FATAL: DATABASE_URL environment variable is missing in production!");
      process.exit(1);
    } else {
      console.warn("WARNING: DATABASE_URL is not set. Skipping PostgreSQL migration for local demo/memory mode.");
      console.log("To run migrations against a database, set DATABASE_URL in your .env or environment.");
      process.exit(0);
    }
  }

  // Mask credentials for safe logging
  const maskedUrl = dbUrl.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
  console.log(`Target Database: ${maskedUrl}`);

  const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
  const client = new Client({
    connectionString: dbUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log("Connecting to PostgreSQL...");
    await client.connect();
    console.log("✓ Connected successfully.");

    // Read schema DDL
    const schemaPath = path.join(__dirname, "..", "src", "db", "schema.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const ddl = fs.readFileSync(schemaPath, "utf8");
    console.log("Executing schema DDL (tables, constraints, indexes, safety actions)...");

    await client.query("BEGIN;");
    await client.query(ddl);
    await client.query("COMMIT;");
    console.log("✓ Schema DDL executed successfully.");

    // Check existing incident count; seed baseline if empty
    const countRes = await client.query("SELECT COUNT(*) FROM incidents;");
    const incidentCount = parseInt(countRes.rows[0].count, 10);
    console.log(`Current incident records in database: ${incidentCount}`);

    if (incidentCount === 0) {
      console.log("Database has 0 incidents. Seeding production baseline operational incidents...");
      
      const seedIncidents = [
        {
          id: "inc-1047",
          code: "INC-1047",
          title: "Payment API Performance Degradation",
          service: "payment-gateway-proxy",
          environment: "Production",
          severity: "high",
          status: "in-progress",
          detected_time: "08:42 AM",
          root_cause_domain: "Database Concurrency",
          summary: "Payment authorization latencies surged to 4.8s following v2.14 deployment. Database connection pool saturated with blocking lock contention on settlement_ledger.",
          tags: "PaymentAPI PostgreSQL HighLatency P1",
          pattern_match: { patternCode: "PAT-DB-LOCK-01", name: "Post-Deployment Database Contention Under Ingress Concurrency", confidence: 94 },
          telemetry_metrics: { p99LatencyMs: 4800, errorRatePercent: 8.4, cpuUtilizationPercent: 91, activeConnections: 198 }
        },
        {
          id: "inc-1032",
          code: "INC-1032",
          title: "Deployment Health Warning",
          service: "checkout-cart-service (v2.14.2)",
          environment: "Canary",
          severity: "medium",
          status: "mitigated",
          detected_time: "07:10 AM",
          root_cause_domain: "Memory Leak",
          summary: "Canary PR #4892 introduced unbounded session payload serialization matching INC-0852. Resonyx Pre-Deploy Risk Radar tripped at 2% rollout and halted rollout with zero outage.",
          tags: "CanaryGated PreventionSuccess MemoryLeak ZeroDowntime",
          pattern_match: { patternCode: "PAT-MEM-SERIALIZE-03", name: "Unbounded Payload Cache Stampede & Hot-Shard Eviction", confidence: 91 },
          telemetry_metrics: { p99LatencyMs: 240, errorRatePercent: 0.1, cpuUtilizationPercent: 42, activeConnections: 48 }
        },
        {
          id: "inc-1028",
          code: "INC-1028",
          title: "API Timeout Spike",
          service: "order-fulfillment-router",
          environment: "Production",
          severity: "high",
          status: "resolved",
          detected_time: "06:02 AM",
          root_cause_domain: "Cascading Timeout",
          summary: "Shipping partner API micro-stalls triggered synchronized client retries across order fulfillment workers, causing HTTP connection pool exhaustion.",
          tags: "Fulfillment RetryStorm P2 CascadingTimeout Resolved",
          pattern_match: { patternCode: "PAT-RETRY-STORM-04", name: "Unjittered Retry Amplification on Transient Service Degradation", confidence: 93 },
          telemetry_metrics: { p99LatencyMs: 180, errorRatePercent: 0.05, cpuUtilizationPercent: 38, activeConnections: 52 }
        },
        {
          id: "inc-0871",
          code: "INC-0871",
          title: "Checkout Threadpool Saturation under Auth Latency",
          service: "checkout-orchestrator",
          environment: "Production",
          severity: "critical",
          status: "learning-indexed",
          detected_time: "May 14, 2026",
          root_cause_domain: "Cascading Timeout",
          summary: "Historical incident where un-hedged downstream RPC latency starved checkout ingress worker threads, leading to cascading cluster restarts.",
          tags: "Historical ThreadStarvation P1 LearningIndexed",
          pattern_match: { patternCode: "PAT-CASCADING-QUEUE-01", name: "Synchronous Downstream Bottleneck with Unbounded Thread Saturation", confidence: 98 },
          telemetry_metrics: { p99LatencyMs: 120, errorRatePercent: 0.0, cpuUtilizationPercent: 28, activeConnections: 35 }
        }
      ];

      for (const inc of seedIncidents) {
        await client.query(
          `INSERT INTO incidents (
            id, code, title, service, environment, severity, status,
            detected_time, root_cause_domain, summary, tags, pattern_match, telemetry_metrics
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO NOTHING;`,
          [
            inc.id,
            inc.code,
            inc.title,
            inc.service,
            inc.environment,
            inc.severity,
            inc.status,
            inc.detected_time,
            inc.root_cause_domain,
            inc.summary,
            inc.tags,
            JSON.stringify(inc.pattern_match),
            JSON.stringify(inc.telemetry_metrics)
          ]
        );
      }
      console.log(`✓ Seeded ${seedIncidents.length} baseline operational incidents.`);
    }

    // Seed baseline Hindsight memories if empty
    const memCountRes = await client.query("SELECT COUNT(*) FROM hindsight_memories;");
    const memCount = parseInt(memCountRes.rows[0].count, 10);
    console.log(`Current hindsight memory records in database: ${memCount}`);

    if (memCount === 0) {
      console.log("Seeding foundational Hindsight organizational memory vectors...");
      const baselineMemories = [
        {
          id: "mem-0871",
          memory_code: "MEM-0871",
          source_incident_code: "INC-0871",
          title: "Post-Deployment Database Contention Memory",
          vector_id: "vec_0x789f2a4",
          knowledge_domain: "Database Concurrency",
          root_cause: "ACCESS EXCLUSIVE table lock on settlement_ledger during peak ingress.",
          decision: "Prohibited blind service restarts during active lock wait queues.",
          action: "cancel_blocking_query",
          outcome: "Recovered",
          outcome_detail: "Canceled blocking pid 48192 and rate-shed 25% traffic; latency normalized in 42s.",
          learned_insight: "Restarting stateless pods during database lock contention causes reconnection storms. Always terminate blocking transaction lock holders first.",
          extracted_rule: "CRITICAL: Under database lock contention, isolate bulkheads and cancel blocking query. DO NOT restart containers.",
          anti_pattern_signature: "Deployment + Foreign Key Lock + Service Restart",
          pattern_code: "PAT-DB-LOCK-01",
          confidence_score: 96.5,
          semantic_tags: ["database", "lock-contention", "rollback", "bulkhead"]
        },
        {
          id: "mem-0852",
          memory_code: "MEM-0852",
          source_incident_code: "INC-0852",
          title: "Session Object Payload Serialization Cache Stampede",
          vector_id: "vec_0x442c8d5",
          knowledge_domain: "Memory Leak",
          root_cause: "Unbounded session payload pushed Redis into aggressive LRU eviction.",
          decision: "Imposed 8KB cache budget and enforced automated canary blast radius guardrails.",
          action: "rollback_deployment",
          outcome: "Prevented",
          outcome_detail: "Automated canary halted rollout at 2% fleet exposure before production failure.",
          learned_insight: "Shared cache tiers require strict payload sizing contracts in CI/CD pipeline.",
          extracted_rule: "Enforce payload compression and 8KB max object limits in shared cache tiers.",
          anti_pattern_signature: "Payload Expansion + Cache LRU Eviction",
          pattern_code: "PAT-MEM-SERIALIZE-03",
          confidence_score: 93.8,
          semantic_tags: ["redis", "cache-stampede", "canary", "guardrail"]
        }
      ];

      for (const m of baselineMemories) {
        await client.query(
          `INSERT INTO hindsight_memories (
            id, memory_code, source_incident_code, title, vector_id,
            knowledge_domain, root_cause, decision, action, outcome,
            outcome_detail, learned_insight, extracted_rule, anti_pattern_signature,
            pattern_code, confidence_score, semantic_tags
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (memory_code) DO NOTHING;`,
          [
            m.id,
            m.memory_code,
            m.source_incident_code,
            m.title,
            m.vector_id,
            m.knowledge_domain,
            m.root_cause,
            m.decision,
            m.action,
            m.outcome,
            m.outcome_detail,
            m.learned_insight,
            m.extracted_rule,
            m.anti_pattern_signature,
            m.pattern_code,
            m.confidence_score,
            JSON.stringify(m.semantic_tags)
          ]
        );
      }
      console.log(`✓ Seeded ${baselineMemories.length} baseline Hindsight memory records.`);
    }

    // Verify all relations
    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("\n=================================================");
    console.log(`MIGRATION COMPLETE! (${tablesRes.rows.length} Relations in public schema)`);
    console.log("=================================================");
    for (const row of tablesRes.rows) {
      const countRes = await client.query(`SELECT COUNT(*) FROM "${row.table_name}";`).catch(() => ({ rows: [{ count: "?" }] }));
      console.log(` - ${row.table_name.padEnd(24)} : ${countRes.rows[0].count} rows`);
    }
    console.log("=================================================\n");

  } catch (err) {
    console.error("FATAL: Database migration failed:", err);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

runMigration();
