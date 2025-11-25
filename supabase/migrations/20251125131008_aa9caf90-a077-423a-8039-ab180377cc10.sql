-- Phase 12: Advanced Payment Management System
-- Corrected with proper payment table column names

DROP TABLE IF EXISTS public.payment_schedules CASCADE;
DROP TABLE IF EXISTS public.scheduled_payments CASCADE;
DROP TABLE IF EXISTS public.payment_refunds CASCADE;
DROP TABLE IF EXISTS public.payment_disputes CASCADE;
DROP TABLE IF EXISTS public.payment_analytics CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;

-- Payment schedules table
CREATE TABLE public.payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES public.profiles(id),
  payee_id UUID NOT NULL REFERENCES public.profiles(id),
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('installment', 'recurring', 'milestone')),
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  frequency TEXT CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'custom')),
  installment_count INTEGER,
  amount_per_payment DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE,
  next_payment_date DATE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scheduled payments table
CREATE TABLE public.scheduled_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.payment_schedules(id) ON DELETE CASCADE,
  payment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'overdue')),
  paid_at TIMESTAMPTZ,
  payment_id UUID REFERENCES public.payments(id),
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment refunds table
CREATE TABLE public.payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  refund_amount DECIMAL(10,2) NOT NULL,
  refund_reason TEXT NOT NULL,
  refund_type TEXT NOT NULL CHECK (refund_type IN ('full', 'partial')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  initiated_by UUID NOT NULL REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  stripe_refund_id TEXT,
  processed_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment disputes table
CREATE TABLE public.payment_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('chargeback', 'fraud', 'unauthorized', 'amount_incorrect', 'service_not_received', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'evidence_required', 'resolved', 'lost', 'won')),
  amount_disputed DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  evidence JSONB DEFAULT '[]'::jsonb,
  stripe_dispute_id TEXT,
  disputed_by UUID NOT NULL REFERENCES public.profiles(id),
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment analytics table
CREATE TABLE public.payment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analytics_date DATE NOT NULL,
  total_transactions INTEGER DEFAULT 0,
  total_volume DECIMAL(12,2) DEFAULT 0,
  total_fees DECIMAL(10,2) DEFAULT 0,
  successful_payments INTEGER DEFAULT 0,
  failed_payments INTEGER DEFAULT 0,
  refunded_payments INTEGER DEFAULT 0,
  refund_volume DECIMAL(10,2) DEFAULT 0,
  avg_transaction_value DECIMAL(10,2) DEFAULT 0,
  disputed_payments INTEGER DEFAULT 0,
  dispute_volume DECIMAL(10,2) DEFAULT 0,
  payment_methods JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(analytics_date)
);

-- Payment methods table
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'paypal', 'other')),
  last4 TEXT,
  brand TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  billing_details JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "sched_view_own" ON public.payment_schedules FOR SELECT TO authenticated
  USING (payer_id = auth.uid() OR payee_id = auth.uid());
CREATE POLICY "sched_admin_all" ON public.payment_schedules FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "sched_pay_view_own" ON public.scheduled_payments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_schedules ps
      WHERE ps.id = scheduled_payments.schedule_id
      AND (ps.payer_id = auth.uid() OR ps.payee_id = auth.uid())
    )
  );

CREATE POLICY "refund_view_own" ON public.payment_refunds FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.payments p
      WHERE p.id = payment_refunds.payment_id
      AND (p.client_id = auth.uid() OR p.professional_id = auth.uid())
    )
  );
CREATE POLICY "refund_create" ON public.payment_refunds FOR INSERT TO authenticated
  WITH CHECK (initiated_by = auth.uid());
CREATE POLICY "refund_admin_all" ON public.payment_refunds FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "disp_view_own" ON public.payment_disputes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.payments p
      WHERE p.id = payment_disputes.payment_id
      AND (p.client_id = auth.uid() OR p.professional_id = auth.uid())
    )
  );
CREATE POLICY "disp_create" ON public.payment_disputes FOR INSERT TO authenticated
  WITH CHECK (disputed_by = auth.uid());
CREATE POLICY "disp_admin_all" ON public.payment_disputes FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "analytics_admin" ON public.payment_analytics FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "pm_view_own" ON public.payment_methods FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "pm_manage_own" ON public.payment_methods FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "pm_admin_view" ON public.payment_methods FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_pay_sched_job ON public.payment_schedules(job_id);
CREATE INDEX idx_pay_sched_payer ON public.payment_schedules(payer_id);
CREATE INDEX idx_pay_sched_payee ON public.payment_schedules(payee_id);
CREATE INDEX idx_pay_sched_active ON public.payment_schedules(is_active, next_payment_date);
CREATE INDEX idx_sched_pay_schedule ON public.scheduled_payments(schedule_id);
CREATE INDEX idx_sched_pay_due ON public.scheduled_payments(due_date, status);
CREATE INDEX idx_refund_payment ON public.payment_refunds(payment_id);
CREATE INDEX idx_refund_status ON public.payment_refunds(status);
CREATE INDEX idx_disp_payment ON public.payment_disputes(payment_id);
CREATE INDEX idx_disp_status ON public.payment_disputes(status, deadline);
CREATE INDEX idx_analytics_date ON public.payment_analytics(analytics_date DESC);
CREATE INDEX idx_pm_user ON public.payment_methods(user_id, is_default);

-- Triggers
CREATE TRIGGER trg_pay_sched_upd BEFORE UPDATE ON public.payment_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_professional_metrics_timestamp();
CREATE TRIGGER trg_sched_pay_upd BEFORE UPDATE ON public.scheduled_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_professional_metrics_timestamp();
CREATE TRIGGER trg_refund_upd BEFORE UPDATE ON public.payment_refunds
  FOR EACH ROW EXECUTE FUNCTION public.update_professional_metrics_timestamp();
CREATE TRIGGER trg_disp_upd BEFORE UPDATE ON public.payment_disputes
  FOR EACH ROW EXECUTE FUNCTION public.update_professional_metrics_timestamp();
CREATE TRIGGER trg_pm_upd BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_professional_metrics_timestamp();