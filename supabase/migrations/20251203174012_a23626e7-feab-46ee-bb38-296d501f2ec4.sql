-- Add Spanish translation columns to professional_service_items
ALTER TABLE public.professional_service_items 
ADD COLUMN IF NOT EXISTS name_es text,
ADD COLUMN IF NOT EXISTS description_es text,
ADD COLUMN IF NOT EXISTS long_description_es text,
ADD COLUMN IF NOT EXISTS group_name_es text;

-- Add Spanish translation columns to micro_services
ALTER TABLE public.micro_services 
ADD COLUMN IF NOT EXISTS name_es text,
ADD COLUMN IF NOT EXISTS description_es text;

-- Add Spanish translation columns to service_categories
ALTER TABLE public.service_categories 
ADD COLUMN IF NOT EXISTS name_es text,
ADD COLUMN IF NOT EXISTS description_es text;

-- Add Spanish translation columns to service_subcategories
ALTER TABLE public.service_subcategories 
ADD COLUMN IF NOT EXISTS name_es text,
ADD COLUMN IF NOT EXISTS description_es text;

-- Create a comment explaining the translation pattern
COMMENT ON COLUMN public.professional_service_items.name_es IS 'Spanish translation of the service name';
COMMENT ON COLUMN public.professional_service_items.description_es IS 'Spanish translation of the service description';
COMMENT ON COLUMN public.micro_services.name_es IS 'Spanish translation of the micro service name';
COMMENT ON COLUMN public.service_categories.name_es IS 'Spanish translation of the category name';