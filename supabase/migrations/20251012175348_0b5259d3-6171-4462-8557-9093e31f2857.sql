-- Create service taxonomy tables
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(category_id, slug)
);

CREATE TABLE IF NOT EXISTS public.service_micro_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID NOT NULL REFERENCES public.service_subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(subcategory_id, slug)
);

-- Create category suggestions table for custom entries
CREATE TABLE IF NOT EXISTS public.category_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('category', 'subcategory', 'micro_category')),
  parent_id UUID, -- category_id for subcategory, subcategory_id for micro_category
  suggested_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_micro_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service categories (public read)
CREATE POLICY "Anyone can view active categories"
  ON public.service_categories
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active subcategories"
  ON public.service_subcategories
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active micro categories"
  ON public.service_micro_categories
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for category suggestions
CREATE POLICY "Users can view their own suggestions"
  ON public.category_suggestions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create suggestions"
  ON public.category_suggestions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending suggestions"
  ON public.category_suggestions
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Create indexes for performance
CREATE INDEX idx_subcategories_category ON public.service_subcategories(category_id);
CREATE INDEX idx_micro_categories_subcategory ON public.service_micro_categories(subcategory_id);
CREATE INDEX idx_category_suggestions_user ON public.category_suggestions(user_id);
CREATE INDEX idx_category_suggestions_status ON public.category_suggestions(status);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_subcategories_updated_at
  BEFORE UPDATE ON public.service_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_micro_categories_updated_at
  BEFORE UPDATE ON public.service_micro_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_category_suggestions_updated_at
  BEFORE UPDATE ON public.category_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample service categories
INSERT INTO public.service_categories (name, slug, description, display_order) VALUES
('Home Services', 'home-services', 'Home maintenance and improvement services', 1),
('Professional Services', 'professional-services', 'Business and professional services', 2),
('Personal Services', 'personal-services', 'Personal care and wellness services', 3),
('Events & Entertainment', 'events-entertainment', 'Event planning and entertainment services', 4);

-- Insert sample subcategories (Home Services)
INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order)
SELECT id, 'Plumbing', 'plumbing', 'Water and drainage services', 1
FROM public.service_categories WHERE slug = 'home-services';

INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order)
SELECT id, 'Electrical', 'electrical', 'Electrical installation and repair', 2
FROM public.service_categories WHERE slug = 'home-services';

INSERT INTO public.service_subcategories (category_id, name, slug, description, display_order)
SELECT id, 'Cleaning', 'cleaning', 'Cleaning and maintenance services', 3
FROM public.service_categories WHERE slug = 'home-services';

-- Insert sample micro categories (Plumbing)
INSERT INTO public.service_micro_categories (subcategory_id, name, slug, description, display_order)
SELECT id, 'Emergency Plumbing', 'emergency-plumbing', '24/7 emergency plumbing repairs', 1
FROM public.service_subcategories WHERE slug = 'plumbing';

INSERT INTO public.service_micro_categories (subcategory_id, name, slug, description, display_order)
SELECT id, 'Drain Cleaning', 'drain-cleaning', 'Drain and sewer cleaning services', 2
FROM public.service_subcategories WHERE slug = 'plumbing';

INSERT INTO public.service_micro_categories (subcategory_id, name, slug, description, display_order)
SELECT id, 'Pipe Installation', 'pipe-installation', 'New pipe installation and replacement', 3
FROM public.service_subcategories WHERE slug = 'plumbing';