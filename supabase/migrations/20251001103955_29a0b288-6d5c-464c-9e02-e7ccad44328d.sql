-- Drop existing view if it exists
DROP VIEW IF EXISTS public.services_unified_v1 CASCADE;

-- Create services_unified_v1 table
CREATE TABLE IF NOT EXISTS public.services_unified_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  micro TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.services_unified_v1 ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Services are publicly readable"
  ON public.services_unified_v1
  FOR SELECT
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services_unified_v1(category);
CREATE INDEX IF NOT EXISTS idx_services_subcategory ON public.services_unified_v1(category, subcategory);

-- Insert comprehensive service data
INSERT INTO public.services_unified_v1 (category, subcategory, micro) VALUES
  -- Moving & Delivery
  ('Moving & Delivery', 'Moving Help', 'Help Moving'),
  ('Moving & Delivery', 'Moving Help', 'Truck Assisted Moving'),
  ('Moving & Delivery', 'Moving Help', 'Heavy Lifting & Loading'),
  ('Moving & Delivery', 'Moving Help', 'Packing Services'),
  ('Moving & Delivery', 'Moving Help', 'Unpacking Services'),
  ('Moving & Delivery', 'Delivery', 'Same Day Delivery'),
  ('Moving & Delivery', 'Delivery', 'Furniture Delivery'),
  ('Moving & Delivery', 'Delivery', 'Package Pickup'),
  
  -- Home Services
  ('Home Services', 'Cleaning', 'House Cleaning'),
  ('Home Services', 'Cleaning', 'Deep Cleaning'),
  ('Home Services', 'Cleaning', 'Post-Party Cleanup'),
  ('Home Services', 'Cleaning', 'Carpet Cleaning'),
  ('Home Services', 'Cleaning', 'Window Cleaning'),
  ('Home Services', 'Organization', 'Home Organization'),
  ('Home Services', 'Organization', 'Office Organization'),
  ('Home Services', 'Outdoor', 'Pressure Washing'),
  ('Home Services', 'Outdoor', 'Gutter Cleaning'),
  
  -- Shopping & Errands
  ('Shopping & Errands', 'Shopping', 'Grocery Shopping'),
  ('Shopping & Errands', 'Shopping', 'Personal Shopping'),
  ('Shopping & Errands', 'Personal Assistance', 'Personal Assistant Tasks'),
  ('Shopping & Errands', 'Personal Assistance', 'Wait in Line Service'),
  
  -- Handyman
  ('Handyman', 'Assembly', 'IKEA Furniture Assembly'),
  ('Handyman', 'Assembly', 'General Furniture Assembly'),
  ('Handyman', 'Installation', 'TV Mounting'),
  ('Handyman', 'Installation', 'Picture & Artwork Hanging'),
  ('Handyman', 'Installation', 'Smart Home Installation'),
  ('Handyman', 'Seasonal', 'Christmas Lights Installation'),
  ('Handyman', 'Seasonal', 'Holiday Decorating'),
  
  -- Pet Care
  ('Pet Care', 'Dog Services', 'Dog Walking'),
  ('Pet Care', 'Pet Sitting', 'Pet Sitting')
ON CONFLICT DO NOTHING;