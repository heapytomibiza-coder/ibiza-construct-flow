-- ============================================
-- ALTER SERVICE_CATEGORIES TABLE
-- Add missing columns for CategorySelector
-- ============================================

-- Add category_group for grouping
ALTER TABLE public.service_categories 
ADD COLUMN IF NOT EXISTS category_group TEXT;

-- Add is_featured for highlighting popular categories
ALTER TABLE public.service_categories 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add metadata for extensibility
ALTER TABLE public.service_categories 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Rename icon to icon_emoji for clarity
ALTER TABLE public.service_categories 
RENAME COLUMN icon TO icon_emoji;

-- Create indexes on new columns
CREATE INDEX IF NOT EXISTS idx_service_categories_group ON public.service_categories(category_group);
CREATE INDEX IF NOT EXISTS idx_service_categories_featured ON public.service_categories(is_featured);