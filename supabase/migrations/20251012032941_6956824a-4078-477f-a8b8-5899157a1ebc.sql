-- Create job_quotes table for professional responses
CREATE TABLE IF NOT EXISTS public.job_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL,
  quote_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  estimated_duration_hours INTEGER,
  estimated_start_date DATE,
  proposal_message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, professional_id)
);

-- Enable RLS
ALTER TABLE public.job_quotes ENABLE ROW LEVEL SECURITY;

-- Professionals can insert their own quotes
CREATE POLICY "Professionals can submit quotes"
ON public.job_quotes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = professional_id 
  AND has_role(auth.uid(), 'professional'::app_role)
);

-- Professionals can view their own quotes
CREATE POLICY "Professionals can view own quotes"
ON public.job_quotes
FOR SELECT
TO authenticated
USING (auth.uid() = professional_id);

-- Job owners can view all quotes for their jobs
CREATE POLICY "Clients can view quotes for their jobs"
ON public.job_quotes
FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE client_id = auth.uid()
  )
);

-- Job owners can update quote status (accept/reject)
CREATE POLICY "Clients can update quote status"
ON public.job_quotes
FOR UPDATE
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE client_id = auth.uid()
  )
)
WITH CHECK (
  job_id IN (
    SELECT id FROM public.jobs WHERE client_id = auth.uid()
  )
);

-- Professionals can withdraw their quotes
CREATE POLICY "Professionals can withdraw quotes"
ON public.job_quotes
FOR UPDATE
TO authenticated
USING (auth.uid() = professional_id)
WITH CHECK (auth.uid() = professional_id);

-- Create index for performance
CREATE INDEX idx_job_quotes_job_id ON public.job_quotes(job_id);
CREATE INDEX idx_job_quotes_professional_id ON public.job_quotes(professional_id);
CREATE INDEX idx_job_quotes_status ON public.job_quotes(status);

-- Trigger to update updated_at
CREATE TRIGGER update_job_quotes_updated_at
BEFORE UPDATE ON public.job_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to notify client when quote is submitted
CREATE OR REPLACE FUNCTION notify_client_new_quote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  -- Create activity feed notification
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
    '/jobs/' || NEW.job_id || '/quotes',
    'quote',
    'high'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_quote_submitted
AFTER INSERT ON public.job_quotes
FOR EACH ROW
EXECUTE FUNCTION notify_client_new_quote();