-- Sprint 15.3: Mediation & Resolution Engine
-- Enhance dispute_resolutions table and add counter-proposals + enforcement tracking

DO $$ BEGIN

  -- 1) Enhance dispute_resolutions table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dispute_resolutions' AND column_name='status') THEN
    ALTER TABLE public.dispute_resolutions ADD COLUMN status text NOT NULL DEFAULT 'proposed';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dispute_resolutions' AND column_name='mediator_decision_reasoning') THEN
    ALTER TABLE public.dispute_resolutions ADD COLUMN mediator_decision_reasoning text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dispute_resolutions' AND column_name='fault_percentage_client') THEN
    ALTER TABLE public.dispute_resolutions ADD COLUMN fault_percentage_client integer CHECK (fault_percentage_client >= 0 AND fault_percentage_client <= 100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dispute_resolutions' AND column_name='fault_percentage_professional') THEN
    ALTER TABLE public.dispute_resolutions ADD COLUMN fault_percentage_professional integer CHECK (fault_percentage_professional >= 0 AND fault_percentage_professional <= 100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dispute_resolutions' AND column_name='auto_execute_date') THEN
    ALTER TABLE public.dispute_resolutions ADD COLUMN auto_execute_date timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dispute_resolutions' AND column_name='appeal_deadline') THEN
    ALTER TABLE public.dispute_resolutions ADD COLUMN appeal_deadline timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dispute_resolutions' AND column_name='party_client_agreed') THEN
    ALTER TABLE public.dispute_resolutions ADD COLUMN party_client_agreed boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dispute_resolutions' AND column_name='party_professional_agreed') THEN
    ALTER TABLE public.dispute_resolutions ADD COLUMN party_professional_agreed boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dispute_resolutions' AND column_name='agreement_finalized_at') THEN
    ALTER TABLE public.dispute_resolutions ADD COLUMN agreement_finalized_at timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dispute_resolutions' AND column_name='terms') THEN
    ALTER TABLE public.dispute_resolutions ADD COLUMN terms jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- 2) Create dispute_counter_proposals table
  CREATE TABLE IF NOT EXISTS public.dispute_counter_proposals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id uuid NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    parent_resolution_id uuid REFERENCES public.dispute_resolutions(id) ON DELETE SET NULL,
    proposer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    terms jsonb NOT NULL DEFAULT '{}'::jsonb,
    note text,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'rejected', 'withdrawn')),
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );

  ALTER TABLE public.dispute_counter_proposals ENABLE ROW LEVEL SECURITY;

  -- 3) Create resolution_enforcement_log table
  CREATE TABLE IF NOT EXISTS public.resolution_enforcement_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id uuid NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    resolution_id uuid REFERENCES public.dispute_resolutions(id) ON DELETE SET NULL,
    action text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    executed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );

  ALTER TABLE public.resolution_enforcement_log ENABLE ROW LEVEL SECURITY;

  -- 4) RLS Policies for counter_proposals
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dispute_counter_proposals' AND policyname='counter_proposals_read_parties') THEN
    CREATE POLICY counter_proposals_read_parties ON public.dispute_counter_proposals
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.disputes d WHERE d.id = dispute_counter_proposals.dispute_id
          AND (auth.uid() = d.created_by OR auth.uid() = d.disputed_against OR has_role(auth.uid(), 'admin'::app_role)))
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dispute_counter_proposals' AND policyname='counter_proposals_insert_parties') THEN
    CREATE POLICY counter_proposals_insert_parties ON public.dispute_counter_proposals
      FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.disputes d WHERE d.id = dispute_counter_proposals.dispute_id
          AND (auth.uid() = d.created_by OR auth.uid() = d.disputed_against OR has_role(auth.uid(), 'admin'::app_role)))
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dispute_counter_proposals' AND policyname='counter_proposals_update_proposer') THEN
    CREATE POLICY counter_proposals_update_proposer ON public.dispute_counter_proposals
      FOR UPDATE USING (
        proposer_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)
      );
  END IF;

  -- 5) RLS Policies for enforcement_log
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='resolution_enforcement_log' AND policyname='enforcement_log_read_parties') THEN
    CREATE POLICY enforcement_log_read_parties ON public.resolution_enforcement_log
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.disputes d WHERE d.id = resolution_enforcement_log.dispute_id
          AND (auth.uid() = d.created_by OR auth.uid() = d.disputed_against OR has_role(auth.uid(), 'admin'::app_role)))
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='resolution_enforcement_log' AND policyname='enforcement_log_insert_system') THEN
    CREATE POLICY enforcement_log_insert_system ON public.resolution_enforcement_log
      FOR INSERT WITH CHECK (true);
  END IF;

