-- Create review_helpfulness table
CREATE TABLE IF NOT EXISTS public.review_helpfulness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Create review_reports table
CREATE TABLE IF NOT EXISTS public.review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(review_id, reported_by)
);

-- Enable RLS
ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review_helpfulness
CREATE POLICY "Users can manage their own helpfulness votes"
  ON public.review_helpfulness
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view helpfulness counts"
  ON public.review_helpfulness
  FOR SELECT
  USING (true);

-- RLS Policies for review_reports
CREATE POLICY "Users can create reports"
  ON public.review_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view their own reports"
  ON public.review_reports
  FOR SELECT
  USING (auth.uid() = reported_by);

CREATE POLICY "Admins can manage all reports"
  ON public.review_reports
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_review_helpfulness_review ON public.review_helpfulness(review_id);
CREATE INDEX idx_review_helpfulness_user ON public.review_helpfulness(user_id);
CREATE INDEX idx_review_reports_review ON public.review_reports(review_id);
CREATE INDEX idx_review_reports_status ON public.review_reports(status);