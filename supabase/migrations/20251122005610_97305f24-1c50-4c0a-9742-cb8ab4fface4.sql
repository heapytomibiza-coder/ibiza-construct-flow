-- Phase 1: Add Metalwork Services for Existing Demo Profiles

-- First, create service catalog entries for metalwork services
INSERT INTO services (category, subcategory, micro)
VALUES 
  ('construction', 'metalwork', 'custom-welding'),
  ('construction', 'metalwork', 'gates-fencing'),
  ('construction', 'metalwork', 'railings-balustrades'),
  ('construction', 'metalwork', 'metal-stairs'),
  ('construction', 'metalwork', 'repair-restoration'),
  ('construction', 'metalwork', 'custom-fabrication')
ON CONFLICT (category, subcategory, micro) DO NOTHING;

-- Get the service IDs and add services for both metalwork professionals
DO $$
DECLARE
  welding_service_id uuid;
  gates_service_id uuid;
  railings_service_id uuid;
  stairs_service_id uuid;
  repair_service_id uuid;
  fabrication_service_id uuid;
  metal_ibiza_id uuid := '11111111-1111-1111-1111-000000000001';
  ferrer_id uuid := '11111111-1111-1111-1111-000000000002';
BEGIN
  -- Get service IDs
  SELECT id INTO welding_service_id FROM services WHERE micro = 'custom-welding' LIMIT 1;
  SELECT id INTO gates_service_id FROM services WHERE micro = 'gates-fencing' LIMIT 1;
  SELECT id INTO railings_service_id FROM services WHERE micro = 'railings-balustrades' LIMIT 1;
  SELECT id INTO stairs_service_id FROM services WHERE micro = 'metal-stairs' LIMIT 1;
  SELECT id INTO repair_service_id FROM services WHERE micro = 'repair-restoration' LIMIT 1;
  SELECT id INTO fabrication_service_id FROM services WHERE micro = 'custom-fabrication' LIMIT 1;

  -- Add services for Metal Ibiza Ingeniería
  INSERT INTO professional_service_items (professional_id, service_id, name, description, base_price, pricing_type, category, is_active)
  VALUES
    (metal_ibiza_id, welding_service_id, 'Industrial Welding Services', 'Professional MIG, TIG, and arc welding for all metal types. Industrial-grade equipment and certified welders.', 90.00, 'hourly', 'metalwork', true),
    (metal_ibiza_id, gates_service_id, 'Commercial Gates & Security', 'Heavy-duty commercial gates and security systems. Automated entry systems available.', 1800.00, 'fixed', 'metalwork', true),
    (metal_ibiza_id, railings_service_id, 'Industrial Railings & Guards', 'Safety-compliant railings for commercial properties. Built to industrial standards.', 520.00, 'per_meter', 'metalwork', true),
    (metal_ibiza_id, stairs_service_id, 'Metal Staircase Engineering', 'Engineered metal staircases for commercial and residential projects.', 4500.00, 'fixed', 'metalwork', true),
    (metal_ibiza_id, repair_service_id, 'Metal Structure Maintenance', 'Comprehensive maintenance and repair services for metal structures. Emergency response available.', 85.00, 'hourly', 'metalwork', true),
    (metal_ibiza_id, fabrication_service_id, 'Industrial Metal Fabrication', 'Custom fabrication for commercial projects. CAD design and precision manufacturing.', 110.00, 'hourly', 'metalwork', true);

  -- Add services for Ferrer Metal Design
  INSERT INTO professional_service_items (professional_id, service_id, name, description, base_price, pricing_type, category, is_active)
  VALUES
    (ferrer_id, welding_service_id, 'Custom Welding Services', 'Expert MIG, TIG, and arc welding for all metal types. Perfect for custom projects and repairs.', 85.00, 'hourly', 'metalwork', true),
    (ferrer_id, gates_service_id, 'Gates & Fencing', 'Design and installation of custom metal gates, railings, and security fencing. Modern and traditional styles.', 1200.00, 'fixed', 'metalwork', true),
    (ferrer_id, railings_service_id, 'Railings & Balustrades', 'Beautiful custom railings for stairs, balconies, and terraces. Stainless steel, wrought iron, or aluminum.', 450.00, 'per_meter', 'metalwork', true),
    (ferrer_id, stairs_service_id, 'Metal Staircase Fabrication', 'Custom metal staircases - from modern floating stairs to industrial spiral designs.', 3500.00, 'fixed', 'metalwork', true),
    (ferrer_id, repair_service_id, 'Metal Repair & Restoration', 'Professional repair and restoration of metal structures, gates, and fixtures. Rust removal and protective coating.', 75.00, 'hourly', 'metalwork', true),
    (ferrer_id, fabrication_service_id, 'Custom Metal Fabrication', 'Bespoke metalwork for residential and commercial projects. From concept to installation.', 95.00, 'hourly', 'metalwork', true);
END $$;