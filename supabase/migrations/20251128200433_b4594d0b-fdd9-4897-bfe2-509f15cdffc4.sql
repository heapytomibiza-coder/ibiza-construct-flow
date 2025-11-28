-- Update admin function to disable trigger during update
DROP FUNCTION IF EXISTS admin_update_question_pack_content(uuid, jsonb);

CREATE OR REPLACE FUNCTION admin_update_question_pack_content(
  p_pack_id uuid,
  p_content jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Temporarily disable the immutability trigger
  ALTER TABLE question_packs DISABLE TRIGGER trg_lock_approved;
  ALTER TABLE question_packs DISABLE TRIGGER trg_lock_approved_pack;
  
  -- Perform the update
  UPDATE question_packs
  SET content = p_content
  WHERE pack_id = p_pack_id;
  
  -- Re-enable the triggers
  ALTER TABLE question_packs ENABLE TRIGGER trg_lock_approved;
  ALTER TABLE question_packs ENABLE TRIGGER trg_lock_approved_pack;
END;
$$;