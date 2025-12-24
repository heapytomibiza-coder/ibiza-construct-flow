-- Create payment idempotency keys table
CREATE TABLE IF NOT EXISTS public.payment_idempotency_keys (
  idempotency_key TEXT PRIMARY KEY,
  stripe_payment_intent_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  job_id UUID,
  amount NUMERIC,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_idempotency_user 
  ON public.payment_idempotency_keys(user_id, created_at);

-- Create processed webhook events table for idempotency
CREATE TABLE IF NOT EXISTS public.stripe_processed_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  result JSONB DEFAULT '{}'
);

-- Enable RLS on new tables
ALTER TABLE public.payment_idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_processed_events ENABLE ROW LEVEL SECURITY;

-- RLS policies - service role only (edge functions use service role)
CREATE POLICY "Service role full access to payment_idempotency_keys"
  ON public.payment_idempotency_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to stripe_processed_events"
  ON public.stripe_processed_events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to check/create idempotency key
CREATE OR REPLACE FUNCTION public.check_payment_idempotency(
  p_key TEXT,
  p_user_id UUID,
  p_job_id UUID,
  p_amount NUMERIC,
  p_currency TEXT DEFAULT 'EUR'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing RECORD;
BEGIN
  -- Check for existing key
  SELECT * INTO v_existing
  FROM payment_idempotency_keys
  WHERE idempotency_key = p_key
    AND expires_at > NOW();
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'is_duplicate', true,
      'existing_payment_intent_id', v_existing.stripe_payment_intent_id
    );
  END IF;
  
  -- Create new key
  INSERT INTO payment_idempotency_keys (idempotency_key, user_id, job_id, amount, currency)
  VALUES (p_key, p_user_id, p_job_id, p_amount, p_currency)
  ON CONFLICT (idempotency_key) DO NOTHING;
  
  RETURN jsonb_build_object('is_duplicate', false);
END;
$$;

-- Cleanup old rate limit records function
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM rate_limit_tracking
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  DELETE FROM payment_idempotency_keys
  WHERE expires_at < NOW();
END;
$$;