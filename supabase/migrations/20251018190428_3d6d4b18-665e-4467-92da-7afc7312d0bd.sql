-- Add Project Management & Consultation Services Category Structure
-- Deactivate old entries if they exist
UPDATE service_categories SET is_active = false 
WHERE slug IN ('project-management-consultation', 'project-management', 'consultation-services');

UPDATE service_subcategories SET is_active = false 
WHERE category_id IN (
  SELECT id FROM service_categories 
  WHERE slug IN ('project-management-consultation', 'project-management', 'consultation-services')
);

UPDATE service_micro_categories SET is_active = false 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id IN (
    SELECT id FROM service_categories 
    WHERE slug IN ('project-management-consultation', 'project-management', 'consultation-services')
  )
);

-- Insert main category
INSERT INTO service_categories (name, slug, icon_name, description, category_group, display_order, is_active)
VALUES (
  'Project Management & Consultation Services',
  'project-management-consultation',
  'ClipboardList',
  'Professional project management, technical consultation, and advisory services',
  'specialized',
  20,
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
  ('Construction Project Management', 'construction-project-management', 'Full lifecycle construction project management', 1),
  ('Design & Build Coordination', 'design-build-coordination', 'Design coordination and build process management', 2),
  ('Renovation & Refurbishment Management', 'renovation-refurbishment-management', 'Managing renovation and refurbishment projects', 3),
  ('Technical Consultation & Feasibility Studies', 'technical-consultation-feasibility', 'Technical assessments and feasibility analysis', 4),
  ('Quantity Surveying & Cost Consultancy', 'quantity-surveying-cost-consultancy', 'Cost management and quantity surveying services', 5),
  ('Health, Safety & Risk Management', 'health-safety-risk-management', 'Safety compliance and risk management', 6),
  ('Sustainability & Environmental Consultation', 'sustainability-environmental-consultation', 'Sustainable building and environmental consulting', 7),
  ('Client Advisory & Strategic Consulting', 'client-advisory-strategic-consulting', 'Strategic advisory and consulting services', 8)
) AS sub(name, slug, description, display_order)
WHERE c.slug = 'project-management-consultation'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Construction Project Management
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
  ('Full project lifecycle management (concept → completion)', 'full-lifecycle-management', 'Complete project management from start to finish', 1),
  ('Budgeting, cost tracking & financial control', 'budgeting-cost-tracking', 'Financial management and cost control', 2),
  ('Contractor sourcing & coordination', 'contractor-sourcing-coordination', 'Find and coordinate contractors', 3),
  ('Schedule & milestone planning (Gantt, critical path)', 'schedule-milestone-planning', 'Project scheduling and timeline management', 4),
  ('Quality assurance & performance monitoring', 'quality-assurance-monitoring', 'Monitor quality and performance standards', 5),
  ('Site supervision & progress reporting', 'site-supervision-reporting', 'Supervise site and report progress', 6),
  ('Material procurement & logistics coordination', 'material-procurement-logistics', 'Manage materials and logistics', 7),
  ('Risk management & contingency planning', 'risk-management-contingency', 'Identify and mitigate project risks', 8),
  ('Health & safety compliance oversight', 'health-safety-compliance', 'Ensure safety compliance on site', 9),
  ('Client representation & reporting', 'client-representation-reporting', 'Represent client interests and provide reports', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'construction-project-management'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'project-management-consultation')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Design & Build Coordination
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
  ('Pre-construction feasibility & design planning', 'preconstruction-feasibility-planning', 'Early stage feasibility and design work', 1),
  ('Architectural / engineering consultant coordination', 'architectural-engineering-coordination', 'Coordinate design consultants', 2),
  ('Value engineering & cost optimisation', 'value-engineering-optimization', 'Optimize design for cost efficiency', 3),
  ('Scope definition & technical documentation', 'scope-definition-documentation', 'Define scope and prepare technical docs', 4),
  ('Tender preparation & contractor evaluation', 'tender-preparation-evaluation', 'Prepare tenders and evaluate contractors', 5),
  ('Planning permission & local authority liaison', 'planning-permission-liaison', 'Handle planning permissions and authorities', 6),
  ('Design-to-build reconciliation (avoiding variations)', 'design-build-reconciliation', 'Align design with build to avoid changes', 7),
  ('On-site change control & approvals', 'onsite-change-control', 'Manage on-site changes and approvals', 8),
  ('Handover documentation & snag management', 'handover-snag-management', 'Manage handover and defect lists', 9),
  ('Lessons learned / project closure reviews', 'lessons-learned-closure', 'Review project outcomes and learnings', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'design-build-coordination'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'project-management-consultation')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Renovation & Refurbishment Management
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
  ('Site evaluation & structural assessment', 'site-evaluation-structural-assessment', 'Assess site and structural condition', 1),
  ('Refurbishment strategy & staging plan', 'refurbishment-strategy-staging', 'Plan refurbishment strategy and phases', 2),
  ('Cost estimation & budget alignment', 'cost-estimation-budget-alignment', 'Estimate costs and align with budget', 3),
  ('Scheduling trades & material delivery', 'scheduling-trades-materials', 'Schedule work and material deliveries', 4),
  ('Managing live environments (occupied spaces)', 'managing-live-environments', 'Manage work in occupied buildings', 5),
  ('Compliance with building regulations', 'compliance-building-regulations', 'Ensure regulatory compliance', 6),
  ('Waste management & sustainability oversight', 'waste-management-sustainability', 'Manage waste and sustainability', 7),
  ('Progress verification & photo documentation', 'progress-verification-documentation', 'Document and verify progress', 8),
  ('Client communication & updates', 'client-communication-updates', 'Keep client informed of progress', 9),
  ('Sign-off and aftercare coordination', 'signoff-aftercare-coordination', 'Coordinate final sign-off and aftercare', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'renovation-refurbishment-management'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'project-management-consultation')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Technical Consultation & Feasibility Studies
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
  ('Site surveys & condition reports', 'site-surveys-condition-reports', 'Survey sites and assess conditions', 1),
  ('Technical feasibility assessments', 'technical-feasibility-assessments', 'Assess technical feasibility', 2),
  ('Structural, MEP & design evaluation', 'structural-mep-design-evaluation', 'Evaluate structural and MEP designs', 3),
  ('Concept planning & cost forecasting', 'concept-planning-cost-forecasting', 'Plan concepts and forecast costs', 4),
  ('Environmental & sustainability analysis', 'environmental-sustainability-analysis', 'Analyze environmental impact', 5),
  ('Compliance with zoning and planning codes', 'compliance-zoning-planning', 'Check zoning and planning compliance', 6),
  ('Infrastructure availability assessment', 'infrastructure-availability-assessment', 'Assess infrastructure availability', 7),
  ('Pre-acquisition property due diligence', 'property-due-diligence', 'Property acquisition due diligence', 8),
  ('Expert witness & technical reporting', 'expert-witness-reporting', 'Expert testimony and technical reports', 9),
  ('Feasibility for investment or development approval', 'investment-development-feasibility', 'Investment feasibility studies', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'technical-consultation-feasibility'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'project-management-consultation')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Quantity Surveying & Cost Consultancy
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
  ('Bill of quantities (BOQ) preparation', 'boq-preparation', 'Prepare detailed bill of quantities', 1),
  ('Cost estimation & breakdown', 'cost-estimation-breakdown', 'Detailed cost estimation and breakdown', 2),
  ('Tender pricing analysis', 'tender-pricing-analysis', 'Analyze tender pricing', 3),
  ('Value engineering recommendations', 'value-engineering-recommendations', 'Recommend cost-saving measures', 4),
  ('Variation & change order tracking', 'variation-change-order-tracking', 'Track variations and change orders', 5),
  ('Payment certification & interim valuations', 'payment-certification-valuations', 'Certify payments and valuations', 6),
  ('Contract administration support', 'contract-administration-support', 'Support contract administration', 7),
  ('Cashflow projection & forecasting', 'cashflow-projection-forecasting', 'Project cashflow forecasting', 8),
  ('Project cost reconciliation', 'project-cost-reconciliation', 'Reconcile final project costs', 9),
  ('Financial closeout reporting', 'financial-closeout-reporting', 'Final financial reporting', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'quantity-surveying-cost-consultancy'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'project-management-consultation')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Health, Safety & Risk Management
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
  ('Site risk assessments (HIRA / RAMS)', 'site-risk-assessments', 'Hazard identification and risk assessments', 1),
  ('Safety plan creation & compliance audits', 'safety-plan-compliance-audits', 'Create safety plans and audit compliance', 2),
  ('Contractor safety training & inductions', 'contractor-safety-training', 'Train contractors on safety procedures', 3),
  ('PPE compliance & inspections', 'ppe-compliance-inspections', 'Ensure proper PPE use and compliance', 4),
  ('Fire safety & emergency planning', 'fire-safety-emergency-planning', 'Plan fire safety and emergency procedures', 5),
  ('Environmental hazard identification', 'environmental-hazard-identification', 'Identify environmental hazards', 6),
  ('Method statement development', 'method-statement-development', 'Develop work method statements', 7),
  ('Accident reporting & corrective actions', 'accident-reporting-corrective', 'Report accidents and implement corrections', 8),
  ('CDM (Construction Design Management) compliance', 'cdm-compliance', 'Construction Design Management compliance', 9),
  ('Independent HSE audits', 'independent-hse-audits', 'Independent health and safety audits', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'health-safety-risk-management'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'project-management-consultation')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Sustainability & Environmental Consultation
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
  ('Green building & eco-certification (LEED, BREEAM, WELL)', 'green-building-certification', 'Green building certification services', 1),
  ('Energy efficiency audits', 'energy-efficiency-audits', 'Audit energy efficiency', 2),
  ('Sustainable materials sourcing', 'sustainable-materials-sourcing', 'Source sustainable building materials', 3),
  ('Carbon footprint assessment', 'carbon-footprint-assessment', 'Assess carbon emissions', 4),
  ('Water & waste management strategies', 'water-waste-management', 'Develop water and waste strategies', 5),
  ('Renewable system integration (solar, heat pumps)', 'renewable-system-integration', 'Integrate renewable energy systems', 6),
  ('Environmental impact statements', 'environmental-impact-statements', 'Prepare environmental impact reports', 7),
  ('Lifecycle cost & energy modelling', 'lifecycle-cost-energy-modelling', 'Model lifecycle costs and energy use', 8),
  ('Reuse & recycling coordination', 'reuse-recycling-coordination', 'Coordinate reuse and recycling efforts', 9),
  ('ESG reporting & sustainability training', 'esg-reporting-sustainability-training', 'ESG reporting and sustainability training', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'sustainability-environmental-consultation'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'project-management-consultation')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Client Advisory & Strategic Consulting
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
  ('Project scoping & needs assessment', 'project-scoping-needs-assessment', 'Define project scope and assess needs', 1),
  ('Procurement & contract strategy', 'procurement-contract-strategy', 'Develop procurement and contract strategies', 2),
  ('Dispute avoidance & claims advisory', 'dispute-avoidance-claims-advisory', 'Advise on dispute avoidance and claims', 3),
  ('Due diligence for investors & developers', 'due-diligence-investors-developers', 'Provide due diligence services', 4),
  ('Long-term asset maintenance planning', 'longterm-asset-maintenance-planning', 'Plan long-term asset maintenance', 5),
  ('Facility lifecycle cost management', 'facility-lifecycle-cost-management', 'Manage facility lifecycle costs', 6),
  ('Performance reviews & audits', 'performance-reviews-audits', 'Review and audit project performance', 7),
  ('Team selection & tender evaluation', 'team-selection-tender-evaluation', 'Select teams and evaluate tenders', 8),
  ('Digital project management systems (BIM, Asana, etc.)', 'digital-project-management-systems', 'Implement digital management tools', 9),
  ('Strategic development consultation', 'strategic-development-consultation', 'Provide strategic development advice', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'client-advisory-strategic-consulting'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'project-management-consultation')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;