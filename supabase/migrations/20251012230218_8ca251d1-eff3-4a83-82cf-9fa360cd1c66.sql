
-- Add unique constraint to service_subcategories
ALTER TABLE service_subcategories
ADD CONSTRAINT service_subcategories_category_name_key UNIQUE (category_id, name);
