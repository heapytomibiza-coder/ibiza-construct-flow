-- Add professional role to existing user profile
UPDATE profiles 
SET roles = '["client", "professional"]'::jsonb 
WHERE full_name = 'Thomas Heap' 
AND roles = '["client"]'::jsonb;