-- Add complete subcategories and micro-categories for Interior Designer and Kitchen & Bathroom

-- Interior Designer
UPDATE service_subcategories SET is_active = false WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'interior-designer');
UPDATE service_micro_categories SET is_active = false WHERE subcategory_id IN (SELECT id FROM service_subcategories WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'interior-designer'));

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_categories WHERE slug = 'interior-designer'), 'Full Interior Design Services', 'interior-designer-full-interior-design-services', 1, true),
((SELECT id FROM service_categories WHERE slug = 'interior-designer'), 'Space Planning & Layout', 'interior-designer-space-planning-layout', 2, true),
((SELECT id FROM service_categories WHERE slug = 'interior-designer'), 'Color & Material Selection', 'interior-designer-color-material-selection', 3, true),
((SELECT id FROM service_categories WHERE slug = 'interior-designer'), 'Furniture & Décor Consultation', 'interior-designer-furniture-decor-consultation', 4, true),
((SELECT id FROM service_categories WHERE slug = 'interior-designer'), 'Room-Specific Design', 'interior-designer-room-specific-design', 5, true),
((SELECT id FROM service_categories WHERE slug = 'interior-designer'), 'Styling & Final Touches', 'interior-designer-styling-final-touches', 6, true);

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-full-interior-design-services'), 'Concept design & mood boards', 'interior-designer-concept-design-mood-boards', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-full-interior-design-services'), 'Complete home interior design', 'interior-designer-complete-home-interior-design', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-full-interior-design-services'), '3D rendering & visualization', 'interior-designer-3d-rendering-visualization', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-full-interior-design-services'), 'Project management & coordination', 'interior-designer-project-management-coordination', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-space-planning-layout'), 'Floor plan optimization', 'interior-designer-floor-plan-optimization', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-space-planning-layout'), 'Room flow & zoning', 'interior-designer-room-flow-zoning', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-space-planning-layout'), 'Furniture placement planning', 'interior-designer-furniture-placement-planning', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-space-planning-layout'), 'Storage solutions design', 'interior-designer-storage-solutions-design', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-color-material-selection'), 'Paint color consultation', 'interior-designer-paint-color-consultation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-color-material-selection'), 'Flooring material selection', 'interior-designer-flooring-material-selection', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-color-material-selection'), 'Fabric & textile sourcing', 'interior-designer-fabric-textile-sourcing', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-color-material-selection'), 'Wall covering & finishes', 'interior-designer-wall-covering-finishes', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-furniture-decor-consultation'), 'Furniture sourcing & procurement', 'interior-designer-furniture-sourcing-procurement', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-furniture-decor-consultation'), 'Custom furniture design', 'interior-designer-custom-furniture-design', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-furniture-decor-consultation'), 'Lighting design & selection', 'interior-designer-lighting-design-selection', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-furniture-decor-consultation'), 'Art & accessories curation', 'interior-designer-art-accessories-curation', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-room-specific-design'), 'Kitchen design & layout', 'interior-designer-kitchen-design-layout', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-room-specific-design'), 'Bathroom design & styling', 'interior-designer-bathroom-design-styling', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-room-specific-design'), 'Bedroom & suite design', 'interior-designer-bedroom-suite-design', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-room-specific-design'), 'Living & entertainment spaces', 'interior-designer-living-entertainment-spaces', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-styling-final-touches'), 'Home staging for sale/rental', 'interior-designer-home-staging-sale-rental', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-styling-final-touches'), 'Accessory placement & styling', 'interior-designer-accessory-placement-styling', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-styling-final-touches'), 'Window treatments & soft furnishings', 'interior-designer-window-treatments-soft-furnishings', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'interior-designer-styling-final-touches'), 'Renovation refresh consultation', 'interior-designer-renovation-refresh-consultation', 4, true);

