-- Add Air Conditioning & Climate Control (HVAC) Services taxonomy structure
-- Deactivate old Air Conditioning subcategories and micro-categories
UPDATE service_subcategories 
SET is_active = false, updated_at = now() 
WHERE category_id = (SELECT id FROM service_categories WHERE name = 'Air Conditioning' LIMIT 1);

UPDATE service_micro_categories 
SET is_active = false, updated_at = now() 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id = (SELECT id FROM service_categories WHERE name = 'Air Conditioning' LIMIT 1)
);

-- Insert new subcategories for Air Conditioning & Climate Control (HVAC) Services
INSERT INTO service_subcategories (category_id, name, display_order, is_active)
SELECT 
  cat.id,
  subcategory,
  row_number() OVER () as display_order,
  true
FROM service_categories cat
CROSS JOIN (VALUES
  ('Air Conditioning Installation'),
  ('Air Conditioning Maintenance & Servicing'),
  ('Air Conditioning Repairs & Faults'),
  ('Ventilation & Airflow Systems'),
  ('Heating & Climate Control Systems'),
  ('Commercial & Industrial HVAC Systems'),
  ('Renewable & Energy-Efficient HVAC Solutions')
) AS subs(subcategory)
WHERE cat.name = 'Air Conditioning';

-- Insert micro-categories for Air Conditioning Installation
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Split system installation (wall or ceiling units)'),
  ('Multi-split and VRV/VRF system setup'),
  ('Ducted air conditioning installation'),
  ('Cassette or floor-standing unit installation'),
  ('Portable & mobile unit setup'),
  ('Concealed or decorative system integration'),
  ('Pipework, drainage & condensate routing'),
  ('Electrical connection & isolation'),
  ('Commissioning & performance testing'),
  ('Outdoor condenser mounting & alignment'),
  ('Smart AC control system setup'),
  ('Noise reduction & vibration dampening')
) AS micros(micro)
WHERE sub.name = 'Air Conditioning Installation'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Air Conditioning' LIMIT 1);

-- Insert micro-categories for Air Conditioning Maintenance & Servicing
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Routine AC servicing (filter, coil & pressure checks)'),
  ('Refrigerant gas level inspection & refill'),
  ('Thermostat calibration & control testing'),
  ('System cleaning & sanitisation'),
  ('Condenser & evaporator coil cleaning'),
  ('Drainage line flushing & blockage removal'),
  ('Fan & motor lubrication'),
  ('Energy efficiency testing'),
  ('Seasonal pre-summer servicing'),
  ('Post-construction cleaning & restart service'),
  ('Preventative maintenance contracts'),
  ('Performance report & service certification')
) AS micros(micro)
WHERE sub.name = 'Air Conditioning Maintenance & Servicing'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Air Conditioning' LIMIT 1);

-- Insert micro-categories for Air Conditioning Repairs & Faults
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('No cooling or heating fault diagnostics'),
  ('Refrigerant leak detection & repair'),
  ('Compressor or fan motor replacement'),
  ('Thermostat or sensor replacement'),
  ('Drainage leak or overflow correction'),
  ('Electrical fault tracing'),
  ('Gas recharging (R32, R410A, etc.)'),
  ('Noisy or vibrating unit repairs'),
  ('Condensate pump repair or replacement'),
  ('Emergency breakdown service'),
  ('Control board or PCB replacement'),
  ('System rebalancing & airflow adjustment')
) AS micros(micro)
WHERE sub.name = 'Air Conditioning Repairs & Faults'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Air Conditioning' LIMIT 1);

-- Insert micro-categories for Ventilation & Airflow Systems
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Mechanical ventilation with heat recovery (MVHR)'),
  ('Extractor fan installation (bathroom, kitchen, etc.)'),
  ('Ductwork design & installation'),
  ('Vent grille & diffuser installation'),
  ('Commercial ventilation systems'),
  ('Smoke extraction systems'),
  ('Filter & damper replacement'),
  ('Ventilation balancing & airflow testing'),
  ('Air quality monitoring systems'),
  ('Ventilation cleaning & disinfection'),
  ('Fresh air intake design'),
  ('Humidity control system installation')
) AS micros(micro)
WHERE sub.name = 'Ventilation & Airflow Systems'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Air Conditioning' LIMIT 1);

-- Insert micro-categories for Heating & Climate Control Systems
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Heat pump installation (air or ground source)'),
  ('Electric radiator & convector heater installation'),
  ('Underfloor heating systems (electric or water-based)'),
  ('Boiler & central heating connection'),
  ('Smart thermostat & zoning controls'),
  ('Fan coil & terminal unit setup'),
  ('Radiant panel heating systems'),
  ('Dehumidifier & humidifier installation'),
  ('Seasonal temperature control balancing'),
  ('Heating circuit flushing & pressure testing'),
  ('Thermal insulation for ducts & pipes'),
  ('System optimisation for energy efficiency')
) AS micros(micro)
WHERE sub.name = 'Heating & Climate Control Systems'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Air Conditioning' LIMIT 1);

-- Insert micro-categories for Commercial & Industrial HVAC Systems
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Large-scale HVAC design & installation'),
  ('Rooftop packaged unit installation'),
  ('Air handling unit (AHU) setup & servicing'),
  ('Chiller plant installation & commissioning'),
  ('Cold room & refrigeration systems'),
  ('Server room climate control systems'),
  ('BMS (Building Management System) integration'),
  ('Ductwork fabrication & acoustic insulation'),
  ('Commercial system maintenance contracts'),
  ('HVAC retrofits for offices & hotels'),
  ('Filter bank & damper control systems'),
  ('Industrial exhaust & fume extraction')
) AS micros(micro)
WHERE sub.name = 'Commercial & Industrial HVAC Systems'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Air Conditioning' LIMIT 1);

-- Insert micro-categories for Renewable & Energy-Efficient HVAC Solutions
INSERT INTO service_micro_categories (subcategory_id, name, display_order, is_active)
SELECT 
  sub.id,
  micro,
  row_number() OVER () as display_order,
  true
FROM service_subcategories sub
CROSS JOIN (VALUES
  ('Solar-assisted air conditioning'),
  ('Hybrid heat pump systems'),
  ('Inverter-based energy-saving upgrades'),
  ('Geothermal HVAC systems'),
  ('Eco refrigerant system conversions'),
  ('Smart home climate control integration'),
  ('Energy recovery ventilation systems'),
  ('Green building HVAC compliance'),
  ('Performance monitoring & analytics'),
  ('Carbon footprint reduction audits'),
  ('Energy certification documentation')
) AS micros(micro)
WHERE sub.name = 'Renewable & Energy-Efficient HVAC Solutions'
  AND sub.category_id = (SELECT id FROM service_categories WHERE name = 'Air Conditioning' LIMIT 1);