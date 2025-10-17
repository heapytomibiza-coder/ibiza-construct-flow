-- First, deactivate all existing electrician subcategories and their micro-categories
UPDATE public.service_subcategories
SET is_active = false
WHERE category_id = (SELECT id FROM public.service_categories WHERE slug = 'electrician')
  AND slug NOT IN (
    'new-installations',
    'rewiring-upgrades', 
    'lighting-power-systems',
    'smart-home-automation',
    'testing-certification',
    'fault-finding-repairs'
  );

UPDATE public.service_micro_categories
SET is_active = false
WHERE subcategory_id IN (
  SELECT id FROM public.service_subcategories 
  WHERE category_id = (SELECT id FROM public.service_categories WHERE slug = 'electrician')
    AND slug NOT IN (
      'new-installations',
      'rewiring-upgrades',
      'lighting-power-systems',
      'smart-home-automation',
      'testing-certification',
      'fault-finding-repairs'
    )
);

-- Now ensure the correct Electrician structure is inserted
DO $$
DECLARE
  v_category_id UUID;
  v_subcategory_id UUID;
BEGIN
  SELECT id INTO v_category_id FROM public.service_categories WHERE slug = 'electrician';

  -- 1. New Installations
  INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_category_id, 'New Installations', 'new-installations', 'Complete electrical installations for new builds and extensions', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = true
  RETURNING id INTO v_subcategory_id;

  INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
  (v_subcategory_id, 'Full property wiring installation (first & second fix)', 'full-property-wiring', 1, true),
  (v_subcategory_id, 'New build electrical systems', 'new-build-systems', 2, true),
  (v_subcategory_id, 'Extension or renovation wiring', 'extension-wiring', 3, true),
  (v_subcategory_id, 'Consumer unit / fuse board installation', 'consumer-unit-install', 4, true),
  (v_subcategory_id, 'Lighting circuit installation', 'lighting-circuit', 5, true),
  (v_subcategory_id, 'Socket & switch installation', 'socket-switch-install', 6, true),
  (v_subcategory_id, 'Outdoor power supply installation', 'outdoor-power', 7, true),
  (v_subcategory_id, 'Garage & outbuilding electrics', 'garage-outbuilding', 8, true),
  (v_subcategory_id, 'Garden lighting & outdoor sockets', 'garden-lighting-sockets', 9, true),
  (v_subcategory_id, 'EV (electric vehicle) charger installation', 'ev-charger', 10, true),
  (v_subcategory_id, 'Data & network cabling', 'data-network-cabling', 11, true),
  (v_subcategory_id, 'Kitchen & bathroom rewiring', 'kitchen-bathroom-rewiring', 12, true),
  (v_subcategory_id, 'New circuit additions & extensions', 'circuit-additions', 13, true),
  (v_subcategory_id, 'Submain installation (to annex or guest house)', 'submain-installation', 14, true),
  (v_subcategory_id, 'Temporary site power installation', 'temporary-site-power', 15, true)
  ON CONFLICT (subcategory_id, slug) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = true;

  -- 2. Rewiring & Upgrades
  INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_category_id, 'Rewiring & Upgrades', 'rewiring-upgrades', 'Complete and partial rewiring services and electrical upgrades', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = true
  RETURNING id INTO v_subcategory_id;

  INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
  (v_subcategory_id, 'Full house rewiring', 'full-house-rewiring', 1, true),
  (v_subcategory_id, 'Partial rewiring (specific circuits or zones)', 'partial-rewiring', 2, true),
  (v_subcategory_id, 'Consumer unit replacement', 'consumer-unit-replacement', 3, true),
  (v_subcategory_id, 'Earthing & bonding upgrades', 'earthing-bonding', 4, true),
  (v_subcategory_id, 'Lighting rewiring', 'lighting-rewiring', 5, true),
  (v_subcategory_id, 'Socket circuit rewiring', 'socket-rewiring', 6, true),
  (v_subcategory_id, 'Kitchen / bathroom electrical upgrades', 'kitchen-bathroom-upgrades', 7, true),
  (v_subcategory_id, 'Outdated cable replacement', 'cable-replacement', 8, true),
  (v_subcategory_id, 'Old property rewire compliance upgrades', 'compliance-upgrades', 9, true),
  (v_subcategory_id, 'Cable routing & concealment in finished properties', 'cable-concealment', 10, true),
  (v_subcategory_id, 'Load balancing & circuit separation', 'load-balancing', 11, true)
  ON CONFLICT (subcategory_id, slug) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = true;

  -- 3. Lighting & Power Systems
  INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_category_id, 'Lighting & Power Systems', 'lighting-power-systems', 'Interior and exterior lighting design and power distribution', 3, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = true
  RETURNING id INTO v_subcategory_id;

  INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
  (v_subcategory_id, 'Interior lighting design & installation', 'interior-lighting', 1, true),
  (v_subcategory_id, 'LED downlight installation', 'led-downlights', 2, true),
  (v_subcategory_id, 'Smart lighting systems', 'smart-lighting', 3, true),
  (v_subcategory_id, 'Exterior & garden lighting', 'exterior-lighting', 4, true),
  (v_subcategory_id, 'Feature & mood lighting', 'feature-lighting', 5, true),
  (v_subcategory_id, 'Emergency lighting installation', 'emergency-lighting', 6, true),
  (v_subcategory_id, 'Lighting repairs & replacements', 'lighting-repairs', 7, true),
  (v_subcategory_id, 'Dimmers & control switch upgrades', 'dimmers-switches', 8, true),
  (v_subcategory_id, 'Power point installation & relocation', 'power-points', 9, true),
  (v_subcategory_id, 'USB & data socket installation', 'usb-data-sockets', 10, true),
  (v_subcategory_id, 'Ceiling fan installation', 'ceiling-fans', 11, true),
  (v_subcategory_id, 'Power distribution board balancing', 'board-balancing', 12, true)
  ON CONFLICT (subcategory_id, slug) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = true;

  -- 4. Smart Home & Automation
  INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_category_id, 'Smart Home & Automation', 'smart-home-automation', 'Smart home systems and automation solutions', 4, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = true
  RETURNING id INTO v_subcategory_id;

  INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
  (v_subcategory_id, 'Smart lighting systems (Hue, Lutron, etc.)', 'smart-lighting-systems', 1, true),
  (v_subcategory_id, 'Home automation setup (Alexa, Google, Control4)', 'home-automation', 2, true),
  (v_subcategory_id, 'Smart thermostat installation', 'smart-thermostat', 3, true),
  (v_subcategory_id, 'Smart plug & device integration', 'smart-plugs', 4, true),
  (v_subcategory_id, 'Motorised blinds & curtain control systems', 'motorised-blinds', 5, true),
  (v_subcategory_id, 'Security camera & smart doorbell installation', 'security-cameras', 6, true),
  (v_subcategory_id, 'WiFi & network expansion for smart systems', 'wifi-network', 7, true),
  (v_subcategory_id, 'Energy monitoring devices', 'energy-monitoring', 8, true),
  (v_subcategory_id, 'Central control panel setup', 'control-panel', 9, true),
  (v_subcategory_id, 'System troubleshooting & syncing', 'system-troubleshooting', 10, true),
  (v_subcategory_id, 'Smart home upgrades & expansions', 'smart-home-upgrades', 11, true)
  ON CONFLICT (subcategory_id, slug) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = true;

  -- 5. Testing, Certification & Compliance
  INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_category_id, 'Testing, Certification & Compliance', 'testing-certification', 'Electrical testing, safety certificates and compliance services', 5, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = true
  RETURNING id INTO v_subcategory_id;

  INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
  (v_subcategory_id, 'Electrical installation condition report (EICR)', 'eicr', 1, true),
  (v_subcategory_id, 'Landlord safety certificates', 'landlord-certificates', 2, true),
  (v_subcategory_id, 'Portable appliance testing (PAT)', 'pat-testing', 3, true),
  (v_subcategory_id, 'New circuit certification', 'circuit-certification', 4, true),
  (v_subcategory_id, 'Electrical fault testing & insulation resistance', 'fault-testing', 5, true),
  (v_subcategory_id, 'Earthing & bonding testing', 'earthing-testing', 6, true),
  (v_subcategory_id, 'Emergency lighting testing', 'emergency-testing', 7, true),
  (v_subcategory_id, 'Fire alarm testing & certification', 'fire-alarm-testing', 8, true),
  (v_subcategory_id, 'Testing before property handover', 'handover-testing', 9, true),
  (v_subcategory_id, 'Compliance upgrades for local regulations', 'compliance-regulations', 10, true)
  ON CONFLICT (subcategory_id, slug) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = true;

  -- 6. Fault Finding & Repairs
  INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order, is_active)
  VALUES (v_category_id, 'Fault Finding & Repairs', 'fault-finding-repairs', 'Electrical fault diagnosis and repair services', 6, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = true
  RETURNING id INTO v_subcategory_id;

  INSERT INTO public.service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
  (v_subcategory_id, 'Power outage diagnostics', 'power-outage', 1, true),
  (v_subcategory_id, 'Fuse & breaker replacement', 'fuse-breaker', 2, true),
  (v_subcategory_id, 'RCD tripping investigation', 'rcd-tripping', 3, true),
  (v_subcategory_id, 'Flickering lights & circuit faults', 'flickering-lights', 4, true),
  (v_subcategory_id, 'Burnt wiring repair', 'burnt-wiring', 5, true),
  (v_subcategory_id, 'Loose connection tracing', 'loose-connections', 6, true),
  (v_subcategory_id, 'Overload & short-circuit repair', 'overload-repair', 7, true),
  (v_subcategory_id, 'Cable repair & junction replacement', 'cable-repair', 8, true),
  (v_subcategory_id, 'Emergency lighting fault repairs', 'emergency-repairs', 9, true),
  (v_subcategory_id, 'Sockets & switches replacement', 'socket-switch-replacement', 10, true),
  (v_subcategory_id, 'Heating or appliance circuit fault finding', 'appliance-faults', 11, true)
  ON CONFLICT (subcategory_id, slug) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = true;

END $$;