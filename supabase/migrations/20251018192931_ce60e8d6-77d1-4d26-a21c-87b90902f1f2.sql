-- Add examples to categories that are missing them (using correct text array format)

UPDATE service_categories SET examples = ARRAY[
  'General building work',
  'Renovations & extensions',
  'New construction'
] WHERE slug = 'builder';

UPDATE service_categories SET examples = ARRAY[
  'Custom furniture',
  'Door fitting',
  'Decking & pergolas'
] WHERE slug = 'carpenter';

UPDATE service_categories SET examples = ARRAY[
  'Full rewiring',
  'Socket installation',
  'Lighting & switches'
] WHERE slug = 'electrician';

UPDATE service_categories SET examples = ARRAY[
  'AC & heating systems',
  'Ventilation',
  'Climate control'
] WHERE slug = 'hvac';

UPDATE service_categories SET examples = ARRAY[
  'Space planning',
  'Furniture selection',
  'Color schemes'
] WHERE slug = 'interior-designer';

UPDATE service_categories SET examples = ARRAY[
  'Kitchen renovations',
  'Bathroom upgrades',
  'Complete refits'
] WHERE slug = 'kitchen-bathroom';

UPDATE service_categories SET examples = ARRAY[
  'Garden design',
  'Irrigation systems',
  'Outdoor structures'
] WHERE slug = 'landscaper';

UPDATE service_categories SET examples = ARRAY[
  'Wall plastering',
  'Ceiling work',
  'Rendering'
] WHERE slug = 'plasterer';

UPDATE service_categories SET examples = ARRAY[
  'Pool construction',
  'Pool renovation',
  'Equipment installation'
] WHERE slug = 'pool-builder';

UPDATE service_categories SET examples = ARRAY[
  'Project planning',
  'Budget management',
  'Contractor coordination'
] WHERE slug = 'project-management-consultation';

UPDATE service_categories SET examples = ARRAY[
  'Roof repairs',
  'Re-roofing',
  'Waterproofing'
] WHERE slug = 'roofer';

UPDATE service_categories SET examples = ARRAY[
  'Foundations',
  'Load-bearing walls',
  'Structural surveys'
] WHERE slug = 'structural-works';

UPDATE service_categories SET examples = ARRAY[
  'Floor tiling',
  'Wall tiling',
  'Bathroom tiling'
] WHERE slug = 'tiler';

UPDATE service_categories SET examples = ARRAY[
  'Moving services',
  'Delivery',
  'Logistics'
] WHERE slug = 'transportation-moving-delivery';

UPDATE service_categories SET examples = ARRAY[
  'Flooring installation',
  'Door fitting',
  'Window replacement'
] WHERE slug = 'floors-doors-windows';

UPDATE service_categories SET examples = ARRAY[
  'Window installation',
  'Glass repairs',
  'Shower enclosures'
] WHERE slug = 'glazing-glassworks';

UPDATE service_categories SET examples = ARRAY[
  'Lock installation',
  'Security systems',
  'Access control'
] WHERE slug = 'locksmith-security-services';

UPDATE service_categories SET examples = ARRAY[
  'Building permits',
  'Contract review',
  'Compliance consulting'
] WHERE slug = 'legal-regulatory-compliance';

UPDATE service_categories SET examples = ARRAY[
  'Architectural design',
  'Planning applications',
  '3D visualisation'
] WHERE slug = 'architecture-design-services';

UPDATE service_categories SET examples = ARRAY[
  'Office fit-outs',
  'Retail spaces',
  'Restaurant builds'
] WHERE slug = 'commercial-projects';

UPDATE service_categories SET examples = ARRAY[
  'General repairs',
  'Maintenance',
  'Odd jobs'
] WHERE slug = 'handyman';