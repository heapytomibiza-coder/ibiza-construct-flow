-- Create ENUMs for question packs
CREATE TYPE pack_status AS ENUM ('draft', 'approved', 'retired');
CREATE TYPE pack_source AS ENUM ('manual', 'ai', 'hybrid');

-- Main question packs table (versioned, immutable when approved)
CREATE TABLE IF NOT EXISTS question_packs (
  pack_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  micro_slug TEXT NOT NULL,
  version INT NOT NULL,
  status pack_status NOT NULL DEFAULT 'draft',
  source pack_source NOT NULL,
  prompt_hash TEXT NULL,
  content JSONB NOT NULL,
  created_by UUID NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ NULL,
  approved_by UUID NULL REFERENCES profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  ab_test_id TEXT NULL
);

-- Unique constraints
CREATE UNIQUE INDEX uq_pack_slug_version ON question_packs (micro_slug, version);
CREATE UNIQUE INDEX uq_pack_active_per_slug ON question_packs (micro_slug, is_active)
  WHERE (is_active = TRUE AND status = 'approved');

-- Audit log (immutable append-only)
CREATE TABLE IF NOT EXISTS question_pack_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES question_packs(pack_id),
  actor UUID NULL REFERENCES profiles(id),
  event TEXT NOT NULL,
  meta JSONB,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Job snapshot for historic fidelity
CREATE TABLE IF NOT EXISTS job_question_snapshot (
  job_id UUID PRIMARY KEY REFERENCES jobs(id),
  pack_id UUID NOT NULL REFERENCES question_packs(pack_id),
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance tracking tables
CREATE TABLE IF NOT EXISTS question_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  pack_id UUID NOT NULL REFERENCES question_packs(pack_id),
  question_key TEXT NOT NULL,
  views INT NOT NULL DEFAULT 0,
  answers INT NOT NULL DEFAULT 0,
  dropoffs INT NOT NULL DEFAULT 0,
  avg_time_ms INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pack_id, question_key)
);

CREATE TABLE IF NOT EXISTS pack_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  pack_id UUID NOT NULL REFERENCES question_packs(pack_id),
  completion_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
  median_duration_s INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pack_id)
);

-- Add metadata columns to services_micro
ALTER TABLE services_micro
  ADD COLUMN IF NOT EXISTS question_source TEXT DEFAULT 'ai',
  ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS ibiza_specific BOOLEAN DEFAULT FALSE;

-- Immutability trigger: prevent editing approved pack content
CREATE OR REPLACE FUNCTION prevent_approved_mutation()
RETURNS trigger AS $$
BEGIN
  IF (OLD.status = 'approved' AND (
    OLD.content IS DISTINCT FROM NEW.content OR
    OLD.source IS DISTINCT FROM NEW.source OR
    OLD.prompt_hash IS DISTINCT FROM NEW.prompt_hash
  )) THEN
    RAISE EXCEPTION 'Approved packs are immutable. Create a new version instead.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lock_approved
BEFORE UPDATE ON question_packs
FOR EACH ROW EXECUTE FUNCTION prevent_approved_mutation();

-- Activation guard: only approved packs can be active
CREATE OR REPLACE FUNCTION validate_activation()
RETURNS trigger AS $$
BEGIN
  IF (NEW.is_active = TRUE AND NEW.status != 'approved') THEN
    RAISE EXCEPTION 'Only approved packs can be active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_activation
BEFORE INSERT OR UPDATE ON question_packs
FOR EACH ROW EXECUTE FUNCTION validate_activation();

-- Auto-audit on pack changes
CREATE OR REPLACE FUNCTION audit_pack_changes()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO question_pack_audit (pack_id, actor, event, meta)
    VALUES (NEW.pack_id, NEW.created_by, 'created', jsonb_build_object('status', NEW.status, 'source', NEW.source));
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.status != NEW.status) THEN
      INSERT INTO question_pack_audit (pack_id, actor, event, meta)
      VALUES (NEW.pack_id, auth.uid(), 'status_changed', jsonb_build_object('from', OLD.status, 'to', NEW.status));
    END IF;
    IF (OLD.is_active != NEW.is_active AND NEW.is_active = TRUE) THEN
      INSERT INTO question_pack_audit (pack_id, actor, event, meta)
      VALUES (NEW.pack_id, auth.uid(), 'activated', jsonb_build_object('version', NEW.version));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_pack_changes
AFTER INSERT OR UPDATE ON question_packs
FOR EACH ROW EXECUTE FUNCTION audit_pack_changes();

-- RLS Policies
ALTER TABLE question_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_pack_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_question_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_performance ENABLE ROW LEVEL SECURITY;

-- Readers can view active approved packs
CREATE POLICY "Authenticated users can view active approved packs"
  ON question_packs FOR SELECT
  USING (auth.role() = 'authenticated' AND status = 'approved' AND is_active = TRUE);

-- Admins can manage everything
CREATE POLICY "Admins can manage question packs"
  ON question_packs FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE roles ? 'admin'));

CREATE POLICY "Admins can view audit logs"
  ON question_pack_audit FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE roles ? 'admin'));

CREATE POLICY "Users can view snapshots for their jobs"
  ON job_question_snapshot FOR SELECT
  USING (auth.uid() IN (SELECT client_id FROM jobs WHERE id = job_question_snapshot.job_id));

CREATE POLICY "Admins can view all metrics"
  ON question_metrics FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE roles ? 'admin'));

CREATE POLICY "Admins can view pack performance"
  ON pack_performance FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE roles ? 'admin'));