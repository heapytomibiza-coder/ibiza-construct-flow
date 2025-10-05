-- Create payment analytics aggregations table
CREATE TABLE IF NOT EXISTS public.payment_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  period_type text NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  total_revenue numeric NOT NULL DEFAULT 0,
  total_expenses numeric NOT NULL DEFAULT 0,
  total_escrow numeric NOT NULL DEFAULT 0,
  total_refunds numeric NOT NULL DEFAULT 0,
  transaction_count integer NOT NULL DEFAULT 0,
  unique_clients integer NOT NULL DEFAULT 0,
  unique_professionals integer NOT NULL DEFAULT 0,
  average_transaction numeric NOT NULL DEFAULT 0,
  payment_method_breakdown jsonb DEFAULT '{}'::jsonb,
  status_breakdown jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_start, period_type)
);

-- Create financial reports table
CREATE TABLE IF NOT EXISTS public.financial_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('income_statement', 'balance_sheet', 'cash_flow', 'tax_summary', 'payout_summary')),
  report_name text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  report_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  file_url text,
  status text NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  generated_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create payment reconciliation table
CREATE TABLE IF NOT EXISTS public.payment_reconciliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reconciliation_date timestamptz NOT NULL,
  expected_amount numeric NOT NULL,
  actual_amount numeric NOT NULL,
  difference numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reconciled', 'discrepancy')),
  notes text,
  reconciled_by uuid REFERENCES auth.users(id),
  reconciled_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reconciliations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_analytics
CREATE POLICY "Users can view their own analytics"
  ON public.payment_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage analytics"
  ON public.payment_analytics FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for financial_reports
CREATE POLICY "Users can view their own reports"
  ON public.financial_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
  ON public.financial_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update reports"
  ON public.financial_reports FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for payment_reconciliations
CREATE POLICY "Users can view their own reconciliations"
  ON public.payment_reconciliations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reconciliations"
  ON public.payment_reconciliations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their reconciliations"
  ON public.payment_reconciliations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_payment_analytics_user ON public.payment_analytics(user_id);
CREATE INDEX idx_payment_analytics_period ON public.payment_analytics(period_start, period_end);
CREATE INDEX idx_financial_reports_user ON public.financial_reports(user_id);
CREATE INDEX idx_financial_reports_type ON public.financial_reports(report_type);
CREATE INDEX idx_payment_reconciliations_user ON public.payment_reconciliations(user_id);
CREATE INDEX idx_payment_reconciliations_date ON public.payment_reconciliations(reconciliation_date);

-- Add trigger for updated_at
CREATE TRIGGER update_payment_analytics_updated_at
  BEFORE UPDATE ON public.payment_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_reports_updated_at
  BEFORE UPDATE ON public.financial_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_reconciliations_updated_at
  BEFORE UPDATE ON public.payment_reconciliations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();