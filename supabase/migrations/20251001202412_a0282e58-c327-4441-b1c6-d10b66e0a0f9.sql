-- Enhanced immutability and activation guards for question packs

-- 1) Prevent edits to APPROVED packs (content/source/prompt_hash/version/micro_slug)
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

DROP TRIGGER IF EXISTS trg_lock_approved_pack ON question_packs;
CREATE TRIGGER trg_lock_approved_pack
BEFORE UPDATE OF content, source, prompt_hash, version, micro_slug
ON question_packs
FOR EACH ROW
EXECUTE FUNCTION prevent_approved_mutation();

-- 2) Only APPROVED packs can be activated; ensure 1 active per slug
CREATE OR REPLACE FUNCTION validate_activation()
RETURNS trigger AS $$
BEGIN
  IF (NEW.is_active = TRUE AND NEW.status != 'approved') THEN
    RAISE EXCEPTION 'Only approved packs can be active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_activation ON question_packs;
CREATE TRIGGER trg_validate_activation
BEFORE UPDATE OF is_active, status
ON question_packs
FOR EACH ROW
EXECUTE FUNCTION validate_activation();

-- 3) Audit trail for pack changes
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

DROP TRIGGER IF EXISTS trg_audit_pack_changes ON question_packs;
CREATE TRIGGER trg_audit_pack_changes
AFTER INSERT OR UPDATE ON question_packs
FOR EACH ROW
EXECUTE FUNCTION audit_pack_changes();

-- 4) Unique index ensures only one active approved per slug
CREATE UNIQUE INDEX IF NOT EXISTS uq_pack_active_per_slug
  ON question_packs (micro_slug)
  WHERE (is_active = TRUE AND status = 'approved');