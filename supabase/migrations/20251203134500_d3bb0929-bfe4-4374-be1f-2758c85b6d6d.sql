
-- Drop the old function and create a simpler one
DROP FUNCTION IF EXISTS admin_remove_logistics_questions();

-- Simpler admin function to remove logistics questions from question packs
CREATE OR REPLACE FUNCTION admin_remove_logistics_questions()
RETURNS TABLE(
  updated_pack_id uuid,
  updated_micro_slug text,
  questions_before int,
  questions_after int,
  removed_count int
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pack_record RECORD;
  new_content jsonb;
  filtered_questions jsonb;
  logistics_keys text[] := ARRAY[
    'urgency', 'timeline', 'when_needed', 'preferred_date', 'schedule',
    'start_date', 'completion_date', 'budget', 'budget_range',
    'job_location', 'location', 'access', 'property_access',
    'q8', 'q9', 'additional_notes', 'notes', 'description',
    'consultation', 'consultation_type', 'start_time', 'project_assets',
    'access_details', 'occupied', 'start_date_preference'
  ];
  before_count int;
  after_count int;
BEGIN
  FOR pack_record IN 
    SELECT qp.pack_id, qp.micro_slug, qp.content
    FROM question_packs qp
    WHERE qp.is_active = true
    AND qp.status = 'approved'
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(qp.content->'questions') q
      WHERE q->>'key' = ANY(logistics_keys)
    )
  LOOP
    before_count := jsonb_array_length(pack_record.content->'questions');
    
    -- Filter out logistics questions
    SELECT jsonb_agg(q)
    INTO filtered_questions
    FROM jsonb_array_elements(pack_record.content->'questions') q
    WHERE NOT (q->>'key' = ANY(logistics_keys));
    
    -- Handle case where all questions might be filtered
    IF filtered_questions IS NULL THEN
      filtered_questions := '[]'::jsonb;
    END IF;
    
    after_count := jsonb_array_length(filtered_questions);
    
    -- Only update if something changed
    IF before_count > after_count THEN
      new_content := jsonb_set(pack_record.content, '{questions}', filtered_questions);
      
      UPDATE question_packs
      SET content = new_content
      WHERE pack_id = pack_record.pack_id;
      
      updated_pack_id := pack_record.pack_id;
      updated_micro_slug := pack_record.micro_slug;
      questions_before := before_count;
      questions_after := after_count;
      removed_count := before_count - after_count;
      
      RETURN NEXT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_remove_logistics_questions() TO authenticated;
