-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_services_category;
DROP INDEX IF EXISTS idx_services_category_subcategory;
DROP INDEX IF EXISTS idx_services_full_path;

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.services_unified;

-- Create unified services table
CREATE TABLE public.services_unified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  micro TEXT NOT NULL,
  description TEXT,
  typical_duration TEXT,
  price_range TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services_unified ENABLE ROW LEVEL SECURITY;

-- Anyone can read services
CREATE POLICY "Anyone can view services"
  ON public.services_unified
  FOR SELECT
  USING (true);

-- Only admins can manage services
CREATE POLICY "Admins can manage services"
  ON public.services_unified
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_services_category ON public.services_unified(category);
CREATE INDEX idx_services_category_subcategory ON public.services_unified(category, subcategory);
CREATE INDEX idx_services_full_path ON public.services_unified(category, subcategory, micro);

-- Insert comprehensive service data for all 18 main categories
INSERT INTO public.services_unified (category, subcategory, micro) VALUES
  -- BUILDER category
  ('Builder', 'New Construction', 'New Build'),
  ('Builder', 'New Construction', 'Villa Construction'),
  ('Builder', 'New Construction', 'Apartment Building'),
  ('Builder', 'Extensions', 'House Extension'),
  ('Builder', 'Extensions', 'Room Addition'),
  ('Builder', 'Extensions', 'Garage Build'),
  ('Builder', 'Renovations', 'Full Renovation'),
  ('Builder', 'Renovations', 'Kitchen Renovation'),
  ('Builder', 'Renovations', 'Bathroom Renovation'),
  
  -- PLUMBER category
  ('Plumber', 'Installation', 'Bathroom Installation'),
  ('Plumber', 'Installation', 'Kitchen Plumbing'),
  ('Plumber', 'Installation', 'New Pipes'),
  ('Plumber', 'Repairs', 'Leak Repair'),
  ('Plumber', 'Repairs', 'Pipe Repair'),
  ('Plumber', 'Repairs', 'Drain Unblocking'),
  ('Plumber', 'Emergency', 'Burst Pipe'),
  ('Plumber', 'Emergency', 'No Water'),
  ('Plumber', 'Emergency', 'Flooding'),
  
  -- ELECTRICIAN category
  ('Electrician', 'Installation', 'Rewiring'),
  ('Electrician', 'Installation', 'New Sockets'),
  ('Electrician', 'Installation', 'Lighting Installation'),
  ('Electrician', 'Installation', 'Consumer Unit Upgrade'),
  ('Electrician', 'Repairs', 'Fault Finding'),
  ('Electrician', 'Repairs', 'Socket Repair'),
  ('Electrician', 'Repairs', 'Light Repair'),
  ('Electrician', 'Emergency', 'Power Cut'),
  ('Electrician', 'Emergency', 'Electrical Fire'),
  ('Electrician', 'Emergency', 'Sparking Socket'),
  
  -- CARPENTER category
  ('Carpenter', 'Furniture', 'Custom Wardrobes'),
  ('Carpenter', 'Furniture', 'Kitchen Cabinets'),
  ('Carpenter', 'Furniture', 'Shelving'),
  ('Carpenter', 'Doors & Windows', 'Door Installation'),
  ('Carpenter', 'Doors & Windows', 'Window Installation'),
  ('Carpenter', 'Doors & Windows', 'Door Repair'),
  ('Carpenter', 'Flooring', 'Wooden Flooring'),
  ('Carpenter', 'Flooring', 'Parquet'),
  ('Carpenter', 'Flooring', 'Skirting Boards'),
  
  -- HANDYMAN category
  ('Handyman', 'General Repairs', 'Furniture Assembly'),
  ('Handyman', 'General Repairs', 'Picture Hanging'),
  ('Handyman', 'General Repairs', 'Minor Repairs'),
  ('Handyman', 'Maintenance', 'Property Maintenance'),
  ('Handyman', 'Maintenance', 'Regular Checks'),
  ('Handyman', 'Odd Jobs', 'Small Jobs'),
  ('Handyman', 'Odd Jobs', 'Multiple Tasks'),
  
  -- PAINTER category
  ('Painter', 'Interior', 'Interior Painting'),
  ('Painter', 'Interior', 'Wallpapering'),
  ('Painter', 'Interior', 'Decorative Finishes'),
  ('Painter', 'Exterior', 'Exterior Painting'),
  ('Painter', 'Exterior', 'Facade Painting'),
  ('Painter', 'Exterior', 'Weatherproofing'),
  ('Painter', 'Specialist', 'Spray Painting'),
  ('Painter', 'Specialist', 'Wood Staining'),
  
  -- TILER category
  ('Tiler', 'Floor', 'Floor Tiling'),
  ('Tiler', 'Floor', 'Stone Flooring'),
  ('Tiler', 'Floor', 'Mosaic Flooring'),
  ('Tiler', 'Wall', 'Bathroom Tiling'),
  ('Tiler', 'Wall', 'Kitchen Tiling'),
  ('Tiler', 'Wall', 'Feature Wall'),
  ('Tiler', 'Repairs', 'Retiling'),
  ('Tiler', 'Repairs', 'Tile Repair'),
  
  -- PLASTERER category
  ('Plasterer', 'Walls', 'Wall Plastering'),
  ('Plasterer', 'Walls', 'Skim Coating'),
  ('Plasterer', 'Walls', 'Venetian Plaster'),
  ('Plasterer', 'Ceilings', 'Ceiling Plastering'),
  ('Plasterer', 'Ceilings', 'Artex Removal'),
  ('Plasterer', 'Repairs', 'Crack Repair'),
  ('Plasterer', 'Repairs', 'Patch Repair'),
  
  -- ROOFER category
  ('Roofer', 'New Roof', 'Complete Roof'),
  ('Roofer', 'New Roof', 'Flat Roof'),
  ('Roofer', 'New Roof', 'Pitched Roof'),
  ('Roofer', 'Repairs', 'Leak Repair'),
  ('Roofer', 'Repairs', 'Tile Replacement'),
  ('Roofer', 'Repairs', 'Emergency Repair'),
  ('Roofer', 'Maintenance', 'Roof Cleaning'),
  ('Roofer', 'Maintenance', 'Gutter Cleaning'),
  
  -- LANDSCAPER category
  ('Landscaper', 'Garden Design', 'Full Garden Design'),
  ('Landscaper', 'Garden Design', 'Patio Design'),
  ('Landscaper', 'Garden Design', 'Planting Scheme'),
  ('Landscaper', 'Construction', 'Patio Installation'),
  ('Landscaper', 'Construction', 'Deck Building'),
  ('Landscaper', 'Construction', 'Retaining Walls'),
  ('Landscaper', 'Maintenance', 'Garden Maintenance'),
  ('Landscaper', 'Maintenance', 'Lawn Care'),
  ('Landscaper', 'Maintenance', 'Hedge Trimming'),
  
  -- POOL BUILDER category
  ('Pool Builder', 'New Pool', 'Concrete Pool'),
  ('Pool Builder', 'New Pool', 'Infinity Pool'),
  ('Pool Builder', 'New Pool', 'Natural Pool'),
  ('Pool Builder', 'Renovations', 'Pool Renovation'),
  ('Pool Builder', 'Renovations', 'Re-tiling'),
  ('Pool Builder', 'Maintenance', 'Pool Cleaning'),
  ('Pool Builder', 'Maintenance', 'Equipment Repair'),
  ('Pool Builder', 'Maintenance', 'Water Treatment'),
  
  -- HVAC category
  ('HVAC', 'Air Conditioning', 'AC Installation'),
  ('HVAC', 'Air Conditioning', 'AC Repair'),
  ('HVAC', 'Air Conditioning', 'AC Maintenance'),
  ('HVAC', 'Heating', 'Boiler Installation'),
  ('HVAC', 'Heating', 'Radiator Installation'),
  ('HVAC', 'Heating', 'Underfloor Heating'),
  ('HVAC', 'Ventilation', 'Ventilation System'),
  ('HVAC', 'Ventilation', 'Extractor Fans'),
  
  -- ARCHITECTS & DESIGN category
  ('Architects & Design', 'Architecture', 'Architectural Design'),
  ('Architects & Design', 'Architecture', 'Building Plans'),
  ('Architects & Design', 'Architecture', 'Planning Permission'),
  ('Architects & Design', 'Interior Design', 'Interior Design Service'),
  ('Architects & Design', 'Interior Design', 'Space Planning'),
  ('Architects & Design', 'Interior Design', 'Color Consultation'),
  ('Architects & Design', 'Project Management', 'Construction Management'),
  ('Architects & Design', 'Project Management', 'Site Supervision'),
  
  -- STRUCTURAL WORKS category
  ('Structural Works', 'Foundations', 'Foundation Work'),
  ('Structural Works', 'Foundations', 'Underpinning'),
  ('Structural Works', 'Steel Work', 'Steel Beams'),
  ('Structural Works', 'Steel Work', 'Steel Frame'),
  ('Structural Works', 'Concrete', 'Concrete Pouring'),
  ('Structural Works', 'Concrete', 'Reinforced Concrete'),
  ('Structural Works', 'Demolition', 'Internal Demolition'),
  ('Structural Works', 'Demolition', 'Wall Removal'),
  
  -- FLOORS, DOORS & WINDOWS category
  ('Floors, Doors & Windows', 'Flooring', 'Laminate Flooring'),
  ('Floors, Doors & Windows', 'Flooring', 'Vinyl Flooring'),
  ('Floors, Doors & Windows', 'Flooring', 'Tiled Flooring'),
  ('Floors, Doors & Windows', 'Doors', 'External Doors'),
  ('Floors, Doors & Windows', 'Doors', 'Internal Doors'),
  ('Floors, Doors & Windows', 'Doors', 'Sliding Doors'),
  ('Floors, Doors & Windows', 'Windows', 'Window Replacement'),
  ('Floors, Doors & Windows', 'Windows', 'Double Glazing'),
  ('Floors, Doors & Windows', 'Windows', 'Window Repair'),
  
  -- KITCHEN & BATHROOM category
  ('Kitchen & Bathroom', 'Kitchen', 'Full Kitchen Fit'),
  ('Kitchen & Bathroom', 'Kitchen', 'Kitchen Worktops'),
  ('Kitchen & Bathroom', 'Kitchen', 'Kitchen Appliances'),
  ('Kitchen & Bathroom', 'Bathroom', 'Full Bathroom Fit'),
  ('Kitchen & Bathroom', 'Bathroom', 'Shower Installation'),
  ('Kitchen & Bathroom', 'Bathroom', 'Bath Installation'),
  ('Kitchen & Bathroom', 'Wet Rooms', 'Wet Room Installation'),
  ('Kitchen & Bathroom', 'Wet Rooms', 'Waterproofing'),
  
  -- COMMERCIAL PROJECTS category
  ('Commercial Projects', 'Office Fit-Out', 'Complete Office Fit-Out'),
  ('Commercial Projects', 'Office Fit-Out', 'Office Renovation'),
  ('Commercial Projects', 'Retail', 'Shop Fit-Out'),
  ('Commercial Projects', 'Retail', 'Restaurant Fit-Out'),
  ('Commercial Projects', 'Hospitality', 'Hotel Renovation'),
  ('Commercial Projects', 'Hospitality', 'Bar Fit-Out'),
  ('Commercial Projects', 'Industrial', 'Warehouse Fit-Out'),
  ('Commercial Projects', 'Industrial', 'Factory Work'),
  
  -- LEGAL & REGULATORY category
  ('Legal & Regulatory', 'Planning', 'Planning Application'),
  ('Legal & Regulatory', 'Planning', 'Planning Appeals'),
  ('Legal & Regulatory', 'Building Control', 'Building Regulations'),
  ('Legal & Regulatory', 'Building Control', 'Building Certificates'),
  ('Legal & Regulatory', 'Surveys', 'Building Survey'),
  ('Legal & Regulatory', 'Surveys', 'Structural Survey'),
  ('Legal & Regulatory', 'Certifications', 'Energy Certificate'),
  ('Legal & Regulatory', 'Certifications', 'Electrical Certificate');