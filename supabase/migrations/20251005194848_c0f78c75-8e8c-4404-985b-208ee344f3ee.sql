-- Phase 9: Client & Professional Payment Interfaces (Corrected)
-- Add real-time updates for payment notifications and enable receipt generation

-- Enable realtime for payment-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE payment_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE refund_requests;

-- Add receipt generation function
CREATE OR REPLACE FUNCTION generate_payment_receipt(p_payment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction record;
  v_receipt jsonb;
  v_receipt_number text;
BEGIN
  -- Get transaction details
  SELECT 
    pt.*,
    p.full_name as user_name,
    au.email as user_email
  INTO v_transaction
  FROM payment_transactions pt
  LEFT JOIN auth.users au ON au.id = pt.user_id
  LEFT JOIN profiles p ON p.id = pt.user_id
  WHERE pt.id = p_payment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment transaction not found';
  END IF;

  -- Generate receipt number
  v_receipt_number := 'RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');

  -- Build receipt JSON
  v_receipt := jsonb_build_object(
    'receipt_number', v_receipt_number,
    'payment_id', v_transaction.id,
    'transaction_id', v_transaction.transaction_id,
    'date', v_transaction.created_at,
    'amount', v_transaction.amount,
    'currency', v_transaction.currency,
    'status', v_transaction.status,
    'payment_method', v_transaction.payment_method,
    'customer_name', v_transaction.user_name,
    'customer_email', v_transaction.user_email
  );

  -- Insert into payment_receipts
  INSERT INTO payment_receipts (
    payment_id,
    user_id,
    receipt_number,
    amount,
    currency,
    receipt_data,
    issued_at
  )
  VALUES (
    p_payment_id,
    v_transaction.user_id,
    v_receipt_number,
    v_transaction.amount,
    v_transaction.currency,
    v_receipt,
    NOW()
  )
  ON CONFLICT (payment_id) DO UPDATE SET
    receipt_data = EXCLUDED.receipt_data,
    issued_at = EXCLUDED.issued_at;

  RETURN v_receipt;
END;
$$;

-- Add professional earnings summary function
CREATE OR REPLACE FUNCTION get_professional_earnings_summary(p_professional_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_summary jsonb;
BEGIN
  -- Only allow professionals to view their own earnings
  IF auth.uid() != p_professional_id AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_earnings', COALESCE(SUM(CASE WHEN status IN ('completed', 'succeeded') THEN amount ELSE 0 END), 0),
    'pending_earnings', COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0),
    'total_transactions', COUNT(*),
    'completed_transactions', COUNT(*) FILTER (WHERE status IN ('completed', 'succeeded')),
    'average_transaction', COALESCE(AVG(CASE WHEN status IN ('completed', 'succeeded') THEN amount ELSE NULL END), 0),
    'last_payment_date', MAX(CASE WHEN status IN ('completed', 'succeeded') THEN created_at ELSE NULL END)
  )
  INTO v_summary
  FROM payment_transactions
  WHERE user_id = p_professional_id;

  RETURN v_summary;
END;
$$;

-- Add RLS policies for professional earnings
CREATE POLICY "Professionals can view their own transactions"
ON payment_transactions FOR SELECT
USING (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Add policy for payment receipts
CREATE POLICY "Users can view their own receipts"
ON payment_receipts FOR SELECT
USING (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'admin'::app_role)
);