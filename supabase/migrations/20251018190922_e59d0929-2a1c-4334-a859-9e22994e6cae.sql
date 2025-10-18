-- Add Architecture & Design Services Category Structure
-- Deactivate old entries if they exist
UPDATE service_categories SET is_active = false 
WHERE slug IN ('architecture-design-services', 'architecture-design', 'design-services');

UPDATE service_subcategories SET is_active = false 
WHERE category_id IN (
  SELECT id FROM service_categories 
  WHERE slug IN ('architecture-design-services', 'architecture-design', 'design-services')
);

UPDATE service_micro_categories SET is_active = false 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id IN (
    SELECT id FROM service_categories 
    WHERE slug IN ('architecture-design-services', 'architecture-design', 'design-services')
  )
);

-- Insert main category
INSERT INTO service_categories (name, slug, icon_name, description, category_group, display_order, is_active)
VALUES (
  'Architecture & Design Services',
  'architecture-design-services',
  'Building',
  'Professional architectural design, planning, and visualization services',
  'specialized',
  21,
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
  ('Architectural Design & Planning', 'architectural-design-planning', 'Concept design, planning, and architectural services', 1),
  ('Structural Design & Engineering Coordination', 'structural-design-engineering', 'Structural engineering and design coordination', 2),
  ('Interior Architecture & Space Planning', 'interior-architecture-planning', 'Interior design and space optimization', 3),
  ('Landscape Architecture & Outdoor Design', 'landscape-architecture-outdoor', 'Landscape design and outdoor planning', 4),
  ('3D Visualisation & Virtual Modelling', 'visualisation-virtual-modelling', '3D rendering and virtual modeling services', 5),
  ('Renovation, Restoration & Heritage Design', 'renovation-restoration-heritage', 'Historic restoration and renovation design', 6),
  ('Sustainable & Passive Design', 'sustainable-passive-design', 'Eco-friendly and sustainable architecture', 7),
  ('Permits, Surveys & Documentation', 'permits-surveys-documentation', 'Building surveys, permits, and compliance', 8)
) AS sub(name, slug, description, display_order)
WHERE c.slug = 'architecture-design-services'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Architectural Design & Planning
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
  ('Concept design & space planning', 'concept-design-space-planning', 'Initial concept and space planning', 1),
  ('Floor plan development & 3D visualisation', 'floor-plan-3d-visualisation', 'Develop floor plans and 3D visuals', 2),
  ('New build residential design', 'new-build-residential-design', 'Design new residential buildings', 3),
  ('Commercial & hospitality architecture', 'commercial-hospitality-architecture', 'Commercial and hospitality design', 4),
  ('Villa, apartment & townhouse layouts', 'villa-apartment-townhouse-layouts', 'Residential layout design', 5),
  ('Sustainable / passive design concepts', 'sustainable-passive-design-concepts', 'Eco-friendly design concepts', 6),
  ('Planning permission drawings & applications', 'planning-permission-drawings', 'Prepare planning permission documents', 7),
  ('Building regulation compliance', 'building-regulation-compliance', 'Ensure building code compliance', 8),
  ('Construction detailing & documentation', 'construction-detailing-documentation', 'Detailed construction drawings', 9),
  ('Material & finish specification', 'material-finish-specification', 'Specify materials and finishes', 10),
  ('Design presentation boards & models', 'design-presentation-boards-models', 'Create presentation materials', 11)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'architectural-design-planning'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'architecture-design-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Structural Design & Engineering Coordination
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
  ('Structural feasibility studies', 'structural-feasibility-studies', 'Assess structural feasibility', 1),
  ('Foundation & load-bearing design', 'foundation-load-bearing-design', 'Design foundations and load-bearing elements', 2),
  ('Reinforced concrete / steel frame calculations', 'concrete-steel-frame-calculations', 'Calculate structural frame requirements', 3),
  ('Timber structure design', 'timber-structure-design', 'Design timber structures', 4),
  ('Seismic & wind load analysis', 'seismic-wind-load-analysis', 'Analyze seismic and wind loads', 5),
  ('Collaboration with MEP and civil engineers', 'mep-civil-engineer-collaboration', 'Coordinate with engineering disciplines', 6),
  ('Retaining wall & roof structure detailing', 'retaining-wall-roof-detailing', 'Detail retaining walls and roofs', 7),
  ('Structural report & certification', 'structural-report-certification', 'Provide structural reports and certs', 8),
  ('Value engineering & buildability assessment', 'value-engineering-buildability', 'Assess cost and construction feasibility', 9),
  ('Site inspections during construction', 'site-inspections-construction', 'Inspect structural work on site', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'structural-design-engineering'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'architecture-design-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Interior Architecture & Space Planning
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
  ('Interior space layout optimisation', 'interior-space-optimisation', 'Optimize interior layouts', 1),
  ('Kitchen & bathroom architectural planning', 'kitchen-bathroom-planning', 'Plan kitchen and bathroom spaces', 2),
  ('Partition wall design & room zoning', 'partition-wall-room-zoning', 'Design partitions and zones', 3),
  ('Ceiling design & lighting integration', 'ceiling-design-lighting', 'Design ceilings and integrate lighting', 4),
  ('Staircase & balustrade architectural detailing', 'staircase-balustrade-detailing', 'Detail stairs and balustrades', 5),
  ('Built-in joinery & cabinetry layout', 'builtin-joinery-cabinetry', 'Plan built-in furniture', 6),
  ('Material palette & surface coordination', 'material-palette-coordination', 'Coordinate materials and surfaces', 7),
  ('Acoustic & lighting performance design', 'acoustic-lighting-performance', 'Design for acoustics and lighting', 8),
  ('Adaptive reuse & renovation layouts', 'adaptive-reuse-renovation-layouts', 'Plan renovations and adaptive reuse', 9),
  ('Coordination with interior stylists & contractors', 'interior-stylist-coordination', 'Coordinate with stylists and builders', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'interior-architecture-planning'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'architecture-design-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Landscape Architecture & Outdoor Design
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
  ('Full landscape masterplanning', 'landscape-masterplanning', 'Comprehensive landscape master plans', 1),
  ('Garden & terrace layout design', 'garden-terrace-layout', 'Design gardens and terraces', 2),
  ('Pool & water feature integration', 'pool-water-feature-integration', 'Integrate pools and water features', 3),
  ('Hardscape (paths, patios, retaining walls) planning', 'hardscape-planning', 'Plan hardscape elements', 4),
  ('Outdoor kitchen & living area design', 'outdoor-kitchen-living-design', 'Design outdoor living spaces', 5),
  ('Planting schemes & irrigation coordination', 'planting-irrigation-coordination', 'Plan planting and irrigation', 6),
  ('Drainage & grading strategy', 'drainage-grading-strategy', 'Design drainage and site grading', 7),
  ('Lighting & mood design for exteriors', 'exterior-lighting-mood-design', 'Design outdoor lighting', 8),
  ('Environmental sustainability planning', 'environmental-sustainability-planning', 'Plan sustainable landscapes', 9),
  ('Coordination with landscape contractors', 'landscape-contractor-coordination', 'Coordinate with contractors', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'landscape-architecture-outdoor'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'architecture-design-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for 3D Visualisation & Virtual Modelling
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
  ('3D architectural rendering (interior & exterior)', '3d-architectural-rendering', 'Create 3D renders', 1),
  ('Virtual walkthroughs / flythrough animations', 'virtual-walkthroughs-animations', 'Produce animated walkthroughs', 2),
  ('Photorealistic CGI production', 'photorealistic-cgi-production', 'Create photorealistic visuals', 3),
  ('BIM modelling (Revit, ArchiCAD)', 'bim-modelling', 'Build information modeling', 4),
  ('Augmented reality design previews', 'ar-design-previews', 'AR visualization services', 5),
  ('Concept moodboards & visual storytelling', 'concept-moodboards-storytelling', 'Create concept presentations', 6),
  ('Material & lighting simulation', 'material-lighting-simulation', 'Simulate materials and lighting', 7),
  ('360° virtual tours', '360-virtual-tours', 'Create immersive virtual tours', 8),
  ('Marketing visuals for developers', 'marketing-visuals-developers', 'Produce marketing renders', 9),
  ('Model updates during project stages', 'model-updates-project-stages', 'Update models throughout project', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'visualisation-virtual-modelling'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'architecture-design-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Renovation, Restoration & Heritage Design
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
  ('Historical building analysis & documentation', 'historical-building-analysis', 'Analyze historic buildings', 1),
  ('Façade restoration & conservation detailing', 'facade-restoration-conservation', 'Restore and conserve facades', 2),
  ('Adaptive reuse planning (old to new purpose)', 'adaptive-reuse-planning', 'Plan adaptive reuse projects', 3),
  ('Structural upgrade integration', 'structural-upgrade-integration', 'Integrate structural upgrades', 4),
  ('Interior restoration with modern systems', 'interior-restoration-modern-systems', 'Restore interiors with modern MEP', 5),
  ('Heritage compliance & local authority liaison', 'heritage-compliance-liaison', 'Handle heritage approvals', 6),
  ('Authentic material sourcing & replication', 'authentic-material-sourcing', 'Source period-appropriate materials', 7),
  ('Architectural photography & survey', 'architectural-photography-survey', 'Document existing buildings', 8),
  ('Renovation phasing strategy', 'renovation-phasing-strategy', 'Plan renovation phases', 9),
  ('Period-style extensions & upgrades', 'period-style-extensions', 'Design sympathetic extensions', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'renovation-restoration-heritage'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'architecture-design-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Sustainable & Passive Design
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
  ('Passive solar orientation & ventilation', 'passive-solar-ventilation', 'Design for passive climate control', 1),
  ('Energy-efficient material selection', 'energy-efficient-materials', 'Select energy-efficient materials', 2),
  ('Natural lighting & thermal optimisation', 'natural-lighting-thermal', 'Optimize daylight and thermal performance', 3),
  ('Renewable system integration (solar, geothermal)', 'renewable-system-integration', 'Integrate renewable energy systems', 4),
  ('Water harvesting & greywater reuse', 'water-harvesting-greywater', 'Design water conservation systems', 5),
  ('Insulation & envelope performance upgrades', 'insulation-envelope-upgrades', 'Improve building envelope performance', 6),
  ('Carbon footprint reduction strategy', 'carbon-footprint-reduction', 'Reduce carbon emissions', 7),
  ('Local material sourcing & low-impact design', 'local-material-lowimpact-design', 'Source local sustainable materials', 8),
  ('Green certification coordination (LEED, BREEAM)', 'green-certification-coordination', 'Coordinate green certifications', 9),
  ('Sustainability reporting & lifecycle analysis', 'sustainability-reporting-lifecycle', 'Provide sustainability analysis', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'sustainable-passive-design'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'architecture-design-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Permits, Surveys & Documentation
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
  ('Measured building surveys', 'measured-building-surveys', 'Survey existing buildings', 1),
  ('Topographical & site condition surveys', 'topographical-site-surveys', 'Survey site conditions', 2),
  ('As-built drawing creation', 'asbuilt-drawing-creation', 'Create as-built drawings', 3),
  ('Planning permission submissions', 'planning-permission-submissions', 'Submit planning applications', 4),
  ('Building regulation & permit compliance', 'building-regulation-permit-compliance', 'Ensure code compliance', 5),
  ('Fire safety & accessibility integration', 'fire-safety-accessibility', 'Design for safety and accessibility', 6),
  ('Local authority consultation & approvals', 'local-authority-consultation', 'Handle authority approvals', 7),
  ('License of occupation & usage applications', 'license-occupation-applications', 'Apply for occupancy licenses', 8),
  ('Compliance documentation & reports', 'compliance-documentation-reports', 'Prepare compliance documentation', 9),
  ('Final handover drawings & certification', 'final-handover-certification', 'Provide final documentation', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'permits-surveys-documentation'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'architecture-design-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;