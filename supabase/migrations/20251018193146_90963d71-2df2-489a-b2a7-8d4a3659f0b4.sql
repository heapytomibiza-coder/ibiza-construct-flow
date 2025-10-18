-- Add complete subcategories and micro-categories for Plasterer

UPDATE service_subcategories SET is_active = false 
WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'plasterer');

UPDATE service_micro_categories SET is_active = false 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'plasterer')
);

INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_categories WHERE slug = 'plasterer'), 'Interior Wall Plastering', 'plasterer-interior-wall-plastering', 1, true),
((SELECT id FROM service_categories WHERE slug = 'plasterer'), 'Ceiling Plastering & Repairs', 'plasterer-ceiling-plastering-repairs', 2, true),
((SELECT id FROM service_categories WHERE slug = 'plasterer'), 'Exterior Rendering', 'plasterer-exterior-rendering', 3, true),
((SELECT id FROM service_categories WHERE slug = 'plasterer'), 'Decorative & Specialist Finishes', 'plasterer-decorative-specialist-finishes', 4, true),
((SELECT id FROM service_categories WHERE slug = 'plasterer'), 'Plaster Repairs & Restoration', 'plasterer-plaster-repairs-restoration', 5, true);

INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-interior-wall-plastering'), 'Skim coating & finishing', 'plasterer-skim-coating-finishing', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-interior-wall-plastering'), 'Full room plastering', 'plasterer-full-room-plastering', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-interior-wall-plastering'), 'Drywall & plasterboard installation', 'plasterer-drywall-plasterboard-installation', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-interior-wall-plastering'), 'Soundproof wall construction', 'plasterer-soundproof-wall-construction', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-interior-wall-plastering'), 'Stud wall framing & boarding', 'plasterer-stud-wall-framing-boarding', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-ceiling-plastering-repairs'), 'Ceiling skim & finish', 'plasterer-ceiling-skim-finish', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-ceiling-plastering-repairs'), 'Suspended ceiling installation', 'plasterer-suspended-ceiling-installation', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-ceiling-plastering-repairs'), 'Cornice & coving installation', 'plasterer-cornice-coving-installation', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-ceiling-plastering-repairs'), 'Water damage ceiling repair', 'plasterer-water-damage-ceiling-repair', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-ceiling-plastering-repairs'), 'Ceiling texture removal', 'plasterer-ceiling-texture-removal', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-exterior-rendering'), 'Cement render application', 'plasterer-cement-render-application', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-exterior-rendering'), 'Lime render & traditional finishes', 'plasterer-lime-render-traditional-finishes', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-exterior-rendering'), 'Acrylic & modern render systems', 'plasterer-acrylic-modern-render-systems', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-exterior-rendering'), 'Scratch coat & base coat prep', 'plasterer-scratch-coat-base-coat-prep', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-exterior-rendering'), 'Coloured & textured render', 'plasterer-coloured-textured-render', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-decorative-specialist-finishes'), 'Venetian plaster & polished finishes', 'plasterer-venetian-plaster-polished-finishes', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-decorative-specialist-finishes'), 'Ornamental mouldings & features', 'plasterer-ornamental-mouldings-features', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-decorative-specialist-finishes'), 'Microcement application', 'plasterer-microcement-application', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-decorative-specialist-finishes'), 'Exposed aggregate finish', 'plasterer-exposed-aggregate-finish', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-plaster-repairs-restoration'), 'Crack repair & patching', 'plasterer-crack-repair-patching', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-plaster-repairs-restoration'), 'Historic plaster restoration', 'plasterer-historic-plaster-restoration', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-plaster-repairs-restoration'), 'Damp-affected plaster removal', 'plasterer-damp-affected-plaster-removal', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'plasterer-plaster-repairs-restoration'), 'Wall re-skimming', 'plasterer-wall-re-skimming', 4, true);