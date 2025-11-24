-- Phase 5: Seed realistic service menu items for Gates & Fencing
-- Professional: Ferrer Metal Design (11111111-1111-1111-1111-000000000002)
-- Service: Gates & Fencing (7930c306-8951-4ba8-9e7f-733e4144bb3f)

-- First, clear existing items for this service
DELETE FROM professional_service_items 
WHERE service_id = '7930c306-8951-4ba8-9e7f-733e4144bb3f' 
  AND professional_id = '11111111-1111-1111-1111-000000000002';

-- Insert detailed service menu items
INSERT INTO professional_service_items (
  service_id, professional_id, name, description, long_description,
  base_price, pricing_type, unit_type, group_name, 
  whats_included, specifications, sort_order, is_active
) VALUES
-- GATES GROUP
('7930c306-8951-4ba8-9e7f-733e4144bb3f', '11111111-1111-1111-1111-000000000002',
 'Modern Sliding Gate',
 'Contemporary automated sliding gate with minimalist design',
 'Our modern sliding gates combine sleek aesthetics with robust functionality. Perfect for residential properties and commercial spaces, these gates feature clean lines and automated operation for maximum convenience. Built from premium materials with weather-resistant finishes.',
 3200, 'range', 'unit', 'Gates',
 '["Premium powder-coated steel frame", "Automated motor system with backup battery", "2 remote controls included", "Safety sensors and obstacle detection", "Professional installation and setup", "5-year structural warranty", "Annual maintenance guide"]'::jsonb,
 '{"height_range": "1.8m - 2.5m", "width_range": "3m - 6m", "material": "Steel with aluminium infills", "finish_options": "Matt black, Anthracite grey, Bronze, Custom RAL colors", "installation_time": "2-3 days", "maintenance": "Minimal - annual lubrication recommended"}'::jsonb,
 1, true),

('7930c306-8951-4ba8-9e7f-733e4144bb3f', '11111111-1111-1111-1111-000000000002',
 'Traditional Swing Gate',
 'Classic double swing gates with decorative elements',
 'Elegant traditional swing gates that add timeless charm to any property entrance. Hand-crafted with attention to detail, featuring ornamental scrollwork and robust hinges. Available in various designs from simple geometric patterns to elaborate decorative motifs.',
 2200, 'range', 'unit', 'Gates',
 '["Hand-forged steel construction", "Decorative scrollwork and finials", "Heavy-duty hinges and latches", "Weather-resistant powder coating", "Professional installation", "Lock mechanism included", "3-year warranty"]'::jsonb,
 '{"height_range": "1.5m - 2.2m", "width_range": "2.5m - 5m (per panel)", "material": "Wrought iron or mild steel", "finish_options": "Matt black, Traditional black, Bronze, Antique finishes", "installation_time": "1-2 days", "style_variations": "Victorian, Mediterranean, Minimalist"}'::jsonb,
 2, true),

('7930c306-8951-4ba8-9e7f-733e4144bb3f', '11111111-1111-1111-1111-000000000002',
 'Security Entrance Gate',
 'Heavy-duty automated gate with advanced security features',
 'Maximum security entrance solution designed for high-value properties. Features reinforced construction, advanced access control systems, and professional-grade automation. Ideal for villas, estates, and commercial premises requiring top-level security.',
 4500, 'range', 'unit', 'Gates',
 '["Reinforced steel frame construction", "Commercial-grade automation system", "Intercom and video entry system", "Access control (keypad/card reader)", "Anti-climb spikes optional", "Emergency manual override", "Professional installation and programming", "7-year comprehensive warranty"]'::jsonb,
 '{"height_range": "2m - 3m", "width_range": "4m - 8m", "material": "Heavy gauge steel with security mesh", "finish_options": "Powder-coated in any RAL color", "installation_time": "3-5 days", "security_rating": "LPS 1175 SR2 equivalent", "automation": "24V motor with solar backup option"}'::jsonb,
 3, true),

