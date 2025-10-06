-- Phase 22: Reviews & Rating System

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  category_ratings jsonb DEFAULT '{}'::jsonb, -- {professionalism: 5, quality: 4, communication: 5, timeliness: 4}
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  unhelpful_count integer DEFAULT 0,
  response_text text,
  response_at timestamp with time zone,
  flagged_at timestamp with time zone,
  flag_reason text,
  moderation_status text DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes text,
  moderated_by uuid REFERENCES auth.users(id),
  moderated_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create review_helpful_votes table
CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful boolean NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Create review_responses table
CREATE TABLE IF NOT EXISTS public.review_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  responder_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create review_media table
CREATE TABLE IF NOT EXISTS public.review_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_name text,
  file_size integer,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Create rating_summary table (cached aggregates)
CREATE TABLE IF NOT EXISTS public.rating_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role text NOT NULL CHECK (role IN ('professional', 'client')),
  total_reviews integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0,
  rating_distribution jsonb DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb,
  category_averages jsonb DEFAULT '{}'::jsonb,
  response_rate numeric(3,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Reviews are publicly readable"
ON public.reviews FOR SELECT
USING (moderation_status = 'approved');

CREATE POLICY "Users can create reviews for completed jobs"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM contracts c
    WHERE c.job_id = reviews.job_id
    AND (c.client_id = auth.uid() OR c.tasker_id = auth.uid())
  )
);

CREATE POLICY "Reviewers can update their own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = reviewer_id);

CREATE POLICY "Reviewees can respond to their reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = reviewee_id)
WITH CHECK (auth.uid() = reviewee_id);

CREATE POLICY "Admins can manage all reviews"
ON public.reviews FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for review_helpful_votes
CREATE POLICY "Users can view helpful votes"
ON public.review_helpful_votes FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own helpful votes"
ON public.review_helpful_votes FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for review_responses
CREATE POLICY "Review responses are publicly readable"
ON public.review_responses FOR SELECT
USING (true);

CREATE POLICY "Reviewees can create responses"
ON public.review_responses FOR INSERT
WITH CHECK (
  auth.uid() = responder_id AND
  EXISTS (
    SELECT 1 FROM reviews r
    WHERE r.id = review_responses.review_id
    AND r.reviewee_id = auth.uid()
  )
);

-- RLS Policies for review_media
CREATE POLICY "Review media is publicly readable"
ON public.review_media FOR SELECT
USING (true);

CREATE POLICY "Reviewers can add media to their reviews"
ON public.review_media FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM reviews r
    WHERE r.id = review_media.review_id
    AND r.reviewer_id = auth.uid()
  )
);

-- RLS Policies for rating_summary
CREATE POLICY "Rating summaries are publicly readable"
ON public.rating_summary FOR SELECT
USING (true);

