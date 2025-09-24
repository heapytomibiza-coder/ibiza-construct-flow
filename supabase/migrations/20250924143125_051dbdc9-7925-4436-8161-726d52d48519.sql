-- Add simple_mode flag to profiles table
ALTER TABLE profiles ADD COLUMN simple_mode BOOLEAN DEFAULT true;

-- Add feature flags for Phase 3
INSERT INTO feature_flags (key, enabled, description) VALUES 
('dashboard_simple_mode', true, 'Enable simplified dashboard layout for new users'),
('first_run_tour', true, 'Show onboarding tour for new users'),
('enhanced_job_summary', true, 'Use enhanced job summary component');

-- Add tour completion tracking to profiles
ALTER TABLE profiles ADD COLUMN tour_completed BOOLEAN DEFAULT false;