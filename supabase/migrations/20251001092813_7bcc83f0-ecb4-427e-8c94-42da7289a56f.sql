-- Restore the original 12+6 category system
-- This migration restructures the services to match the professional taxonomy

-- Clear existing fragmented data
TRUNCATE TABLE services_micro;

-- Insert 12 Main Categories (core trades/what clients search for)

-- 1. Builder
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Builder', 'General Building', 'Home Renovations', '[]'::jsonb, '[]'::jsonb),
('Builder', 'General Building', 'Extensions', '[]'::jsonb, '[]'::jsonb),
('Builder', 'General Building', 'New Construction', '[]'::jsonb, '[]'::jsonb),
('Builder', 'General Building', 'House Refurbishment', '[]'::jsonb, '[]'::jsonb);

-- 2. Plumber
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Plumber', 'Repairs', 'Leak Repairs', '[]'::jsonb, '[]'::jsonb),
('Plumber', 'Repairs', 'Pipe Repairs', '[]'::jsonb, '[]'::jsonb),
('Plumber', 'Installations', 'Bathroom Installation', '[]'::jsonb, '[]'::jsonb),
('Plumber', 'Installations', 'Kitchen Plumbing', '[]'::jsonb, '[]'::jsonb),
('Plumber', 'Heating', 'Boiler Installation', '[]'::jsonb, '[]'::jsonb),
('Plumber', 'Heating', 'Radiator Installation', '[]'::jsonb, '[]'::jsonb);

-- 3. Electrician
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Electrician', 'Rewiring', 'Full House Rewire', '[]'::jsonb, '[]'::jsonb),
('Electrician', 'Rewiring', 'Partial Rewire', '[]'::jsonb, '[]'::jsonb),
('Electrician', 'Installations', 'Socket Installation', '[]'::jsonb, '[]'::jsonb),
('Electrician', 'Installations', 'Light Fitting', '[]'::jsonb, '[]'::jsonb),
('Electrician', 'Fuse Boxes', 'Consumer Unit Replacement', '[]'::jsonb, '[]'::jsonb),
('Electrician', 'Fuse Boxes', 'Fuse Box Upgrade', '[]'::jsonb, '[]'::jsonb);

-- 4. Carpenter / Joiner
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Carpenter', 'Doors', 'Door Installation', '[]'::jsonb, '[]'::jsonb),
('Carpenter', 'Doors', 'Door Repairs', '[]'::jsonb, '[]'::jsonb),
('Carpenter', 'Kitchens', 'Kitchen Cabinets', '[]'::jsonb, '[]'::jsonb),
('Carpenter', 'Kitchens', 'Kitchen Island', '[]'::jsonb, '[]'::jsonb),
('Carpenter', 'Wardrobes', 'Built-in Wardrobes', '[]'::jsonb, '[]'::jsonb),
('Carpenter', 'Wardrobes', 'Walk-in Closets', '[]'::jsonb, '[]'::jsonb),
('Carpenter', 'Timber Structures', 'Pergolas', '[]'::jsonb, '[]'::jsonb),
('Carpenter', 'Timber Structures', 'Decking', '[]'::jsonb, '[]'::jsonb);

-- 5. Handyman / Odd Jobs
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Handyman', 'Small Repairs', 'General Repairs', '[]'::jsonb, '[]'::jsonb),
('Handyman', 'Small Repairs', 'Minor Fixes', '[]'::jsonb, '[]'::jsonb),
('Handyman', 'Furniture Assembly', 'Flat Pack Assembly', '[]'::jsonb, '[]'::jsonb),
('Handyman', 'Furniture Assembly', 'IKEA Assembly', '[]'::jsonb, '[]'::jsonb),
('Handyman', 'Odd Jobs', 'TV Mounting', '[]'::jsonb, '[]'::jsonb),
('Handyman', 'Odd Jobs', 'Picture Hanging', '[]'::jsonb, '[]'::jsonb);

