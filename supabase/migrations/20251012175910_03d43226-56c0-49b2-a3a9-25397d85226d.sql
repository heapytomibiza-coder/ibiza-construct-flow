-- Fix construction service taxonomy
-- Remove incorrect sample data
DELETE FROM public.service_micro_categories;
DELETE FROM public.service_subcategories;
DELETE FROM public.service_categories;

-- Insert construction main categories (12 main + 6 specialist)
INSERT INTO public.service_categories (name, slug, description, display_order, icon) VALUES
('Builder', 'builder', 'General construction and building services', 1, 'Hammer'),
('Plumber', 'plumber', 'Plumbing installation and repairs', 2, 'Wrench'),
('Electrician', 'electrician', 'Electrical services and installations', 3, 'Zap'),
('Carpenter', 'carpenter', 'Carpentry and woodwork services', 4, 'Hammer'),
('Painter & Decorator', 'painter-decorator', 'Painting and decorating services', 5, 'Paintbrush'),
('Pool Builder', 'pool-builder', 'Swimming pool construction and maintenance', 6, 'Waves'),
('HVAC Specialist', 'hvac-specialist', 'Heating, ventilation, and air conditioning', 7, 'Wind'),
('Landscaper', 'landscaper', 'Garden and landscape design', 8, 'Trees'),
('Tiler', 'tiler', 'Tiling services for floors and walls', 9, 'Grid'),
('Roofer', 'roofer', 'Roofing installation and repairs', 10, 'Home'),
('Architect', 'architect', 'Architectural design and planning', 11, 'Ruler'),
('Interior Designer', 'interior-designer', 'Interior design and styling', 12, 'Palette'),
('Demolition', 'demolition', 'Demolition and site clearing', 13, 'Trash'),
('Locksmith', 'locksmith', 'Lock installation and security', 14, 'Key'),
('Glazier', 'glazier', 'Glass installation and repairs', 15, 'Square'),
('Scaffolder', 'scaffolder', 'Scaffolding services', 16, 'Construction'),
('Flooring Specialist', 'flooring-specialist', 'Floor installation and finishing', 17, 'Layers'),
('Handyman', 'handyman', 'General maintenance and repairs', 18, 'Tool');

-- Insert subcategories for Builder
INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order)
SELECT id, 'Renovation', 'renovation', 'Home renovation projects', 1
FROM public.service_categories WHERE slug = 'builder'
UNION ALL
SELECT id, 'New Build', 'new-build', 'New construction projects', 2
FROM public.service_categories WHERE slug = 'builder'
UNION ALL
SELECT id, 'Extensions', 'extensions', 'Home extensions and additions', 3
FROM public.service_categories WHERE slug = 'builder'
UNION ALL
SELECT id, 'Conversions', 'conversions', 'Loft and garage conversions', 4
FROM public.service_categories WHERE slug = 'builder';

-- Insert micro categories for Builder > Renovation
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, description, display_order)
SELECT id, 'Kitchen Renovation', 'kitchen-renovation', 'Complete kitchen remodeling', 1
FROM public.service_subcategories WHERE slug = 'renovation' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'builder')
UNION ALL
SELECT id, 'Bathroom Renovation', 'bathroom-renovation', 'Complete bathroom remodeling', 2
FROM public.service_subcategories WHERE slug = 'renovation' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'builder')
UNION ALL
SELECT id, 'Full House Renovation', 'full-house-renovation', 'Whole house renovation', 3
FROM public.service_subcategories WHERE slug = 'renovation' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'builder');

-- Insert micro categories for Builder > Extensions
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, description, display_order)
SELECT id, 'Kitchen Extension', 'kitchen-extension', 'Kitchen space extension', 1
FROM public.service_subcategories WHERE slug = 'extensions' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'builder')
UNION ALL
SELECT id, 'Side Return Extension', 'side-return-extension', 'Side return extension', 2
FROM public.service_subcategories WHERE slug = 'extensions' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'builder')
UNION ALL
SELECT id, 'Rear Extension', 'rear-extension', 'Rear extension', 3
FROM public.service_subcategories WHERE slug = 'extensions' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'builder');

-- Insert subcategories for Plumber
INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order)
SELECT id, 'Installation', 'installation', 'New plumbing installations', 1
FROM public.service_categories WHERE slug = 'plumber'
UNION ALL
SELECT id, 'Repairs', 'repairs', 'Plumbing repairs and maintenance', 2
FROM public.service_categories WHERE slug = 'plumber'
UNION ALL
SELECT id, 'Emergency', 'emergency', '24/7 emergency plumbing', 3
FROM public.service_categories WHERE slug = 'plumber'
UNION ALL
SELECT id, 'Drainage', 'drainage', 'Drainage and sewage services', 4
FROM public.service_categories WHERE slug = 'plumber';

-- Insert micro categories for Plumber > Installation
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, description, display_order)
SELECT id, 'Bathroom Installation', 'bathroom-installation', 'Complete bathroom fitting', 1
FROM public.service_subcategories WHERE slug = 'installation' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'plumber')
UNION ALL
SELECT id, 'Kitchen Plumbing', 'kitchen-plumbing', 'Kitchen plumbing installation', 2
FROM public.service_subcategories WHERE slug = 'installation' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'plumber')
UNION ALL
SELECT id, 'Boiler Installation', 'boiler-installation', 'New boiler installation', 3
FROM public.service_subcategories WHERE slug = 'installation' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'plumber');

