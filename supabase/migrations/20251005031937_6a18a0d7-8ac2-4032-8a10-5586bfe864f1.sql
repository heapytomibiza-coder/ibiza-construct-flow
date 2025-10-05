-- Phase 15: Complete Payment System Tables

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  professional_id UUID,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create refunds table
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_refund_id TEXT,
  requested_by UUID NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payouts table
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payout_id TEXT,
  stripe_account_id TEXT,
  method TEXT NOT NULL DEFAULT 'standard',
  arrival_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payout_items table
CREATE TABLE IF NOT EXISTS public.payout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID NOT NULL REFERENCES public.payouts(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create escrow_releases table
CREATE TABLE IF NOT EXISTS public.escrow_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.escrow_milestones(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  released_by UUID NOT NULL,
  released_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_job_id ON public.payments(job_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_professional_id ON public.payments(professional_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payouts_professional_id ON public.payouts(professional_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON public.refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_payout_items_payout_id ON public.payout_items(payout_id);
CREATE INDEX IF NOT EXISTS idx_escrow_releases_milestone_id ON public.escrow_releases(milestone_id);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_releases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = professional_id);

CREATE POLICY "System can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update payments"
  ON public.payments FOR UPDATE
  USING (true);

-- RLS Policies for stripe_customers
CREATE POLICY "Users can view their own Stripe customer"
  ON public.stripe_customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage Stripe customers"
  ON public.stripe_customers FOR ALL
  USING (true);

-- RLS Policies for refunds
CREATE POLICY "Users can view refunds for their payments"
  ON public.refunds FOR SELECT
  USING (payment_id IN (
    SELECT id FROM public.payments 
    WHERE client_id = auth.uid() OR professional_id = auth.uid()
  ));

CREATE POLICY "Clients can request refunds"
  ON public.refunds FOR INSERT
  WITH CHECK (auth.uid() = requested_by AND payment_id IN (
    SELECT id FROM public.payments WHERE client_id = auth.uid()
  ));

CREATE POLICY "System can update refunds"
  ON public.refunds FOR UPDATE
  USING (true);

-- RLS Policies for payouts
CREATE POLICY "Professionals can view their own payouts"
  ON public.payouts FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "System can manage payouts"
  ON public.payouts FOR ALL
  USING (true);

-- RLS Policies for payout_items
CREATE POLICY "Professionals can view their payout items"
  ON public.payout_items FOR SELECT
  USING (payout_id IN (
    SELECT id FROM public.payouts WHERE professional_id = auth.uid()
  ));

CREATE POLICY "System can manage payout items"
  ON public.payout_items FOR ALL
  USING (true);

-- RLS Policies for escrow_releases
CREATE POLICY "Users can view releases for their contracts"
  ON public.escrow_releases FOR SELECT
  USING (milestone_id IN (
    SELECT em.id FROM public.escrow_milestones em
    JOIN public.contracts c ON c.id = em.contract_id
    WHERE c.client_id = auth.uid() OR c.tasker_id = auth.uid()
  ));

CREATE POLICY "System can manage escrow releases"
  ON public.escrow_releases FOR ALL
  USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payouts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.refunds;