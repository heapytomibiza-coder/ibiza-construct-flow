-- Phase 7 Enhanced: Per-Category Reputation & AI Review Summaries

-- Professional category ratings table (aggregated stats per micro-service)
CREATE TABLE IF NOT EXISTS public.professional_category_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  micro_service_id UUID REFERENCES public.micro_services(id) ON DELETE CASCADE,
  
  -- Aggregated ratings for this specific category
  average_rating NUMERIC(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  
  -- Detailed category breakdowns
  avg_timeliness NUMERIC(3,2) DEFAULT 0,
  avg_communication NUMERIC(3,2) DEFAULT 0,
  avg_value NUMERIC(3,2) DEFAULT 0,
  avg_quality NUMERIC(3,2) DEFAULT 0,
  avg_professionalism NUMERIC(3,2) DEFAULT 0,
  
  -- Rating distribution
  five_star_count INTEGER DEFAULT 0,
  four_star_count INTEGER DEFAULT 0,
  three_star_count INTEGER DEFAULT 0,
  two_star_count INTEGER DEFAULT 0,
  one_star_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(professional_id, micro_service_id)
);

-- AI-generated review summaries
CREATE TABLE IF NOT EXISTS public.review_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  micro_service_id UUID REFERENCES public.micro_services(id) ON DELETE CASCADE,
  
  -- AI-generated content
  summary_text TEXT NOT NULL,
  key_strengths TEXT[] DEFAULT '{}',
  common_praise TEXT[] DEFAULT '{}',
  areas_mentioned TEXT[] DEFAULT '{}',
  
  -- Generation metadata
  reviews_analyzed INTEGER DEFAULT 0,
  last_generated_at TIMESTAMPTZ DEFAULT NOW(),
  confidence_score NUMERIC(3,2), -- How confident the AI is in this summary
  
  -- Versioning
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(professional_id, micro_service_id, version)
);

-- Indexes for performance
CREATE INDEX idx_category_ratings_professional ON public.professional_category_ratings(professional_id);
CREATE INDEX idx_category_ratings_micro ON public.professional_category_ratings(micro_service_id);
CREATE INDEX idx_category_ratings_rating ON public.professional_category_ratings(average_rating DESC);

CREATE INDEX idx_review_summaries_professional ON public.review_summaries(professional_id);
CREATE INDEX idx_review_summaries_active ON public.review_summaries(is_active) WHERE is_active = true;
CREATE INDEX idx_review_summaries_micro ON public.review_summaries(micro_service_id);

-- RLS Policies
ALTER TABLE public.professional_category_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_summaries ENABLE ROW LEVEL SECURITY;

-- Anyone can read category ratings
CREATE POLICY "Anyone can view category ratings"
  ON public.professional_category_ratings
  FOR SELECT
  USING (true);

-- Only system can write (via functions/triggers)
CREATE POLICY "Only authenticated users can manage category ratings"
  ON public.professional_category_ratings
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Anyone can read active summaries
CREATE POLICY "Anyone can view active review summaries"
  ON public.review_summaries
  FOR SELECT
  USING (is_active = true);

-- Only authenticated can manage summaries
CREATE POLICY "Authenticated users can manage review summaries"
  ON public.review_summaries
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Function to recalculate category ratings
CREATE OR REPLACE FUNCTION public.recalculate_category_ratings(p_professional_id UUID, p_micro_service_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats RECORD;
BEGIN
  -- Get aggregated stats from reviews
  SELECT 
    AVG(r.overall_rating) as avg_overall,
    COUNT(*) as total,
    AVG(r.timeliness_rating) as avg_timeliness,
    AVG(r.communication_rating) as avg_communication,
    AVG(r.value_rating) as avg_value,
    AVG(r.quality_rating) as avg_quality,
    AVG(r.professionalism_rating) as avg_professionalism,
    COUNT(*) FILTER (WHERE ROUND(r.overall_rating) = 5) as five_star,
    COUNT(*) FILTER (WHERE ROUND(r.overall_rating) = 4) as four_star,
    COUNT(*) FILTER (WHERE ROUND(r.overall_rating) = 3) as three_star,
    COUNT(*) FILTER (WHERE ROUND(r.overall_rating) = 2) as two_star,
    COUNT(*) FILTER (WHERE ROUND(r.overall_rating) = 1) as one_star
  INTO v_stats
  FROM public.reviews r
  LEFT JOIN public.jobs j ON j.id = r.job_id
  WHERE r.reviewee_id = p_professional_id
    AND r.status = 'active'
    AND (p_micro_service_id IS NULL OR j.micro_uuid = p_micro_service_id);

  IF v_stats.total > 0 THEN
    -- Upsert category ratings
    INSERT INTO public.professional_category_ratings (
      professional_id,
      micro_service_id,
      average_rating,
      total_reviews,
      avg_timeliness,
      avg_communication,
      avg_value,
      avg_quality,
      avg_professionalism,
      five_star_count,
      four_star_count,
      three_star_count,
      two_star_count,
      one_star_count,
      updated_at
    ) VALUES (
      p_professional_id,
      p_micro_service_id,
      v_stats.avg_overall,
      v_stats.total,
      v_stats.avg_timeliness,
      v_stats.avg_communication,
      v_stats.avg_value,
      v_stats.avg_quality,
      v_stats.avg_professionalism,
      v_stats.five_star,
      v_stats.four_star,
      v_stats.three_star,
      v_stats.two_star,
      v_stats.one_star,
      NOW()
    )
    ON CONFLICT (professional_id, micro_service_id)
    DO UPDATE SET
      average_rating = EXCLUDED.average_rating,
      total_reviews = EXCLUDED.total_reviews,
      avg_timeliness = EXCLUDED.avg_timeliness,
      avg_communication = EXCLUDED.avg_communication,
      avg_value = EXCLUDED.avg_value,
      avg_quality = EXCLUDED.avg_quality,
      avg_professionalism = EXCLUDED.avg_professionalism,
      five_star_count = EXCLUDED.five_star_count,
      four_star_count = EXCLUDED.four_star_count,
      three_star_count = EXCLUDED.three_star_count,
      two_star_count = EXCLUDED.two_star_count,
      one_star_count = EXCLUDED.one_star_count,
      updated_at = NOW();
  END IF;
END;
$$;

-- Trigger to update category ratings when reviews change
CREATE OR REPLACE FUNCTION public.trigger_update_category_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_micro_service_id UUID;
BEGIN
  -- Get micro_service_id from job
  SELECT j.micro_uuid INTO v_micro_service_id
  FROM public.jobs j
  WHERE j.id = COALESCE(NEW.job_id, OLD.job_id);

  -- Recalculate for this professional and category
  PERFORM public.recalculate_category_ratings(
    COALESCE(NEW.reviewee_id, OLD.reviewee_id),
    v_micro_service_id
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger on reviews table
DROP TRIGGER IF EXISTS update_category_ratings_on_review ON public.reviews;
CREATE TRIGGER update_category_ratings_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_category_ratings();