('7930c306-8951-4ba8-9e7f-733e4144bb3f', '11111111-1111-1111-1111-000000000002',
 'Decorative Double Gate',
 'Artistic custom-designed entrance gates',
 'Make a statement with our bespoke decorative gates. Each piece is custom-designed to reflect your personal style and property character. From Mediterranean elegance to contemporary art pieces, we create gates that are functional works of art.',
 5200, 'range', 'unit', 'Gates',
 '["Custom design consultation", "Architectural drawings and 3D renderings", "Hand-forged decorative elements", "Premium materials and finishes", "Automated or manual operation", "Professional installation", "Lifetime craftsmanship guarantee"]'::jsonb,
 '{"height_range": "1.8m - 2.8m", "width_range": "3m - 7m (total)", "material": "Wrought iron, steel, or bronze", "finish_options": "Custom patinas, gilding, powder coating", "design_time": "2-3 weeks", "installation_time": "2-4 days", "customization": "Fully bespoke - any design possible"}'::jsonb,
 4, true),

-- RAILINGS & FENCING GROUP
('7930c306-8951-4ba8-9e7f-733e4144bb3f', '11111111-1111-1111-1111-000000000002',
 'Perimeter Security Fencing',
 'Robust boundary fencing for property protection',
 'Professional-grade perimeter fencing providing both security and aesthetic appeal. Designed to deter intruders while maintaining visual appeal. Perfect for residential estates, commercial properties, and agricultural land.',
 210, 'per_square_meter', 'linear meter', 'Railings & Fencing',
 '["Galvanized steel posts and panels", "Anti-climb design features", "Powder-coated finish", "Concrete post foundations", "Professional installation", "5-year warranty against rust", "Optional barbed wire topping"]'::jsonb,
 '{"height_range": "1.8m - 2.5m", "panel_width": "2.5m - 3m standard", "material": "Galvanized steel mesh or vertical bars", "finish_options": "Green, Black, Anthracite grey", "installation": "Includes concrete post setting", "maintenance": "Virtually maintenance-free"}'::jsonb,
 5, true),

('7930c306-8951-4ba8-9e7f-733e4144bb3f', '11111111-1111-1111-1111-000000000002',
 'Decorative Garden Railings',
 'Elegant railings for gardens and terraces',
 'Beautiful decorative railings that define spaces while adding architectural interest. Hand-crafted with traditional techniques, perfect for garden boundaries, terraces, and pathways. Combines security with Mediterranean charm.',
 280, 'per_square_meter', 'linear meter', 'Railings & Fencing',
 '["Hand-forged steel construction", "Decorative finials and scrollwork", "Weather-resistant coating", "Concrete base or wall mounting", "Custom height options", "Professional installation", "3-year warranty"]'::jsonb,
 '{"height_range": "0.8m - 1.5m", "material": "Wrought iron or mild steel", "finish_options": "Matt black, Bronze, Traditional black, Custom colors", "post_spacing": "2m - 2.5m", "design_styles": "Victorian, Mediterranean, Contemporary", "installation_time": "1-2 days per 10m"}'::jsonb,
 6, true),

('7930c306-8951-4ba8-9e7f-733e4144bb3f', '11111111-1111-1111-1111-000000000002',
 'Glass Balustrade with Steel Frame',
 'Modern glass and steel balustrade system',
 'Contemporary balustrade combining tempered glass panels with sleek steel framing. Perfect for pool areas, terraces, and balconies where unobstructed views are essential. Complies with all safety regulations.',
 340, 'per_square_meter', 'linear meter', 'Railings & Fencing',
 '["10mm tempered safety glass panels", "Stainless steel or powder-coated frame", "Corrosion-resistant hardware", "Engineer certification included", "Professional installation", "Easy-clean nano coating option", "10-year warranty on glass", "5-year warranty on metalwork"]'::jsonb,
 '{"height_options": "1m, 1.1m, 1.2m (to meet regulations)", "glass_type": "Tempered safety glass", "frame_material": "316 marine-grade stainless steel or powder-coated aluminium", "finish_options": "Brushed stainless, Polished stainless, Matt black, White", "installation_time": "1 day per 5m", "maintenance": "Low - periodic glass cleaning"}'::jsonb,
 7, true),

