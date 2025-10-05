-- Create site_settings table for frontend content management
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section, key)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all site settings
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can read site settings
CREATE POLICY "Public can read site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Insert default data
INSERT INTO public.site_settings (section, key, value) VALUES
  ('hero', 'stats', '{"pros": "500+", "projects": "2000+", "protected": "€20M+"}'::jsonb),
  ('hero', 'badge', '"Ibiza''s #1 Rated Network"'::jsonb),
  ('hero', 'title', '"Building the Island."'::jsonb),
  ('hero', 'subtitle', '"Building Your Dreams."'::jsonb),
  ('hero', 'description', '"Connect with Ibiza''s most trusted construction professionals. From handyman jobs to luxury builds, our community is installing quality across the island."'::jsonb),
  ('footer', 'contact', '{"address": "Ibiza, Balearic Islands, Spain", "phone": "+34 971 XXX XXX", "email": "hello@csibiza.com", "emergency": {"title": "Emergency Service", "description": "24/7 support for urgent repairs", "phone": "+34 600 XXX XXX"}}'::jsonb),
  ('footer', 'social', '{"facebook": "#", "instagram": "#", "linkedin": "#"}'::jsonb),
  ('footer', 'brand', '{"name": "CS Ibiza", "tagline": "Elite Network", "description": "Constructive Solutions Ibiza connects you with the island''s most trusted construction professionals. From quick fixes to luxury builds."}'::jsonb),
  ('homepage', 'layout', '{"showBenefitsStrip": true, "showCarousel": true, "showTestingBanner": false}'::jsonb);

-- Create trigger to update updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();