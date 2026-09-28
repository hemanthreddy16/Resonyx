/**
 * Resonyx Real Production Knowledge Center Verification
 * Tests the /api/memories endpoint and /memory page against real PostgreSQL database.
 */

import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/resonyx';
const BASE_URL = process.env.TEST_URL || 'http://localhost:3005';

async function main() {
  console.log('===============================================================');
  console.log('   RESONYX REAL MEMORY / KNOWLEDGE CENTER VERIFICATION        ');
  console.log('===============================================================');
  console.log(`[1] Verifying direct PostgreSQL hindsight_memories table...`);
  console.log(`    Connecting to: ${DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);

  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const memoryCountResult = await pool.query('SELECT COUNT(*) AS count FROM hindsight_memories');
    const memoryCount = parseInt(memoryCountResult.rows[0].count, 10);
    console.log(`    PostgreSQL total hindsight_memories: ${memoryCount}`);

    if (memoryCount === 0) {
      console.warn('    WARNING: hindsight_memories table is empty! Run seed or demo first.');
    } else {
      const sampleMemories = await pool.query(`
        SELECT id, memory_code, source_incident_id, knowledge_domain, confidence_score, outcome, vector_id, created_at
        FROM hindsight_memories
        ORDER BY created_at DESC
        LIMIT 3
      `);
      console.log(`    Sample real memories in DB:`);
      sampleMemories.rows.forEach(m => {
        console.log(`      - [${m.memory_code}] Source Incident: ${m.source_incident_id} | Domain: ${m.knowledge_domain} | Confidence: ${m.confidence_score} | Outcome: ${m.outcome} | Vector: ${m.vector_id}`);
      });
    }

    console.log(`\n[2] Testing GET ${BASE_URL}/api/memories...`);
    const res = await fetch(`${BASE_URL}/api/memories`);
    if (!res.ok) {
      throw new Error(`API returned HTTP ${res.status}: ${await res.text()}`);
    }
    const json = await res.json();

    if (!json.success || !json.data) {
      throw new Error(`API returned failure or missing data: ${JSON.stringify(json)}`);
    }

    const payload = json.data;

    console.log('    ✓ API Response OK');
    console.log(`    Stats:`);
    console.log(`      - Total Memories:       ${payload.stats.totalMemories}`);
    console.log(`      - Average Confidence:   ${payload.stats.averageConfidence}%`);
    console.log(`      - Successful Outcomes:  ${payload.stats.successfulOutcomes}`);
    console.log(`      - Memories Recalled:    ${payload.stats.memoriesRecalled}`);
    console.log(`      - Total Citations:      ${payload.stats.totalCitations}`);
    console.log(`      - Recent Events:        ${payload.stats.recentLearningEvents}`);
    console.log(`      - Live Database:        ${payload.isLiveDatabase}`);

    console.log(`\n[3] Validating memory items payload structure (count: ${payload.memories.length})...`);
    if (payload.memories.length > 0) {
      const first = payload.memories[0];
      const requiredFields = [
        'id', 'memoryId', 'incidentTitle', 'rootCause',
        'learnedInsight', 'outcome', 'confidence', 'vectorId',
        'createdTimestamp', 'usedInDiagnoses'
      ];

      for (const field of requiredFields) {
        if (first[field] === undefined) {
          throw new Error(`Missing required field '${field}' on memory item`);
        }
      }
      console.log(`    ✓ First item contains all required fields:`);
      console.log(`      ID:                ${first.id}`);
      console.log(`      Memory ID:         ${first.memoryId}`);
      console.log(`      Title:             ${first.incidentTitle}`);
      console.log(`      Root Cause:        ${first.rootCause}`);
      console.log(`      Insight:           ${first.learnedInsight}`);
      console.log(`      Outcome:           ${first.outcome}`);
      console.log(`      Confidence:        ${first.confidence}%`);
      console.log(`      Vector ID:         ${first.vectorId}`);
      console.log(`      Created Incident:  ${first.createdIncident ? `${first.createdIncident.code} (${first.createdIncident.title})` : 'N/A'}`);
      console.log(`      Used in Diagnoses: ${first.usedInDiagnoses.length} incident(s)`);

      // Check for recalled memories
      const recalledMemories = payload.memories.filter(m => m.usedInDiagnoses && m.usedInDiagnoses.length > 0);
      console.log(`\n[4] Validating Memory -> Diagnosis Citation link...`);
      console.log(`    Memories with real diagnosis citations: ${recalledMemories.length}`);
      recalledMemories.forEach(rm => {
        console.log(`    ✓ Memory [${rm.memoryId}] cited in ${rm.usedInDiagnoses.length} diagnosis(es):`);
        rm.usedInDiagnoses.forEach(diag => {
          console.log(`       - Incident [${diag.incidentCode}] "${diag.incidentTitle}" (${diag.service}): Confidence ${diag.confidence}% at ${diag.usedAt}`);
        });
      });
    }

    console.log(`\n[5] Testing GET ${BASE_URL}/memory UI page...`);
    const pageRes = await fetch(`${BASE_URL}/memory`);
    if (!pageRes.ok) {
      throw new Error(`Page returned HTTP ${pageRes.status}`);
    }
    const html = await pageRes.text();
    if (!html.includes('Knowledge Center') && !html.includes('Hindsight Memory')) {
      throw new Error('Page HTML does not contain expected Knowledge Center content');
    }
    console.log(`    ✓ Page rendered HTTP 200 OK (${html.length} bytes)`);

    console.log('\n===============================================================');
    console.log('   ALL MEMORY / KNOWLEDGE CENTER VERIFICATIONS PASSED!       ');
    console.log('===============================================================');
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('\n❌ Verification FAILED:', err);
  process.exit(1);
});
