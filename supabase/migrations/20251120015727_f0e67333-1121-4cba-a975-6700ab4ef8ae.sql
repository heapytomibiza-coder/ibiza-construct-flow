-- Create micro_services table
CREATE TABLE micro_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  trade TEXT,
  category TEXT,
  description TEXT,
  matchers TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_micro_services_slug ON micro_services(slug);
CREATE INDEX idx_micro_services_trade ON micro_services(trade);
CREATE INDEX idx_micro_services_category ON micro_services(category);

-- Enable RLS
ALTER TABLE micro_services ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "micro_services are viewable by everyone"
  ON micro_services FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Admins can manage micro_services"
  ON micro_services FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed construction micros
INSERT INTO micro_services (slug, name, trade, category, description, matchers) VALUES
  ('excavation_site_prep', 'Excavation & Groundworks – Site Preparation', 'groundworks', 'construction', 'Site preparation and excavation services', ARRAY['ground-worker', 'excavation', 'groundwork', 'site-preparation', 'site-prep']),
  ('concrete_foundations', 'Concrete Foundations & Footings', 'groundworks', 'construction', 'Concrete foundation and footing work', ARRAY['foundation', 'footing', 'concrete-pour', 'slab']),
  ('bathroom_full_renovation', 'Bathroom Renovation – Full Refurbishment', 'bathroom_renovation', 'construction', 'Complete bathroom renovation services', ARRAY['bathroom-renovation', 'bathroom', 'bathroom-full', 'bathroom-remodel']),
  ('bathroom_light_refresh', 'Bathroom – Light Refresh', 'bathroom_renovation', 'construction', 'Light bathroom refresh and updates', ARRAY['bathroom-refresh', 'bathroom-update', 'small-bathroom']),
  ('tiling_floor_walls', 'Floor & Wall Tiling', 'tiling', 'construction', 'Professional tiling services', ARRAY['tiling', 'tile', 'flooring', 'tiler']);