-- Add Commercial & Infrastructure Projects taxonomy structure
-- Deactivate old Commercial & Infrastructure subcategories and micro-categories
UPDATE service_subcategories 
SET is_active = false, updated_at = now() 
WHERE category_id = (SELECT id FROM service_categories WHERE name = 'Commercial & Infrastructure' LIMIT 1);

UPDATE service_micro_categories 
SET is_active = false, updated_at = now() 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id = (SELECT id FROM service_categories WHERE name = 'Commercial & Infrastructure' LIMIT 1)
);

-- Insert new subcategories for Commercial & Infrastructure Projects
INSERT INTO service_subcategories (category_id, name, display_order, is_active)
SELECT 
  cat.id,
  subcategory,
  row_number() OVER () as display_order,
  true
FROM service_categories cat
CROSS JOIN (VALUES
  ('Commercial Building Construction'),
  ('Commercial Renovation & Refurbishment'),
  ('Industrial & Infrastructure Construction'),
  ('Public & Government Projects'),
  ('Commercial Fit-Out & Interiors'),
  ('Project Coordination & Compliance'),
  ('Maintenance & Facilities Management')
) AS subs(subcategory)
WHERE cat.name = 'Commercial & Infrastructure';

-- Insert micro-categories for Commercial Building Construction
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Office building design & construction'),
  ('Retail & shopping unit fit-out'),
  ('Restaurant & bar build projects'),
  ('Hotels, villas & accommodation developments'),
  ('Industrial warehouse & factory construction'),
  ('Showrooms & display center builds'),
  ('Healthcare & clinic construction'),
  ('Educational & institutional buildings'),
  ('Sports & leisure facility construction'),
  ('Mixed-use development projects'),
  ('Parking structures & car parks'),
  ('Compliance & accessibility integration')
) AS micros(micro)
WHERE sub.name = 'Commercial Building Construction'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Commercial & Infrastructure' LIMIT 1);

-- Insert micro-categories for Commercial Renovation & Refurbishment
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Office & workspace renovations'),
  ('Retail store redesign & rebranding'),
  ('Restaurant & hospitality refits'),
  ('Hotel suite or lobby refurbishment'),
  ('Commercial flooring & ceiling replacement'),
  ('Partition wall & acoustic system upgrades'),
  ('Lighting & MEP system modernisation'),
  ('Facade upgrades & exterior repainting'),
  ('Reception & common area redesign'),
  ('Accessibility & compliance improvements'),
  ('Fire safety & emergency lighting upgrades'),
  ('Full interior strip-out & refit coordination')
) AS micros(micro)
WHERE sub.name = 'Commercial Renovation & Refurbishment'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Commercial & Infrastructure' LIMIT 1);

-- Insert micro-categories for Industrial & Infrastructure Construction
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Factory & production facility construction'),
  ('Power station & utility infrastructure'),
  ('Roads, highways & bridge construction'),
  ('Drainage & sewage system installation'),
  ('Water treatment & pumping stations'),
  ('Solar farms & renewable energy sites'),
  ('Ports, marinas & docking facilities'),
  ('Airport or transport hub infrastructure'),
  ('Telecom & electrical substations'),
  ('Industrial tank & pipeline installation'),
  ('Civil works & heavy engineering projects'),
  ('Large-scale excavation & site development')
) AS micros(micro)
WHERE sub.name = 'Industrial & Infrastructure Construction'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Commercial & Infrastructure' LIMIT 1);

-- Insert micro-categories for Public & Government Projects
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Municipal building construction'),
  ('Public park & recreation facility projects'),
  ('Community centers & sports halls'),
  ('Public school & education facilities'),
  ('Government office refurbishment'),
  ('Healthcare & public health infrastructure'),
  ('Transport & mobility access upgrades'),
  ('Waste management facility construction'),
  ('Public lighting & power distribution'),
  ('Drainage & flood control systems'),
  ('Urban renewal & civic space design'),
  ('Compliance with public tender documentation')
) AS micros(micro)
WHERE sub.name = 'Public & Government Projects'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Commercial & Infrastructure' LIMIT 1);

-- Insert micro-categories for Commercial Fit-Out & Interiors
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Office partitioning & layout planning'),
  ('Commercial flooring & ceiling systems'),
  ('Lighting & electrical fit-out'),
  ('HVAC & ventilation installation'),
  ('Glass walls & acoustic glazing systems'),
  ('Furniture & workstation installation'),
  ('Reception & breakout area design'),
  ('Brand graphics & signage integration'),
  ('Fire alarm & security system setup'),
  ('Networking & data system integration'),
  ('Commercial joinery & cabinetry'),
  ('Final handover inspection & documentation')
) AS micros(micro)
WHERE sub.name = 'Commercial Fit-Out & Interiors'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Commercial & Infrastructure' LIMIT 1);

-- Insert micro-categories for Project Coordination & Compliance
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Project management & supervision'),
  ('Construction scheduling & logistics planning'),
  ('Budget control & cost reporting'),
  ('Site health & safety management'),
  ('Permit & inspection coordination'),
  ('Tendering & subcontractor selection'),
  ('Material procurement & delivery control'),
  ('Client progress reporting'),
  ('Quality assurance & control systems'),
  ('Environmental & sustainability compliance'),
  ('Commissioning & handover documentation'),
  ('Post-project maintenance planning')
) AS micros(micro)
WHERE sub.name = 'Project Coordination & Compliance'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Commercial & Infrastructure' LIMIT 1);

-- Insert micro-categories for Maintenance & Facilities Management
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Planned preventative maintenance contracts'),
  ('Building inspection & safety certification'),
  ('HVAC & electrical maintenance'),
  ('Fire system & alarm servicing'),
  ('Cleaning & waste management for large sites'),
  ('Grounds & exterior upkeep'),
  ('Reactive repair call-out services'),
  ('Energy monitoring & optimization'),
  ('Security & access control maintenance'),
  ('Tenant fit-out coordination & handover'),
  ('Lifecycle asset management'),
  ('Facility upgrade & modernisation plans')
) AS micros(micro)
WHERE sub.name = 'Maintenance & Facilities Management'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Commercial & Infrastructure' LIMIT 1);