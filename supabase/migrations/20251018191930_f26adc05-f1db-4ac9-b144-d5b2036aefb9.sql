-- Add Landscaping & Outdoor Works service structure
-- Deactivate old Landscaper subcategories and micro-categories if any exist
UPDATE service_subcategories 
SET is_active = false 
WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'landscaper');

UPDATE service_micro_categories 
SET is_active = false 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'landscaper')
);

-- Insert new subcategories for Landscaper
INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_categories WHERE slug = 'landscaper'), 'Garden Design & Build', 'landscaper-garden-design-build', 1, true),
((SELECT id FROM service_categories WHERE slug = 'landscaper'), 'Patios, Driveways & Paving', 'landscaper-patios-driveways-paving', 2, true),
((SELECT id FROM service_categories WHERE slug = 'landscaper'), 'Fencing, Walls & Gates', 'landscaper-fencing-walls-gates', 3, true),
((SELECT id FROM service_categories WHERE slug = 'landscaper'), 'Irrigation & Drainage Systems', 'landscaper-irrigation-drainage-systems', 4, true),
((SELECT id FROM service_categories WHERE slug = 'landscaper'), 'Garden Maintenance & Care', 'landscaper-garden-maintenance-care', 5, true),
((SELECT id FROM service_categories WHERE slug = 'landscaper'), 'Outdoor Structures & Features', 'landscaper-outdoor-structures-features', 6, true);

-- Insert micro-categories for Garden Design & Build
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Full landscape design & planning', 'landscaper-full-landscape-design-planning', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), '3D garden visualisation & layout planning', 'landscaper-3d-garden-visualisation-layout-planning', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Garden renovation & transformation', 'landscaper-garden-renovation-transformation', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Mediterranean & drought-tolerant design', 'landscaper-mediterranean-drought-tolerant-design', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Zen / minimalist garden design', 'landscaper-zen-minimalist-garden-design', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Tropical or lush planting schemes', 'landscaper-tropical-lush-planting-schemes', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Garden lighting design & installation', 'landscaper-garden-lighting-design-installation', 7, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Outdoor kitchen or BBQ area integration', 'landscaper-outdoor-kitchen-bbq-area-integration', 8, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Pool garden design coordination', 'landscaper-pool-garden-design-coordination', 9, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Irrigation layout planning', 'landscaper-irrigation-layout-planning', 10, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Pathways, steps & transitions in design', 'landscaper-pathways-steps-transitions-design', 11, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Hardscape & softscape balancing', 'landscaper-hardscape-softscape-balancing', 12, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Plant selection & sourcing (nursery coordination)', 'landscaper-plant-selection-sourcing-nursery-coordination', 13, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-design-build'), 'Seasonal garden design updates', 'landscaper-seasonal-garden-design-updates', 14, true);

-- Insert micro-categories for Patios, Driveways & Paving
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Patio construction (tile, stone, concrete, or paver)', 'landscaper-patio-construction', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Driveway installation (gravel, resin, or paving)', 'landscaper-driveway-installation', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Pathway & stepping stone installation', 'landscaper-pathway-stepping-stone-installation', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Stone or tile terrace surfacing', 'landscaper-stone-tile-terrace-surfacing', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Pool surround paving', 'landscaper-pool-surround-paving', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Retaining wall & edging construction', 'landscaper-retaining-wall-edging-construction', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Concrete pad or base installation', 'landscaper-concrete-pad-base-installation', 7, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Leveling, compaction & base prep', 'landscaper-leveling-compaction-base-prep', 8, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Drainage integration under patios', 'landscaper-drainage-integration-under-patios', 9, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Resin-bound or microcement surfacing', 'landscaper-resin-bound-microcement-surfacing', 10, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Repairing cracked or lifted paving', 'landscaper-repairing-cracked-lifted-paving', 11, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Sealing & protective coating application', 'landscaper-sealing-protective-coating-application', 12, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Decorative stone or marble inlays', 'landscaper-decorative-stone-marble-inlays', 13, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-patios-driveways-paving'), 'Accessibility ramp or walkway construction', 'landscaper-accessibility-ramp-walkway-construction', 14, true);

