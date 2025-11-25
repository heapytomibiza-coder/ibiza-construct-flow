-- Drop existing reviews table and related objects if they exist
DROP TABLE IF EXISTS public.review_votes CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP FUNCTION IF EXISTS public.calculate_overall_rating() CASCADE;
DROP FUNCTION IF EXISTS public.update_review_helpful_count() CASCADE;

-- Create reviews table with multi-category ratings
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Relationships
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Multi-category ratings (1-5 stars each)
  timeliness_rating INTEGER NOT NULL CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  communication_rating INTEGER NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  value_rating INTEGER NOT NULL CHECK (value_rating >= 1 AND value_rating <= 5),
  quality_rating INTEGER NOT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
  professionalism_rating INTEGER NOT NULL CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  
  -- Overall rating (auto-calculated as average)
  overall_rating NUMERIC(3,2) NOT NULL,
  
  -- Optional content
  title TEXT,
  comment TEXT,
  photos TEXT[], -- Array of photo URLs
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'reported', 'removed')),
  is_verified BOOLEAN DEFAULT false, -- Verified purchase/completion
  
  -- Engagement metrics
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Response from professional
  response_text TEXT,
  response_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT one_review_per_job UNIQUE (job_id, reviewer_id, reviewee_id)
);

-- Create review_votes table (helpful/not helpful)
CREATE TABLE public.review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  
  CONSTRAINT one_vote_per_review UNIQUE (review_id, voter_id)
);

-- Create indexes
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_job ON public.reviews(job_id);
CREATE INDEX idx_reviews_contract ON public.reviews(contract_id);
CREATE INDEX idx_reviews_overall_rating ON public.reviews(overall_rating);
CREATE INDEX idx_review_votes_review ON public.review_votes(review_id);

-- Function to calculate overall rating from category ratings
CREATE OR REPLACE FUNCTION public.calculate_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
  NEW.overall_rating := (
    NEW.timeliness_rating + 
    NEW.communication_rating + 
    NEW.value_rating + 
    NEW.quality_rating + 
    NEW.professionalism_rating
  )::NUMERIC / 5;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate overall rating
CREATE TRIGGER calculate_overall_rating_trigger
BEFORE INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.calculate_overall_rating();

-- Function to update helpful counts
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'helpful' THEN
      UPDATE public.reviews 
      SET helpful_count = helpful_count + 1 
      WHERE id = NEW.review_id;
    ELSE
      UPDATE public.reviews 
      SET not_helpful_count = not_helpful_count + 1 
      WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'helpful' THEN
      UPDATE public.reviews 
      SET helpful_count = helpful_count - 1 
      WHERE id = OLD.review_id;
    ELSE
      UPDATE public.reviews 
      SET not_helpful_count = not_helpful_count - 1 
      WHERE id = OLD.review_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.vote_type != NEW.vote_type THEN
    -- Vote type changed
    IF NEW.vote_type = 'helpful' THEN
      UPDATE public.reviews 
      SET helpful_count = helpful_count + 1,
          not_helpful_count = not_helpful_count - 1
      WHERE id = NEW.review_id;
    ELSE
      UPDATE public.reviews 
      SET helpful_count = helpful_count - 1,
          not_helpful_count = not_helpful_count + 1
      WHERE id = NEW.review_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for vote counting
CREATE TRIGGER update_review_helpful_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.review_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_review_helpful_count();

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view active reviews"
ON public.reviews FOR SELECT
USING (status = 'active');

CREATE POLICY "Authenticated users can create reviews"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = reviewer_id
  AND EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE c.id = contract_id
    AND c.escrow_status = 'released'
    AND (c.client_id = auth.uid() OR c.tasker_id = auth.uid())
  )
);

CREATE POLICY "Reviewers can update their own reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (auth.uid() = reviewer_id)
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewees can add responses"
ON public.reviews FOR UPDATE
TO authenticated
USING (auth.uid() = reviewee_id)
WITH CHECK (auth.uid() = reviewee_id);

-- RLS Policies for review votes
CREATE POLICY "Anyone can view votes"
ON public.review_votes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can vote"
ON public.review_votes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can update their votes"
ON public.review_votes FOR UPDATE
TO authenticated
USING (auth.uid() = voter_id)
WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can delete their votes"
ON public.review_votes FOR DELETE
TO authenticated
USING (auth.uid() = voter_id);