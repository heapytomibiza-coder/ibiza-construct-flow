-- Sprint 1: Financial & Data Safety Migration
-- 1. Add status column to stripe_processed_events for atomic claim pattern
ALTER TABLE public.stripe_processed_events 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'claimed' CHECK (status IN ('claimed', 'processed', 'failed'));

ALTER TABLE public.stripe_processed_events 
ADD COLUMN IF NOT EXISTS error_message TEXT;

ALTER TABLE public.stripe_processed_events 
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ DEFAULT now();

-- 2. Add missing Stripe ID columns to escrow_payments
ALTER TABLE public.escrow_payments 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

ALTER TABLE public.escrow_payments 
ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT;

ALTER TABLE public.escrow_payments 
ADD COLUMN IF NOT EXISTS captured_at TIMESTAMPTZ;

ALTER TABLE public.escrow_payments 
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

ALTER TABLE public.escrow_payments 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

ALTER TABLE public.escrow_payments 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.profiles(id);

ALTER TABLE public.escrow_payments 
ADD COLUMN IF NOT EXISTS job_id UUID;

ALTER TABLE public.escrow_payments 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Add idempotency_key to jobs for duplicate submission prevention (Sprint 2)
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Create unique index for idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_idempotency_key 
ON public.jobs(idempotency_key) 
WHERE idempotency_key IS NOT NULL;

-- 4. Create index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_escrow_payments_stripe_intent 
ON public.escrow_payments(stripe_payment_intent_id) 
WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_escrow_payments_stripe_charge 
ON public.escrow_payments(stripe_charge_id) 
WHERE stripe_charge_id IS NOT NULL;

-- 5. Create disputes table if not exists (for dispute webhook handling)
CREATE TABLE IF NOT EXISTS public.stripe_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_dispute_id TEXT UNIQUE NOT NULL,
  stripe_charge_id TEXT,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  reason TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'needs_response', 'under_review', 'warning_needs_response', 'warning_under_review', 'warning_closed', 'charge_refunded')),
  evidence_due_by TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on stripe_disputes
ALTER TABLE public.stripe_disputes ENABLE ROW LEVEL SECURITY;

-- Only service role can manage disputes (webhook-only)
CREATE POLICY "Service role manages disputes" 
ON public.stripe_disputes 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Admins can view disputes
CREATE POLICY "Admins can view disputes" 
ON public.stripe_disputes 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- 6. Seed site_settings with defaults to fix PGRST116 errors (Sprint 2)
INSERT INTO public.site_settings (section, key, value) VALUES
  ('hero', 'stats', '{"projectsCompleted": 500, "professionals": 150, "satisfaction": 98}'::jsonb),
  ('homepage', 'layout', '{"showStats": true, "showTestimonials": true}'::jsonb),
  ('footer', 'social', '{"instagram": "", "facebook": "", "linkedin": ""}'::jsonb),
  ('footer', 'contact', '{"email": "info@cs-ibiza.com", "phone": ""}'::jsonb),
  ('branding', 'colors', '{"primary": "#c9a961", "secondary": "#1a1a2e"}'::jsonb)
ON CONFLICT (section, key) DO NOTHING;

-- 7. Create a function to freeze escrow for disputes (called by webhook)
CREATE OR REPLACE FUNCTION public.freeze_escrow_for_dispute(p_charge_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.escrow_payments
  SET 
    escrow_status = 'frozen',
    metadata = metadata || jsonb_build_object('frozen_reason', 'dispute', 'frozen_at', now())
  WHERE stripe_charge_id = p_charge_id
  AND escrow_status IN ('held', 'pending');
END;
$$;