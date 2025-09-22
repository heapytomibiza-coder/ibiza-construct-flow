-- Create professional service items table for detailed service catalogs
CREATE TABLE public.professional_service_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  service_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  pricing_type TEXT NOT NULL DEFAULT 'flat_rate', -- 'hourly', 'per_item', 'per_unit', 'flat_rate', 'quote_required'
  unit_type TEXT DEFAULT 'item', -- 'hours', 'items', 'sqm', 'linear_meter', 'rooms', etc.
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER,
  bulk_discount_threshold INTEGER,
  bulk_discount_price NUMERIC,
  category TEXT NOT NULL DEFAULT 'labor', -- 'labor', 'materials', 'additional_services'
  estimated_duration_minutes INTEGER,
  difficulty_level TEXT DEFAULT 'standard', -- 'simple', 'standard', 'complex'
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.professional_service_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Professional service items are publicly readable" 
ON public.professional_service_items 
FOR SELECT 
USING (true);

CREATE POLICY "Professionals can manage their own service items" 
ON public.professional_service_items 
FOR ALL
USING (auth.uid() = professional_id);

-- Create booking requests table (replacing instant bookings)
CREATE TABLE public.booking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID,
  service_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  selected_items JSONB DEFAULT '[]'::jsonb, -- Array of selected service items with quantities
  total_estimated_price NUMERIC DEFAULT 0,
  preferred_dates JSONB DEFAULT '[]'::jsonb, -- Array of preferred date/time slots
  location_details TEXT,
  special_requirements TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'quoted', 'accepted', 'declined', 'completed'
  professional_quote NUMERIC,
  professional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for booking requests
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for booking requests
CREATE POLICY "Users can view their own booking requests" 
ON public.booking_requests 
FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = professional_id);

CREATE POLICY "Clients can create booking requests" 
ON public.booking_requests 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own booking requests" 
ON public.booking_requests 
FOR UPDATE 
USING (auth.uid() = client_id OR auth.uid() = professional_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_professional_service_items_updated_at
BEFORE UPDATE ON public.professional_service_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_requests_updated_at
BEFORE UPDATE ON public.booking_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample professional service items for testing
INSERT INTO public.professional_service_items (professional_id, service_id, name, description, base_price, pricing_type, unit_type, category, estimated_duration_minutes) 
SELECT 
  gen_random_uuid(), -- This would be a real professional_id in production
  s.id,
  CASE s.micro
    WHEN 'plumbing_repairs' THEN 'Fix Leaky Tap'
    WHEN 'electrical_installation' THEN 'Install Light Fixture'
    WHEN 'cleaning_services' THEN 'Deep Clean Room'
    WHEN 'furniture_assembly' THEN 'Assemble IKEA Furniture'
    ELSE 'Standard Service'
  END,
  CASE s.micro
    WHEN 'plumbing_repairs' THEN 'Professional repair of dripping taps and faucets'
    WHEN 'electrical_installation' THEN 'Safe installation of ceiling or wall light fixtures'
    WHEN 'cleaning_services' THEN 'Thorough cleaning including all surfaces and corners'
    WHEN 'furniture_assembly' THEN 'Expert assembly of flat-pack furniture with tools provided'
    ELSE 'Professional service delivery'
  END,
  CASE s.micro
    WHEN 'plumbing_repairs' THEN 45
    WHEN 'electrical_installation' THEN 75
    WHEN 'cleaning_services' THEN 25
    WHEN 'furniture_assembly' THEN 35
    ELSE 50
  END,
  CASE s.micro
    WHEN 'cleaning_services' THEN 'per_unit'
    ELSE 'per_item'
  END,
  CASE s.micro
    WHEN 'cleaning_services' THEN 'rooms'
    ELSE 'items'
  END,
  'labor',
  CASE s.micro
    WHEN 'plumbing_repairs' THEN 60
    WHEN 'electrical_installation' THEN 90
    WHEN 'cleaning_services' THEN 45
    WHEN 'furniture_assembly' THEN 120
    ELSE 60
  END
FROM public.services s
LIMIT 10;