-- Kitchen & Bathroom
UPDATE service_subcategories SET is_active = false WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'kitchen-bathroom');
UPDATE service_micro_categories SET is_active = false WHERE subcategory_id IN (SELECT id FROM service_subcategories WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'kitchen-bathroom'));

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_categories WHERE slug = 'kitchen-bathroom'), 'Kitchen Renovation & Installation', 'kitchen-bathroom-kitchen-renovation-installation', 1, true),
((SELECT id FROM service_categories WHERE slug = 'kitchen-bathroom'), 'Bathroom Renovation & Fitting', 'kitchen-bathroom-bathroom-renovation-fitting', 2, true),
((SELECT id FROM service_categories WHERE slug = 'kitchen-bathroom'), 'Plumbing & Fixtures', 'kitchen-bathroom-plumbing-fixtures', 3, true),
((SELECT id FROM service_categories WHERE slug = 'kitchen-bathroom'), 'Worktops & Surfaces', 'kitchen-bathroom-worktops-surfaces', 4, true),
((SELECT id FROM service_categories WHERE slug = 'kitchen-bathroom'), 'Kitchen & Bathroom Accessories', 'kitchen-bathroom-kitchen-bathroom-accessories', 5, true);

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-kitchen-renovation-installation'), 'Full kitchen design & installation', 'kitchen-bathroom-full-kitchen-design-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-kitchen-renovation-installation'), 'Kitchen cabinet fitting', 'kitchen-bathroom-kitchen-cabinet-fitting', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-kitchen-renovation-installation'), 'Appliance installation & integration', 'kitchen-bathroom-appliance-installation-integration', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-kitchen-renovation-installation'), 'Kitchen island construction', 'kitchen-bathroom-kitchen-island-construction', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-kitchen-renovation-installation'), 'Splashback installation', 'kitchen-bathroom-splashback-installation', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-bathroom-renovation-fitting'), 'Full bathroom renovation', 'kitchen-bathroom-full-bathroom-renovation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-bathroom-renovation-fitting'), 'Shower installation & wet rooms', 'kitchen-bathroom-shower-installation-wet-rooms', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-bathroom-renovation-fitting'), 'Bath installation & replacement', 'kitchen-bathroom-bath-installation-replacement', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-bathroom-renovation-fitting'), 'Ensuite bathroom creation', 'kitchen-bathroom-ensuite-bathroom-creation', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-bathroom-renovation-fitting'), 'Bathroom tiling & waterproofing', 'kitchen-bathroom-bathroom-tiling-waterproofing', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-plumbing-fixtures'), 'Sink & tap installation', 'kitchen-bathroom-sink-tap-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-plumbing-fixtures'), 'Toilet & bidet fitting', 'kitchen-bathroom-toilet-bidet-fitting', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-plumbing-fixtures'), 'Basin & vanity unit installation', 'kitchen-bathroom-basin-vanity-unit-installation', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-plumbing-fixtures'), 'Radiator & heated towel rail', 'kitchen-bathroom-radiator-heated-towel-rail', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-worktops-surfaces'), 'Granite & marble worktops', 'kitchen-bathroom-granite-marble-worktops', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-worktops-surfaces'), 'Quartz & composite surfaces', 'kitchen-bathroom-quartz-composite-surfaces', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-worktops-surfaces'), 'Laminate & wood worktops', 'kitchen-bathroom-laminate-wood-worktops', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-worktops-surfaces'), 'Worktop templating & fitting', 'kitchen-bathroom-worktop-templating-fitting', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-kitchen-bathroom-accessories'), 'Kitchen storage & organization', 'kitchen-bathroom-kitchen-storage-organization', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-kitchen-bathroom-accessories'), 'Bathroom mirrors & cabinets', 'kitchen-bathroom-bathroom-mirrors-cabinets', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-kitchen-bathroom-accessories'), 'Extractor & ventilation fitting', 'kitchen-bathroom-extractor-ventilation-fitting', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'kitchen-bathroom-kitchen-bathroom-accessories'), 'Shower screens & enclosures', 'kitchen-bathroom-shower-screens-enclosures', 4, true);