END $$;

-- 6) Helper function: mark party agreement
CREATE OR REPLACE FUNCTION public.mark_party_agreement(p_dispute_id uuid, p_field text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
BEGIN
  SELECT * INTO r FROM public.dispute_resolutions 
  WHERE dispute_id = p_dispute_id 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF r IS NULL THEN RETURN; END IF;
  
  IF p_field = 'party_client_agreed' THEN
    UPDATE public.dispute_resolutions SET party_client_agreed = true WHERE id = r.id;
  ELSIF p_field = 'party_professional_agreed' THEN
    UPDATE public.dispute_resolutions SET party_professional_agreed = true WHERE id = r.id;
  END IF;
  
  -- Add timeline event
  INSERT INTO public.dispute_timeline (dispute_id, event_type, description, metadata)
  VALUES (p_dispute_id, 'resolution_agreement', 'Party agreed to resolution', jsonb_build_object('field', p_field));
END;
$$;

-- 7) Trigger: auto-finalize when both parties agree
CREATE OR REPLACE FUNCTION public.finalize_resolution_if_both_agree()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.party_client_agreed = true AND NEW.party_professional_agreed = true AND NEW.agreement_finalized_at IS NULL THEN
    NEW.agreement_finalized_at := now();
    NEW.status := 'agreed';
    IF NEW.auto_execute_date IS NULL THEN
      NEW.auto_execute_date := now() + interval '24 hours';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_finalize_resolution ON public.dispute_resolutions;
CREATE TRIGGER trg_finalize_resolution
BEFORE UPDATE ON public.dispute_resolutions
FOR EACH ROW EXECUTE FUNCTION public.finalize_resolution_if_both_agree();

-- 8) Execute resolution function
CREATE OR REPLACE FUNCTION public.execute_resolution(p_resolution_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  d record;
BEGIN
  SELECT * INTO r FROM public.dispute_resolutions WHERE id = p_resolution_id;
  IF r IS NULL THEN RETURN; END IF;
  
  SELECT * INTO d FROM public.disputes WHERE id = r.dispute_id;
  IF d IS NULL THEN RETURN; END IF;
  
  -- Log execution start
  INSERT INTO public.resolution_enforcement_log(dispute_id, resolution_id, action, details)
  VALUES (r.dispute_id, r.id, 'execute_begin', jsonb_build_object('at', now()));
  
  -- Update resolution status
  UPDATE public.dispute_resolutions SET status = 'executed' WHERE id = p_resolution_id;
  
  -- Update dispute status
  UPDATE public.disputes SET status = 'resolved', resolved_at = now() WHERE id = r.dispute_id;
  
  -- Log execution end
  INSERT INTO public.resolution_enforcement_log(dispute_id, resolution_id, action, details)
  VALUES (r.dispute_id, r.id, 'execute_end', jsonb_build_object('at', now()));
  
  -- Add timeline event
  INSERT INTO public.dispute_timeline (dispute_id, event_type, description, metadata)
  VALUES (r.dispute_id, 'resolution_executed', 'Resolution automatically executed', jsonb_build_object('resolution_id', p_resolution_id));
END;
$$;