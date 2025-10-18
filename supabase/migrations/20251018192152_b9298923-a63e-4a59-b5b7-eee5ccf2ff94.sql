-- Add Floors, Doors & Windows service structure
-- Deactivate old subcategories and micro-categories if any exist
UPDATE service_subcategories 
SET is_active = false 
WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'floors-doors-windows');

UPDATE service_micro_categories 
SET is_active = false 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'floors-doors-windows')
);

-- Insert new subcategories for Floors, Doors & Windows
INSERT INTO service_subcategories (category_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_categories WHERE slug = 'floors-doors-windows'), 'Flooring Installation & Repairs', 'floors-doors-windows-flooring-installation-repairs', 1, true),
((SELECT id FROM service_categories WHERE slug = 'floors-doors-windows'), 'Door Hanging & Fitting', 'floors-doors-windows-door-hanging-fitting', 2, true),
((SELECT id FROM service_categories WHERE slug = 'floors-doors-windows'), 'Window Installation & Replacement', 'floors-doors-windows-window-installation-replacement', 3, true),
((SELECT id FROM service_categories WHERE slug = 'floors-doors-windows'), 'Shutters, Blinds & Glazing Accessories', 'floors-doors-windows-shutters-blinds-glazing-accessories', 4, true);

-- Insert micro-categories for Flooring Installation & Repairs
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-flooring-installation-repairs'), 'Hardwood, laminate & engineered floor installation', 'floors-doors-windows-hardwood-laminate-engineered-floor-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-flooring-installation-repairs'), 'Tile, stone & marble floor fitting', 'floors-doors-windows-tile-stone-marble-floor-fitting', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-flooring-installation-repairs'), 'Vinyl, linoleum & rubber flooring', 'floors-doors-windows-vinyl-linoleum-rubber-flooring', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-flooring-installation-repairs'), 'Carpet fitting & underlay installation', 'floors-doors-windows-carpet-fitting-underlay-installation', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-flooring-installation-repairs'), 'Floor levelling & subfloor preparation', 'floors-doors-windows-floor-levelling-subfloor-preparation', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-flooring-installation-repairs'), 'Floor sanding, sealing & varnishing', 'floors-doors-windows-floor-sanding-sealing-varnishing', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-flooring-installation-repairs'), 'Repairing water-damaged or worn floors', 'floors-doors-windows-repairing-water-damaged-worn-floors', 7, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-flooring-installation-repairs'), 'Skirting board & threshold fitting', 'floors-doors-windows-skirting-board-threshold-fitting', 8, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-flooring-installation-repairs'), 'Underfloor heating compatibility checks', 'floors-doors-windows-underfloor-heating-compatibility-checks', 9, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-flooring-installation-repairs'), 'Acoustic & thermal insulation layers', 'floors-doors-windows-acoustic-thermal-insulation-layers', 10, true);

-- Insert micro-categories for Door Hanging & Fitting
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-door-hanging-fitting'), 'Interior door installation (hinged, sliding, pocket)', 'floors-doors-windows-interior-door-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-door-hanging-fitting'), 'External & security door fitting', 'floors-doors-windows-external-security-door-fitting', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-door-hanging-fitting'), 'Fire door supply & installation', 'floors-doors-windows-fire-door-supply-installation', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-door-hanging-fitting'), 'Custom timber door fabrication', 'floors-doors-windows-custom-timber-door-fabrication', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-door-hanging-fitting'), 'Bi-fold, French & patio door fitting', 'floors-doors-windows-bi-fold-french-patio-door-fitting', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-door-hanging-fitting'), 'Ironmongery & handle installation', 'floors-doors-windows-ironmongery-handle-installation', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-door-hanging-fitting'), 'Door trimming, alignment & adjustment', 'floors-doors-windows-door-trimming-alignment-adjustment', 7, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-door-hanging-fitting'), 'Frame installation & architraves', 'floors-doors-windows-frame-installation-architraves', 8, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-door-hanging-fitting'), 'Door sealing & draught proofing', 'floors-doors-windows-door-sealing-draught-proofing', 9, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-door-hanging-fitting'), 'Soundproof & insulated doors', 'floors-doors-windows-soundproof-insulated-doors', 10, true);

-- Insert micro-categories for Window Installation & Replacement
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-window-installation-replacement'), 'Timber, aluminium & UPVC window installation', 'floors-doors-windows-timber-aluminium-upvc-window-installation', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-window-installation-replacement'), 'Double / triple glazing replacement', 'floors-doors-windows-double-triple-glazing-replacement', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-window-installation-replacement'), 'Skylight & rooflight fitting', 'floors-doors-windows-skylight-rooflight-fitting', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-window-installation-replacement'), 'Bay & bow window installation', 'floors-doors-windows-bay-bow-window-installation', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-window-installation-replacement'), 'Casement & sash window systems', 'floors-doors-windows-casement-sash-window-systems', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-window-installation-replacement'), 'Acoustic & thermal performance upgrades', 'floors-doors-windows-acoustic-thermal-performance-upgrades', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-window-installation-replacement'), 'Heritage & conservation-style windows', 'floors-doors-windows-heritage-conservation-style-windows', 7, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-window-installation-replacement'), 'Sealing, caulking & insulation', 'floors-doors-windows-sealing-caulking-insulation', 8, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-window-installation-replacement'), 'Glass replacement & reglazing', 'floors-doors-windows-glass-replacement-reglazing', 9, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-window-installation-replacement'), 'Shutter & blind integration', 'floors-doors-windows-shutter-blind-integration', 10, true);

-- Insert micro-categories for Shutters, Blinds & Glazing Accessories
INSERT INTO service_micro_categories (subcategory_id, name, slug, display_order, is_active) VALUES
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-shutters-blinds-glazing-accessories'), 'Interior shutters & louvre systems', 'floors-doors-windows-interior-shutters-louvre-systems', 1, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-shutters-blinds-glazing-accessories'), 'Roller, Venetian & Roman blinds', 'floors-doors-windows-roller-venetian-roman-blinds', 2, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-shutters-blinds-glazing-accessories'), 'Blackout & motorised blind systems', 'floors-doors-windows-blackout-motorised-blind-systems', 3, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-shutters-blinds-glazing-accessories'), 'External aluminium or wooden shutters', 'floors-doors-windows-external-aluminium-wooden-shutters', 4, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-shutters-blinds-glazing-accessories'), 'Window film & UV protection installation', 'floors-doors-windows-window-film-uv-protection-installation', 5, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-shutters-blinds-glazing-accessories'), 'Flyscreen & insect net fitting', 'floors-doors-windows-flyscreen-insect-net-fitting', 6, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-shutters-blinds-glazing-accessories'), 'Curtain rail & track mounting', 'floors-doors-windows-curtain-rail-track-mounting', 7, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-shutters-blinds-glazing-accessories'), 'Decorative glass & frosting films', 'floors-doors-windows-decorative-glass-frosting-films', 8, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-shutters-blinds-glazing-accessories'), 'Solar control coatings', 'floors-doors-windows-solar-control-coatings', 9, true),
((SELECT id FROM service_subcategories WHERE slug = 'floors-doors-windows-shutters-blinds-glazing-accessories'), 'Smart home blind automation integration', 'floors-doors-windows-smart-home-blind-automation-integration', 10, true);