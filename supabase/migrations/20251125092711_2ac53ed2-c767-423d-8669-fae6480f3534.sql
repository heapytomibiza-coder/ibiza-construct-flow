-- Create professional subscriptions table to track manual subscription payments
CREATE TABLE IF NOT EXISTS public.professional_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'pro', 'premium')),
  stripe_product_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_professional_subscriptions_professional_id 
  ON public.professional_subscriptions(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_subscriptions_status 
  ON public.professional_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_professional_subscriptions_expires_at 
  ON public.professional_subscriptions(expires_at);

-- Enable RLS
ALTER TABLE public.professional_subscriptions ENABLE ROW LEVEL SECURITY;

-- Professionals can view their own subscriptions
CREATE POLICY "Professionals can view own subscriptions"
  ON public.professional_subscriptions
  FOR SELECT
  USING (auth.uid() = professional_id);

-- Professionals can insert their own subscriptions (for payment processing)
CREATE POLICY "Professionals can create own subscriptions"
  ON public.professional_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_professional_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_professional_subscriptions_updated_at_trigger
  BEFORE UPDATE ON public.professional_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_subscriptions_updated_at();

-- Add commission_rate to contracts table for tracking per-job commission
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,4);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(5,4) DEFAULT 0.025;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS commission_amount INTEGER;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS platform_fee_amount INTEGER;