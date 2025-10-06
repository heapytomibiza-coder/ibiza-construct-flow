-- ============================================================================
-- Sprint 15.4 Demo Seed: dispute, messages, sentiments, quality scores
-- This script:
--  - Picks one client + one professional (from user_roles), or falls back to any two users
--  - Creates a dispute 2 days old
--  - Inserts a sequence of messages with negative wording
--  - Ensures the last client msg is 8h ago (pro hasn't replied) -> slow_response(pro)
--  - Seeds message_sentiments (negative streak) and quality_scores (pro < 60)
--  - Prints the created dispute UUIDs for reference
-- ============================================================================

-- Safety: required ext for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_client uuid;
  v_pro uuid;
  v_fallback1 uuid;
  v_fallback2 uuid;
  v_dispute uuid := gen_random_uuid();

  -- message ids (to seed sentiments)
  v_m1 uuid := gen_random_uuid();
  v_m2 uuid := gen_random_uuid();
  v_m3 uuid := gen_random_uuid();
  v_m4 uuid := gen_random_uuid();
  v_m5 uuid := gen_random_uuid();
BEGIN
  -- Try to pick a client & professional by role
  SELECT ur.user_id INTO v_client
  FROM public.user_roles ur
  WHERE ur.role = 'client'::public.app_role
  LIMIT 1;

  SELECT ur.user_id INTO v_pro
  FROM public.user_roles ur
  WHERE ur.role = 'professional'::public.app_role
  LIMIT 1;

  -- Fallback: any two distinct users
  IF v_client IS NULL OR v_pro IS NULL OR v_client = v_pro THEN
    SELECT u.id INTO v_fallback1 FROM auth.users u LIMIT 1;
    SELECT u.id INTO v_fallback2 FROM auth.users u WHERE u.id <> v_fallback1 LIMIT 1;

    IF v_client IS NULL THEN v_client := v_fallback1; END IF;
    IF v_pro IS NULL OR v_pro = v_client THEN v_pro := v_fallback2; END IF;
  END IF;

  -- Create dispute (status 'open'), 2 days old
  INSERT INTO public.disputes (
    id, 
    created_by,
    disputed_against,
    job_id,
    title,
    description,
    type,
    amount_disputed,
    status,
    priority,
    created_at,
    last_activity_at
  )
  VALUES (
    v_dispute, 
    v_client, 
    v_pro,
    NULL,
    'Service Quality Issue - Demo',
    'This is a demo dispute for testing Sprint 15.4 analytics and warning system.',
    'service_quality',
    500.00,
    'open',
    'medium',
    now() - interval '2 days',
    now() - interval '8 hours'
  );

  -- Insert messages: alternate a bit; last message from client is 8h ago (no pro reply)
  -- Timestamps go from -36h to -8h
  INSERT INTO public.dispute_messages (id, dispute_id, sender_id, message, created_at)
  VALUES
    (v_m1, v_dispute, v_client, 'Hi, this is unacceptable. The work looks terrible.', now() - interval '36 hours'),
    (v_m2, v_dispute, v_pro,    'Thanks for the note—let me check the issue and get back.', now() - interval '30 hours'),
    (v_m3, v_dispute, v_client, 'Still waiting. This feels like a scam if not fixed today.', now() - interval '24 hours'),
    (v_m4, v_dispute, v_pro,    'Understood. I will review the photos shortly.', now() - interval '20 hours'),
    (v_m5, v_dispute, v_client, 'Awful experience so far. Please respond with a plan.', now() - interval '8 hours');

  -- Seed message sentiments (admin-only table) to force a negative streak immediately
  INSERT INTO public.message_sentiments (message_id, sentiment, label, confidence, computed_at)
  VALUES
    (v_m1, -0.70, 'negative', 0.85, now() - interval '35 hours'),
    (v_m2,  0.10, 'neutral',  0.70, now() - interval '29 hours'),
    (v_m3, -0.65, 'negative', 0.85, now() - interval '23 hours'),
    (v_m4,  0.05, 'neutral',  0.65, now() - interval '19 hours'),
    (v_m5, -0.75, 'negative', 0.90, now() - interval '8 hours');

  -- Lower the pro's quality score to trigger repeat_offender
  INSERT INTO public.quality_scores (user_id, score, last_recalculated_at, breakdown)
  VALUES (v_pro, 55.00, now(), jsonb_build_object('seed','demo','reason','repeat_offender threshold'))
  ON CONFLICT (user_id)
  DO UPDATE SET score = EXCLUDED.score, last_recalculated_at = now(),
                breakdown = public.quality_scores.breakdown || EXCLUDED.breakdown;

  -- Add audit trail entries
  INSERT INTO public.case_audit_trail (dispute_id, action_type, actor_id, details, created_at)
  VALUES
    (v_dispute, 'dispute_created', v_client, jsonb_build_object('source', 'seed_script'), now() - interval '2 days'),
    (v_dispute, 'message_sent', v_client, jsonb_build_object('message_id', v_m1), now() - interval '36 hours'),
    (v_dispute, 'message_sent', v_pro, jsonb_build_object('message_id', v_m2), now() - interval '30 hours'),
    (v_dispute, 'message_sent', v_client, jsonb_build_object('message_id', v_m3), now() - interval '24 hours'),
    (v_dispute, 'message_sent', v_pro, jsonb_build_object('message_id', v_m4), now() - interval '20 hours'),
    (v_dispute, 'message_sent', v_client, jsonb_build_object('message_id', v_m5), now() - interval '8 hours');

  RAISE NOTICE 'Seed complete. Dispute ID: % (client: %, pro: %)', v_dispute, v_client, v_pro;
END $$;

-- Refresh analytics MVs so the dashboard shows data
SELECT public.refresh_analytics_views();
