-- Add Interior Design & Styling Services taxonomy structure
-- Deactivate old Interior Design subcategories and micro-categories
UPDATE service_subcategories 
SET is_active = false, updated_at = now() 
WHERE category_id = (SELECT id FROM service_categories WHERE name = 'Interior Design' LIMIT 1);

UPDATE service_micro_categories 
SET is_active = false, updated_at = now() 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id = (SELECT id FROM service_categories WHERE name = 'Interior Design' LIMIT 1)
);

-- Insert new subcategories for Interior Design & Styling Services
INSERT INTO service_subcategories (category_id, name, display_order, is_active)
SELECT 
  cat.id,
  subcategory,
  row_number() OVER () as display_order,
  true
FROM service_categories cat
CROSS JOIN (VALUES
  ('Interior Design Consultation & Concept Development'),
  ('Interior Layout & Space Planning'),
  ('Furniture & Custom Joinery Design'),
  ('Lighting, Colour & Material Styling'),
  ('Decoration, Furnishing & Final Styling'),
  ('Commercial & Hospitality Interiors'),
  ('Sustainable & Holistic Interior Design')
) AS subs(subcategory)
WHERE cat.name = 'Interior Design';

-- Insert micro-categories for Interior Design Consultation & Concept Development
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Initial design consultation & brief creation'),
  ('Concept development & design direction'),
  ('Mood boards & material palettes'),
  ('Colour scheme planning & coordination'),
  ('Style definition (modern, boho, rustic, luxury, etc.)'),
  ('Room-by-room design planning'),
  ('Space usage & layout strategy'),
  ('Lighting & ambience design planning'),
  ('Inspiration sourcing & theme refinement'),
  ('Online / remote design consultation'),
  ('Design presentation for client approval'),
  ('Budget & project scope outline')
) AS micros(micro)
WHERE sub.name = 'Interior Design Consultation & Concept Development'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Interior Design' LIMIT 1);

-- Insert micro-categories for Interior Layout & Space Planning
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Room layout optimisation'),
  ('Furniture positioning & flow planning'),
  ('Partition wall layout & zoning'),
  ('Kitchen & living space reconfiguration'),
  ('Bedroom, dressing room & storage layout'),
  ('Bathroom space optimisation'),
  ('Home office or studio space planning'),
  ('Open-plan area organisation'),
  ('Circulation & sightline improvement'),
  ('Floor plan design & measurements'),
  ('3D visual layouts & walkthroughs'),
  ('On-site layout testing & refinement')
) AS micros(micro)
WHERE sub.name = 'Interior Layout & Space Planning'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Interior Design' LIMIT 1);

-- Insert micro-categories for Furniture & Custom Joinery Design
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Custom furniture design & specification'),
  ('Built-in wardrobes & storage systems'),
  ('Bespoke cabinetry & shelving'),
  ('Reception desks, bars & counters'),
  ('TV units & entertainment walls'),
  ('Dining table or coffee table design'),
  ('Material & finish selection (wood, veneer, lacquer)'),
  ('Furniture layout & scale coordination'),
  ('Furniture sourcing & production management'),
  ('Collaboration with carpenters & fabricators'),
  ('Installation supervision & fitting checks'),
  ('Furniture restoration or refinishing design')
) AS micros(micro)
WHERE sub.name = 'Furniture & Custom Joinery Design'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Interior Design' LIMIT 1);

-- Insert micro-categories for Lighting, Colour & Material Styling
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Lighting plan coordination with electrician'),
  ('Decorative lighting fixture selection'),
  ('Accent & mood lighting design'),
  ('Colour palette creation & wall finishes'),
  ('Material sourcing (tiles, flooring, fabrics, etc.)'),
  ('Fabric & texture matching (curtains, upholstery)'),
  ('Surface finishes & decorative coatings'),
  ('Paint & wallpaper specification'),
  ('Lighting control & dimming systems'),
  ('Style continuity across spaces'),
  ('Sample boards & finish presentations'),
  ('On-site material approval coordination')
) AS micros(micro)
WHERE sub.name = 'Lighting, Colour & Material Styling'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Interior Design' LIMIT 1);

-- Insert micro-categories for Decoration, Furnishing & Final Styling
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Furniture selection & procurement'),
  ('Soft furnishing (curtains, cushions, rugs)'),
  ('Wall art, mirrors & decor curation'),
  ('Indoor plant selection & placement'),
  ('Tableware & accessory styling'),
  ('Seasonal re-styling or refresh'),
  ('Home staging for sale or rental'),
  ('Luxury finishing & hotel-style detailing'),
  ('Brand or theme-based interior styling'),
  ('Final styling setup & photo preparation'),
  ('Custom decor commissions'),
  ('Personalised interior shopping service')
) AS micros(micro)
WHERE sub.name = 'Decoration, Furnishing & Final Styling'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Interior Design' LIMIT 1);

-- Insert micro-categories for Commercial & Hospitality Interiors
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Restaurant & café interior design'),
  ('Retail & boutique space design'),
  ('Hotel & villa interior concepts'),
  ('Office & workspace layout planning'),
  ('Event & pop-up venue styling'),
  ('Wellness spa or salon interior design'),
  ('Furniture & fixture selection for commercial use'),
  ('Lighting & acoustic planning'),
  ('Brand experience & visual identity integration'),
  ('Custom signage & display design'),
  ('Maintenance & durability material choices'),
  ('Commercial fit-out supervision')
) AS micros(micro)
WHERE sub.name = 'Commercial & Hospitality Interiors'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Interior Design' LIMIT 1);

-- Insert micro-categories for Sustainable & Holistic Interior Design
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Eco-conscious material selection'),
  ('Reclaimed & recycled furniture sourcing'),
  ('Low-VOC paints & natural finishes'),
  ('Energy-efficient lighting & systems'),
  ('Indoor air quality & healthy material planning'),
  ('Biophilic design (plants, natural textures)'),
  ('Sustainable textile & fabric use'),
  ('Local artisan & ethical sourcing'),
  ('Minimal-waste design approach'),
  ('Space for mindfulness & well-being'),
  ('Design for long-term adaptability'),
  ('Sustainability report & certification support')
) AS micros(micro)
WHERE sub.name = 'Sustainable & Holistic Interior Design'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Interior Design' LIMIT 1);