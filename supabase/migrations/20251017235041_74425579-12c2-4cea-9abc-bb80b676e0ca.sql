-- Clean up old plumber subcategories and implement comprehensive structure
DO $$
DECLARE
  v_plumber_id UUID := '096e750f-dcf5-48de-b379-8a312a00e35e';
  v_general_plumbing_id UUID;
  v_heating_boilers_id UUID;
  v_bathrooms_kitchens_id UUID;
  v_leak_detection_id UUID;
  v_drainage_waste_id UUID;
  v_emergency_id UUID;
BEGIN

-- 1. Deactivate old subcategories
UPDATE service_subcategories 
SET is_active = false
WHERE category_id = v_plumber_id
  AND slug IN ('installation', 'repairs', 'heating', 'emergency', 'drainage', 'leak-repairs');

-- 2. Insert new comprehensive subcategories
INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
VALUES 
  (v_plumber_id, 'General Plumbing', 'general-plumbing', 'Installations, repairs, pipes, taps, and general plumbing work', 1, true),
  (v_plumber_id, 'Heating & Boilers', 'heating-boilers', 'Boiler installation, central heating, radiators, and heating systems', 2, true),
  (v_plumber_id, 'Bathrooms & Kitchens', 'bathrooms-kitchens', 'Bathroom and kitchen plumbing installations and refurbishments', 3, true),
  (v_plumber_id, 'Leak Detection & Repairs', 'leak-detection-repairs', 'Finding and fixing leaks, moisture testing, and emergency sealing', 4, true),
  (v_plumber_id, 'Drainage & Waste Systems', 'drainage-waste-systems', 'Drain unblocking, CCTV inspection, waste pipes, and drainage solutions', 5, true),
  (v_plumber_id, 'Emergency Call-Outs', 'emergency-call-outs', '24/7 emergency plumbing services for urgent issues', 6, true)
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- Get subcategory IDs
SELECT id INTO v_general_plumbing_id FROM service_subcategories WHERE category_id = v_plumber_id AND slug = 'general-plumbing';
SELECT id INTO v_heating_boilers_id FROM service_subcategories WHERE category_id = v_plumber_id AND slug = 'heating-boilers';
SELECT id INTO v_bathrooms_kitchens_id FROM service_subcategories WHERE category_id = v_plumber_id AND slug = 'bathrooms-kitchens';
SELECT id INTO v_leak_detection_id FROM service_subcategories WHERE category_id = v_plumber_id AND slug = 'leak-detection-repairs';
SELECT id INTO v_drainage_waste_id FROM service_subcategories WHERE category_id = v_plumber_id AND slug = 'drainage-waste-systems';
SELECT id INTO v_emergency_id FROM service_subcategories WHERE category_id = v_plumber_id AND slug = 'emergency-call-outs';