-- Insert micro-categories for Fencing, Walls & Gates
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Timber fencing installation', 'landscaper-timber-fencing-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Bamboo or natural screening', 'landscaper-bamboo-natural-screening', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Composite or metal fencing systems', 'landscaper-composite-metal-fencing-systems', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Garden wall construction (block, stone, render)', 'landscaper-garden-wall-construction', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Retaining garden walls', 'landscaper-retaining-garden-walls', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Automated gate installation (electric or manual)', 'landscaper-automated-gate-installation', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Driveway gate fabrication & fitting', 'landscaper-driveway-gate-fabrication-fitting', 7, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Boundary wall repair & rendering', 'landscaper-boundary-wall-repair-rendering', 8, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Decorative cladding or slats', 'landscaper-decorative-cladding-slats', 9, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Sound/privacy barrier installation', 'landscaper-sound-privacy-barrier-installation', 10, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Fence painting & maintenance', 'landscaper-fence-painting-maintenance', 11, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Wall capping & coping installation', 'landscaper-wall-capping-coping-installation', 12, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-fencing-walls-gates'), 'Stone or dry-stack wall building', 'landscaper-stone-dry-stack-wall-building', 13, true);

-- Insert micro-categories for Irrigation & Drainage Systems
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'Full automatic irrigation system installation', 'landscaper-full-automatic-irrigation-system-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'Drip-line & micro-spray systems', 'landscaper-drip-line-micro-spray-systems', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'Lawn sprinkler systems', 'landscaper-lawn-sprinkler-systems', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'Smart irrigation controllers & sensors', 'landscaper-smart-irrigation-controllers-sensors', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'Water tank & pump integration', 'landscaper-water-tank-pump-integration', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'Greywater recycling systems', 'landscaper-greywater-recycling-systems', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'Soakaway & drainage systems', 'landscaper-soakaway-drainage-systems', 7, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'Retrofitting irrigation to existing gardens', 'landscaper-retrofitting-irrigation-existing-gardens', 8, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'Pipe routing & trenching', 'landscaper-pipe-routing-trenching', 9, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'Seasonal irrigation maintenance', 'landscaper-seasonal-irrigation-maintenance', 10, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'Pressure testing & leak detection', 'landscaper-pressure-testing-leak-detection', 11, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'Filter & valve replacement', 'landscaper-filter-valve-replacement', 12, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-irrigation-drainage-systems'), 'System flushing & descaling', 'landscaper-system-flushing-descaling', 13, true);

-- Insert micro-categories for Garden Maintenance & Care
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Regular garden maintenance (weekly/monthly)', 'landscaper-regular-garden-maintenance', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Hedge trimming & shaping', 'landscaper-hedge-trimming-shaping', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Lawn mowing & edging', 'landscaper-lawn-mowing-edging', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Tree pruning & care', 'landscaper-tree-pruning-care', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Palm tree trimming & cleaning', 'landscaper-palm-tree-trimming-cleaning', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Weed control & prevention', 'landscaper-weed-control-prevention', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Fertilising & soil conditioning', 'landscaper-fertilising-soil-conditioning', 7, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Seasonal planting & replanting', 'landscaper-seasonal-planting-replanting', 8, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Irrigation system checks', 'landscaper-irrigation-system-checks', 9, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Leaf & debris clearance', 'landscaper-leaf-debris-clearance', 10, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Plant pest & disease treatment', 'landscaper-plant-pest-disease-treatment', 11, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Mulching & composting', 'landscaper-mulching-composting', 12, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Garden waste removal', 'landscaper-garden-waste-removal', 13, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-garden-maintenance-care'), 'Turf laying & lawn rejuvenation', 'landscaper-turf-laying-lawn-rejuvenation', 14, true);

-- Insert micro-categories for Outdoor Structures & Features
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Pergola & gazebo construction', 'landscaper-pergola-gazebo-construction', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Outdoor bars & kitchens', 'landscaper-outdoor-bars-kitchens', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Garden sheds & storage', 'landscaper-garden-sheds-storage', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Decking (wood or composite)', 'landscaper-decking-wood-composite', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Water features & fountains', 'landscaper-water-features-fountains', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Fire pits & outdoor fireplaces', 'landscaper-fire-pits-outdoor-fireplaces', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Seating areas & built-in benches', 'landscaper-seating-areas-built-in-benches', 7, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Garden steps & planters', 'landscaper-garden-steps-planters', 8, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Shade sails & canopies', 'landscaper-shade-sails-canopies', 9, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Outdoor shower installation', 'landscaper-outdoor-shower-installation', 10, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Feature walls & art installations', 'landscaper-feature-walls-art-installations', 11, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Stone or sculpture placement', 'landscaper-stone-sculpture-placement', 12, true),
((SELECT id FROM service_subcategories WHERE slug = 'landscaper-outdoor-structures-features'), 'Lighting integration (in coordination with electricians)', 'landscaper-lighting-integration-coordination', 13, true);