-- Create homepage_featured_services table
CREATE TABLE public.homepage_featured_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  sort_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_featured_services ENABLE ROW LEVEL SECURITY;

-- Public read access for active items
CREATE POLICY "Public can view active featured services"
  ON public.homepage_featured_services
  FOR SELECT
  TO public
  USING (is_active = true);

-- Seed with 8 featured categories
INSERT INTO public.homepage_featured_services (category_id, sort_order) VALUES
('5e97f736-36b8-4d7d-9fcf-f1c52f845237', 1), -- Construction
('d384aa17-5dc6-4bc6-b0f1-0ea1f4186a8c', 2), -- Carpentry
('098dc559-b205-4f0c-9dbe-6210358fc2df', 3), -- Electrical
('1e540b07-14c7-471a-87db-25704275de48', 4), -- Plumbing
('ba7182bd-0867-45af-8df5-30888fa32dee', 5), -- Painting & Decorating
('ec0e677b-4f65-42af-b137-d2d9c4b53509', 6), -- Pool & Spa
('d00c7fec-2c46-4540-9aa8-4bb509a90b02', 7), -- Gardening & Landscaping
('1d0d5594-33b5-4244-8041-167017de5cbf', 8); -- Kitchen & Bathroom