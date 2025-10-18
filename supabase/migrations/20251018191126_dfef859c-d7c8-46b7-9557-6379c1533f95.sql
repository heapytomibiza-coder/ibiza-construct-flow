-- Add Transportation, Moving & Delivery Services Category Structure
-- Deactivate old entries if they exist
UPDATE service_categories SET is_active = false 
WHERE slug IN ('transportation-moving-delivery', 'transportation-services', 'moving-delivery');

UPDATE service_subcategories SET is_active = false 
WHERE category_id IN (
  SELECT id FROM service_categories 
  WHERE slug IN ('transportation-moving-delivery', 'transportation-services', 'moving-delivery')
);

UPDATE service_micro_categories SET is_active = false 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id IN (
    SELECT id FROM service_categories 
    WHERE slug IN ('transportation-moving-delivery', 'transportation-services', 'moving-delivery')
  )
);

-- Insert main category
INSERT INTO service_categories (name, slug, icon_name, description, category_group, display_order, is_active)
VALUES (
  'Transportation, Moving & Delivery Services',
  'transportation-moving-delivery',
  'Truck',
  'Professional moving, delivery, and transportation logistics services',
  'specialized',
  22,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon_name = EXCLUDED.icon_name,
  description = EXCLUDED.description,
  is_active = true;

-- Insert subcategories
INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.description,
  sub.display_order,
  true
FROM service_categories c
CROSS JOIN (VALUES
  ('Local & Domestic Moving', 'local-domestic-moving', 'Local house and apartment removals', 1),
  ('International & Long-Distance Moving', 'international-longdistance-moving', 'Cross-border and long-distance relocations', 2),
  ('Delivery & Courier Services', 'delivery-courier-services', 'Same-day and scheduled delivery services', 3),
  ('Logistics & Freight Transport', 'logistics-freight-transport', 'Commercial freight and logistics coordination', 4),
  ('Furniture & Specialist Item Transport', 'furniture-specialist-transport', 'Specialist transport for valuable items', 5),
  ('Vehicle & Equipment Transport', 'vehicle-equipment-transport', 'Vehicle and machinery transportation', 6),
  ('Event & Production Logistics', 'event-production-logistics', 'Event equipment and production logistics', 7),
  ('Storage & Warehousing Solutions', 'storage-warehousing-solutions', 'Storage and warehousing services', 8)
) AS sub(name, slug, description, display_order)
WHERE c.slug = 'transportation-moving-delivery'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Local & Domestic Moving
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Full house / apartment removals', 'full-house-apartment-removals', 'Complete residential removal service', 1),
  ('Partial moves or single-room relocations', 'partial-single-room-moves', 'Move specific rooms or partial loads', 2),
  ('Furniture disassembly & reassembly', 'furniture-disassembly-reassembly', 'Dismantle and reassemble furniture', 3),
  ('Packing & unpacking service', 'packing-unpacking-service', 'Professional packing and unpacking', 4),
  ('Fragile or valuable item handling', 'fragile-valuable-item-handling', 'Special handling for delicate items', 5),
  ('Lift / stair / access assessment', 'lift-stair-access-assessment', 'Assess access and plan logistics', 6),
  ('Loading & unloading assistance', 'loading-unloading-assistance', 'Help with loading and unloading', 7),
  ('Van and driver hire (with or without helpers)', 'van-driver-hire', 'Van rental with driver', 8),
  ('Short-distance moves within Ibiza / mainland Spain', 'short-distance-moves', 'Local area relocations', 9),
  ('Furniture arrangement at destination', 'furniture-arrangement-destination', 'Place furniture at new location', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'local-domestic-moving'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'transportation-moving-delivery')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for International & Long-Distance Moving
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Cross-border removals (EU & UK routes)', 'cross-border-removals', 'International relocation services', 1),
  ('Door-to-door shipping coordination', 'door-to-door-shipping', 'Complete door-to-door logistics', 2),
  ('Customs documentation & clearance', 'customs-documentation-clearance', 'Handle customs procedures', 3),
  ('Freight forwarding & logistics support', 'freight-forwarding-logistics', 'International freight coordination', 4),
  ('Shared container / consolidated shipments', 'shared-container-shipments', 'Consolidated shipping options', 5),
  ('Vehicle & boat transport', 'vehicle-boat-transport', 'Transport vehicles internationally', 6),
  ('Insurance for international transit', 'international-transit-insurance', 'Insurance for international moves', 7),
  ('Storage at origin or destination', 'storage-origin-destination', 'Storage services at either end', 8),
  ('Customs brokerage & port assistance', 'customs-brokerage-port', 'Customs and port support', 9),
  ('Overseas relocation advisory', 'overseas-relocation-advisory', 'Advisory for international moves', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'international-longdistance-moving'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'transportation-moving-delivery')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Delivery & Courier Services
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Same-day or next-day delivery', 'same-day-next-day-delivery', 'Express delivery services', 1),
  ('Local courier collection & drop-off', 'local-courier-collection-dropoff', 'Local courier services', 2),
  ('Scheduled or recurring deliveries (business / retail)', 'scheduled-recurring-deliveries', 'Regular scheduled deliveries', 3),
  ('Furniture, appliance & large-item delivery', 'furniture-appliance-delivery', 'Large item delivery services', 4),
  ('Parcel delivery tracking', 'parcel-delivery-tracking', 'Track parcel deliveries', 5),
  ('Fragile / high-value delivery handling', 'fragile-highvalue-delivery', 'Special handling for valuable items', 6),
  ('White glove delivery service (setup & placement)', 'white-glove-delivery', 'Premium delivery with setup', 7),
  ('Urgent document / legal courier', 'urgent-document-courier', 'Express document delivery', 8),
  ('Inter-island courier (Ibiza ↔ Formentera / Mallorca)', 'inter-island-courier', 'Island-to-island delivery', 9),
  ('Eco / low-emission vehicle delivery options', 'eco-lowemission-delivery', 'Environmentally friendly delivery', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'delivery-courier-services'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'transportation-moving-delivery')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Logistics & Freight Transport
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Commercial freight transport (pallets, goods, supplies)', 'commercial-freight-transport', 'Business freight services', 1),
  ('Warehouse-to-site delivery scheduling', 'warehouse-to-site-delivery', 'Coordinate warehouse deliveries', 2),
  ('Material transport for construction projects', 'material-transport-construction', 'Construction materials delivery', 3),
  ('Crate, container & bulk cargo handling', 'crate-container-bulk-cargo', 'Handle bulk cargo shipments', 4),
  ('Equipment & tool transport', 'equipment-tool-transport', 'Transport equipment and tools', 5),
  ('Heavy-duty load management', 'heavy-duty-load-management', 'Manage heavy loads', 6),
  ('Storage facility transfers', 'storage-facility-transfers', 'Transfer between storage locations', 7),
  ('Airport / port logistics coordination', 'airport-port-logistics', 'Coordinate air and sea freight', 8),
  ('Supply chain tracking & reporting', 'supply-chain-tracking-reporting', 'Track supply chain logistics', 9),
  ('Fleet management & route optimisation', 'fleet-management-route-optimisation', 'Optimize delivery routes', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'logistics-freight-transport'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'transportation-moving-delivery')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Furniture & Specialist Item Transport
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Artwork, sculpture & antiques transport', 'artwork-sculpture-antiques-transport', 'Transport art and antiques', 1),
  ('Piano & instrument moving', 'piano-instrument-moving', 'Specialized piano and instrument moves', 2),
  ('Sensitive equipment (AV / lighting / tech gear)', 'sensitive-equipment-transport', 'Transport delicate equipment', 3),
  ('Designer furniture & showroom deliveries', 'designer-furniture-showroom', 'High-end furniture delivery', 4),
  ('Exhibition / event logistics', 'exhibition-event-logistics', 'Exhibition transport and setup', 5),
  ('Custom crating & protective packaging', 'custom-crating-packaging', 'Custom protective packaging', 6),
  ('Climate-controlled or shock-proof delivery', 'climate-controlled-delivery', 'Specialized climate control', 7),
  ('Multi-stop furniture distribution', 'multi-stop-furniture-distribution', 'Multiple delivery stops', 8),
  ('On-site assembly & placement', 'onsite-assembly-placement', 'Assembly and installation service', 9),
  ('Storage & return transport service', 'storage-return-transport', 'Storage and return services', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'furniture-specialist-transport'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'transportation-moving-delivery')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Vehicle & Equipment Transport
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Car, bike & scooter transport', 'car-bike-scooter-transport', 'Vehicle transportation services', 1),
  ('Boat, jet-ski & marine equipment transfer', 'boat-jetski-marine-transfer', 'Marine equipment transport', 2),
  ('Machinery & construction equipment relocation', 'machinery-construction-equipment', 'Heavy machinery transport', 3),
  ('Trailer & flatbed transport', 'trailer-flatbed-transport', 'Flatbed transportation services', 4),
  ('Vehicle import/export coordination', 'vehicle-import-export', 'International vehicle shipping', 5),
  ('Covered or open vehicle carriers', 'covered-open-carriers', 'Protected vehicle transport', 6),
  ('Motorcycle recovery & delivery', 'motorcycle-recovery-delivery', 'Motorcycle transport services', 7),
  ('Roadside pickup & drop-off', 'roadside-pickup-dropoff', 'Convenient pickup locations', 8),
  ('Storage and staging logistics', 'storage-staging-logistics', 'Vehicle storage and logistics', 9),
  ('Airport or ferry terminal transfer for vehicles', 'airport-ferry-vehicle-transfer', 'Terminal vehicle transfer', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'vehicle-equipment-transport'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'transportation-moving-delivery')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Event & Production Logistics
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Stage, lighting & sound equipment transport', 'stage-lighting-sound-transport', 'Event production equipment', 1),
  ('Festival & club setup logistics', 'festival-club-setup-logistics', 'Festival logistics coordination', 2),
  ('Temporary structure / rigging transport', 'temporary-structure-rigging', 'Transport event structures', 3),
  ('Timed delivery coordination with production teams', 'timed-delivery-coordination', 'Precise timing for events', 4),
  ('Artist / performer logistics support', 'artist-performer-logistics', 'Artist transportation support', 5),
  ('Crew shuttle services', 'crew-shuttle-services', 'Transport crew members', 6),
  ('Pre-show storage & delivery timing', 'preshow-storage-delivery', 'Pre-event storage and timing', 7),
  ('VIP transport coordination', 'vip-transport-coordination', 'VIP transportation services', 8),
  ('Post-event dismantling & return deliveries', 'postevent-dismantling-return', 'Event breakdown and return', 9),
  ('24/7 emergency delivery support', '24-7-emergency-delivery', 'Round-the-clock event support', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'event-production-logistics'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'transportation-moving-delivery')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Storage & Warehousing Solutions
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Short- & long-term storage rental', 'short-longterm-storage-rental', 'Flexible storage rental terms', 1),
  ('Climate-controlled or secure storage', 'climate-controlled-secure-storage', 'Protected storage facilities', 2),
  ('Furniture & household goods storage', 'furniture-household-storage', 'Residential storage services', 3),
  ('Business inventory warehousing', 'business-inventory-warehousing', 'Commercial inventory storage', 4),
  ('Palletised or bulk goods storage', 'palletised-bulk-storage', 'Pallet and bulk storage', 5),
  ('Inventory cataloguing & management', 'inventory-cataloguing-management', 'Inventory tracking services', 6),
  ('Pickup & redelivery from storage', 'pickup-redelivery-storage', 'Storage collection and delivery', 7),
  ('Container storage for relocations', 'container-storage-relocations', 'Container-based storage', 8),
  ('Construction material holding & release', 'construction-material-storage', 'Construction materials storage', 9),
  ('Insurance & monitoring services', 'insurance-monitoring-services', 'Storage insurance and security', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'storage-warehousing-solutions'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'transportation-moving-delivery')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;