-- ADDITIONAL SERVICES GROUP
('7930c306-8951-4ba8-9e7f-733e4144bb3f', '11111111-1111-1111-1111-000000000002',
 'Gate Automation System',
 'Professional automation kit for existing gates',
 'Upgrade your manual gates with our professional automation system. Includes motor, control panel, remote controls, and safety features. Compatible with most existing swing and sliding gates.',
 1200, 'range', 'installation', 'Additional Services',
 '["Motor system (swing or sliding)", "Control panel with timer", "2 remote controls", "Safety photocells", "Emergency manual release", "Professional installation and programming", "2-year warranty on electronics"]'::jsonb,
 '{"motor_types": "Swing arm motors or sliding gate motors", "power": "230V or 24V low voltage", "weight_capacity": "Up to 400kg per gate leaf", "opening_speed": "Adjustable 10-20 seconds", "features": "Soft start/stop, automatic closing, obstacle detection", "compatibility": "Most existing gates", "installation_time": "Half day"}'::jsonb,
 8, true),

('7930c306-8951-4ba8-9e7f-733e4144bb3f', '11111111-1111-1111-1111-000000000002',
 'Custom Design Consultation',
 'Professional design service for bespoke projects',
 'Work directly with our design team to create unique metalwork solutions. Includes site visit, concept drawings, 3D renderings, and detailed specifications. Perfect for complex or unusual projects requiring custom design.',
 180, 'per_hour', 'hour', 'Additional Services',
 '["Initial site visit and assessment", "Concept sketches and design options", "3D CAD renderings", "Material recommendations", "Detailed cost estimation", "Technical drawings for approval", "Ongoing project consultation"]'::jsonb,
 '{"session_length": "Typically 2-4 hours", "deliverables": "Drawings, renderings, specifications, quote", "turnaround": "1-2 weeks for initial concepts", "revisions": "Up to 3 design revisions included", "ideal_for": "Complex projects, unique designs, historical renovations"}'::jsonb,
 9, true);

-- Add portfolio images for Ferrer Metal Design
INSERT INTO portfolio_images (professional_id, image_url, title, description, category, display_order)
VALUES
('11111111-1111-1111-1111-000000000002', 
 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
 'Modern Sliding Gate - Villa Sa Carroca',
 'Contemporary 5-meter automated sliding gate with integrated lighting and smart access control',
 'metalwork', 1),

('11111111-1111-1111-1111-000000000002',
 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
 'Traditional Entrance Gates - Can Furnet Estate',
 'Hand-forged double swing gates featuring Mediterranean scrollwork and bronze finish',
 'gates', 2),

('11111111-1111-1111-1111-000000000002',
 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
 'Security Fencing - Commercial Property',
 '200 meters of high-security perimeter fencing with anti-climb features',
 'metalwork', 3),

('11111111-1111-1111-1111-000000000002',
 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800',
 'Glass Balustrade - Pool Terrace',
 'Modern glass and stainless steel balustrade with unobstructed sea views',
 'metalwork', 4),

('11111111-1111-1111-1111-000000000002',
 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800',
 'Decorative Garden Railings - Historic Finca',
 'Restoration and extension of traditional wrought iron garden railings',
 'gates', 5),

('11111111-1111-1111-1111-000000000002',
 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
 'Automated Double Gates - Luxury Villa',
 'Bespoke 7-meter automated gates with custom geometric pattern design',
 'metalwork', 6),

('11111111-1111-1111-1111-000000000002',
 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
 'Terrace Railings - Ibiza Town',
 'Contemporary steel railings for penthouse terrace installation',
 'metalwork', 7),

('11111111-1111-1111-1111-000000000002',
 'https://images.unsplash.com/photo-1600566753097-d9ca2c6fa1d0?w=800',
 'Security Gate with Intercom - Private Road',
 'Heavy-duty entrance gate with integrated video intercom system',
 'gates', 8),

('11111111-1111-1111-1111-000000000002',
 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800',
 'Custom Decorative Gate - Artist Residence',
 'One-of-a-kind sculptural gate design incorporating wave motifs',
 'gates', 9),

('11111111-1111-1111-1111-000000000002',
 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800',
 'Perimeter Fencing - Agricultural Estate',
 'Complete boundary fencing solution with motorized access gates',
 'metalwork', 10);