-- 6. Painter & Decorator
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Painter', 'Interior Painting', 'Wall Painting', '[]'::jsonb, '[]'::jsonb),
('Painter', 'Interior Painting', 'Ceiling Painting', '[]'::jsonb, '[]'::jsonb),
('Painter', 'Exterior Painting', 'House Exterior', '[]'::jsonb, '[]'::jsonb),
('Painter', 'Exterior Painting', 'Fence Painting', '[]'::jsonb, '[]'::jsonb),
('Painter', 'Decorating', 'Wallpapering', '[]'::jsonb, '[]'::jsonb),
('Painter', 'Decorating', 'Feature Walls', '[]'::jsonb, '[]'::jsonb);

-- 7. Tiler
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Tiler', 'Bathroom Tiling', 'Bathroom Floor', '[]'::jsonb, '[]'::jsonb),
('Tiler', 'Bathroom Tiling', 'Bathroom Walls', '[]'::jsonb, '[]'::jsonb),
('Tiler', 'Kitchen Tiling', 'Kitchen Backsplash', '[]'::jsonb, '[]'::jsonb),
('Tiler', 'Kitchen Tiling', 'Kitchen Floor', '[]'::jsonb, '[]'::jsonb),
('Tiler', 'Floor Tiling', 'Indoor Floor Tiling', '[]'::jsonb, '[]'::jsonb),
('Tiler', 'Floor Tiling', 'Outdoor Floor Tiling', '[]'::jsonb, '[]'::jsonb);

-- 8. Plasterer
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Plasterer', 'Plastering', 'Wall Plastering', '[]'::jsonb, '[]'::jsonb),
('Plasterer', 'Plastering', 'Ceiling Plastering', '[]'::jsonb, '[]'::jsonb),
('Plasterer', 'Skimming', 'Skim Coating', '[]'::jsonb, '[]'::jsonb),
('Plasterer', 'Skimming', 'Re-skimming', '[]'::jsonb, '[]'::jsonb),
('Plasterer', 'Drywall', 'Plasterboard Installation', '[]'::jsonb, '[]'::jsonb),
('Plasterer', 'Drywall', 'Partition Walls', '[]'::jsonb, '[]'::jsonb);

-- 9. Roofer
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Roofer', 'Tile Roofs', 'Tile Roof Installation', '[]'::jsonb, '[]'::jsonb),
('Roofer', 'Tile Roofs', 'Tile Roof Repairs', '[]'::jsonb, '[]'::jsonb),
('Roofer', 'Leak Repairs', 'Roof Leak Detection', '[]'::jsonb, '[]'::jsonb),
('Roofer', 'Leak Repairs', 'Roof Leak Repairs', '[]'::jsonb, '[]'::jsonb),
('Roofer', 'Waterproofing', 'Flat Roof Waterproofing', '[]'::jsonb, '[]'::jsonb),
('Roofer', 'Replacements', 'Complete Roof Replacement', '[]'::jsonb, '[]'::jsonb);

-- 10. Landscaper / Gardener
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Landscaper', 'Garden Design', 'Garden Planning', '[]'::jsonb, '[]'::jsonb),
('Landscaper', 'Garden Design', 'Garden Makeover', '[]'::jsonb, '[]'::jsonb),
('Landscaper', 'Patios', 'Patio Installation', '[]'::jsonb, '[]'::jsonb),
('Landscaper', 'Patios', 'Patio Repairs', '[]'::jsonb, '[]'::jsonb),
('Landscaper', 'Driveways', 'Driveway Installation', '[]'::jsonb, '[]'::jsonb),
('Landscaper', 'Driveways', 'Driveway Repairs', '[]'::jsonb, '[]'::jsonb),
('Landscaper', 'Irrigation', 'Sprinkler Systems', '[]'::jsonb, '[]'::jsonb),
('Landscaper', 'Irrigation', 'Garden Watering', '[]'::jsonb, '[]'::jsonb);

-- 11. Pool Builder / Pool Maintenance
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Pool Builder', 'Construction', 'New Pool Construction', '[]'::jsonb, '[]'::jsonb),
('Pool Builder', 'Construction', 'Pool Renovation', '[]'::jsonb, '[]'::jsonb),
('Pool Builder', 'Repairs', 'Pool Leak Repairs', '[]'::jsonb, '[]'::jsonb),
('Pool Builder', 'Repairs', 'Pool Equipment Repairs', '[]'::jsonb, '[]'::jsonb),
('Pool Builder', 'Maintenance', 'Regular Pool Servicing', '[]'::jsonb, '[]'::jsonb),
('Pool Builder', 'Maintenance', 'Pool Cleaning', '[]'::jsonb, '[]'::jsonb);

