-- Populate detailed service items for micro-services

-- House Cleaning Service Items
INSERT INTO professional_service_items (professional_id, service_id, name, description, category, base_price, pricing_type, unit_type, min_quantity, max_quantity, estimated_duration_minutes) VALUES
-- Use a dummy professional_id - in real app, professionals would create these
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'House Cleaning' LIMIT 1), 'Standard House Clean', 'Basic cleaning of living areas, kitchen, and bathrooms', 'labor', 30.00, 'flat_rate', 'service', 1, 1, 120),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'House Cleaning' LIMIT 1), 'Deep Clean Service', 'Thorough cleaning including inside appliances, baseboards, and detailed work', 'labor', 45.00, 'flat_rate', 'service', 1, 1, 180),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'House Cleaning' LIMIT 1), 'Additional Room Cleaning', 'Clean extra bedrooms or living spaces', 'labor', 15.00, 'per_unit', 'room', 1, 5, 45),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'House Cleaning' LIMIT 1), 'Kitchen Deep Clean', 'Inside oven, fridge, detailed counters and cabinets', 'labor', 25.00, 'flat_rate', 'service', 1, 1, 60);

-- Furniture Delivery Service Items
INSERT INTO professional_service_items (professional_id, service_id, name, description, category, base_price, pricing_type, unit_type, min_quantity, max_quantity, estimated_duration_minutes) VALUES
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Furniture Delivery' LIMIT 1), 'Small Item Delivery', 'Chairs, small tables, decor items (up to 25kg)', 'labor', 15.00, 'per_unit', 'item', 1, 10, 30),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Furniture Delivery' LIMIT 1), 'Medium Furniture Delivery', 'Desks, dressers, medium sofas (25-75kg)', 'labor', 25.00, 'per_unit', 'item', 1, 5, 45),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Furniture Delivery' LIMIT 1), 'Large Furniture Delivery', 'Wardrobes, large sofas, beds (75kg+)', 'labor', 40.00, 'per_unit', 'item', 1, 3, 60),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Furniture Delivery' LIMIT 1), 'Assembly After Delivery', 'Professional assembly of delivered furniture', 'additional_services', 20.00, 'per_unit', 'item', 1, 5, 45);

-- Light Installation Service Items  
INSERT INTO professional_service_items (professional_id, service_id, name, description, category, base_price, pricing_type, unit_type, min_quantity, max_quantity, estimated_duration_minutes) VALUES
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Install light fixture' LIMIT 1), 'Basic Light Fixture', 'Standard ceiling light or pendant (existing wiring)', 'labor', 20.00, 'per_unit', 'fixture', 1, 8, 30),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Install light fixture' LIMIT 1), 'Chandelier Installation', 'Heavy decorative fixtures requiring extra support', 'labor', 45.00, 'per_unit', 'fixture', 1, 3, 75),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Install light fixture' LIMIT 1), 'Smart Light Switch', 'Install smart switches with app control', 'labor', 30.00, 'per_unit', 'switch', 1, 10, 20),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Install light fixture' LIMIT 1), 'Under-Cabinet LED Strip', 'Kitchen or workspace LED lighting installation', 'labor', 35.00, 'per_unit', 'strip', 1, 5, 45);

-- Ceiling Fan Installation Service Items
INSERT INTO professional_service_items (professional_id, service_id, name, description, category, base_price, pricing_type, unit_type, min_quantity, max_quantity, estimated_duration_minutes) VALUES
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Install ceiling fan' LIMIT 1), 'Standard Ceiling Fan', 'Basic ceiling fan installation (existing electrical)', 'labor', 40.00, 'per_unit', 'fan', 1, 4, 60),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Install ceiling fan' LIMIT 1), 'Smart Ceiling Fan', 'WiFi-enabled fan with app control and scheduling', 'labor', 55.00, 'per_unit', 'fan', 1, 3, 75),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Install ceiling fan' LIMIT 1), 'Fan with New Wiring', 'Installation requiring new electrical circuit', 'labor', 85.00, 'per_unit', 'fan', 1, 2, 120);

-- Window Cleaning Service Items
INSERT INTO professional_service_items (professional_id, service_id, name, description, category, base_price, pricing_type, unit_type, min_quantity, max_quantity, estimated_duration_minutes) VALUES
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Window Cleaning' LIMIT 1), 'Interior Window Cleaning', 'Clean windows from inside only', 'labor', 3.00, 'per_unit', 'window', 4, 20, 5),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Window Cleaning' LIMIT 1), 'Full Window Service', 'Interior and exterior cleaning both sides', 'labor', 5.00, 'per_unit', 'window', 4, 20, 8),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Window Cleaning' LIMIT 1), 'High Windows (2+ Stories)', 'Specialized equipment for elevated windows', 'labor', 8.00, 'per_unit', 'window', 2, 15, 12);

-- Grocery Shopping Service Items
INSERT INTO professional_service_items (professional_id, service_id, name, description, category, base_price, pricing_type, unit_type, min_quantity, max_quantity, estimated_duration_minutes) VALUES
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Grocery Shopping' LIMIT 1), 'Quick Shopping Trip', 'Up to 15 items from provided list', 'labor', 12.00, 'flat_rate', 'trip', 1, 1, 45),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Grocery Shopping' LIMIT 1), 'Full Weekly Shop', 'Complete grocery shopping 25+ items', 'labor', 18.00, 'flat_rate', 'trip', 1, 1, 75),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM services WHERE micro = 'Grocery Shopping' LIMIT 1), 'Special Dietary Shopping', 'Organic, vegan, or specialty diet requirements', 'labor', 25.00, 'flat_rate', 'trip', 1, 1, 90);

