-- ============================================================================
-- Ibiza Home Meeting 2025: Fair Showcase System Database Extensions
-- ============================================================================

-- 1. Extend professional_profiles with fair-specific fields
ALTER TABLE professional_profiles 
  ADD COLUMN IF NOT EXISTS subsector_tags jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ideal_clients text,
  ADD COLUMN IF NOT EXISTS unique_selling_points jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS team_size integer,
  ADD COLUMN IF NOT EXISTS min_project_value numeric,
  ADD COLUMN IF NOT EXISTS max_project_value numeric,
  ADD COLUMN IF NOT EXISTS typical_project_duration text,
  ADD COLUMN IF NOT EXISTS seasonality text DEFAULT 'Todo el año',
  ADD COLUMN IF NOT EXISTS emergency_service boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_projects_in_parallel integer,
  ADD COLUMN IF NOT EXISTS sustainability_practices jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS short_slug text,
  ADD COLUMN IF NOT EXISTS company_type text DEFAULT 'business',
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS featured_at_events jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_demo_profile boolean DEFAULT false;

-- Add unique constraint for short_slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_professional_profiles_short_slug 
  ON professional_profiles(short_slug) WHERE short_slug IS NOT NULL;

-- Create index for fair showcase filtering
CREATE INDEX IF NOT EXISTS idx_professional_profiles_events 
  ON professional_profiles USING gin(featured_at_events);

-- Create index for demo profiles
CREATE INDEX IF NOT EXISTS idx_professional_profiles_demo 
  ON professional_profiles(is_demo_profile) WHERE is_demo_profile = true;

-- 2. Create fair_sectors taxonomy table
CREATE TABLE IF NOT EXISTS fair_sectors (
  slug text PRIMARY KEY,
  name_es text NOT NULL,
  name_en text NOT NULL,
  icon text,
  description_es text,
  description_en text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on fair_sectors
ALTER TABLE fair_sectors ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view sectors
CREATE POLICY "Anyone can view fair sectors"
  ON fair_sectors FOR SELECT
  USING (true);

-- Admins can manage sectors
CREATE POLICY "Admins can manage fair sectors"
  ON fair_sectors FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Insert fair sector taxonomy
INSERT INTO fair_sectors (slug, name_es, name_en, icon, description_es, description_en, display_order) VALUES
  ('construccion-reformas', 'Construcción y Reformas', 'Construction & Renovation', 'Hammer', 'Equipos integrales de obra y reforma', 'Complete construction and renovation teams', 1),
  ('arquitectura', 'Arquitectura', 'Architecture', 'Building', 'Estudios de arquitectura y diseño', 'Architecture and design studios', 2),
  ('materiales', 'Materiales', 'Materials', 'Package', 'Proveedores de materiales de construcción', 'Construction materials suppliers', 3),
  ('metalurgia', 'Metalurgía', 'Metalworking', 'Wrench', 'Soluciones metálicas a medida', 'Custom metal solutions', 4),
  ('proveedores', 'Proveedores', 'Suppliers', 'Truck', 'Distribuidores técnicos', 'Technical distributors', 5),
  ('aluminio-ventanas', 'Aluminio y Ventanas', 'Aluminum & Windows', 'SquareSplitHorizontal', 'Carpintería de aluminio y PVC', 'Aluminum and PVC carpentry', 6),
  ('maquinaria-industrial', 'Maquinaria Industrial', 'Industrial Machinery', 'Forklift', 'Alquiler y venta de maquinaria', 'Machinery rental and sales', 7),
  ('rehabilitacion-fachadas', 'Rehabilitación y Fachadas', 'Restoration & Facades', 'Building2', 'Especialistas en fachadas y aislamiento', 'Facade and insulation specialists', 8),
  ('puertas-ventanas', 'Puertas y Ventanas', 'Doors & Windows', 'DoorOpen', 'Puertas y ventanas de calidad', 'Quality doors and windows', 9),
  ('interiorismo-decoracion', 'Interiorismo y Decoración', 'Interior Design', 'Palette', 'Diseño de interiores y decoración', 'Interior design and decoration', 10),
  ('cocinas', 'Cocinas', 'Kitchens', 'ChefHat', 'Cocinas a medida', 'Custom kitchens', 11),
  ('equipamiento-integral', 'Equipamiento Integral', 'Complete Equipment', 'Package2', 'Equipamiento completo para proyectos', 'Complete project equipment', 12),
  ('domotica-sonorizacion', 'Domótica y Sonorización', 'Home Automation', 'Smartphone', 'Domótica, audio y vídeo', 'Home automation, audio and video', 13),
  ('electricidad-diseno', 'Electricidad y Diseño', 'Electrical & Lighting', 'Lightbulb', 'Instalaciones eléctricas y iluminación', 'Electrical installations and lighting', 14),
  ('maderas-ebanisteria', 'Maderas y Ebanistería', 'Wood & Cabinetry', 'TreePine', 'Carpintería y ebanistería a medida', 'Custom carpentry and cabinetry', 15),
  ('piscinas-spa-wellness', 'Piscinas, Spa & Wellness', 'Pools, Spa & Wellness', 'Waves', 'Piscinas y zonas wellness', 'Pools and wellness areas', 16),
  ('energias-sostenibilidad', 'Energías y Sostenibilidad', 'Energy & Sustainability', 'Leaf', 'Energía solar y eficiencia', 'Solar energy and efficiency', 17),
  ('seguridad', 'Seguridad', 'Security', 'Shield', 'Seguridad física y electrónica', 'Physical and electronic security', 18),
  ('real-estate', 'Real Estate', 'Real Estate', 'Home', 'Agencias inmobiliarias', 'Real estate agencies', 19),
  ('servicios', 'Servicios', 'Services', 'Briefcase', 'Servicios técnicos y profesionales', 'Technical and professional services', 20),
  ('marketing', 'Marketing', 'Marketing', 'Megaphone', 'Agencias creativas y marketing', 'Creative and marketing agencies', 21)
ON CONFLICT (slug) DO NOTHING;

-- 4. Create function to generate short slug
CREATE OR REPLACE FUNCTION generate_short_slug(company_name text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug from company name
  base_slug := lower(regexp_replace(unaccent(company_name), '[^a-z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Try to find unique slug
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM professional_profiles WHERE short_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE fair_sectors IS 'Taxonomy of sectors for Ibiza Home Meeting fair';
COMMENT ON COLUMN professional_profiles.subsector_tags IS 'Array of subsector tags for detailed categorization';
COMMENT ON COLUMN professional_profiles.ideal_clients IS 'Description of ideal client profile';
COMMENT ON COLUMN professional_profiles.unique_selling_points IS 'Array of unique selling points (3-5 bullets)';
COMMENT ON COLUMN professional_profiles.featured_at_events IS 'Array of event slugs where this profile is featured';
COMMENT ON COLUMN professional_profiles.is_demo_profile IS 'Flag for demo/example profiles used at fairs';
COMMENT ON COLUMN professional_profiles.short_slug IS 'URL-friendly slug for professional profile';