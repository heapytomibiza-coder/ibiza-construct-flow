-- Create profile views tracking table
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create index for better performance
CREATE INDEX idx_profile_views_professional ON public.profile_views(professional_id);
CREATE INDEX idx_profile_views_viewed_at ON public.profile_views(viewed_at DESC);
CREATE INDEX idx_profile_views_session ON public.profile_views(professional_id, session_id);

-- Enable RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Professionals can view their own stats
CREATE POLICY "Professionals can view their own profile views"
  ON public.profile_views
  FOR SELECT
  USING (auth.uid() = professional_id);

-- System can insert views
CREATE POLICY "System can track profile views"
  ON public.profile_views
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all
CREATE POLICY "Admins can view all profile views"
  ON public.profile_views
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Function to get profile view count (unique sessions)
CREATE OR REPLACE FUNCTION public.get_profile_view_count(p_professional_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT session_id)::INTEGER
    FROM public.profile_views
    WHERE professional_id = p_professional_id
  );
END;
$$;

-- Function to get recent views (last 30 days)
CREATE OR REPLACE FUNCTION public.get_recent_profile_views(p_professional_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT session_id)::INTEGER
    FROM public.profile_views
    WHERE professional_id = p_professional_id
      AND viewed_at >= NOW() - INTERVAL '30 days'
  );
END;
$$;