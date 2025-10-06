-- Create exchange rates table for currency conversions
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL CHECK (from_currency ~ '^[A-Z]{3}$'),
  to_currency TEXT NOT NULL CHECK (to_currency ~ '^[A-Z]{3}$'),
  rate NUMERIC(20, 10) NOT NULL CHECK (rate > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_currency, to_currency)
);

-- Enable RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- RLS policies - exchange rates are publicly readable
CREATE POLICY "Exchange rates are publicly readable"
  ON exchange_rates FOR SELECT
  USING (true);

CREATE POLICY "System can manage exchange rates"
  ON exchange_rates FOR ALL
  USING (true);

-- Create indexes
CREATE INDEX idx_exchange_rates_from_currency ON exchange_rates(from_currency);
CREATE INDEX idx_exchange_rates_to_currency ON exchange_rates(to_currency);
CREATE INDEX idx_exchange_rates_pair ON exchange_rates(from_currency, to_currency);

-- Add preferred_currency to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'preferred_currency'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN preferred_currency TEXT DEFAULT 'EUR' CHECK (preferred_currency ~ '^[A-Z]{3}$');
  END IF;
END $$;

-- Function to get exchange rate
CREATE OR REPLACE FUNCTION get_exchange_rate(
  p_from_currency TEXT,
  p_to_currency TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rate NUMERIC;
BEGIN
  -- If same currency, return 1
  IF p_from_currency = p_to_currency THEN
    RETURN 1.0;
  END IF;

  -- Try direct conversion
  SELECT rate INTO v_rate
  FROM exchange_rates
  WHERE from_currency = p_from_currency
    AND to_currency = p_to_currency
  ORDER BY updated_at DESC
  LIMIT 1;

  IF v_rate IS NOT NULL THEN
    RETURN v_rate;
  END IF;

  -- Try inverse conversion
  SELECT 1.0 / rate INTO v_rate
  FROM exchange_rates
  WHERE from_currency = p_to_currency
    AND to_currency = p_from_currency
  ORDER BY updated_at DESC
  LIMIT 1;

  IF v_rate IS NOT NULL THEN
    RETURN v_rate;
  END IF;

  -- If no rate found, return NULL
  RETURN NULL;
END;
$$;

-- Function to convert amount between currencies
CREATE OR REPLACE FUNCTION convert_currency(
  p_amount NUMERIC,
  p_from_currency TEXT,
  p_to_currency TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rate NUMERIC;
BEGIN
  v_rate := get_exchange_rate(p_from_currency, p_to_currency);
  
  IF v_rate IS NULL THEN
    RAISE EXCEPTION 'Exchange rate not found for % to %', p_from_currency, p_to_currency;
  END IF;

  RETURN ROUND(p_amount * v_rate, 2);
END;
$$;

-- Insert some initial exchange rates (these should be updated regularly)
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
  ('EUR', 'USD', 1.09),
  ('EUR', 'GBP', 0.86),
  ('EUR', 'JPY', 163.50),
  ('EUR', 'CHF', 0.95),
  ('EUR', 'CAD', 1.47),
  ('EUR', 'AUD', 1.66),
  ('USD', 'EUR', 0.92),
  ('USD', 'GBP', 0.79),
  ('USD', 'JPY', 150.00),
  ('GBP', 'EUR', 1.16),
  ('GBP', 'USD', 1.27)
ON CONFLICT (from_currency, to_currency) 
DO UPDATE SET 
  rate = EXCLUDED.rate,
  updated_at = NOW();

-- Create view for currency pairs with both directions
CREATE OR REPLACE VIEW currency_exchange_pairs AS
SELECT 
  from_currency,
  to_currency,
  rate,
  updated_at
FROM exchange_rates
UNION ALL
SELECT 
  to_currency as from_currency,
  from_currency as to_currency,
  1.0 / rate as rate,
  updated_at
FROM exchange_rates;

COMMENT ON TABLE exchange_rates IS 'Stores currency exchange rates for multi-currency support';
COMMENT ON FUNCTION get_exchange_rate IS 'Gets the exchange rate between two currencies';
COMMENT ON FUNCTION convert_currency IS 'Converts an amount from one currency to another';
COMMENT ON VIEW currency_exchange_pairs IS 'Bidirectional view of all currency exchange rates';
