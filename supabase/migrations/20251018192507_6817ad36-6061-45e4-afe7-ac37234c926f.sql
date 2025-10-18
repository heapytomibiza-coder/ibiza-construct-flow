-- Fix Legal category slug reference in category_group assignment
UPDATE service_categories 
SET category_group = 'project_services' 
WHERE slug = 'legal-regulatory-compliance';