-- 3. Insert micro-categories for General Plumbing
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
VALUES
  (v_general_plumbing_id, 'New plumbing installations', 'new-plumbing-installations', 'Complete new plumbing system installations', 1, true),
  (v_general_plumbing_id, 'Tap, mixer & valve replacement', 'tap-mixer-valve-replacement', 'Replacing taps, mixers, and valves', 2, true),
  (v_general_plumbing_id, 'Pipe fitting & rerouting', 'pipe-fitting-rerouting', 'Installing and rerouting pipes', 3, true),
  (v_general_plumbing_id, 'Water pressure issues', 'water-pressure-issues', 'Diagnosing and fixing water pressure problems', 4, true),
  (v_general_plumbing_id, 'Leak detection & repair', 'leak-detection-repair', 'Finding and repairing leaks', 5, true),
  (v_general_plumbing_id, 'Toilet installation & repair', 'toilet-installation-repair', 'Installing and repairing toilets', 6, true),
  (v_general_plumbing_id, 'Sink & basin installation', 'sink-basin-installation', 'Installing sinks and basins', 7, true),
  (v_general_plumbing_id, 'Shower & bath installation', 'shower-bath-installation', 'Installing showers and baths', 8, true),
  (v_general_plumbing_id, 'Washing machine & dishwasher connections', 'washing-machine-dishwasher-connections', 'Connecting appliances to water supply', 9, true),
  (v_general_plumbing_id, 'Outdoor water supply installation', 'outdoor-water-supply-installation', 'Installing outdoor taps and water points', 10, true),
  (v_general_plumbing_id, 'Pipe lagging & insulation', 'pipe-lagging-insulation', 'Insulating pipes to prevent freezing', 11, true),
  (v_general_plumbing_id, 'Burst pipe repair', 'burst-pipe-repair', 'Emergency burst pipe repairs', 12, true),
  (v_general_plumbing_id, 'Stopcock installation & replacement', 'stopcock-installation-replacement', 'Installing and replacing stopcocks', 13, true),
  (v_general_plumbing_id, 'Mains water connection & isolation', 'mains-water-connection-isolation', 'Connecting to mains water and isolation', 14, true)
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- 4. Insert micro-categories for Heating & Boilers
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
VALUES
  (v_heating_boilers_id, 'Boiler installation (gas, oil, electric)', 'boiler-installation', 'Installing new boilers of all types', 1, true),
  (v_heating_boilers_id, 'Boiler repair & servicing', 'boiler-repair-servicing', 'Repairing and servicing existing boilers', 2, true),
  (v_heating_boilers_id, 'Central heating system installation', 'central-heating-system-installation', 'Installing complete central heating systems', 3, true),
  (v_heating_boilers_id, 'Radiator installation & replacement', 'radiator-installation-replacement', 'Installing and replacing radiators', 4, true),
  (v_heating_boilers_id, 'Underfloor heating installation (wet systems)', 'underfloor-heating-installation', 'Installing wet underfloor heating systems', 5, true),
  (v_heating_boilers_id, 'Power flushing & descaling', 'power-flushing-descaling', 'Cleaning heating systems', 6, true),
  (v_heating_boilers_id, 'Thermostat installation (manual or smart)', 'thermostat-installation', 'Installing heating controls', 7, true),
  (v_heating_boilers_id, 'Hot water cylinder installation', 'hot-water-cylinder-installation', 'Installing hot water cylinders', 8, true),
  (v_heating_boilers_id, 'Expansion vessel replacement', 'expansion-vessel-replacement', 'Replacing expansion vessels', 9, true),
  (v_heating_boilers_id, 'Pump replacement & balancing', 'pump-replacement-balancing', 'Replacing and balancing heating pumps', 10, true),
  (v_heating_boilers_id, 'System upgrades & conversions', 'system-upgrades-conversions', 'Upgrading heating systems', 11, true),
  (v_heating_boilers_id, 'Immersion heater installation', 'immersion-heater-installation', 'Installing immersion heaters', 12, true),
  (v_heating_boilers_id, 'Renewable heating systems (solar, heat pump tie-ins)', 'renewable-heating-systems', 'Installing renewable heating solutions', 13, true)
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- 5. Insert micro-categories for Bathrooms & Kitchens
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
VALUES
  (v_bathrooms_kitchens_id, 'Bathroom plumbing installation', 'bathroom-plumbing-installation', 'Complete bathroom plumbing', 1, true),
  (v_bathrooms_kitchens_id, 'Kitchen plumbing installation', 'kitchen-plumbing-installation', 'Complete kitchen plumbing', 2, true),
  (v_bathrooms_kitchens_id, 'Tap & mixer installations', 'tap-mixer-installations', 'Installing taps and mixers', 3, true),
  (v_bathrooms_kitchens_id, 'Shower valve & head replacement', 'shower-valve-head-replacement', 'Replacing shower valves and heads', 4, true),
  (v_bathrooms_kitchens_id, 'Waste pipe installations', 'waste-pipe-installations', 'Installing waste pipes', 5, true),
  (v_bathrooms_kitchens_id, 'Sanitary ware connection', 'sanitary-ware-connection', 'Connecting sanitary ware', 6, true),
  (v_bathrooms_kitchens_id, 'Bath & shower tray installation', 'bath-shower-tray-installation', 'Installing baths and shower trays', 7, true),
  (v_bathrooms_kitchens_id, 'Wet room preparation (waterproofing, tray & waste)', 'wet-room-preparation', 'Preparing and installing wet rooms', 8, true),
  (v_bathrooms_kitchens_id, 'Bidet & WC installations', 'bidet-wc-installations', 'Installing bidets and WCs', 9, true),
  (v_bathrooms_kitchens_id, 'Sink & waste disposal units', 'sink-waste-disposal-units', 'Installing sinks and waste disposal', 10, true),
  (v_bathrooms_kitchens_id, 'Plumbing for kitchen appliances', 'plumbing-kitchen-appliances', 'Connecting kitchen appliances', 11, true),
  (v_bathrooms_kitchens_id, 'Relocating plumbing fixtures during refurbishments', 'relocating-plumbing-fixtures', 'Moving plumbing during renovations', 12, true)
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- 6. Insert micro-categories for Leak Detection & Repairs
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
VALUES
  (v_leak_detection_id, 'Visible leak repair (pipes, joints, fittings)', 'visible-leak-repair', 'Repairing visible leaks', 1, true),
  (v_leak_detection_id, 'Hidden leak detection (thermal or acoustic)', 'hidden-leak-detection', 'Finding hidden leaks with specialist equipment', 2, true),
  (v_leak_detection_id, 'Underground pipe leak tracing', 'underground-pipe-leak-tracing', 'Tracing underground pipe leaks', 3, true),
  (v_leak_detection_id, 'Leak source investigation', 'leak-source-investigation', 'Investigating leak sources', 4, true),
  (v_leak_detection_id, 'Wall & ceiling moisture testing', 'wall-ceiling-moisture-testing', 'Testing for moisture in walls and ceilings', 5, true),
  (v_leak_detection_id, 'Water supply pipe repairs', 'water-supply-pipe-repairs', 'Repairing water supply pipes', 6, true),
  (v_leak_detection_id, 'Drain leak detection', 'drain-leak-detection', 'Detecting drain leaks', 7, true),
  (v_leak_detection_id, 'Joint & valve tightening / resealing', 'joint-valve-tightening-resealing', 'Tightening and resealing joints and valves', 8, true),
  (v_leak_detection_id, 'Emergency pipe sealing', 'emergency-pipe-sealing', 'Emergency sealing of leaking pipes', 9, true),
  (v_leak_detection_id, 'Post-repair testing & prevention measures', 'post-repair-testing-prevention', 'Testing repairs and preventing future leaks', 10, true)
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- 7. Insert micro-categories for Drainage & Waste Systems
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
VALUES
  (v_drainage_waste_id, 'Drain unblocking (toilets, sinks, showers)', 'drain-unblocking', 'Unblocking drains throughout property', 1, true),
  (v_drainage_waste_id, 'CCTV drain inspection', 'cctv-drain-inspection', 'Camera inspection of drains', 2, true),
  (v_drainage_waste_id, 'Soakaway systems & repair', 'soakaway-systems-repair', 'Installing and repairing soakaways', 3, true),
  (v_drainage_waste_id, 'Waste pipe installations & rerouting', 'waste-pipe-installations-rerouting', 'Installing and rerouting waste pipes', 4, true),
  (v_drainage_waste_id, 'Gully cleaning & maintenance', 'gully-cleaning-maintenance', 'Cleaning and maintaining gullies', 5, true),
  (v_drainage_waste_id, 'Septic tank connection & maintenance', 'septic-tank-connection-maintenance', 'Connecting and maintaining septic tanks', 6, true),
  (v_drainage_waste_id, 'Greywater system installation', 'greywater-system-installation', 'Installing greywater recycling systems', 7, true),
  (v_drainage_waste_id, 'External drain installation', 'external-drain-installation', 'Installing external drainage', 8, true),
  (v_drainage_waste_id, 'Backflow prevention systems', 'backflow-prevention-systems', 'Installing backflow prevention', 9, true),
  (v_drainage_waste_id, 'Stormwater management connections', 'stormwater-management-connections', 'Managing stormwater drainage', 10, true),
  (v_drainage_waste_id, 'Drain relining & patch repairs', 'drain-relining-patch-repairs', 'Relining and patching drains', 11, true)
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