-- 12. Aircon / HVAC
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('HVAC', 'Air Conditioning', 'AC Installation', '[]'::jsonb, '[]'::jsonb),
('HVAC', 'Air Conditioning', 'AC Repairs', '[]'::jsonb, '[]'::jsonb),
('HVAC', 'Air Conditioning', 'AC Maintenance', '[]'::jsonb, '[]'::jsonb),
('HVAC', 'Heating', 'Heating Installation', '[]'::jsonb, '[]'::jsonb),
('HVAC', 'Heating', 'Heating Repairs', '[]'::jsonb, '[]'::jsonb),
('HVAC', 'Ventilation', 'Ventilation Systems', '[]'::jsonb, '[]'::jsonb);

-- 6 Specialist Categories (professional/technical services)

-- 1. Architects & Design
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Architects & Design', 'Architecture', 'Home Design', '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Architecture', 'Renovation Plans', '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Architecture', 'Extension Design', '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Architecture', 'Building Permits', '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Technical', 'Site Supervision', '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Technical', 'Building Compliance', '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Engineering', 'Structural Calculations', '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Engineering', 'MEP Design', '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Interior Design', 'Room Layouts', '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Interior Design', 'Kitchen Design', '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Surveying', 'Land Surveys', '[]'::jsonb, '[]'::jsonb),
('Architects & Design', 'Surveying', 'Topographic Surveys', '[]'::jsonb, '[]'::jsonb);

-- 2. Builders & Structural Works
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Structural Works', 'Groundworks', 'Excavation', '[]'::jsonb, '[]'::jsonb),
('Structural Works', 'Groundworks', 'Site Preparation', '[]'::jsonb, '[]'::jsonb),
('Structural Works', 'Foundations', 'Foundation Construction', '[]'::jsonb, '[]'::jsonb),
('Structural Works', 'Foundations', 'Concrete Work', '[]'::jsonb, '[]'::jsonb),
('Structural Works', 'Masonry', 'Bricklaying', '[]'::jsonb, '[]'::jsonb),
('Structural Works', 'Masonry', 'Block Work', '[]'::jsonb, '[]'::jsonb),
('Structural Works', 'Stonework', 'Stone Walls', '[]'::jsonb, '[]'::jsonb),
('Structural Works', 'Stonework', 'Stone Restoration', '[]'::jsonb, '[]'::jsonb),
('Structural Works', 'Timber Framing', 'Roof Carpentry', '[]'::jsonb, '[]'::jsonb),
('Structural Works', 'Timber Framing', 'Timber Frame Construction', '[]'::jsonb, '[]'::jsonb),
('Structural Works', 'Steel & Welding', 'Structural Steel', '[]'::jsonb, '[]'::jsonb),
('Structural Works', 'Steel & Welding', 'Steel Fabrication', '[]'::jsonb, '[]'::jsonb);

-- 3. Floors, Doors & Windows
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Floors, Doors & Windows', 'Floor Tiling', 'Floor Tile Installation', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Floor Tiling', 'Wall Tile Installation', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Wood Flooring', 'Solid Wood Floors', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Wood Flooring', 'Engineered Flooring', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Wood Flooring', 'Laminate Flooring', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Soft Flooring', 'Carpet Installation', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Soft Flooring', 'Vinyl Flooring', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Door Fitting', 'Wooden Doors', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Door Fitting', 'Sliding Doors', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Door Fitting', 'Security Doors', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Window Fitting', 'PVC Windows', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Window Fitting', 'Aluminium Windows', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Window Fitting', 'Double Glazing', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Skylights', 'Roof Windows', '[]'::jsonb, '[]'::jsonb),
('Floors, Doors & Windows', 'Skylights', 'Skylight Installation', '[]'::jsonb, '[]'::jsonb);

