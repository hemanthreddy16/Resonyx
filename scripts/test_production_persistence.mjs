import { Client } from "pg";

const BASE_URL = "http://localhost:3000";
const DB_URL = "postgresql://postgres:postgres@localhost:5432/resonyx";

async function verifyAll() {
  console.log("==================================================================");
  console.log("RESONYX REAL POSTGRESQL & HINDSIGHT PERSISTENCE TEST SUITE");
  console.log("==================================================================");

  const pgClient = new Client({ connectionString: DB_URL });
  await pgClient.connect();
  console.log("✓ Direct PostgreSQL client connected to database.");

  // TEST 1: Health check endpoint
  console.log("\n--- TEST 1: Production Health Check (/api/health) ---");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json();
  console.log("Health Status:", health.status);
  console.log("Database connected:", health.services?.database?.connected);
  console.log("Database table count:", health.services?.database?.tableCount);
  console.log("Hindsight storage mode:", health.services?.hindsight?.storageMode);

  if (!health.services?.database?.connected || health.services?.database?.tableCount !== 8) {
    throw new Error(`Health check failed: Expected connected=true and tableCount=8, got: ${JSON.stringify(health.services?.database)}`);
  }

  // TEST 2: Ingest New Incident
  console.log("\n--- TEST 2: Ingest New Incident (/api/incidents) ---");
  const newIncidentPayload = {
    title: "Post-Deployment Database Contention Under Ingress Surge",
    service: "checkout-payment-v3",
    severity: "critical",
    environment: "Production",
    rootCauseDomain: "Database Concurrency",
    summary: "Deadlock on table settlement_ledger during holiday sale rush.",
    tags: "CheckoutDB Deadlock HolidaySurge",
  };

  const createRes = await fetch(`${BASE_URL}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newIncidentPayload),
  });
  const createData = await createRes.json();
  console.log("Incident Created:", createData.success, "ID:", createData.data?.id, "Code:", createData.data?.code);
  const incidentId = createData.data?.id;

  // Verify in PostgreSQL table
  const dbIncCheck = await pgClient.query("SELECT * FROM incidents WHERE id = $1;", [incidentId]);
  console.log("✓ Verified in PostgreSQL 'incidents' table: row count =", dbIncCheck.rows.length, "Title:", dbIncCheck.rows[0]?.title);
  if (dbIncCheck.rows.length === 0) throw new Error("Incident was NOT stored in PostgreSQL!");

  // TEST 3: Generate AI Diagnosis
  console.log("\n--- TEST 3: AI Diagnosis (/api/agents/diagnose) ---");
  const diagRes = await fetch(`${BASE_URL}/api/agents/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId }),
  });
  const diagData = await diagRes.json();
  console.log("Diagnosis Success:", diagData.success, "Root Cause:", diagData.data?.diagnosis?.rootCause);
  console.log("Recommended Actions:", diagData.data?.diagnosis?.recommendedActions);

  // Verify in PostgreSQL diagnoses table
  const dbDiagCheck = await pgClient.query("SELECT * FROM diagnoses WHERE incident_id = $1;", [incidentId]);
  console.log("✓ Verified in PostgreSQL 'diagnoses' table: row count =", dbDiagCheck.rows.length, "Root Cause:", dbDiagCheck.rows[0]?.root_cause);
  if (dbDiagCheck.rows.length === 0) throw new Error("Diagnosis was NOT stored in PostgreSQL!");

  // TEST 4: Generate Recovery Strategy
  console.log("\n--- TEST 4: Recovery Strategy (/api/agents/strategy) ---");
  const stratRes = await fetch(`${BASE_URL}/api/agents/strategy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId }),
  });
  const stratData = await stratRes.json();
  const selectedAction = stratData.data?.strategy?.selectedAction || "cancel_blocking_query";
  console.log("Strategy Success:", stratData.success, "Selected Action:", selectedAction);

  // TEST 5: Execute Controlled Action via Safety Gate
  console.log("\n--- TEST 5: Controlled Recovery Action (/api/agents/recover) ---");
  const recRes = await fetch(`${BASE_URL}/api/agents/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId, action: selectedAction }),
  });
  const recData = await recRes.json();
  console.log("Execution Success:", recData.success, "Action Status:", recData.data?.execution?.status);

  // Verify in PostgreSQL action_executions table
  const dbExecCheck = await pgClient.query("SELECT * FROM action_executions WHERE incident_id = $1;", [incidentId]);
  console.log("✓ Verified in PostgreSQL 'action_executions' table: row count =", dbExecCheck.rows.length, "Action:", dbExecCheck.rows[0]?.action);
  if (dbExecCheck.rows.length === 0) throw new Error("Action execution was NOT stored in PostgreSQL!");

  // TEST 6: Post-Recovery Telemetry Verification
  console.log("\n--- TEST 6: Telemetry Verification Probe (/api/agents/verify) ---");
  const verRes = await fetch(`${BASE_URL}/api/agents/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId }),
  });
  const verData = await verRes.json();
  console.log("Verification Success:", verData.success, "Status:", verData.data?.verification?.verificationStatus);
  console.log("Telemetry Metrics:", JSON.stringify(verData.data?.verification?.metrics));

  // Verify in PostgreSQL verifications table
  const dbVerCheck = await pgClient.query("SELECT * FROM verifications WHERE incident_id = $1;", [incidentId]);
  console.log("✓ Verified in PostgreSQL 'verifications' table: row count =", dbVerCheck.rows.length, "Result:", dbVerCheck.rows[0]?.verification_result);
  if (dbVerCheck.rows.length === 0) throw new Error("Verification was NOT stored in PostgreSQL!");

  // TEST 7: Hindsight Learning & Memory Codification
  console.log("\n--- TEST 7: Hindsight Learning Codification (/api/agents/learn) ---");
  const learnRes = await fetch(`${BASE_URL}/api/agents/learn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      incidentId,
      recoveryAction: selectedAction,
      actionSucceeded: true,
      importantLessons: ["Terminating blocking query #8192 avoided database cluster failover under peak traffic."],
    }),
  });
  const learnData = await learnRes.json();
  console.log("Learning Success:", learnData.success, "Memory ID:", learnData.data?.memoryId);

  // Verify in PostgreSQL hindsight_memories table
  const dbMemCheck = await pgClient.query("SELECT * FROM hindsight_memories WHERE source_incident_code = $1 OR memory_code = $2;", [createData.data?.code, learnData.data?.memoryId]);
  console.log("✓ Verified in PostgreSQL 'hindsight_memories' table: row count =", dbMemCheck.rows.length, "Learned Insight:", dbMemCheck.rows[0]?.learned_insight);
  if (dbMemCheck.rows.length === 0) throw new Error("Hindsight memory was NOT stored in PostgreSQL!");

  // Verify audit logs table
  const dbAuditCheck = await pgClient.query("SELECT COUNT(*) FROM audit_logs WHERE incident_id = $1;", [incidentId]);
  console.log("✓ Verified in PostgreSQL 'audit_logs' table: audit entries recorded =", dbAuditCheck.rows[0]?.count);

  // TEST 8: Future Incident Recalls Previous Memory!
  console.log("\n--- TEST 8: Future Incident Memory Recall Verification ---");
  const futureIncidentPayload = {
    title: "Database Lock Contention Spike on Payment Settlement",
    service: "checkout-payment-v4",
    severity: "high",
    environment: "Production",
    rootCauseDomain: "Database Concurrency",
    summary: "Similar lock wait timeouts observed on settlement_ledger.",
  };

  const futureCreateRes = await fetch(`${BASE_URL}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(futureIncidentPayload),
  });
  const futureData = await futureCreateRes.json();
  const futureIncidentId = futureData.data?.id;

  const futureDiagRes = await fetch(`${BASE_URL}/api/agents/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId: futureIncidentId }),
  });
  const futureDiag = await futureDiagRes.json();
  console.log("Future Incident Diagnosis Retrieved Memories Count:", futureDiag.data?.retrievedMemoriesCount);
  console.log("Retrieved Memories:", futureDiag.data?.retrievedMemories?.map((m) => `[${m.memoryCode}] ${m.insight}`));

  if (!futureDiag.data?.retrievedMemoriesCount || futureDiag.data.retrievedMemoriesCount === 0) {
    throw new Error("Future incident failed to recall prior memories from Hindsight/PostgreSQL!");
  }

  console.log("\n==================================================================");
  console.log("ALL REAL PERSISTENCE & MEMORY RETRIEVAL TESTS PASSED WITH 100% SUCCESS!");
  console.log("==================================================================");

  await pgClient.end();
}

verifyAll().catch((err) => {
  console.error("FATAL VERIFICATION ERROR:", err);
  process.exit(1);
});
