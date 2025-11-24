-- Phase 1: Add Portfolio Support and Dynamic Pricing Add-ons

-- Add portfolio images to professional_service_items table
ALTER TABLE professional_service_items 
ADD COLUMN IF NOT EXISTS portfolio_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- Create service_materials table for contextual materials
CREATE TABLE IF NOT EXISTS service_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES professional_service_items(id) ON DELETE CASCADE,
  material_category TEXT NOT NULL,
  material_name TEXT NOT NULL,
  material_icon TEXT,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create service_pricing_addons table for "What's Included" dynamic pricing
CREATE TABLE IF NOT EXISTS service_pricing_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES professional_service_items(id) ON DELETE CASCADE,
  addon_name TEXT NOT NULL,
  addon_description TEXT,
  addon_price DECIMAL(10,2) NOT NULL,
  is_included_in_base BOOLEAN DEFAULT false,
  is_optional BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_pricing_addons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_materials
CREATE POLICY "Anyone can view service materials"
  ON service_materials FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage their service materials"
  ON service_materials FOR ALL
  USING (
    service_id IN (
      SELECT id FROM professional_service_items 
      WHERE professional_id = auth.uid()
    )
  );

-- RLS Policies for service_pricing_addons
CREATE POLICY "Anyone can view service pricing addons"
  ON service_pricing_addons FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage their service pricing addons"
  ON service_pricing_addons FOR ALL
  USING (
    service_id IN (
      SELECT id FROM professional_service_items 
      WHERE professional_id = auth.uid()
    )
  );