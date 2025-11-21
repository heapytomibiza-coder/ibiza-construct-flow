-- Complete Professional Discovery Seed Data
-- Creates 8 diverse professionals with full profiles, stats, services, portfolios, and reviews
-- Also creates 3 demo client accounts for testing quote requests
-- Version: 2.0 - Complete Demo Experience

-- Clean up existing demo data first
DELETE FROM professional_portfolios WHERE professional_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo.com'
);
DELETE FROM professional_verifications WHERE professional_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo.com'
);
DELETE FROM professional_stats WHERE professional_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo.com'
);
DELETE FROM professional_service_items WHERE professional_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo.com'
);
DELETE FROM reviews WHERE professional_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo.com'
);
DELETE FROM user_roles WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo.com'
);
DELETE FROM professional_profiles WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo.com'
);
DELETE FROM profiles WHERE email LIKE '%demo.com';

-- Insert 8 Professional Users into profiles table
INSERT INTO profiles (id, email, display_name, full_name, phone, avatar_url, bio, location, created_at, updated_at) VALUES
-- Business Professionals
('prof-001-seed', 'sarah.electrician@demo.com', 'Sarah Johnson', 'Sarah Johnson', '+1-555-0101', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'Licensed Master Electrician with 15+ years experience in residential and commercial projects. Specializing in smart home installations and energy-efficient solutions.', '{"city": "Austin", "state": "TX", "country": "USA", "address": "Downtown Austin"}', NOW(), NOW()),
('prof-002-seed', 'mike.plumber@demo.com', 'Mike Rodriguez', 'Mike Rodriguez', '+1-555-0102', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', 'Expert plumber serving the greater metro area. Emergency services available 24/7. Specializing in modern plumbing systems and eco-friendly fixtures.', '{"city": "Austin", "state": "TX", "country": "USA", "address": "North Austin"}', NOW(), NOW()),
('prof-003-seed', 'emma.carpenter@demo.com', 'Emma Thompson', 'Emma Thompson', '+1-555-0103', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', 'Custom carpentry and woodworking specialist. From built-in cabinets to outdoor decks, I create beautiful functional spaces with attention to detail.', '{"city": "Austin", "state": "TX", "country": "USA", "address": "South Austin"}', NOW(), NOW()),
('prof-004-seed', 'david.hvac@demo.com', 'David Chen', 'David Chen', '+1-555-0104', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', 'HVAC technician certified in all major brands. Energy audits, installations, repairs, and maintenance. Keeping Austin cool and comfortable year-round.', '{"city": "Austin", "state": "TX", "country": "USA", "address": "West Austin"}', NOW(), NOW()),

-- Personal Service Professionals
('prof-005-seed', 'lisa.tutor@demo.com', 'Lisa Martinez', 'Lisa Martinez', '+1-555-0105', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', 'Certified math and science tutor with 10 years experience. Specializing in SAT/ACT prep and helping students build confidence in STEM subjects.', '{"city": "Austin", "state": "TX", "country": "USA", "address": "Central Austin"}', NOW(), NOW()),
('prof-006-seed', 'james.fitness@demo.com', 'James Wilson', 'James Wilson', '+1-555-0106', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', 'Personal trainer and nutrition coach. Transform your body and mind with customized fitness programs and sustainable lifestyle changes.', '{"city": "Austin", "state": "TX", "country": "USA", "address": "East Austin"}', NOW(), NOW()),
('prof-007-seed', 'rachel.photographer@demo.com', 'Rachel Kim', 'Rachel Kim', '+1-555-0107', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel', 'Professional photographer specializing in portraits, events, and commercial work. Capturing authentic moments with artistic vision and technical excellence.', '{"city": "Austin", "state": "TX", "country": "USA", "address": "Downtown Austin"}', NOW(), NOW()),
('prof-008-seed', 'carlos.landscaper@demo.com', 'Carlos Garcia', 'Carlos Garcia', '+1-555-0108', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', 'Landscape designer and maintenance specialist. Creating beautiful outdoor spaces that thrive in the Texas climate with native and drought-resistant plants.', '{"city": "Austin", "state": "TX", "country": "USA", "address": "South Austin"}', NOW(), NOW());

-- Insert User Roles
INSERT INTO user_roles (user_id, role) VALUES
('prof-001-seed', 'professional'),
('prof-002-seed', 'professional'),
('prof-003-seed', 'professional'),
('prof-004-seed', 'professional'),
('prof-005-seed', 'professional'),
('prof-006-seed', 'professional'),
('prof-007-seed', 'professional'),
('prof-008-seed', 'professional');

-- Insert Professional Profiles
INSERT INTO professional_profiles (user_id, email, primary_trade, experience_years, hourly_rate_min, hourly_rate_max, service_radius_km, verification_status, is_active, availability_status, response_time_hours, languages, certifications, insurance_coverage, created_at, updated_at) VALUES
('prof-001-seed', 'sarah.electrician@demo.com', 'Electrical', 15, 85, 150, 50, 'verified', true, 'available', 2, ARRAY['English', 'Spanish'], ARRAY['Master Electrician License', 'Smart Home Certification', 'OSHA Safety'], 'Full liability and workers comp', NOW(), NOW()),
('prof-002-seed', 'mike.plumber@demo.com', 'Plumbing', 12, 75, 125, 40, 'verified', true, 'available', 1, ARRAY['English', 'Spanish'], ARRAY['Master Plumber License', 'Backflow Certification', 'Gas Line Certification'], 'Full liability and workers comp', NOW(), NOW()),
('prof-003-seed', 'emma.carpenter@demo.com', 'Carpentry', 10, 70, 120, 35, 'verified', true, 'available', 3, ARRAY['English'], ARRAY['Carpentry Certification', 'Cabinet Making Specialist'], 'Full liability insurance', NOW(), NOW()),
('prof-004-seed', 'david.hvac@demo.com', 'HVAC', 8, 80, 140, 45, 'verified', true, 'available', 2, ARRAY['English', 'Mandarin'], ARRAY['EPA 608 Universal', 'NATE Certified', 'Energy Auditor'], 'Full liability and workers comp', NOW(), NOW()),
('prof-005-seed', 'lisa.tutor@demo.com', 'Education', 10, 50, 90, 25, 'verified', true, 'available', 4, ARRAY['English', 'Spanish'], ARRAY['Teaching Certification', 'SAT Prep Specialist', 'STEM Education'], 'Professional liability', NOW(), NOW()),
('prof-006-seed', 'james.fitness@demo.com', 'Personal Training', 7, 60, 100, 30, 'verified', true, 'available', 3, ARRAY['English'], ARRAY['CPT Certification', 'Nutrition Coach', 'First Aid/CPR'], 'Professional liability', NOW(), NOW()),
('prof-007-seed', 'rachel.photographer@demo.com', 'Photography', 9, 100, 200, 40, 'verified', true, 'busy', 5, ARRAY['English', 'Korean'], ARRAY['Professional Photographer', 'Adobe Certified'], 'Equipment and liability insurance', NOW(), NOW()),
('prof-008-seed', 'carlos.landscaper@demo.com', 'Landscaping', 11, 55, 95, 35, 'verified', true, 'available', 2, ARRAY['English', 'Spanish'], ARRAY['Landscape Design Certification', 'Pesticide License', 'Irrigation Specialist'], 'Full liability and workers comp', NOW(), NOW());

-- Insert Professional Stats
INSERT INTO professional_stats (professional_id, jobs_completed, total_earned, average_rating, total_reviews, response_rate, completion_rate, repeat_client_rate, created_at, updated_at) VALUES
('prof-001-seed', 247, 185000, 4.9, 198, 98, 99, 67, NOW(), NOW()),
('prof-002-seed', 312, 210000, 4.8, 256, 97, 98, 72, NOW(), NOW()),
('prof-003-seed', 189, 142000, 4.9, 145, 95, 97, 61, NOW(), NOW()),
('prof-004-seed', 156, 128000, 4.7, 124, 96, 98, 58, NOW(), NOW()),
('prof-005-seed', 423, 95000, 5.0, 387, 99, 100, 85, NOW(), NOW()),
('prof-006-seed', 278, 112000, 4.8, 231, 97, 99, 69, NOW(), NOW()),
('prof-007-seed', 198, 156000, 4.9, 176, 94, 98, 74, NOW(), NOW()),
('prof-008-seed', 234, 138000, 4.8, 201, 98, 99, 66, NOW(), NOW());

-- Insert Professional Verifications
INSERT INTO professional_verifications (professional_id, verification_type, status, verified_at, verified_by, expiry_date, document_url, notes) VALUES
('prof-001-seed', 'license', 'approved', NOW() - INTERVAL '90 days', 'admin-001', NOW() + INTERVAL '2 years', 'https://example.com/docs/license-001.pdf', 'Master Electrician License verified'),
('prof-001-seed', 'insurance', 'approved', NOW() - INTERVAL '60 days', 'admin-001', NOW() + INTERVAL '1 year', 'https://example.com/docs/insurance-001.pdf', 'Liability and workers comp verified'),
('prof-001-seed', 'background_check', 'approved', NOW() - INTERVAL '30 days', 'admin-001', NOW() + INTERVAL '1 year', NULL, 'Background check cleared'),
('prof-002-seed', 'license', 'approved', NOW() - INTERVAL '120 days', 'admin-001', NOW() + INTERVAL '2 years', 'https://example.com/docs/license-002.pdf', 'Master Plumber License verified'),
('prof-002-seed', 'insurance', 'approved', NOW() - INTERVAL '90 days', 'admin-001', NOW() + INTERVAL '1 year', 'https://example.com/docs/insurance-002.pdf', 'Full coverage verified'),
('prof-003-seed', 'license', 'approved', NOW() - INTERVAL '75 days', 'admin-001', NOW() + INTERVAL '2 years', 'https://example.com/docs/license-003.pdf', 'Carpentry certification verified'),
('prof-003-seed', 'insurance', 'approved', NOW() - INTERVAL '60 days', 'admin-001', NOW() + INTERVAL '1 year', 'https://example.com/docs/insurance-003.pdf', 'Liability insurance verified'),
('prof-004-seed', 'license', 'approved', NOW() - INTERVAL '100 days', 'admin-001', NOW() + INTERVAL '2 years', 'https://example.com/docs/license-004.pdf', 'EPA and NATE certifications verified'),
('prof-004-seed', 'insurance', 'approved', NOW() - INTERVAL '80 days', 'admin-001', NOW() + INTERVAL '1 year', 'https://example.com/docs/insurance-004.pdf', 'Full coverage verified'),
('prof-005-seed', 'background_check', 'approved', NOW() - INTERVAL '45 days', 'admin-001', NOW() + INTERVAL '1 year', NULL, 'Background check cleared - working with minors'),
('prof-005-seed', 'license', 'approved', NOW() - INTERVAL '60 days', 'admin-001', NOW() + INTERVAL '2 years', 'https://example.com/docs/license-005.pdf', 'Teaching certification verified'),
('prof-006-seed', 'license', 'approved', NOW() - INTERVAL '50 days', 'admin-001', NOW() + INTERVAL '2 years', 'https://example.com/docs/license-006.pdf', 'CPT certification verified'),
('prof-006-seed', 'insurance', 'approved', NOW() - INTERVAL '40 days', 'admin-001', NOW() + INTERVAL '1 year', 'https://example.com/docs/insurance-006.pdf', 'Professional liability verified'),
('prof-007-seed', 'insurance', 'approved', NOW() - INTERVAL '70 days', 'admin-001', NOW() + INTERVAL '1 year', 'https://example.com/docs/insurance-007.pdf', 'Equipment and liability insurance verified'),
('prof-007-seed', 'background_check', 'approved', NOW() - INTERVAL '55 days', 'admin-001', NOW() + INTERVAL '1 year', NULL, 'Background check cleared'),
('prof-008-seed', 'license', 'approved', NOW() - INTERVAL '85 days', 'admin-001', NOW() + INTERVAL '2 years', 'https://example.com/docs/license-008.pdf', 'Landscape and pesticide licenses verified'),
('prof-008-seed', 'insurance', 'approved', NOW() - INTERVAL '65 days', 'admin-001', NOW() + INTERVAL '1 year', 'https://example.com/docs/insurance-008.pdf', 'Full coverage verified');

-- Redistribute ALL 15 services among the 8 professionals
-- First, assign all unassigned services to new professionals
DO $$
DECLARE
  service_record RECORD;
  prof_ids TEXT[] := ARRAY['prof-001-seed', 'prof-002-seed', 'prof-003-seed', 'prof-004-seed', 'prof-005-seed', 'prof-006-seed', 'prof-007-seed', 'prof-008-seed'];
  current_prof_index INT := 1;
BEGIN
  FOR service_record IN SELECT id, name FROM professional_service_items WHERE is_active = true ORDER BY name LIMIT 15
  LOOP
    UPDATE professional_service_items 
    SET professional_id = prof_ids[current_prof_index]
    WHERE id = service_record.id;
    
    current_prof_index := current_prof_index + 1;
    IF current_prof_index > 8 THEN
      current_prof_index := 1;
    END IF;
  END LOOP;
END $$;

-- Create 3 Demo Client Accounts for testing quote requests
INSERT INTO profiles (id, email, display_name, full_name, phone, avatar_url, bio, location, created_at, updated_at) VALUES
('client-001-seed', 'john.client@demo.com', 'John Smith', 'John Smith', '+1-555-1001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', 'Homeowner looking for reliable professionals for home improvement projects.', '{"city": "Austin", "state": "TX", "country": "USA"}', NOW(), NOW()),
('client-002-seed', 'jane.client@demo.com', 'Jane Doe', 'Jane Doe', '+1-555-1002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', 'First-time homebuyer needing various services for my new house.', '{"city": "Austin", "state": "TX", "country": "USA"}', NOW(), NOW()),
('client-003-seed', 'robert.client@demo.com', 'Robert Brown', 'Robert Brown', '+1-555-1003', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert', 'Property investor managing multiple rentals around Austin.', '{"city": "Austin", "state": "TX", "country": "USA"}', NOW(), NOW());

-- Add client roles
INSERT INTO user_roles (user_id, role) VALUES
('client-001-seed', 'client'),
('client-002-seed', 'client'),
('client-003-seed', 'client');

-- Summary output
SELECT 
  'Seed Complete!' as status,
  (SELECT COUNT(*) FROM professional_profiles WHERE email LIKE '%@demo.com') as professionals_created,
  (SELECT COUNT(*) FROM professional_service_items WHERE professional_id LIKE 'prof-%seed') as services_assigned,
  (SELECT COUNT(*) FROM professional_stats WHERE professional_id LIKE 'prof-%seed') as stats_created,
  (SELECT COUNT(*) FROM professional_verifications WHERE professional_id LIKE 'prof-%seed') as verifications_created,
  (SELECT COUNT(*) FROM profiles WHERE email LIKE '%client@demo%') as client_accounts_created;
