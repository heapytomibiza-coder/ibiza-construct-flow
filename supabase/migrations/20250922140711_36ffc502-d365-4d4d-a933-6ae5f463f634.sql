-- Create service_options table for customizable service items
CREATE TABLE public.service_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL,
  category TEXT NOT NULL, -- e.g., 'items', 'room_type', 'size'
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_unit DECIMAL(10,2),
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_addons table for optional extras
CREATE TABLE public.service_addons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create professional_deals table for custom pricing
CREATE TABLE public.professional_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  service_id UUID NOT NULL,
  deal_type TEXT NOT NULL DEFAULT 'package', -- 'package', 'hourly', 'custom'
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_hours INTEGER,
  includes JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_deals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service_options
CREATE POLICY "Service options are publicly readable" 
ON public.service_options 
FOR SELECT 
USING (true);

-- Create RLS policies for service_addons
CREATE POLICY "Service addons are publicly readable" 
ON public.service_addons 
FOR SELECT 
USING (true);

-- Create RLS policies for professional_deals
CREATE POLICY "Professional deals are publicly readable" 
ON public.professional_deals 
FOR SELECT 
USING (true);

CREATE POLICY "Professionals can manage their own deals" 
ON public.professional_deals 
FOR ALL 
USING (auth.uid() = professional_id);

-- Add triggers for updated_at
CREATE TRIGGER update_service_options_updated_at
BEFORE UPDATE ON public.service_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professional_deals_updated_at
BEFORE UPDATE ON public.professional_deals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample service options for Furniture Assembly
INSERT INTO public.service_options (service_id, category, name, description, base_price, price_per_unit, min_quantity, max_quantity, is_required, display_order)
SELECT 
  s.id,
  'furniture_type',
  unnest(ARRAY['IKEA Furniture', 'Bedroom Furniture', 'Office Furniture', 'Living Room Furniture', 'Kitchen Furniture']),
  unnest(ARRAY['Beds, wardrobes, and dressers', 'Beds, nightstands, and dressers', 'Desks, chairs, and filing cabinets', 'Sofas, tables, and entertainment centers', 'Cabinets and pantry units']),
  unnest(ARRAY[35.00, 45.00, 40.00, 50.00, 55.00]),
  unnest(ARRAY[35.00, 45.00, 40.00, 50.00, 55.00]),
  1, 10, true,
  unnest(ARRAY[1, 2, 3, 4, 5])
FROM services s 
WHERE s.micro = 'Furniture Assembly'
LIMIT 1;

-- Insert sample addons for Furniture Assembly
INSERT INTO public.service_addons (service_id, name, description, price, is_popular)
SELECT 
  s.id,
  unnest(ARRAY['Same Day Service', 'Weekend Service', 'Cleanup Service', 'Wall Mounting']),
  unnest(ARRAY['Get your furniture assembled today', 'Weekend and evening availability', 'Clean up packaging and dispose of boxes', 'Mount TVs, shelves, and artwork']),
  unnest(ARRAY[15.00, 10.00, 20.00, 25.00]),
  unnest(ARRAY[true, false, true, false])
FROM services s 
WHERE s.micro = 'Furniture Assembly'
LIMIT 1;