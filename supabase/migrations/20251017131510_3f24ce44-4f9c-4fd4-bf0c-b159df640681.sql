-- Update Painter with icon and examples
UPDATE service_categories 
SET icon_name = 'Paintbrush',
    examples = ARRAY['Interior Painting', 'Exterior Painting', 'Wallpapering']
WHERE slug = 'painter';

-- Update HVAC with icon and examples
UPDATE service_categories 
SET icon_name = 'Wind',
    examples = ARRAY['AC Installation', 'Heating Repair', 'Ventilation']
WHERE slug = 'hvac';

-- Update Architect with icon and examples
UPDATE service_categories 
SET icon_name = 'Ruler',
    examples = ARRAY['Home Design', 'Planning Permission', '3D Rendering']
WHERE slug = 'architect';

-- Update Interior Designer with icon and examples
UPDATE service_categories 
SET icon_name = 'Layers',
    examples = ARRAY['Space Planning', 'Furniture Selection', 'Color Schemes']
WHERE slug = 'interior-designer';

-- Update Demolition with icon and examples
UPDATE service_categories 
SET icon_name = 'Hammer',
    examples = ARRAY['Structural Demolition', 'Site Clearance', 'Controlled Demolition']
WHERE slug = 'demolition';

-- Update Locksmith with icon and examples
UPDATE service_categories 
SET icon_name = 'DoorOpen',
    examples = ARRAY['Lock Changes', 'Emergency Lockout', 'Security Upgrades']
WHERE slug = 'locksmith';

-- Update Glazer with icon and examples
UPDATE service_categories 
SET icon_name = 'Square',
    examples = ARRAY['Window Installation', 'Glass Replacement', 'Mirror Fitting']
WHERE slug = 'glazer';

-- Delete Flooring Specialist
DELETE FROM service_categories WHERE slug = 'flooring-specialist';

-- Delete Scaffolder
DELETE FROM service_categories WHERE slug = 'scaffolder';

-- Insert Transport category
INSERT INTO service_categories (name, slug, icon_name, examples, category_group, is_active, display_order)
VALUES (
  'Transport',
  'transport',
  'Truck',
  ARRAY['House Moving', 'Furniture Delivery', 'Waste Removal'],
  'trade_services',
  true,
  19
);