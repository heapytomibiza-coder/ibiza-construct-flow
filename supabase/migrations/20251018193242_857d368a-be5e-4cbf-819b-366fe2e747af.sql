-- Add complete subcategories and micro-categories for HVAC, Handyman, and Commercial Projects

-- HVAC
UPDATE service_subcategories SET is_active = false WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'hvac');
UPDATE service_micro_categories SET is_active = false WHERE subcategory_id IN (SELECT id FROM service_subcategories WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'hvac'));

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_categories WHERE slug = 'hvac'), 'Air Conditioning Installation & Repair', 'hvac-air-conditioning-installation-repair', 1, true),
((SELECT id FROM service_categories WHERE slug = 'hvac'), 'Heating Systems', 'hvac-heating-systems', 2, true),
((SELECT id FROM service_categories WHERE slug = 'hvac'), 'Ventilation & Air Quality', 'hvac-ventilation-air-quality', 3, true),
((SELECT id FROM service_categories WHERE slug = 'hvac'), 'HVAC Maintenance & Servicing', 'hvac-hvac-maintenance-servicing', 4, true);

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'hvac-air-conditioning-installation-repair'), 'Split system AC installation', 'hvac-split-system-ac-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-air-conditioning-installation-repair'), 'Multi-split & VRF systems', 'hvac-multi-split-vrf-systems', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-air-conditioning-installation-repair'), 'Ducted air conditioning', 'hvac-ducted-air-conditioning', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-air-conditioning-installation-repair'), 'Portable & wall-mounted units', 'hvac-portable-wall-mounted-units', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-air-conditioning-installation-repair'), 'AC repair & gas top-up', 'hvac-ac-repair-gas-top-up', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-heating-systems'), 'Central heating installation', 'hvac-central-heating-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-heating-systems'), 'Radiator installation & replacement', 'hvac-radiator-installation-replacement', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-heating-systems'), 'Underfloor heating systems', 'hvac-underfloor-heating-systems', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-heating-systems'), 'Heat pump installation', 'hvac-heat-pump-installation', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-ventilation-air-quality'), 'Mechanical ventilation systems', 'hvac-mechanical-ventilation-systems', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-ventilation-air-quality'), 'Extractor fan installation', 'hvac-extractor-fan-installation', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-ventilation-air-quality'), 'Air purification systems', 'hvac-air-purification-systems', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-ventilation-air-quality'), 'Duct cleaning & maintenance', 'hvac-duct-cleaning-maintenance', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-hvac-maintenance-servicing'), 'Annual AC servicing', 'hvac-annual-ac-servicing', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-hvac-maintenance-servicing'), 'Filter replacement', 'hvac-filter-replacement', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-hvac-maintenance-servicing'), 'System performance check', 'hvac-system-performance-check', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'hvac-hvac-maintenance-servicing'), 'Emergency breakdown repair', 'hvac-emergency-breakdown-repair', 4, true);

-- Handyman
UPDATE service_subcategories SET is_active = false WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'handyman');
UPDATE service_micro_categories SET is_active = false WHERE subcategory_id IN (SELECT id FROM service_subcategories WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'handyman'));

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_categories WHERE slug = 'handyman'), 'General Repairs & Maintenance', 'handyman-general-repairs-maintenance', 1, true),
((SELECT id FROM service_categories WHERE slug = 'handyman'), 'Furniture Assembly & Installation', 'handyman-furniture-assembly-installation', 2, true),
((SELECT id FROM service_categories WHERE slug = 'handyman'), 'Hanging & Mounting', 'handyman-hanging-mounting', 3, true),
((SELECT id FROM service_categories WHERE slug = 'handyman'), 'Odd Jobs & Small Projects', 'handyman-odd-jobs-small-projects', 4, true);

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'handyman-general-repairs-maintenance'), 'Door & lock repairs', 'handyman-door-lock-repairs', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-general-repairs-maintenance'), 'Window & blind repairs', 'handyman-window-blind-repairs', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-general-repairs-maintenance'), 'Minor plumbing fixes', 'handyman-minor-plumbing-fixes', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-general-repairs-maintenance'), 'Basic electrical repairs', 'handyman-basic-electrical-repairs', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-general-repairs-maintenance'), 'Patch & touch-up painting', 'handyman-patch-touch-up-painting', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-furniture-assembly-installation'), 'Flat-pack furniture assembly', 'handyman-flat-pack-furniture-assembly', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-furniture-assembly-installation'), 'Wardrobe & cabinet installation', 'handyman-wardrobe-cabinet-installation', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-furniture-assembly-installation'), 'Desk & office setup', 'handyman-desk-office-setup', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-hanging-mounting'), 'TV & bracket mounting', 'handyman-tv-bracket-mounting', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-hanging-mounting'), 'Picture & mirror hanging', 'handyman-picture-mirror-hanging', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-hanging-mounting'), 'Shelf installation', 'handyman-shelf-installation', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-hanging-mounting'), 'Curtain rail & blind fitting', 'handyman-curtain-rail-blind-fitting', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-odd-jobs-small-projects'), 'Snagging list completion', 'handyman-snagging-list-completion', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-odd-jobs-small-projects'), 'Property maintenance visits', 'handyman-property-maintenance-visits', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-odd-jobs-small-projects'), 'Pre-rental property prep', 'handyman-pre-rental-property-prep', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'handyman-odd-jobs-small-projects'), 'Decluttering & organization', 'handyman-decluttering-organization', 4, true);

