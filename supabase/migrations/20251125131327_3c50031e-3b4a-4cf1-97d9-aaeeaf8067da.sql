-- Phase 13: Enhanced Search & Filtering System
-- Clean slate approach

DROP TABLE IF EXISTS public.saved_searches CASCADE;
DROP TABLE IF EXISTS public.search_suggestions CASCADE;
DROP TABLE IF EXISTS public.filter_presets CASCADE;
DROP FUNCTION IF EXISTS public.increment_suggestion_popularity(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_trending_searches(INTEGER) CASCADE;

-- Add session_id to existing search_history
ALTER TABLE public.search_history ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Saved searches table
CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_type TEXT NOT NULL,
  search_query TEXT,
  filters JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  notify_on_new_results BOOLEAN DEFAULT false,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Search suggestions table
CREATE TABLE public.search_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_text TEXT NOT NULL UNIQUE,
  suggestion_type TEXT NOT NULL,
  popularity_score INTEGER DEFAULT 1,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Filter presets table
CREATE TABLE public.filter_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  filter_type TEXT NOT NULL CHECK (filter_type IN ('professional', 'service', 'job')),
  filters JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filter_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "saved_own" ON public.saved_searches FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_admin" ON public.saved_searches FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "sugg_view" ON public.search_suggestions FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "sugg_admin" ON public.search_suggestions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "preset_view" ON public.filter_presets FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_public = true);
CREATE POLICY "preset_own" ON public.filter_presets FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "preset_admin" ON public.filter_presets FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_search_hist_fts ON public.search_history USING gin(to_tsvector('english', search_query));
CREATE INDEX idx_search_hist_session ON public.search_history(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_saved_user_active ON public.saved_searches(user_id, is_active);
CREATE INDEX idx_saved_notify ON public.saved_searches(notify_on_new_results) WHERE notify_on_new_results = true;
CREATE INDEX idx_sugg_text ON public.search_suggestions(suggestion_text);
CREATE INDEX idx_sugg_pop ON public.search_suggestions(suggestion_type, popularity_score DESC);
CREATE INDEX idx_preset_user_type ON public.filter_presets(user_id, filter_type);
CREATE INDEX idx_preset_public_usage ON public.filter_presets(is_public, usage_count DESC) WHERE is_public = true;

-- Functions
CREATE OR REPLACE FUNCTION public.increment_suggestion_popularity(p_suggestion_text TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.search_suggestions (suggestion_text, suggestion_type, popularity_score)
  VALUES (p_suggestion_text, 'general', 1)
  ON CONFLICT (suggestion_text) DO UPDATE
  SET popularity_score = search_suggestions.popularity_score + 1, updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_trending_searches(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (search_query TEXT, search_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT search_query, COUNT(*) as search_count
  FROM public.search_history
  WHERE created_at > now() - interval '7 days'
  GROUP BY search_query
  ORDER BY search_count DESC
  LIMIT p_limit;
$$;

-- Triggers
CREATE TRIGGER trg_saved_upd BEFORE UPDATE ON public.saved_searches FOR EACH ROW EXECUTE FUNCTION public.update_professional_metrics_timestamp();
CREATE TRIGGER trg_sugg_upd BEFORE UPDATE ON public.search_suggestions FOR EACH ROW EXECUTE FUNCTION public.update_professional_metrics_timestamp();
CREATE TRIGGER trg_preset_upd BEFORE UPDATE ON public.filter_presets FOR EACH ROW EXECUTE FUNCTION public.update_professional_metrics_timestamp();