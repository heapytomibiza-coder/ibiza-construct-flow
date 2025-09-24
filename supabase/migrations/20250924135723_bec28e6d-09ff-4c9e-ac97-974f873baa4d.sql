-- Phase 1: Quick Wins & Foundation - Database changes

-- Add is_featured column to services table
ALTER TABLE services ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Add feature flags for Phase 1
INSERT INTO feature_flags (key, enabled, description) VALUES 
('enable_featured_services_carousel', true, 'Enable featured services carousel on homepage'),
('enable_home_benefits_strip', true, 'Enable benefits strip under hero section'),
('admin_info_tips', true, 'Enable admin dashboard info tooltips')
ON CONFLICT (key) DO UPDATE SET 
enabled = EXCLUDED.enabled, 
description = EXCLUDED.description;

-- Mark some services as featured for demo (using proper PostgreSQL syntax)
UPDATE services 
SET is_featured = true 
WHERE id IN (
  SELECT id FROM services 
  WHERE category IN ('Cleaning', 'Home Maintenance', 'Beauty & Wellness', 'Pet Care')
  LIMIT 4
);