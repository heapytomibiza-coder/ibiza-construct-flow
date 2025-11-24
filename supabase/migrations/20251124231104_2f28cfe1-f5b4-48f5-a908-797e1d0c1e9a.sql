-- Add portfolio support to professional_service_items (if not exists)
ALTER TABLE professional_service_items 
ADD COLUMN IF NOT EXISTS portfolio_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Professionals can manage their service materials" ON service_materials;
DROP POLICY IF EXISTS "Professionals can manage their service pricing addons" ON service_pricing_addons;

-- Recreate professional management policies
CREATE POLICY "Professionals can manage their service materials" 
  ON service_materials FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM professional_service_items psi
      WHERE psi.id = service_materials.service_id
      AND psi.professional_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can manage their service pricing addons" 
  ON service_pricing_addons FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM professional_service_items psi
      WHERE psi.id = service_pricing_addons.service_id
      AND psi.professional_id = auth.uid()
    )
  );