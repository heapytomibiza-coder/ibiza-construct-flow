-- Phase 3: Enhanced Templates and Smart Features Migration

-- Create job_templates table for saved user templates
CREATE TABLE public.job_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  micro_service TEXT NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on job_templates
ALTER TABLE public.job_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for job_templates
CREATE POLICY "Users can view their own templates" 
ON public.job_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" 
ON public.job_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.job_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.job_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_job_templates_user_id ON public.job_templates(user_id);
CREATE INDEX idx_job_templates_category ON public.job_templates(category);
CREATE INDEX idx_job_templates_usage_count ON public.job_templates(usage_count DESC);
CREATE INDEX idx_job_templates_last_used ON public.job_templates(last_used_at DESC);

-- Create pricing_hints table for smart pricing suggestions
CREATE TABLE public.pricing_hints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_category TEXT NOT NULL,
  service_subcategory TEXT NOT NULL,
  micro_service TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'general',
  avg_price NUMERIC NOT NULL,
  min_price NUMERIC NOT NULL,
  max_price NUMERIC NOT NULL,
  sample_size INTEGER NOT NULL DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pricing_hints (public read access)
ALTER TABLE public.pricing_hints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pricing hints are publicly readable" 
ON public.pricing_hints 
FOR SELECT 
USING (true);

-- Add indexes for pricing hints
CREATE INDEX idx_pricing_hints_service ON public.pricing_hints(service_category, service_subcategory, micro_service);
CREATE INDEX idx_pricing_hints_location ON public.pricing_hints(location_type);

-- Create conversion_analytics table for A/B testing
CREATE TABLE public.conversion_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  step_number INTEGER,
  variant TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on conversion_analytics
ALTER TABLE public.conversion_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics" 
ON public.conversion_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add indexes for analytics
CREATE INDEX idx_conversion_analytics_session ON public.conversion_analytics(session_id);
CREATE INDEX idx_conversion_analytics_event ON public.conversion_analytics(event_type);
CREATE INDEX idx_conversion_analytics_timestamp ON public.conversion_analytics(timestamp DESC);

-- Create trigger for job_templates updated_at
CREATE TRIGGER update_job_templates_updated_at
BEFORE UPDATE ON public.job_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample pricing hints data
INSERT INTO public.pricing_hints (service_category, service_subcategory, micro_service, location_type, avg_price, min_price, max_price, sample_size) VALUES
('Home Services', 'Plumbing', 'Pipe Repair', 'urban', 150.00, 80.00, 300.00, 45),
('Home Services', 'Plumbing', 'Drain Cleaning', 'urban', 120.00, 60.00, 200.00, 32),
('Home Services', 'Electrical', 'Light Installation', 'urban', 85.00, 40.00, 150.00, 28),
('Home Services', 'Cleaning', 'Deep Cleaning', 'urban', 180.00, 100.00, 350.00, 67),
('Tech Services', 'IT Support', 'Computer Repair', 'general', 95.00, 50.00, 180.00, 23),
('Business Services', 'Consulting', 'Business Analysis', 'general', 350.00, 200.00, 600.00, 18);