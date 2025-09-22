-- Enhance profiles table with professional-specific fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS specializations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS experience_years integer,
ADD COLUMN IF NOT EXISTS education text,
ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS portfolio_images jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hourly_rate numeric,
ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'available',
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS professional_status text DEFAULT 'freelancer',
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS profile_image_url text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS years_experience integer,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS total_jobs_completed integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0;

-- Create professional services junction table
CREATE TABLE IF NOT EXISTS public.professional_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
    base_price numeric NOT NULL DEFAULT 0,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(professional_id, service_id)
);

-- Enable RLS on professional_services
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for professional_services
CREATE POLICY "Professional services are publicly readable" 
ON public.professional_services 
FOR SELECT 
USING (true);

CREATE POLICY "Professionals can manage their own services" 
ON public.professional_services 
FOR ALL 
USING (auth.uid() = professional_id);

-- Insert sample professional data
INSERT INTO public.profiles (id, full_name, bio, specializations, experience_years, hourly_rate, location, profile_image_url, phone, rating, total_jobs_completed, total_reviews, roles) 
VALUES 
(gen_random_uuid(), 'Sarah Johnson', 'Experienced electrician with 8+ years in residential and commercial electrical work. Specializing in smart home installations and energy-efficient solutions.', '["electrical", "smart home", "solar panels"]'::jsonb, 8, 75.00, 'Downtown, Metropolitan Area', '/placeholder.svg', '+1 (555) 123-4567', 4.9, 127, 89, '["professional"]'::jsonb),
(gen_random_uuid(), 'Mike Rodriguez', 'Licensed plumber offering comprehensive plumbing services including emergency repairs, bathroom renovations, and water heater installations.', '["plumbing", "bathroom renovation", "emergency repairs"]'::jsonb, 12, 65.00, 'North Side, Metropolitan Area', '/placeholder.svg', '+1 (555) 234-5678', 4.8, 203, 156, '["professional"]'::jsonb),
(gen_random_uuid(), 'Jennifer Chen', 'Professional house cleaner with eco-friendly cleaning solutions. Providing thorough residential cleaning services with attention to detail.', '["house cleaning", "deep cleaning", "eco-friendly"]'::jsonb, 5, 45.00, 'West End, Metropolitan Area', '/placeholder.svg', '+1 (555) 345-6789', 4.7, 89, 67, '["professional"]'::jsonb),
(gen_random_uuid(), 'David Thompson', 'Skilled carpenter and handyman specializing in custom furniture, home repairs, and kitchen renovations with 15+ years experience.', '["carpentry", "furniture", "home repairs", "kitchen renovation"]'::jsonb, 15, 80.00, 'East District, Metropolitan Area', '/placeholder.svg', '+1 (555) 456-7890', 4.9, 178, 142, '["professional"]'::jsonb),
(gen_random_uuid(), 'Lisa Martinez', 'Professional painter with expertise in interior and exterior painting, decorative finishes, and color consultation services.', '["painting", "interior design", "color consultation"]'::jsonb, 7, 55.00, 'South Side, Metropolitan Area', '/placeholder.svg', '+1 (555) 567-8901', 4.6, 95, 71, '["professional"]'::jsonb);

-- Create trigger for updating professional_services updated_at
CREATE TRIGGER update_professional_services_updated_at
    BEFORE UPDATE ON public.professional_services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();