-- 4. Kitchen & Bathroom Fitter
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Kitchen & Bathroom', 'Kitchen Installation', 'Full Kitchen Fit', '[]'::jsonb, '[]'::jsonb),
('Kitchen & Bathroom', 'Kitchen Installation', 'Kitchen Units', '[]'::jsonb, '[]'::jsonb),
('Kitchen & Bathroom', 'Kitchen Renovation', 'Kitchen Refurbishment', '[]'::jsonb, '[]'::jsonb),
('Kitchen & Bathroom', 'Kitchen Renovation', 'Kitchen Makeover', '[]'::jsonb, '[]'::jsonb),
('Kitchen & Bathroom', 'Bathroom Installation', 'Full Bathroom Fit', '[]'::jsonb, '[]'::jsonb),
('Kitchen & Bathroom', 'Bathroom Installation', 'Bathroom Suite', '[]'::jsonb, '[]'::jsonb),
('Kitchen & Bathroom', 'Wetrooms', 'Wetroom Installation', '[]'::jsonb, '[]'::jsonb),
('Kitchen & Bathroom', 'Wetrooms', 'Waterproofing', '[]'::jsonb, '[]'::jsonb),
('Kitchen & Bathroom', 'Joinery', 'Custom Cabinetry', '[]'::jsonb, '[]'::jsonb),
('Kitchen & Bathroom', 'Joinery', 'Vanity Units', '[]'::jsonb, '[]'::jsonb);

-- 5. Commercial Projects
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Commercial Projects', 'Design & Planning', 'Project Design', '[]'::jsonb, '[]'::jsonb),
('Commercial Projects', 'Design & Planning', 'Project Management', '[]'::jsonb, '[]'::jsonb),
('Commercial Projects', 'Design & Planning', 'Cost Control', '[]'::jsonb, '[]'::jsonb),
('Commercial Projects', 'Structural Works', 'Earthworks', '[]'::jsonb, '[]'::jsonb),
('Commercial Projects', 'Structural Works', 'Concrete Structures', '[]'::jsonb, '[]'::jsonb),
('Commercial Projects', 'MEP Systems', 'Commercial Electrical', '[]'::jsonb, '[]'::jsonb),
('Commercial Projects', 'MEP Systems', 'Commercial HVAC', '[]'::jsonb, '[]'::jsonb),
('Commercial Projects', 'MEP Systems', 'Fire Safety Systems', '[]'::jsonb, '[]'::jsonb),
('Commercial Projects', 'Interior Fit-Out', 'Office Partitions', '[]'::jsonb, '[]'::jsonb),
('Commercial Projects', 'Interior Fit-Out', 'Commercial Flooring', '[]'::jsonb, '[]'::jsonb),
('Commercial Projects', 'Exterior Works', 'Facades', '[]'::jsonb, '[]'::jsonb),
('Commercial Projects', 'Exterior Works', 'Commercial Roofing', '[]'::jsonb, '[]'::jsonb);

-- 6. Legal & Regulatory (Optional)
INSERT INTO services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Legal & Regulatory', 'Legal Services', 'Property Lawyers', '[]'::jsonb, '[]'::jsonb),
('Legal & Regulatory', 'Legal Services', 'Building Permits', '[]'::jsonb, '[]'::jsonb),
('Legal & Regulatory', 'Compliance', 'Building Inspections', '[]'::jsonb, '[]'::jsonb),
('Legal & Regulatory', 'Compliance', 'Certification', '[]'::jsonb, '[]'::jsonb),
('Legal & Regulatory', 'Health & Safety', 'HSE Consulting', '[]'::jsonb, '[]'::jsonb),
('Legal & Regulatory', 'Testing', 'Material Testing', '[]'::jsonb, '[]'::jsonb);

-- Add metadata column to distinguish main vs specialist categories
ALTER TABLE services_micro ADD COLUMN IF NOT EXISTS category_type text DEFAULT 'main';

-- Update specialist categories
UPDATE services_micro SET category_type = 'specialist' 
WHERE category IN (
  'Architects & Design',
  'Structural Works', 
  'Floors, Doors & Windows',
  'Kitchen & Bathroom',
  'Commercial Projects',
  'Legal & Regulatory'
);