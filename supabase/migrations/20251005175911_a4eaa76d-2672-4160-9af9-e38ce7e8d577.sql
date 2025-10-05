-- Drop table if it exists to start fresh
DROP TABLE IF EXISTS public.professional_portfolio CASCADE;

-- Create professional_portfolio table for portfolio items
CREATE TABLE public.professional_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  project_date DATE,
  category TEXT,
  client_name TEXT,
  skills_used TEXT[] DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.professional_portfolio ENABLE ROW LEVEL SECURITY;

-- Policies for professional_portfolio
CREATE POLICY "Professionals can view their own portfolio items"
  ON public.professional_portfolio
  FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can create their own portfolio items"
  ON public.professional_portfolio
  FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their own portfolio items"
  ON public.professional_portfolio
  FOR UPDATE
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can delete their own portfolio items"
  ON public.professional_portfolio
  FOR DELETE
  USING (auth.uid() = professional_id);

CREATE POLICY "Public can view featured portfolio items"
  ON public.professional_portfolio
  FOR SELECT
  USING (is_featured = true);

-- Indexes
CREATE INDEX idx_professional_portfolio_professional_id ON public.professional_portfolio(professional_id);
CREATE INDEX idx_professional_portfolio_featured ON public.professional_portfolio(is_featured) WHERE is_featured = true;
CREATE INDEX idx_professional_portfolio_category ON public.professional_portfolio(category);

-- Trigger for updated_at
CREATE TRIGGER update_professional_portfolio_updated_at
  BEFORE UPDATE ON public.professional_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();