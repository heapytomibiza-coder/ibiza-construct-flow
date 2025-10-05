-- Add admin payment management policies and functions

-- Add admin policies for refund_requests
CREATE POLICY "Admins can view all refund requests"
  ON public.refund_requests FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update refund requests"
  ON public.refund_requests FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin policies for payment_transactions
CREATE POLICY "Admins can view all transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update transactions"
  ON public.payment_transactions FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin policies for disputes
CREATE POLICY "Admins can view all disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin policies for payment_notifications
CREATE POLICY "Admins can view all notifications"
  ON public.payment_notifications FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to get payment statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_payment_statistics(
  p_start_date timestamptz DEFAULT now() - interval '30 days',
  p_end_date timestamptz DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only allow admins to run this
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_transactions', (
      SELECT COUNT(*) FROM payment_transactions 
      WHERE created_at BETWEEN p_start_date AND p_end_date
    ),
    'total_amount', (
      SELECT COALESCE(SUM(amount), 0) FROM payment_transactions 
      WHERE created_at BETWEEN p_start_date AND p_end_date AND status IN ('completed', 'succeeded')
    ),
    'pending_refunds', (
      SELECT COUNT(*) FROM refund_requests WHERE status = 'pending'
    ),
    'active_disputes', (
      SELECT COUNT(*) FROM disputes WHERE status IN ('open', 'in_progress')
    ),
    'failed_transactions', (
      SELECT COUNT(*) FROM payment_transactions 
      WHERE created_at BETWEEN p_start_date AND p_end_date AND status IN ('failed', 'cancelled')
    )
  ) INTO result;

  RETURN result;
END;
$$;