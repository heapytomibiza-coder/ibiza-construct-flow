-- Enhanced Client Dashboard Schema
-- Add client profiles table for user preferences
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_property_id UUID,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add properties table for client property management
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  access_notes TEXT,
  parking_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add quote requests table for professional quote management
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add quotes table for detailed quote information
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_request_id UUID NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  breakdown JSONB DEFAULT '{}'::jsonb,
  inclusions TEXT[],
  exclusions TEXT[],
  warranty_info TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add favorites table for client professional favorites
CREATE TABLE IF NOT EXISTS public.client_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, professional_id)
);

-- Add client files table for job-related file management
CREATE TABLE IF NOT EXISTS public.client_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID,
  client_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  tags TEXT[],
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add change orders table for job modifications
CREATE TABLE IF NOT EXISTS public.change_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  proposer_id UUID NOT NULL,
  delta_amount NUMERIC,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_profiles
CREATE POLICY "Users can manage their own client profile" ON public.client_profiles
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for properties
CREATE POLICY "Users can manage their own properties" ON public.properties
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM public.client_profiles WHERE id = client_id
  ));

-- RLS Policies for quote_requests
CREATE POLICY "Users can view quote requests for their jobs" ON public.quote_requests
  FOR SELECT USING (
    auth.uid() IN (
      SELECT client_id FROM public.jobs WHERE id = job_id
    ) OR 
    auth.uid() = professional_id
  );

CREATE POLICY "Professionals can create quote requests" ON public.quote_requests
  FOR INSERT WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Users can update their own quote requests" ON public.quote_requests
  FOR UPDATE USING (auth.uid() = professional_id OR auth.uid() IN (
    SELECT client_id FROM public.jobs WHERE id = job_id
  ));

-- RLS Policies for quotes
CREATE POLICY "Users can view quotes for their requests" ON public.quotes
  FOR SELECT USING (
    auth.uid() IN (
      SELECT professional_id FROM public.quote_requests WHERE id = quote_request_id
    ) OR
    auth.uid() IN (
      SELECT j.client_id FROM public.jobs j
      JOIN public.quote_requests qr ON j.id = qr.job_id
      WHERE qr.id = quote_request_id
    )
  );

CREATE POLICY "Professionals can manage their own quotes" ON public.quotes
  FOR ALL USING (
    auth.uid() IN (
      SELECT professional_id FROM public.quote_requests WHERE id = quote_request_id
    )
  );

-- RLS Policies for client_favorites
CREATE POLICY "Users can manage their own favorites" ON public.client_favorites
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.client_profiles WHERE id = client_id
    )
  );

-- RLS Policies for client_files
CREATE POLICY "Users can manage files for their jobs" ON public.client_files
  FOR ALL USING (
    auth.uid() = client_id OR
    auth.uid() IN (
      SELECT client_id FROM public.jobs WHERE id = job_id
    )
  );

-- RLS Policies for change_orders
CREATE POLICY "Users can view change orders for their jobs" ON public.change_orders
  FOR SELECT USING (
    auth.uid() = proposer_id OR
    auth.uid() IN (
      SELECT client_id FROM public.jobs WHERE id = job_id
    )
  );

CREATE POLICY "Users can create change orders for jobs they're involved in" ON public.change_orders
  FOR INSERT WITH CHECK (
    auth.uid() = proposer_id AND (
      auth.uid() IN (SELECT client_id FROM public.jobs WHERE id = job_id)
    )
  );

CREATE POLICY "Users can update change orders they proposed" ON public.change_orders
  FOR UPDATE USING (
    auth.uid() = proposer_id OR
    auth.uid() IN (
      SELECT client_id FROM public.jobs WHERE id = job_id
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_client_id ON public.properties(client_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_job_id ON public.quote_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_professional_id ON public.quote_requests(professional_id);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_request_id ON public.quotes(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_client_favorites_client_id ON public.client_favorites(client_id);
CREATE INDEX IF NOT EXISTS idx_client_files_job_id ON public.client_files(job_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_job_id ON public.change_orders(job_id);

-- Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_change_orders_updated_at
  BEFORE UPDATE ON public.change_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();