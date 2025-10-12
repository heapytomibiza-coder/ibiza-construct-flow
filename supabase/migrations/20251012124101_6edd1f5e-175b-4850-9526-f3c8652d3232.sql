-- ================================================================
-- PHASE 3: COMPLETE NOTIFICATION SYSTEM
-- Add missing notification triggers for key contract/payment events
-- ================================================================

-- ================================================================
-- 1. NOTIFY PROFESSIONAL: Escrow Funded
-- Trigger when client funds escrow for a contract
-- ================================================================
CREATE OR REPLACE FUNCTION public.notify_escrow_funded()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_job RECORD;
BEGIN
  -- Only trigger when escrow status changes to 'funded'
  IF NEW.escrow_status = 'funded' AND OLD.escrow_status != 'funded' THEN
    -- Get job details
    SELECT j.title, j.client_id INTO v_job
    FROM public.jobs j
    WHERE j.id = NEW.job_id;
    
    IF v_job IS NOT NULL THEN
      -- Notify professional that escrow is funded and they can start work
      INSERT INTO public.activity_feed (
        user_id,
        event_type,
        entity_type,
        entity_id,
        title,
        description,
        action_url,
        notification_type,
        priority
      ) VALUES (
        NEW.tasker_id,
        'escrow_funded',
        'contract',
        NEW.id,
        'Escrow Funded - Start Work!',
        'The client has funded escrow for "' || v_job.title || '". You can now begin work.',
        '/contracts/' || NEW.id,
        'payment',
        'high'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for escrow funding
DROP TRIGGER IF EXISTS trigger_notify_escrow_funded ON public.contracts;
CREATE TRIGGER trigger_notify_escrow_funded
  AFTER UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_escrow_funded();

-- ================================================================
-- 2. NOTIFY CLIENT: Milestone Completed (by professional)
-- Trigger when professional marks milestone as completed
-- ================================================================
CREATE OR REPLACE FUNCTION public.notify_milestone_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_contract RECORD;
  v_job RECORD;
BEGIN
  -- Only trigger when milestone status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get contract and job details
    SELECT c.client_id, c.tasker_id, c.job_id, j.title
    INTO v_contract
    FROM public.contracts c
    LEFT JOIN public.jobs j ON j.id = c.job_id
    WHERE c.id = NEW.contract_id;
    
    IF v_contract IS NOT NULL THEN
      -- Notify client that milestone is completed and needs verification
      INSERT INTO public.activity_feed (
        user_id,
        event_type,
        entity_type,
        entity_id,
        title,
        description,
        action_url,
        notification_type,
        priority
      ) VALUES (
        v_contract.client_id,
        'milestone_completed',
        'milestone',
        NEW.id,
        'Work Completed - Review Needed',
        'Professional completed milestone #' || NEW.milestone_number || ' for "' || COALESCE(v_contract.title, 'your project') || '". Please review and verify.',
        '/contracts/' || NEW.contract_id,
        'work',
        'high'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for milestone completion
DROP TRIGGER IF EXISTS trigger_notify_milestone_completed ON public.escrow_milestones;
CREATE TRIGGER trigger_notify_milestone_completed
  AFTER UPDATE ON public.escrow_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_milestone_completed();

-- ================================================================
-- 3. NOTIFY PROFESSIONAL: Work Verified (by client)
-- Trigger when client approves completed work
-- ================================================================
CREATE OR REPLACE FUNCTION public.notify_work_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_contract RECORD;
  v_job RECORD;
BEGIN
  -- Trigger when milestone is approved (has approved_by and approved_date)
  IF NEW.approved_by IS NOT NULL AND OLD.approved_by IS NULL THEN
    -- Get contract and job details
    SELECT c.client_id, c.tasker_id, c.job_id, j.title
    INTO v_contract
    FROM public.contracts c
    LEFT JOIN public.jobs j ON j.id = c.job_id
    WHERE c.id = NEW.contract_id;
    
    IF v_contract IS NOT NULL THEN
      -- Notify professional that work was verified
      INSERT INTO public.activity_feed (
        user_id,
        event_type,
        entity_type,
        entity_id,
        title,
        description,
        action_url,
        notification_type,
        priority
      ) VALUES (
        v_contract.tasker_id,
        'work_verified',
        'milestone',
        NEW.id,
        'Work Approved!',
        'Client approved milestone #' || NEW.milestone_number || ' for "' || COALESCE(v_contract.title, 'your project') || '". Payment will be released.',
        '/contracts/' || NEW.contract_id,
        'payment',
        'high'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for work verification
DROP TRIGGER IF EXISTS trigger_notify_work_verified ON public.escrow_milestones;
CREATE TRIGGER trigger_notify_work_verified
  AFTER UPDATE ON public.escrow_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_work_verified();

-- ================================================================
-- 4. NOTIFY PROFESSIONAL: Payment Released
-- Trigger when escrow payment is released to professional
-- ================================================================
CREATE OR REPLACE FUNCTION public.notify_payment_released()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_milestone RECORD;
  v_contract RECORD;
BEGIN
  -- Only trigger when transaction type is 'release' and status changes to 'completed'
  IF NEW.transaction_type = 'release' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get milestone and contract details
    SELECT 
      em.milestone_number,
      em.amount,
      c.tasker_id,
      c.job_id,
      j.title
    INTO v_milestone
    FROM public.escrow_milestones em
    LEFT JOIN public.contracts c ON c.id = em.contract_id
    LEFT JOIN public.jobs j ON j.id = c.job_id
    WHERE em.id = NEW.milestone_id;
    
    IF v_milestone IS NOT NULL THEN
      -- Notify professional that payment was released
      INSERT INTO public.activity_feed (
        user_id,
        event_type,
        entity_type,
        entity_id,
        title,
        description,
        action_url,
        notification_type,
        priority
      ) VALUES (
        v_milestone.tasker_id,
        'payment_released',
        'transaction',
        NEW.id,
        'Payment Released!',
        'Payment of €' || v_milestone.amount || ' for milestone #' || v_milestone.milestone_number || ' has been released to you.',
        '/earnings',
        'payment',
        'high'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for payment release
DROP TRIGGER IF EXISTS trigger_notify_payment_released ON public.escrow_transactions;
CREATE TRIGGER trigger_notify_payment_released
  AFTER UPDATE ON public.escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_payment_released();

-- ================================================================
-- 5. NOTIFY CLIENT: Review Request
-- Trigger when all milestones are completed/approved - request review
-- ================================================================
CREATE OR REPLACE FUNCTION public.notify_review_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_contract RECORD;
  v_all_milestones_complete BOOLEAN;
  v_review_exists BOOLEAN;
BEGIN
  -- Only trigger when contract status changes to 'completed'
  IF NEW.escrow_status = 'released' AND OLD.escrow_status != 'released' THEN
    -- Get contract details
    SELECT c.client_id, c.tasker_id, c.job_id, j.title
    INTO v_contract
    FROM public.contracts c
    LEFT JOIN public.jobs j ON j.id = c.job_id
    WHERE c.id = NEW.id;
    
    IF v_contract IS NOT NULL THEN
      -- Check if review already exists
      SELECT EXISTS (
        SELECT 1 FROM public.reviews
        WHERE job_id = v_contract.job_id
        AND client_id = v_contract.client_id
        AND professional_id = v_contract.tasker_id
      ) INTO v_review_exists;
      
      -- Only notify if no review exists yet
      IF NOT v_review_exists THEN
        -- Notify client to leave a review
        INSERT INTO public.activity_feed (
          user_id,
          event_type,
          entity_type,
          entity_id,
          title,
          description,
          action_url,
          notification_type,
          priority
        ) VALUES (
          v_contract.client_id,
          'review_request',
          'job',
          v_contract.job_id,
          'Leave a Review',
          'How was your experience with "' || COALESCE(v_contract.title, 'your project') || '"? Share your feedback.',
          '/jobs/' || v_contract.job_id,
          'review',
          'medium'
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for review request
DROP TRIGGER IF EXISTS trigger_notify_review_request ON public.contracts;
CREATE TRIGGER trigger_notify_review_request
  AFTER UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_review_request();

-- ================================================================
-- Update existing notification function to use correct routes
-- Fix notify_client_new_quote to use /jobs/:jobId route
-- ================================================================
CREATE OR REPLACE FUNCTION public.notify_client_new_quote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_client_id UUID;
  v_job_title TEXT;
  v_professional_name TEXT;
BEGIN
  -- Get job details
  SELECT client_id, title INTO v_client_id, v_job_title
  FROM public.jobs
  WHERE id = NEW.job_id;
  
  -- Get professional name
  SELECT COALESCE(full_name, display_name, 'A professional') INTO v_professional_name
  FROM public.profiles
  WHERE id = NEW.professional_id;
  
  -- Create activity feed notification with correct route
  INSERT INTO public.activity_feed (
    user_id,
    event_type,
    entity_type,
    entity_id,
    title,
    description,
    action_url,
    notification_type,
    priority
  ) VALUES (
    v_client_id,
    'quote_received',
    'job_quote',
    NEW.id,
    'New Quote Received',
    v_professional_name || ' submitted a quote for "' || v_job_title || '"',
    '/jobs/' || NEW.job_id,
    'quote',
    'high'
  );
  
  RETURN NEW;
END;
$$;