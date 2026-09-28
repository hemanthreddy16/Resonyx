-- ==============================================================================
-- RESONYX PRODUCTION POSTGRESQL SCHEMA & MIGRATION
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(64) DEFAULT 'sre_engineer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INCIDENTS TABLE
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

ALTER TABLE incidents ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '{}';

-- Ensure backwards compatibility if columns were previously created as JSONB
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'tags' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE incidents ALTER COLUMN tags TYPE TEXT USING tags::TEXT;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'key_learnings' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE incidents ALTER COLUMN key_learnings TYPE TEXT USING key_learnings::TEXT;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'preventative_measures' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE incidents ALTER COLUMN preventative_measures TYPE TEXT USING preventative_measures::TEXT;
  END IF;
END $$;

-- 3. DIAGNOSES TABLE (OpenRouter Causal Analyses)
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

-- 4. RECOVERY ACTIONS (Human Safety Whitelist)
CREATE TABLE IF NOT EXISTS recovery_actions (
  id VARCHAR(64) PRIMARY KEY,
  action_type VARCHAR(64) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  risk_tier VARCHAR(32) DEFAULT 'low',
  is_whitelisted BOOLEAN DEFAULT TRUE,
  requires_human_approval BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACTION EXECUTIONS (Controlled Routine Runs)
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

-- 6. VERIFICATIONS (Post-Recovery Telemetry Probes)
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

-- 7. AUDIT LOGS (Immutable Compliance Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE SET NULL,
  event_type VARCHAR(64) NOT NULL,
  actor VARCHAR(128) NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. HINDSIGHT MEMORIES (Persistent Long-Term Memory Vectors)
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

-- INDEXES FOR PERFORMANCE AND LOOKUPS
CREATE INDEX IF NOT EXISTS idx_incidents_code ON incidents(code);
CREATE INDEX IF NOT EXISTS idx_incidents_occurred_at ON incidents(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_service ON incidents(service);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);

CREATE INDEX IF NOT EXISTS idx_diagnoses_incident_id ON diagnoses(incident_id);
CREATE INDEX IF NOT EXISTS idx_action_executions_incident_id ON action_executions(incident_id);
CREATE INDEX IF NOT EXISTS idx_verifications_incident_id ON verifications(incident_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_incident_id ON audit_logs(incident_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hindsight_memories_code ON hindsight_memories(memory_code);
CREATE INDEX IF NOT EXISTS idx_hindsight_memories_domain ON hindsight_memories(knowledge_domain);
CREATE INDEX IF NOT EXISTS idx_hindsight_memories_pattern ON hindsight_memories(pattern_code);

-- SEED THE 9 HUMAN-SAFETY WHITELISTED RECOVERY ACTIONS
INSERT INTO recovery_actions (id, action_type, description, risk_tier, is_whitelisted, requires_human_approval)
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
ON CONFLICT (action_type) DO UPDATE SET
  description = EXCLUDED.description,
  risk_tier = EXCLUDED.risk_tier,
  is_whitelisted = EXCLUDED.is_whitelisted;
