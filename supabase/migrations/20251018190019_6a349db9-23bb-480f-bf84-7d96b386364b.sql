-- Add Legal, Regulatory & Compliance Services Category Structure
-- Deactivate old entries if they exist
UPDATE service_categories SET is_active = false 
WHERE slug IN ('legal-regulatory-compliance', 'legal-services', 'compliance-services');

UPDATE service_subcategories SET is_active = false 
WHERE category_id IN (
  SELECT id FROM service_categories 
  WHERE slug IN ('legal-regulatory-compliance', 'legal-services', 'compliance-services')
);

UPDATE service_micro_categories SET is_active = false 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id IN (
    SELECT id FROM service_categories 
    WHERE slug IN ('legal-regulatory-compliance', 'legal-services', 'compliance-services')
  )
);

-- Insert main category
INSERT INTO service_categories (name, slug, icon_name, description, category_group, display_order, is_active)
VALUES (
  'Legal, Regulatory & Compliance Services',
  'legal-regulatory-compliance',
  'Scale',
  'Professional legal, regulatory compliance, and dispute resolution services',
  'specialized',
  19,
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
  ('Property & Real Estate Law', 'property-real-estate-law', 'Conveyancing, contracts, and property legal services', 1),
  ('Business & Commercial Law', 'business-commercial-law', 'Company formation, contracts, and commercial legal advice', 2),
  ('Construction & Trade Compliance', 'construction-trade-compliance', 'Building contracts, safety compliance, and trade regulations', 3),
  ('Regulatory & Licensing Services', 'regulatory-licensing', 'Business licenses, permits, and regulatory applications', 4),
  ('Financial & Tax Compliance', 'financial-tax-compliance', 'Tax filing, accounting compliance, and financial regulations', 5),
  ('Dispute Resolution & Mediation', 'dispute-resolution-mediation', 'Mediation, arbitration, and conflict resolution services', 6),
  ('Compliance Auditing & Advisory', 'compliance-auditing-advisory', 'Risk assessment, audits, and compliance consulting', 7)
) AS sub(name, slug, description, display_order)
WHERE c.slug = 'legal-regulatory-compliance'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Property & Real Estate Law
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
  ('Conveyancing (buying / selling / transferring ownership)', 'conveyancing-property-transfer', 'Property sale and transfer legal services', 1),
  ('Title deed checks & land registry support', 'title-deed-land-registry', 'Verify property ownership and registration', 2),
  ('Lease agreements & tenancy contracts', 'lease-agreements-tenancy', 'Draft and review rental contracts', 3),
  ('Boundary / land dispute resolution', 'boundary-land-disputes', 'Resolve property boundary conflicts', 4),
  ('Construction & planning permission legal review', 'construction-planning-legal', 'Review planning and construction permits', 5),
  ('Property development joint-venture agreements', 'property-development-agreements', 'Joint venture legal structuring', 6),
  ('Evictions & tenant mediation', 'evictions-tenant-mediation', 'Handle eviction and tenant disputes', 7),
  ('Contract drafting & notarisation', 'contract-drafting-notarisation', 'Create and notarize property contracts', 8),
  ('Off-plan purchase due diligence', 'off-plan-purchase-diligence', 'Legal checks for off-plan purchases', 9),
  ('Legal advice for foreign buyers and investors', 'foreign-buyer-legal-advice', 'Legal support for international buyers', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'property-real-estate-law'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'legal-regulatory-compliance')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Business & Commercial Law
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
  ('Company registration & formation', 'company-registration-formation', 'Register and structure new businesses', 1),
  ('Contract creation & negotiation', 'contract-creation-negotiation', 'Draft and negotiate business contracts', 2),
  ('Partnership / shareholder agreements', 'partnership-shareholder-agreements', 'Create partner and shareholder agreements', 3),
  ('Employment / contractor law compliance', 'employment-contractor-compliance', 'Employment law and contractor agreements', 4),
  ('Mergers & acquisitions legal support', 'mergers-acquisitions-support', 'Legal assistance for M&A transactions', 5),
  ('Intellectual property & brand protection', 'ip-brand-protection', 'Trademark and IP legal protection', 6),
  ('Debt recovery & dispute mediation', 'debt-recovery-mediation', 'Recover debts and resolve disputes', 7),
  ('Legal audits for SMEs', 'legal-audits-smes', 'Compliance audits for small businesses', 8),
  ('Business licensing & regulatory filings', 'business-licensing-filings', 'Obtain licenses and file regulatory docs', 9),
  ('Franchise & distribution agreements', 'franchise-distribution-agreements', 'Create franchise and distribution contracts', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'business-commercial-law'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'legal-regulatory-compliance')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Construction & Trade Compliance
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
  ('Building contract review & dispute resolution', 'building-contract-review', 'Review construction contracts and disputes', 1),
  ('Liability & insurance compliance', 'liability-insurance-compliance', 'Ensure proper liability coverage', 2),
  ('Health & safety regulation advisory', 'health-safety-regulation', 'Construction safety compliance advice', 3),
  ('Environmental / waste / permit compliance', 'environmental-waste-permits', 'Environmental and waste compliance', 4),
  ('Planning & zoning applications', 'planning-zoning-applications', 'Submit planning and zoning requests', 5),
  ('Worker / contractor agreements', 'worker-contractor-agreements', 'Employment contracts for construction', 6),
  ('Warranty & defect liability guidance', 'warranty-defect-liability', 'Construction warranty legal advice', 7),
  ('Project arbitration & mediation', 'project-arbitration-mediation', 'Resolve construction project disputes', 8),
  ('Site inspection & legal documentation', 'site-inspection-documentation', 'Legal documentation for inspections', 9),
  ('Construction litigation support', 'construction-litigation-support', 'Legal representation for construction cases', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'construction-trade-compliance'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'legal-regulatory-compliance')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Regulatory & Licensing Services
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
  ('Business & trade license applications', 'business-trade-license-apps', 'Apply for business and trade licenses', 1),
  ('Import / export & customs compliance', 'import-export-customs', 'International trade compliance', 2),
  ('Hospitality / event / music licensing', 'hospitality-event-licensing', 'Entertainment and event permits', 3),
  ('Fire safety & occupancy certification', 'fire-safety-occupancy-cert', 'Fire safety and occupancy approvals', 4),
  ('Alcohol / entertainment / health permits', 'alcohol-entertainment-permits', 'Special business permits and licenses', 5),
  ('Local government submissions & approvals', 'local-government-submissions', 'Municipal and government applications', 6),
  ('Food safety / hygiene / environmental health registration', 'food-safety-hygiene-registration', 'Food business compliance and permits', 7),
  ('Vehicle / transport license support', 'vehicle-transport-licensing', 'Transportation and vehicle permits', 8),
  ('Short-term rental & tourist license applications', 'rental-tourist-licenses', 'Vacation rental and tourist permits', 9),
  ('Compliance renewal & audit tracking', 'compliance-renewal-tracking', 'Track and renew licenses and permits', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'regulatory-licensing'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'legal-regulatory-compliance')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Financial & Tax Compliance
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
  ('Personal & corporate tax filing', 'personal-corporate-tax-filing', 'Prepare and file tax returns', 1),
  ('VAT / IVA / sales tax registration', 'vat-sales-tax-registration', 'Register for VAT and sales tax', 2),
  ('Accounting & bookkeeping compliance', 'accounting-bookkeeping-compliance', 'Maintain compliant financial records', 3),
  ('Cross-border & expat tax advice', 'cross-border-expat-tax', 'International and expat tax planning', 4),
  ('Payroll & social security compliance', 'payroll-social-security', 'Payroll processing and social contributions', 5),
  ('Financial audit & record-keeping', 'financial-audit-records', 'Audit financial statements and records', 6),
  ('Tax residency & legal entity structuring', 'tax-residency-structuring', 'Structure entities for tax efficiency', 7),
  ('Revenue / profit / dividend declarations', 'revenue-profit-declarations', 'File income and dividend reports', 8),
  ('Legal reporting to authorities', 'legal-reporting-authorities', 'Submit required legal reports', 9),
  ('Tax dispute & investigation support', 'tax-dispute-investigation', 'Handle tax disputes and audits', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'financial-tax-compliance'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'legal-regulatory-compliance')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Dispute Resolution & Mediation
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
  ('Commercial / contract dispute mediation', 'commercial-contract-mediation', 'Mediate business contract disputes', 1),
  ('Property & construction arbitration', 'property-construction-arbitration', 'Arbitrate property and construction disputes', 2),
  ('Neighbour / community conflict resolution', 'neighbour-community-resolution', 'Resolve neighbor and community issues', 3),
  ('Debt recovery & payment disputes', 'debt-recovery-payment-disputes', 'Recover debts and resolve payment issues', 4),
  ('Family law & separation agreements', 'family-law-separation', 'Mediate family and separation matters', 5),
  ('Employment grievances & negotiation', 'employment-grievances-negotiation', 'Resolve workplace disputes', 6),
  ('Legal representation & case preparation', 'legal-representation-preparation', 'Prepare and represent in legal cases', 7),
  ('Settlement drafting & documentation', 'settlement-drafting-documentation', 'Draft settlement agreements', 8),
  ('Notary & witness services', 'notary-witness-services', 'Provide notary and witness services', 9),
  ('Cross-border mediation & translation', 'cross-border-mediation-translation', 'International dispute mediation', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'dispute-resolution-mediation'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'legal-regulatory-compliance')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Compliance Auditing & Advisory
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
  ('Risk assessment & policy compliance reviews', 'risk-assessment-policy-reviews', 'Assess compliance risks and policies', 1),
  ('GDPR / data protection advisory', 'gdpr-data-protection-advisory', 'Data protection compliance advice', 2),
  ('Anti-money laundering (AML) compliance', 'aml-compliance', 'AML compliance and reporting', 3),
  ('Workplace health & safety audits', 'workplace-health-safety-audits', 'Audit workplace safety compliance', 4),
  ('Environmental impact & sustainability law', 'environmental-sustainability-law', 'Environmental compliance and sustainability', 5),
  ('Quality management system audit (ISO 9001 / 14001)', 'iso-quality-management-audit', 'ISO certification and quality audits', 6),
  ('Insurance compliance advice', 'insurance-compliance-advice', 'Ensure proper insurance coverage', 7),
  ('Regulatory training for staff', 'regulatory-training-staff', 'Train staff on compliance requirements', 8),
  ('Document control & record management', 'document-control-management', 'Manage compliance documentation', 9),
  ('Ongoing compliance monitoring & renewals', 'compliance-monitoring-renewals', 'Monitor and renew compliance obligations', 10)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'compliance-auditing-advisory'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'legal-regulatory-compliance')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;