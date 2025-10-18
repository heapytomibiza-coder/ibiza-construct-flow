-- Add Architecture & Design Services taxonomy structure
-- Deactivate old Architecture subcategories and micro-categories
UPDATE service_subcategories 
SET is_active = false, updated_at = now() 
WHERE category_id = (SELECT id FROM service_categories WHERE name = 'Architecture' LIMIT 1);

UPDATE service_micro_categories 
SET is_active = false, updated_at = now() 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id = (SELECT id FROM service_categories WHERE name = 'Architecture' LIMIT 1)
);

-- Insert new subcategories for Architecture & Design Services
INSERT INTO service_subcategories (category_id, name, display_order, is_active)
SELECT 
  cat.id,
  subcategory,
  row_number() OVER () as display_order,
  true
FROM service_categories cat
CROSS JOIN (VALUES
  ('Architectural Design & Planning'),
  ('Interior Architecture & Spatial Design'),
  ('Landscape & Exterior Architecture'),
  ('Renovation, Restoration & Extensions'),
  ('Sustainable & Eco Design'),
  ('Technical Documentation & Compliance'),
  ('Concept Design & Visualisation')
) AS subs(subcategory)
WHERE cat.name = 'Architecture';

-- Insert micro-categories for Architectural Design & Planning
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Concept & schematic design development'),
  ('Full architectural drawings (plans, elevations, sections)'),
  ('Planning application drawings & submissions'),
  ('Site surveys & measured drawings'),
  ('3D modelling & visualisation (SketchUp, Revit, etc.)'),
  ('Design development for client approval'),
  ('Technical drawings & construction detailing'),
  ('Building permit coordination & licensing'),
  ('Material & specification documentation'),
  ('Planning revisions & compliance updates'),
  ('Change of use or renovation planning'),
  ('Architectural consultancy & feasibility reports')
) AS micros(micro)
WHERE sub.name = 'Architectural Design & Planning'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Architecture' LIMIT 1);

-- Insert micro-categories for Interior Architecture & Spatial Design
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Interior layout & floor plan optimisation'),
  ('Open-plan conversions & spatial flow redesign'),
  ('Ceiling, lighting & structural layout coordination'),
  ('Built-in furniture & joinery design'),
  ('Custom partitioning & feature wall design'),
  ('Interior material & finish specification'),
  ('Mood boards & visual concept presentations'),
  ('Ergonomic & functional space planning'),
  ('Integration with mechanical & electrical plans'),
  ('Detailed interior construction drawings'),
  ('3D walkthroughs & presentation renders'),
  ('On-site design supervision & adjustments')
) AS micros(micro)
WHERE sub.name = 'Interior Architecture & Spatial Design'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Architecture' LIMIT 1);

-- Insert micro-categories for Landscape & Exterior Architecture
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Site planning & zoning layouts'),
  ('Garden & terrace integration with building'),
  ('Outdoor living & pool area design'),
  ('Topography & drainage design'),
  ('Lighting, seating & pathway planning'),
  ('Retaining wall & boundary layout design'),
  ('Hardscape & softscape coordination'),
  ('Rooftop terrace & pergola design'),
  ('Irrigation & planting integration'),
  ('Environmental & wind/sun orientation analysis'),
  ('3D visualisation for outdoor spaces'),
  ('Landscape concept documentation')
) AS micros(micro)
WHERE sub.name = 'Landscape & Exterior Architecture'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Architecture' LIMIT 1);

-- Insert micro-categories for Renovation, Restoration & Extensions
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('House extension & floor addition design'),
  ('Property renovation planning & redesign'),
  ('Heritage building restoration'),
  ('Facade redesign & modernisation'),
  ('Structural modifications & approvals'),
  ('Roof terrace or balcony conversion'),
  ('Basement or attic conversion design'),
  ('Adaptive reuse of existing structures'),
  ('Energy efficiency & sustainability upgrades'),
  ('Interior reconfiguration for functionality'),
  ('Permit drawings for renovation works'),
  ('Architectural supervision during restoration')
) AS micros(micro)
WHERE sub.name = 'Renovation, Restoration & Extensions'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Architecture' LIMIT 1);

-- Insert micro-categories for Sustainable & Eco Design
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Passive design & orientation planning'),
  ('Natural ventilation & lighting strategies'),
  ('Solar shading & thermal mass design'),
  ('Green roof & wall integration'),
  ('Eco material specification (bamboo, recycled, etc.)'),
  ('Rainwater harvesting & reuse planning'),
  ('Energy-efficient building envelope design'),
  ('Renewable energy integration coordination'),
  ('Net-zero & low-carbon building design'),
  ('Sustainability certification (BREEAM, LEED)'),
  ('Life cycle & embodied carbon analysis'),
  ('Eco retrofit design consultancy')
) AS micros(micro)
WHERE sub.name = 'Sustainable & Eco Design'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Architecture' LIMIT 1);

-- Insert micro-categories for Technical Documentation & Compliance
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Building code & regulation compliance'),
  ('Fire safety & accessibility planning'),
  ('Structural coordination with engineers'),
  ('MEP coordination drawings'),
  ('Specification sheets & detail drawings'),
  ('Tender documentation preparation'),
  ('Bill of quantities coordination'),
  ('Health & safety compliance documentation'),
  ('Construction phase coordination'),
  ('Post-construction documentation (as-built plans)'),
  ('Client & contractor liaison drawings'),
  ('Certificate of habitability (Cédula) preparation')
) AS micros(micro)
WHERE sub.name = 'Technical Documentation & Compliance'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Architecture' LIMIT 1);

-- Insert micro-categories for Concept Design & Visualisation
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Concept sketches & creative direction'),
  ('3D visualisations & photorealistic renders'),
  ('Architectural animation & walkthrough videos'),
  ('Colour, texture & material visualisation'),
  ('Concept presentations for investor approval'),
  ('Marketing visuals & brochure render packs'),
  ('Virtual reality project tours'),
  ('Exterior lighting & ambience visualisation'),
  ('Digital twin & BIM visual data models'),
  ('Style development (modern, rustic, minimalist, etc.)'),
  ('Interior styling mockups & presentation boards'),
  ('Design refinement sessions with clients')
) AS micros(micro)
WHERE sub.name = 'Concept Design & Visualisation'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Architecture' LIMIT 1);