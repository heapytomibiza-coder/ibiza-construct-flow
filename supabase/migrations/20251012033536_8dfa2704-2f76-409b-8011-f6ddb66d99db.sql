-- Update the trigger function to use correct field names
CREATE OR REPLACE FUNCTION create_contract_from_quote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job RECORD;
  v_contract_id UUID;
BEGIN
  -- Only proceed if status changed to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Get job details
    SELECT * INTO v_job FROM public.jobs WHERE id = NEW.job_id;
    
    IF v_job IS NULL THEN
      RAISE EXCEPTION 'Job not found';
    END IF;
    
    -- Create contract using correct field names
    INSERT INTO public.contracts (
      job_id,
      tasker_id,
      client_id,
      agreed_amount,
      type,
      escrow_status
    ) VALUES (
      NEW.job_id,
      NEW.professional_id,
      v_job.client_id,
      NEW.quote_amount,
      'fixed',
      'pending'
    ) RETURNING id INTO v_contract_id;
    
    -- Create default milestone (full amount)
    INSERT INTO public.escrow_milestones (
      contract_id,
      milestone_number,
      description,
      amount,
      currency,
      status
    ) VALUES (
      v_contract_id,
      1,
      'Project completion',
      NEW.quote_amount,
      NEW.currency,
      'pending'
    );
    
    -- Update job status to in_progress
    UPDATE public.jobs
    SET status = 'in_progress'
    WHERE id = NEW.job_id;
    
    -- Notify professional
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
      NEW.professional_id,
      'quote_accepted',
      'contract',
      v_contract_id,
      'Your Quote Was Accepted!',
      'Congratulations! The client accepted your quote for "' || v_job.title || '"',
      '/contracts/' || v_contract_id,
      'contract',
      'high'
    );
    
    -- Notify client about next steps (fund escrow)
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
      v_job.client_id,
      'contract_created',
      'contract',
      v_contract_id,
      'Contract Created - Fund Escrow',
      'Your contract for "' || v_job.title || '" is ready. Please fund the escrow to begin work.',
      '/job/' || NEW.job_id,
      'payment',
      'high'
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update split_milestone function to use correct field names
CREATE OR REPLACE FUNCTION split_milestone_into_phases(
  p_contract_id UUID,
  p_phases JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contract RECORD;
  v_phase JSONB;
  v_phase_num INT := 1;
  v_total_allocated NUMERIC := 0;
BEGIN
  -- Get contract
  SELECT * INTO v_contract FROM public.contracts WHERE id = p_contract_id;
  
  IF v_contract IS NULL THEN
    RAISE EXCEPTION 'Contract not found';
  END IF;
  
  -- Verify caller is client
  IF auth.uid() != v_contract.client_id THEN
    RAISE EXCEPTION 'Only the client can split milestones';
  END IF;
  
  -- Delete existing milestones
  DELETE FROM public.escrow_milestones WHERE contract_id = p_contract_id;
  
  -- Create new milestones from phases
  FOR v_phase IN SELECT * FROM jsonb_array_elements(p_phases)
  LOOP
    INSERT INTO public.escrow_milestones (
      contract_id,
      milestone_number,
      description,
      amount,
      currency,
      status,
      due_date
    ) VALUES (
      p_contract_id,
      v_phase_num,
      v_phase->>'description',
      (v_phase->>'amount')::NUMERIC,
      'EUR',
      'pending',
      CASE 
        WHEN v_phase->>'due_date' IS NOT NULL 
        THEN (v_phase->>'due_date')::DATE 
        ELSE NULL 
      END
    );
    
    v_total_allocated := v_total_allocated + (v_phase->>'amount')::NUMERIC;
    v_phase_num := v_phase_num + 1;
  END LOOP;
  
  -- Verify total matches contract amount
  IF v_total_allocated != v_contract.agreed_amount THEN
    RAISE EXCEPTION 'Phase amounts (%) do not match contract total (%)', v_total_allocated, v_contract.agreed_amount;
  END IF;
  
  -- Log event
  INSERT INTO public.activity_feed (
    user_id,
    event_type,
    entity_type,
    entity_id,
    title,
    description
  ) VALUES (
    v_contract.client_id,
    'milestones_split',
    'contract',
    p_contract_id,
    'Payment Milestones Created',
    'Contract split into ' || (v_phase_num - 1) || ' payment milestones'
  );
END;
$$;