-- Add bulk pricing for popular services
UPDATE professional_service_items 
SET bulk_discount_threshold = 3, bulk_discount_price = 12.00 
WHERE name = 'Additional Room Cleaning';

UPDATE professional_service_items 
SET bulk_discount_threshold = 5, bulk_discount_price = 20.00 
WHERE name = 'Basic Light Fixture';

UPDATE professional_service_items 
SET bulk_discount_threshold = 10, bulk_discount_price = 4.00 
WHERE name = 'Full Window Service';

-- Add Service Add-ons (general ones that apply to multiple services)
INSERT INTO service_addons (service_id, name, description, price, is_popular) VALUES
((SELECT id FROM services WHERE micro = 'House Cleaning' LIMIT 1), 'Same Day Service', 'Get your service completed today', 15.00, true),
((SELECT id FROM services WHERE micro = 'House Cleaning' LIMIT 1), 'Supply All Materials', 'We bring all cleaning supplies and equipment', 8.00, false),
((SELECT id FROM services WHERE micro = 'House Cleaning' LIMIT 1), 'Weekend Premium', 'Service on Saturday or Sunday', 12.00, false),
((SELECT id FROM services WHERE micro = 'House Cleaning' LIMIT 1), 'Eco-Friendly Products Only', 'Use only environmentally safe cleaning products', 5.00, true);

INSERT INTO service_addons (service_id, name, description, price, is_popular) VALUES
((SELECT id FROM services WHERE micro = 'Furniture Delivery' LIMIT 1), 'Same Day Delivery', 'Delivered within 4 hours of booking', 20.00, true),
((SELECT id FROM services WHERE micro = 'Furniture Delivery' LIMIT 1), 'Weekend Delivery', 'Saturday or Sunday delivery service', 15.00, false),
((SELECT id FROM services WHERE micro = 'Furniture Delivery' LIMIT 1), 'Packaging Removal', 'Remove and dispose of all packaging materials', 8.00, true),
((SELECT id FROM services WHERE micro = 'Furniture Delivery' LIMIT 1), 'Furniture Placement', 'Position furniture exactly where you want it', 10.00, false);

INSERT INTO service_addons (service_id, name, description, price, is_popular) VALUES
((SELECT id FROM services WHERE micro = 'Install light fixture' LIMIT 1), 'Supply All Materials', 'Wire nuts, screws, mounting hardware included', 8.00, true),
((SELECT id FROM services WHERE micro = 'Install light fixture' LIMIT 1), 'Same Day Service', 'Installation completed today', 15.00, false),
((SELECT id FROM services WHERE micro = 'Install light fixture' LIMIT 1), 'Old Fixture Removal', 'Remove and dispose of existing fixtures', 10.00, true),
((SELECT id FROM services WHERE micro = 'Install light fixture' LIMIT 1), 'Dimmer Switch Upgrade', 'Install dimmer switches for new fixtures', 12.00, false);

INSERT INTO service_addons (service_id, name, description, price, is_popular) VALUES
((SELECT id FROM services WHERE micro = 'Install ceiling fan' LIMIT 1), 'Old Fan Removal', 'Remove and dispose of existing ceiling fan', 15.00, true),
((SELECT id FROM services WHERE micro = 'Install ceiling fan' LIMIT 1), 'Wall Control Installation', 'Install wall-mounted fan speed control', 20.00, false),
((SELECT id FROM services WHERE micro = 'Install ceiling fan' LIMIT 1), 'Same Day Service', 'Installation completed today', 25.00, false);

INSERT INTO service_addons (service_id, name, description, price, is_popular) VALUES
((SELECT id FROM services WHERE micro = 'Window Cleaning' LIMIT 1), 'Screen Cleaning', 'Clean window screens and frames', 2.00, true),
((SELECT id FROM services WHERE micro = 'Window Cleaning' LIMIT 1), 'Sill and Frame Detail', 'Deep clean window sills and frames', 3.00, false),
((SELECT id FROM services WHERE micro = 'Window Cleaning' LIMIT 1), 'Same Day Service', 'Service completed today', 10.00, false);

INSERT INTO service_addons (service_id, name, description, price, is_popular) VALUES
((SELECT id FROM services WHERE micro = 'Grocery Shopping' LIMIT 1), 'Express Delivery', 'Delivered within 2 hours', 8.00, true),
((SELECT id FROM services WHERE micro = 'Grocery Shopping' LIMIT 1), 'Refrigerated Transport', 'Insulated bags for frozen/cold items', 5.00, true),
((SELECT id FROM services WHERE micro = 'Grocery Shopping' LIMIT 1), 'Price Comparison', 'Find best deals across multiple stores', 6.00, false),
((SELECT id FROM services WHERE micro = 'Grocery Shopping' LIMIT 1), 'Organized Delivery', 'Sort items by category upon delivery', 4.00, false);