-- Add icon_name and examples columns to service_categories
ALTER TABLE service_categories 
ADD COLUMN IF NOT EXISTS icon_name TEXT,
ADD COLUMN IF NOT EXISTS examples TEXT[];

-- Update existing categories with Lucide icon names and examples
UPDATE service_categories SET icon_name = 'HardHat', examples = ARRAY['Home Extensions', 'New Builds', 'Renovations'] WHERE name = 'Builder';
UPDATE service_categories SET icon_name = 'Droplet', examples = ARRAY['Leak Repairs', 'Pipe Installation', 'Bathroom Plumbing'] WHERE name = 'Plumber';
UPDATE service_categories SET icon_name = 'Zap', examples = ARRAY['Rewiring', 'Fault Finding', 'EV Charger Install'] WHERE name = 'Electrician';
UPDATE service_categories SET icon_name = 'Hammer', examples = ARRAY['Custom Furniture', 'Door Fitting', 'Decking'] WHERE name = 'Carpenter';
UPDATE service_categories SET icon_name = 'Wrench', examples = ARRAY['General Repairs', 'Furniture Assembly', 'Odd Jobs'] WHERE name = 'Handyman';
UPDATE service_categories SET icon_name = 'Paintbrush', examples = ARRAY['Interior Painting', 'Exterior Painting', 'Decorating'] WHERE name = 'Painter & Decorator';
UPDATE service_categories SET icon_name = 'Square', examples = ARRAY['Floor Tiling', 'Wall Tiling', 'Bathroom Tiling'] WHERE name = 'Tiler';
UPDATE service_categories SET icon_name = 'Layers', examples = ARRAY['Wall Plastering', 'Ceiling Repair', 'Rendering'] WHERE name = 'Plasterer';
UPDATE service_categories SET icon_name = 'Home', examples = ARRAY['Roof Repairs', 'Gutter Cleaning', 'New Roof Installation'] WHERE name = 'Roofer';
UPDATE service_categories SET icon_name = 'Leaf', examples = ARRAY['Garden Design', 'Paving', 'Lawn Care'] WHERE name = 'Landscaper';
UPDATE service_categories SET icon_name = 'Waves', examples = ARRAY['Pool Installation', 'Pool Maintenance', 'Pool Renovation'] WHERE name = 'Pool Builder';
UPDATE service_categories SET icon_name = 'Wind', examples = ARRAY['Heating Installation', 'Air Conditioning', 'Ventilation'] WHERE name = 'HVAC';
UPDATE service_categories SET icon_name = 'Ruler', examples = ARRAY['House Plans', 'Interior Design', 'Planning Permission'] WHERE name = 'Architects & Design';
UPDATE service_categories SET icon_name = 'Building2', examples = ARRAY['Foundations', 'Steel Work', 'Load Bearing Walls'] WHERE name = 'Structural Works';
UPDATE service_categories SET icon_name = 'DoorOpen', examples = ARRAY['Flooring Installation', 'Door Fitting', 'Window Installation'] WHERE name = 'Floors, Doors & Windows';
UPDATE service_categories SET icon_name = 'Bath', examples = ARRAY['Kitchen Fitting', 'Bathroom Renovation', 'Worktop Installation'] WHERE name = 'Kitchen & Bathroom';
UPDATE service_categories SET icon_name = 'Building', examples = ARRAY['Office Fit-Out', 'Shop Fitting', 'Commercial Building'] WHERE name = 'Commercial Projects';
UPDATE service_categories SET icon_name = 'FileText', examples = ARRAY['Building Regulations', 'Legal Advice', 'Compliance Checks'] WHERE name = 'Legal & Regulatory';