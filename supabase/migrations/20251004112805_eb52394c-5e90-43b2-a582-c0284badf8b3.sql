-- Create professional_services table for service management
CREATE TABLE IF NOT EXISTS public.professional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professional_profiles(user_id) ON DELETE CASCADE,
  micro_service_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  service_areas JSONB DEFAULT '[]'::jsonb,
  pricing_structure JSONB DEFAULT '{}'::jsonb,
  portfolio_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Professionals can manage their own services"
  ON public.professional_services
  FOR ALL
  USING (professional_id = auth.uid());

CREATE POLICY "Anyone can view active services"
  ON public.professional_services
  FOR SELECT
  USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_professional_services_updated_at
  BEFORE UPDATE ON public.professional_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_professional_services_professional_id ON public.professional_services(professional_id);
CREATE INDEX idx_professional_services_micro_service_id ON public.professional_services(micro_service_id);
CREATE INDEX idx_professional_services_active ON public.professional_services(is_active);