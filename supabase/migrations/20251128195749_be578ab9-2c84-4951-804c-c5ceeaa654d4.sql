-- Fix search_path security warning for admin function
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
  -- Direct update without triggering immutability checks
  UPDATE question_packs
  SET content = p_content
  WHERE pack_id = p_pack_id;
END;
$$;