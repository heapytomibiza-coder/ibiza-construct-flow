-- Create payment schedules table for managing installment payment plans
CREATE TABLE IF NOT EXISTS payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount > 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  installment_count INTEGER NOT NULL CHECK (installment_count > 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  next_payment_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create scheduled payments table for individual installments
CREATE TABLE IF NOT EXISTS scheduled_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES payment_schedules(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL CHECK (installment_number > 0),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled')),
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  stripe_payment_intent_id TEXT,
  failure_reason TEXT,
  reminder_sent_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(schedule_id, installment_number)
);

-- Enable RLS
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_schedules
CREATE POLICY "Users can view their own payment schedules"
  ON payment_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment schedules"
  ON payment_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment schedules"
  ON payment_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payment schedules"
  ON payment_schedules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for scheduled_payments
CREATE POLICY "Users can view their scheduled payments"
  ON scheduled_payments FOR SELECT
  USING (
    schedule_id IN (
      SELECT id FROM payment_schedules WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage scheduled payments"
  ON scheduled_payments FOR ALL
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_payment_schedules_user_id ON payment_schedules(user_id);
CREATE INDEX idx_payment_schedules_job_id ON payment_schedules(job_id);
CREATE INDEX idx_payment_schedules_status ON payment_schedules(status);
CREATE INDEX idx_payment_schedules_next_payment_date ON payment_schedules(next_payment_date);
CREATE INDEX idx_scheduled_payments_schedule_id ON scheduled_payments(schedule_id);
CREATE INDEX idx_scheduled_payments_due_date ON scheduled_payments(due_date);
CREATE INDEX idx_scheduled_payments_status ON scheduled_payments(status);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_schedules_updated_at
  BEFORE UPDATE ON payment_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_schedules_updated_at();

CREATE TRIGGER scheduled_payments_updated_at
  BEFORE UPDATE ON scheduled_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_schedules_updated_at();

-- Function to create payment schedule with installments
CREATE OR REPLACE FUNCTION create_payment_schedule(
  p_job_id UUID,
  p_total_amount NUMERIC,
  p_currency TEXT,
  p_installment_count INTEGER,
  p_frequency TEXT,
  p_start_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_schedule_id UUID;
  v_installment_amount NUMERIC;
  v_current_date TIMESTAMPTZ;
  v_interval INTERVAL;
  v_i INTEGER;
BEGIN
  -- Validate user owns the job
  IF NOT EXISTS (
    SELECT 1 FROM jobs WHERE id = p_job_id AND client_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Not the job owner';
  END IF;

  -- Calculate installment amount
  v_installment_amount := p_total_amount / p_installment_count;
  
  -- Determine interval based on frequency
  v_interval := CASE p_frequency
    WHEN 'weekly' THEN INTERVAL '1 week'
    WHEN 'biweekly' THEN INTERVAL '2 weeks'
    WHEN 'monthly' THEN INTERVAL '1 month'
  END;

  -- Create payment schedule
  INSERT INTO payment_schedules (
    job_id,
    user_id,
    total_amount,
    currency,
    installment_count,
    frequency,
    next_payment_date,
    status
  ) VALUES (
    p_job_id,
    auth.uid(),
    p_total_amount,
    p_currency,
    p_installment_count,
    p_frequency,
    p_start_date,
    'active'
  ) RETURNING id INTO v_schedule_id;

  -- Create scheduled payment records
  v_current_date := p_start_date;
  FOR v_i IN 1..p_installment_count LOOP
    INSERT INTO scheduled_payments (
      schedule_id,
      installment_number,
      amount,
      currency,
      due_date,
      status
    ) VALUES (
      v_schedule_id,
      v_i,
      v_installment_amount,
      p_currency,
      v_current_date,
      'pending'
    );
    
    v_current_date := v_current_date + v_interval;
  END LOOP;

  RETURN v_schedule_id;
END;
$$;

-- Function to get upcoming payments
CREATE OR REPLACE FUNCTION get_upcoming_payments(
  p_user_id UUID DEFAULT auth.uid(),
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
  payment_id UUID,
  schedule_id UUID,
  job_id UUID,
  installment_number INTEGER,
  amount NUMERIC,
  currency TEXT,
  due_date TIMESTAMPTZ,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id as payment_id,
    sp.schedule_id,
    ps.job_id,
    sp.installment_number,
    sp.amount,
    sp.currency,
    sp.due_date,
    sp.status
  FROM scheduled_payments sp
  JOIN payment_schedules ps ON ps.id = sp.schedule_id
  WHERE ps.user_id = p_user_id
    AND sp.status = 'pending'
    AND sp.due_date <= NOW() + (p_days_ahead || ' days')::INTERVAL
  ORDER BY sp.due_date ASC;
END;
$$;

COMMENT ON TABLE payment_schedules IS 'Stores payment plan configurations for installment payments';
COMMENT ON TABLE scheduled_payments IS 'Individual installment payment records for payment schedules';
COMMENT ON FUNCTION create_payment_schedule IS 'Creates a payment schedule with automated installment generation';
COMMENT ON FUNCTION get_upcoming_payments IS 'Retrieves upcoming scheduled payments for a user';