-- Insert subcategories for Electrician
INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order)
SELECT id, 'Installation', 'installation', 'Electrical installations', 1
FROM public.service_categories WHERE slug = 'electrician'
UNION ALL
SELECT id, 'Repairs', 'repairs', 'Electrical repairs', 2
FROM public.service_categories WHERE slug = 'electrician'
UNION ALL
SELECT id, 'Rewiring', 'rewiring', 'Full or partial rewiring', 3
FROM public.service_categories WHERE slug = 'electrician'
UNION ALL
SELECT id, 'Testing', 'testing', 'Electrical testing and certification', 4
FROM public.service_categories WHERE slug = 'electrician';

-- Insert micro categories for Electrician > Installation
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, description, display_order)
SELECT id, 'Lighting Installation', 'lighting-installation', 'Interior and exterior lighting', 1
FROM public.service_subcategories WHERE slug = 'installation' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'electrician')
UNION ALL
SELECT id, 'Socket Installation', 'socket-installation', 'Power socket installation', 2
FROM public.service_subcategories WHERE slug = 'installation' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'electrician')
UNION ALL
SELECT id, 'Consumer Unit Upgrade', 'consumer-unit-upgrade', 'Fuse box replacement', 3
FROM public.service_subcategories WHERE slug = 'installation' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'electrician');

-- Insert subcategories for Carpenter
INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order)
SELECT id, 'Furniture', 'furniture', 'Custom furniture making', 1
FROM public.service_categories WHERE slug = 'carpenter'
UNION ALL
SELECT id, 'Doors & Windows', 'doors-windows', 'Door and window installation', 2
FROM public.service_categories WHERE slug = 'carpenter'
UNION ALL
SELECT id, 'Flooring', 'flooring', 'Wood flooring installation', 3
FROM public.service_categories WHERE slug = 'carpenter'
UNION ALL
SELECT id, 'Decking', 'decking', 'Outdoor decking', 4
FROM public.service_categories WHERE slug = 'carpenter';

-- Insert micro categories for Carpenter > Furniture
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, description, display_order)
SELECT id, 'Built-in Wardrobes', 'built-in-wardrobes', 'Custom wardrobe installation', 1
FROM public.service_subcategories WHERE slug = 'furniture' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'carpenter')
UNION ALL
SELECT id, 'Kitchen Cabinets', 'kitchen-cabinets', 'Kitchen cabinet making', 2
FROM public.service_subcategories WHERE slug = 'furniture' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'carpenter')
UNION ALL
SELECT id, 'Shelving', 'shelving', 'Custom shelving solutions', 3
FROM public.service_subcategories WHERE slug = 'furniture' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'carpenter');

-- Insert subcategories for Painter & Decorator
INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order)
SELECT id, 'Interior Painting', 'interior-painting', 'Interior painting services', 1
FROM public.service_categories WHERE slug = 'painter-decorator'
UNION ALL
SELECT id, 'Exterior Painting', 'exterior-painting', 'Exterior painting services', 2
FROM public.service_categories WHERE slug = 'painter-decorator'
UNION ALL
SELECT id, 'Wallpapering', 'wallpapering', 'Wallpaper hanging', 3
FROM public.service_categories WHERE slug = 'painter-decorator'
UNION ALL
SELECT id, 'Decorating', 'decorating', 'Full decorating services', 4
FROM public.service_categories WHERE slug = 'painter-decorator';

-- Insert micro categories for Painter > Interior Painting
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, description, display_order)
SELECT id, 'Room Painting', 'room-painting', 'Single room painting', 1
FROM public.service_subcategories WHERE slug = 'interior-painting' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'painter-decorator')
UNION ALL
SELECT id, 'Whole House Painting', 'whole-house-painting', 'Complete house interior', 2
FROM public.service_subcategories WHERE slug = 'interior-painting' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'painter-decorator')
UNION ALL
SELECT id, 'Feature Wall', 'feature-wall', 'Feature wall painting', 3
FROM public.service_subcategories WHERE slug = 'interior-painting' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'painter-decorator');

-- Insert subcategories for Pool Builder
INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order)
SELECT id, 'New Pool', 'new-pool', 'New pool construction', 1
FROM public.service_categories WHERE slug = 'pool-builder'
UNION ALL
SELECT id, 'Renovation', 'renovation', 'Pool renovation', 2
FROM public.service_categories WHERE slug = 'pool-builder'
UNION ALL
SELECT id, 'Maintenance', 'maintenance', 'Pool maintenance', 3
FROM public.service_categories WHERE slug = 'pool-builder';

-- Insert micro categories for Pool Builder > New Pool
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, description, display_order)
SELECT id, 'Concrete Pool', 'concrete-pool', 'Concrete pool construction', 1
FROM public.service_subcategories WHERE slug = 'new-pool' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'pool-builder')
UNION ALL
SELECT id, 'Fiberglass Pool', 'fiberglass-pool', 'Fiberglass pool installation', 2
FROM public.service_subcategories WHERE slug = 'new-pool' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'pool-builder')
UNION ALL
SELECT id, 'Natural Pool', 'natural-pool', 'Natural swimming pool', 3
FROM public.service_subcategories WHERE slug = 'new-pool' AND category_id IN (SELECT id FROM public.service_categories WHERE slug = 'pool-builder');