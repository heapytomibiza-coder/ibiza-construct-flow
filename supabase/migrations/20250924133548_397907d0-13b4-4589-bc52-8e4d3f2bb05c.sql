-- Phase 9: Final Polish & Production Readiness - Security & Performance

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT active_role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.user_has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND roles ? role_name::text
  );
$$;

-- Add performance indexes for analytics and AI tables
CREATE INDEX IF NOT EXISTS idx_ai_runs_user_id_created_at ON ai_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_runs_operation_type ON ai_runs(operation_type);
CREATE INDEX IF NOT EXISTS idx_business_metrics_category_period ON business_metrics(metric_category, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_smart_matches_job_score ON smart_matches(job_id, match_score DESC);
CREATE INDEX IF NOT EXISTS idx_booking_requests_professional_status ON booking_requests(professional_id, status);

-- Add missing tables for real data integration
CREATE TABLE IF NOT EXISTS public.professional_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES booking_requests(id) ON DELETE CASCADE,
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  fee_amount numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.professional_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES booking_requests(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  response text,
  responded_at timestamp with time zone,
  is_verified boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id, booking_id)
);

CREATE TABLE IF NOT EXISTS public.professional_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_bookings integer NOT NULL DEFAULT 0,
  completed_bookings integer NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0,
  average_rating numeric NOT NULL DEFAULT 0,
  total_reviews integer NOT NULL DEFAULT 0,
  response_rate numeric NOT NULL DEFAULT 0,
  completion_rate numeric NOT NULL DEFAULT 0,
  repeat_client_rate numeric NOT NULL DEFAULT 0,
  last_active_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.professional_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for professional_earnings
CREATE POLICY "Professionals can view their own earnings"
ON public.professional_earnings FOR SELECT
USING (auth.uid() = professional_id);

CREATE POLICY "System can manage earnings"
ON public.professional_earnings FOR ALL
USING (auth.uid() IN (SELECT id FROM profiles WHERE roles ? 'admin'));

-- RLS policies for professional_reviews
CREATE POLICY "Anyone can view reviews"
ON public.professional_reviews FOR SELECT
USING (true);

CREATE POLICY "Clients can create reviews for their bookings"
ON public.professional_reviews FOR INSERT
WITH CHECK (
  auth.uid() = client_id AND
  booking_id IN (SELECT id FROM booking_requests WHERE client_id = auth.uid())
);

CREATE POLICY "Review owners can update their reviews"
ON public.professional_reviews FOR UPDATE
USING (auth.uid() = client_id OR auth.uid() = professional_id);

-- RLS policies for professional_stats
CREATE POLICY "Anyone can view professional stats"
ON public.professional_stats FOR SELECT
USING (true);

CREATE POLICY "Professionals can update their own stats"
ON public.professional_stats FOR UPDATE
USING (auth.uid() = professional_id);

CREATE POLICY "System can manage professional stats"
ON public.professional_stats FOR ALL
USING (auth.uid() IN (SELECT id FROM profiles WHERE roles ? 'admin'));

-- Add indexes for new tables
CREATE INDEX idx_professional_earnings_professional_id ON professional_earnings(professional_id);
CREATE INDEX idx_professional_earnings_status ON professional_earnings(status);
CREATE INDEX idx_professional_reviews_professional_id ON professional_reviews(professional_id);
CREATE INDEX idx_professional_reviews_rating ON professional_reviews(rating);
CREATE INDEX idx_professional_stats_professional_id ON professional_stats(professional_id);

-- Create triggers for automatic stats updates
CREATE OR REPLACE FUNCTION public.update_professional_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stats when bookings change status
  IF TG_TABLE_NAME = 'booking_requests' THEN
    INSERT INTO professional_stats (professional_id)
    VALUES (COALESCE(NEW.professional_id, OLD.professional_id))
    ON CONFLICT (professional_id) DO UPDATE SET
      total_bookings = (
        SELECT COUNT(*) FROM booking_requests 
        WHERE professional_id = EXCLUDED.professional_id
      ),
      completed_bookings = (
        SELECT COUNT(*) FROM booking_requests 
        WHERE professional_id = EXCLUDED.professional_id AND status = 'completed'
      ),
      completion_rate = (
        SELECT CASE 
          WHEN COUNT(*) = 0 THEN 0 
          ELSE (COUNT(*) FILTER (WHERE status = 'completed'))::numeric / COUNT(*) * 100 
        END
        FROM booking_requests 
        WHERE professional_id = EXCLUDED.professional_id
      ),
      updated_at = now();
  END IF;

  -- Update stats when reviews are added
  IF TG_TABLE_NAME = 'professional_reviews' THEN
    INSERT INTO professional_stats (professional_id)
    VALUES (NEW.professional_id)
    ON CONFLICT (professional_id) DO UPDATE SET
      total_reviews = (
        SELECT COUNT(*) FROM professional_reviews 
        WHERE professional_id = EXCLUDED.professional_id
      ),
      average_rating = (
        SELECT COALESCE(AVG(rating), 0) FROM professional_reviews 
        WHERE professional_id = EXCLUDED.professional_id
      ),
      updated_at = now();
  END IF;

  -- Update stats when earnings are recorded
  IF TG_TABLE_NAME = 'professional_earnings' THEN
    INSERT INTO professional_stats (professional_id)
    VALUES (NEW.professional_id)
    ON CONFLICT (professional_id) DO UPDATE SET
      total_earnings = (
        SELECT COALESCE(SUM(net_amount), 0) FROM professional_earnings 
        WHERE professional_id = EXCLUDED.professional_id AND status = 'paid'
      ),
      updated_at = now();
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_stats_on_booking ON booking_requests;
CREATE TRIGGER trigger_update_stats_on_booking
  AFTER INSERT OR UPDATE OR DELETE ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION update_professional_stats();

DROP TRIGGER IF EXISTS trigger_update_stats_on_review ON professional_reviews;
CREATE TRIGGER trigger_update_stats_on_review
  AFTER INSERT OR UPDATE OR DELETE ON professional_reviews
  FOR EACH ROW EXECUTE FUNCTION update_professional_stats();

DROP TRIGGER IF EXISTS trigger_update_stats_on_earnings ON professional_earnings;
CREATE TRIGGER trigger_update_stats_on_earnings
  AFTER INSERT OR UPDATE OR DELETE ON professional_earnings
  FOR EACH ROW EXECUTE FUNCTION update_professional_stats();

-- Add updated_at triggers for new tables
CREATE TRIGGER update_professional_earnings_updated_at
  BEFORE UPDATE ON professional_earnings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_reviews_updated_at
  BEFORE UPDATE ON professional_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_stats_updated_at
  BEFORE UPDATE ON professional_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();