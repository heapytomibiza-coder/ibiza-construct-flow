-- ============================================================================
-- Sprint 15.4 Demo Cleanup
-- Replace 'REPLACE_WITH_SEEDED_DISPUTE_ID' with the UUID from seed output
-- ============================================================================

DO $$
DECLARE
  v_dispute uuid := 'REPLACE_WITH_SEEDED_DISPUTE_ID';
BEGIN
  -- Dependent rows will cascade if your FKs are ON DELETE CASCADE
  DELETE FROM public.early_warnings WHERE dispute_id = v_dispute;
  DELETE FROM public.case_audit_trail WHERE dispute_id = v_dispute;
  DELETE FROM public.dispute_outcomes WHERE dispute_id = v_dispute;
  DELETE FROM public.dispute_messages WHERE dispute_id = v_dispute;
  DELETE FROM public.message_sentiments WHERE message_id IN (
    SELECT id FROM public.dispute_messages WHERE dispute_id = v_dispute
  );
  DELETE FROM public.disputes WHERE id = v_dispute;
  
  -- Refresh analytics MVs
  PERFORM public.refresh_analytics_views();
  
  RAISE NOTICE 'Cleaned seed dispute %', v_dispute;
END $$;
