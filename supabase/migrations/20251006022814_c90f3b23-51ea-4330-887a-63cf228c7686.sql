-- Add Stripe tracking columns to payment tables

-- Add stripe_refund_id to refund_requests if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'refund_requests' AND column_name = 'stripe_refund_id'
  ) THEN
    ALTER TABLE refund_requests 
    ADD COLUMN stripe_refund_id text;
  END IF;
END $$;

-- Add stripe_payment_intent_id to payment_transactions if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_transactions' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE payment_transactions 
    ADD COLUMN stripe_payment_intent_id text;
    
    -- Add index for faster lookups
    CREATE INDEX idx_payment_transactions_stripe_payment_intent_id 
    ON payment_transactions(stripe_payment_intent_id);
  END IF;
END $$;

-- Add index for stripe_refund_id lookups
CREATE INDEX IF NOT EXISTS idx_refund_requests_stripe_refund_id 
ON refund_requests(stripe_refund_id);

-- Add comment for documentation
COMMENT ON COLUMN payment_transactions.stripe_payment_intent_id IS 'Stripe PaymentIntent ID for tracking payment status';
COMMENT ON COLUMN refund_requests.stripe_refund_id IS 'Stripe Refund ID for tracking refund status';
