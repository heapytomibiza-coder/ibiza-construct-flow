-- Add complete subcategories and micro-categories for Structural Works

UPDATE service_subcategories SET is_active = false 
WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'structural-works');

UPDATE service_micro_categories SET is_active = false 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'structural-works')
);

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_categories WHERE slug = 'structural-works'), 'Structural Surveys & Assessments', 'structural-structural-surveys-assessments', 1, true),
((SELECT id FROM service_categories WHERE slug = 'structural-works'), 'Foundation & Underpinning', 'structural-foundation-underpinning', 2, true),
((SELECT id FROM service_categories WHERE slug = 'structural-works'), 'Load-Bearing Walls & Openings', 'structural-load-bearing-walls-openings', 3, true),
((SELECT id FROM service_categories WHERE slug = 'structural-works'), 'Beam & Lintel Installation', 'structural-beam-lintel-installation', 4, true),
((SELECT id FROM service_categories WHERE slug = 'structural-works'), 'Structural Repairs & Reinforcement', 'structural-structural-repairs-reinforcement', 5, true),
((SELECT id FROM service_categories WHERE slug = 'structural-works'), 'Retaining Walls & Structures', 'structural-retaining-walls-structures', 6, true);

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'structural-structural-surveys-assessments'), 'Full structural survey', 'structural-full-structural-survey', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-structural-surveys-assessments'), 'Crack & subsidence assessment', 'structural-crack-subsidence-assessment', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-structural-surveys-assessments'), 'Load-bearing capacity calculation', 'structural-load-bearing-capacity-calculation', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-structural-surveys-assessments'), 'Pre-renovation structural check', 'structural-pre-renovation-structural-check', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-foundation-underpinning'), 'House underpinning', 'structural-house-underpinning', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-foundation-underpinning'), 'Foundation repair & stabilization', 'structural-foundation-repair-stabilization', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-foundation-underpinning'), 'New foundation construction', 'structural-new-foundation-construction', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-foundation-underpinning'), 'Concrete pad & slab installation', 'structural-concrete-pad-slab-installation', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-load-bearing-walls-openings'), 'Load-bearing wall removal', 'structural-load-bearing-wall-removal', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-load-bearing-walls-openings'), 'New opening creation (doors/windows)', 'structural-new-opening-creation', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-load-bearing-walls-openings'), 'Structural wall construction', 'structural-structural-wall-construction', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-load-bearing-walls-openings'), 'Wall propping & support', 'structural-wall-propping-support', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-beam-lintel-installation'), 'Steel beam (RSJ) installation', 'structural-steel-beam-rsj-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-beam-lintel-installation'), 'Concrete lintel fitting', 'structural-concrete-lintel-fitting', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-beam-lintel-installation'), 'Timber beam & joist repair', 'structural-timber-beam-joist-repair', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-beam-lintel-installation'), 'Beam boxing & concealment', 'structural-beam-boxing-concealment', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-structural-repairs-reinforcement'), 'Wall tie replacement', 'structural-wall-tie-replacement', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-structural-repairs-reinforcement'), 'Reinforced concrete repair', 'structural-reinforced-concrete-repair', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-structural-repairs-reinforcement'), 'Carbon fibre reinforcement', 'structural-carbon-fibre-reinforcement', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-structural-repairs-reinforcement'), 'Structural crack injection', 'structural-structural-crack-injection', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-retaining-walls-structures'), 'Retaining wall construction', 'structural-retaining-wall-construction', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-retaining-walls-structures'), 'Basement wall reinforcement', 'structural-basement-wall-reinforcement', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-retaining-walls-structures'), 'Garden & terrace retaining walls', 'structural-garden-terrace-retaining-walls', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'structural-retaining-walls-structures'), 'Drainage integration', 'structural-drainage-integration', 4, true);