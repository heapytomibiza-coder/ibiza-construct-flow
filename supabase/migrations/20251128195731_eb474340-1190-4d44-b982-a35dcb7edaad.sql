-- Create admin function to update approved question packs
-- This bypasses the immutability check for one-time standardization
CREATE OR REPLACE FUNCTION admin_update_question_pack_content(
  p_pack_id uuid,
  p_content jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Direct update without triggering immutability checks
  UPDATE question_packs
  SET content = p_content
  WHERE pack_id = p_pack_id;
END;
$$;