-- Commercial Projects
UPDATE service_subcategories SET is_active = false WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'commercial-projects');
UPDATE service_micro_categories SET is_active = false WHERE subcategory_id IN (SELECT id FROM service_subcategories WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'commercial-projects'));

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_categories WHERE slug = 'commercial-projects'), 'Office Fit-Outs & Refurbishment', 'commercial-office-fit-outs-refurbishment', 1, true),
((SELECT id FROM service_categories WHERE slug = 'commercial-projects'), 'Retail & Hospitality Spaces', 'commercial-retail-hospitality-spaces', 2, true),
((SELECT id FROM service_categories WHERE slug = 'commercial-projects'), 'Restaurant & Bar Builds', 'commercial-restaurant-bar-builds', 3, true),
((SELECT id FROM service_categories WHERE slug = 'commercial-projects'), 'Healthcare & Specialist Facilities', 'commercial-healthcare-specialist-facilities', 4, true),
((SELECT id FROM service_categories WHERE slug = 'commercial-projects'), 'Commercial Maintenance & Repairs', 'commercial-commercial-maintenance-repairs', 5, true);

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'commercial-office-fit-outs-refurbishment'), 'Full office fit-out', 'commercial-full-office-fit-out', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-office-fit-outs-refurbishment'), 'Partition & meeting room installation', 'commercial-partition-meeting-room-installation', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-office-fit-outs-refurbishment'), 'Reception area design & build', 'commercial-reception-area-design-build', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-office-fit-outs-refurbishment'), 'Office cabling & IT infrastructure', 'commercial-office-cabling-it-infrastructure', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-retail-hospitality-spaces'), 'Shop fit-out & display areas', 'commercial-shop-fit-out-display-areas', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-retail-hospitality-spaces'), 'Boutique & showroom design', 'commercial-boutique-showroom-design', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-retail-hospitality-spaces'), 'Hotel room refurbishment', 'commercial-hotel-room-refurbishment', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-retail-hospitality-spaces'), 'Retail lighting & signage', 'commercial-retail-lighting-signage', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-restaurant-bar-builds'), 'Commercial kitchen installation', 'commercial-commercial-kitchen-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-restaurant-bar-builds'), 'Bar counter & seating areas', 'commercial-bar-counter-seating-areas', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-restaurant-bar-builds'), 'Restaurant interior build-out', 'commercial-restaurant-interior-build-out', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-restaurant-bar-builds'), 'Outdoor dining area construction', 'commercial-outdoor-dining-area-construction', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-healthcare-specialist-facilities'), 'Medical clinic fit-out', 'commercial-medical-clinic-fit-out', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-healthcare-specialist-facilities'), 'Dental practice construction', 'commercial-dental-practice-construction', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-healthcare-specialist-facilities'), 'Gym & fitness center build', 'commercial-gym-fitness-center-build', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-healthcare-specialist-facilities'), 'Spa & wellness facility', 'commercial-spa-wellness-facility', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-commercial-maintenance-repairs'), 'Scheduled building maintenance', 'commercial-scheduled-building-maintenance', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-commercial-maintenance-repairs'), 'Emergency repair callout', 'commercial-emergency-repair-callout', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-commercial-maintenance-repairs'), 'Facility management services', 'commercial-facility-management-services', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'commercial-commercial-maintenance-repairs'), 'Commercial cleaning coordination', 'commercial-commercial-cleaning-coordination', 4, true);