-- 8. Insert micro-categories for Emergency Call-Outs
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
VALUES
  (v_emergency_id, 'Burst pipe response', 'burst-pipe-response', 'Emergency response to burst pipes', 1, true),
  (v_emergency_id, 'Blocked drains & flooding', 'blocked-drains-flooding', 'Emergency drain unblocking and flood response', 2, true),
  (v_emergency_id, 'Emergency boiler breakdown', 'emergency-boiler-breakdown', '24/7 boiler breakdown service', 3, true),
  (v_emergency_id, 'No water / low water pressure', 'no-water-low-pressure', 'Emergency water supply restoration', 4, true),
  (v_emergency_id, 'Emergency leak sealing', 'emergency-leak-sealing', 'Emergency leak sealing service', 5, true),
  (v_emergency_id, 'Overflow & tank problems', 'overflow-tank-problems', 'Emergency overflow and tank issues', 6, true),
  (v_emergency_id, 'Radiator or heating failure', 'radiator-heating-failure', 'Emergency heating repairs', 7, true),
  (v_emergency_id, 'Emergency tap or valve failure', 'emergency-tap-valve-failure', 'Emergency tap and valve repairs', 8, true),
  (v_emergency_id, 'Temporary isolation & fix until permanent repair', 'temporary-isolation-fix', 'Temporary emergency fixes', 9, true)
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

END $$;