-- Indexes
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_job ON public.reviews(job_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_moderation ON public.reviews(moderation_status);
CREATE INDEX idx_reviews_created ON public.reviews(created_at DESC);
CREATE INDEX idx_review_helpful_votes_review ON public.review_helpful_votes(review_id);
CREATE INDEX idx_rating_summary_user ON public.rating_summary(user_id);

-- Function to calculate and update rating summary
CREATE OR REPLACE FUNCTION public.update_rating_summary(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_reviews integer;
  v_avg_rating numeric;
  v_distribution jsonb;
  v_category_avgs jsonb;
  v_total_with_response integer;
  v_response_rate numeric;
BEGIN
  -- Get basic stats
  SELECT 
    COUNT(*),
    COALESCE(AVG(rating), 0)
  INTO v_total_reviews, v_avg_rating
  FROM reviews
  WHERE reviewee_id = p_user_id
    AND moderation_status = 'approved';

  -- Calculate rating distribution
  SELECT jsonb_object_agg(rating::text, count)
  INTO v_distribution
  FROM (
    SELECT rating, COUNT(*) as count
    FROM reviews
    WHERE reviewee_id = p_user_id
      AND moderation_status = 'approved'
    GROUP BY rating
  ) dist;

  -- Calculate category averages
  SELECT jsonb_object_agg(key, avg_value)
  INTO v_category_avgs
  FROM (
    SELECT 
      key,
      AVG((value)::numeric) as avg_value
    FROM reviews,
    LATERAL jsonb_each_text(category_ratings)
    WHERE reviewee_id = p_user_id
      AND moderation_status = 'approved'
    GROUP BY key
  ) cats;

  -- Calculate response rate
  SELECT 
    COUNT(*) FILTER (WHERE response_text IS NOT NULL),
    COUNT(*)
  INTO v_total_with_response, v_total_reviews
  FROM reviews
  WHERE reviewee_id = p_user_id
    AND moderation_status = 'approved';

  v_response_rate := CASE 
    WHEN v_total_reviews > 0 THEN (v_total_with_response::numeric / v_total_reviews) * 100 
    ELSE 0 
  END;

  -- Upsert rating summary
  INSERT INTO rating_summary (
    user_id,
    role,
    total_reviews,
    average_rating,
    rating_distribution,
    category_averages,
    response_rate,
    updated_at
  ) VALUES (
    p_user_id,
    p_role,
    v_total_reviews,
    v_avg_rating,
    COALESCE(v_distribution, '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb),
    COALESCE(v_category_avgs, '{}'::jsonb),
    v_response_rate,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_reviews = EXCLUDED.total_reviews,
    average_rating = EXCLUDED.average_rating,
    rating_distribution = EXCLUDED.rating_distribution,
    category_averages = EXCLUDED.category_averages,
    response_rate = EXCLUDED.response_rate,
    updated_at = now();
END;
$$;

-- Function to get reviews with filters
CREATE OR REPLACE FUNCTION public.get_reviews_for_user(
  p_user_id uuid,
  p_min_rating integer DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  job_id uuid,
  reviewer_id uuid,
  reviewer_name text,
  reviewer_avatar text,
  rating integer,
  title text,
  comment text,
  category_ratings jsonb,
  is_verified boolean,
  helpful_count integer,
  response_text text,
  response_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.job_id,
    r.reviewer_id,
    p.full_name as reviewer_name,
    p.avatar_url as reviewer_avatar,
    r.rating,
    r.title,
    r.comment,
    r.category_ratings,
    r.is_verified,
    r.helpful_count,
    r.response_text,
    r.response_at,
    r.created_at
  FROM reviews r
  LEFT JOIN profiles p ON p.id = r.reviewer_id
  WHERE r.reviewee_id = p_user_id
    AND r.moderation_status = 'approved'
    AND (p_min_rating IS NULL OR r.rating >= p_min_rating)
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Trigger to update rating summary when review changes
CREATE OR REPLACE FUNCTION public.trigger_update_rating_summary()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_role text;
BEGIN
  -- Determine role based on reviewee
  SELECT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id) AND role = 'professional') THEN 'professional'
      ELSE 'client'
    END INTO v_role;

  PERFORM update_rating_summary(COALESCE(NEW.reviewee_id, OLD.reviewee_id), v_role);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_rating_summary_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_rating_summary();

-- Trigger to update helpful counts
CREATE OR REPLACE FUNCTION public.update_review_helpful_counts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    ELSE
      UPDATE reviews SET unhelpful_count = unhelpful_count + 1 WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.is_helpful != NEW.is_helpful THEN
    IF NEW.is_helpful THEN
      UPDATE reviews SET 
        helpful_count = helpful_count + 1,
        unhelpful_count = unhelpful_count - 1
      WHERE id = NEW.review_id;
    ELSE
      UPDATE reviews SET 
        helpful_count = helpful_count - 1,
        unhelpful_count = unhelpful_count + 1
      WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
    ELSE
      UPDATE reviews SET unhelpful_count = unhelpful_count - 1 WHERE id = OLD.review_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_helpful_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_helpful_counts();

-- Trigger to prevent duplicate reviews
CREATE OR REPLACE FUNCTION public.prevent_duplicate_reviews()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reviews
    WHERE job_id = NEW.job_id
      AND reviewer_id = NEW.reviewer_id
      AND reviewee_id = NEW.reviewee_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'You have already reviewed this job';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_duplicate_review
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_duplicate_reviews();