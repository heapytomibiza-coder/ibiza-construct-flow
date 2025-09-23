-- Phase 1: Database Schema Alignment
-- Add missing tables from playbook while keeping existing frontend compatibility

-- Create offers table for professional applications/bids
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  tasker_id UUID NOT NULL, -- maps to professional in frontend
  message TEXT,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL DEFAULT 'fixed' CHECK (type IN ('fixed', 'hourly')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'declined', 'withdrawn', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contracts table for accepted offers
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  tasker_id UUID NOT NULL,
  client_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'fixed' CHECK (type IN ('fixed', 'hourly')),
  agreed_amount NUMERIC NOT NULL,
  escrow_status TEXT NOT NULL DEFAULT 'none' CHECK (escrow_status IN ('none', 'funded', 'released', 'refunded')),
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID,
  contract_id UUID,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'file')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_events table for system events
CREATE TABLE public.admin_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services_micro table to match ServiceMicro contract
CREATE TABLE public.services_micro (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  micro TEXT NOT NULL,
  questions_micro JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions_logistics JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table to match Job contract (maps to bookings in current system)
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'invited', 'offered', 'assigned', 'in_progress', 'complete_pending', 'complete', 'disputed', 'cancelled')),
  client_id UUID NOT NULL,
  micro_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  budget_type TEXT NOT NULL DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly')),
  budget_value NUMERIC,
  location JSONB, -- {lat, lng, address}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_micro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offers
CREATE POLICY "Taskers can create offers" ON public.offers
FOR INSERT WITH CHECK (auth.uid() = tasker_id);

CREATE POLICY "Users can view offers for their jobs" ON public.offers
FOR SELECT USING (
  auth.uid() = tasker_id OR 
  auth.uid() IN (SELECT client_id FROM jobs WHERE jobs.id = offers.job_id)
);

CREATE POLICY "Users can update their offers" ON public.offers
FOR UPDATE USING (auth.uid() = tasker_id);

-- RLS Policies for contracts
CREATE POLICY "Users can view their contracts" ON public.contracts
FOR SELECT USING (auth.uid() = client_id OR auth.uid() = tasker_id);

CREATE POLICY "Users can update their contracts" ON public.contracts
FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = tasker_id);

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for jobs
CREATE POLICY "Clients can create jobs" ON public.jobs
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can view relevant jobs" ON public.jobs
FOR SELECT USING (
  auth.uid() = client_id OR 
  status = 'open' -- open jobs visible to all authenticated users
);

CREATE POLICY "Clients can update their jobs" ON public.jobs
FOR UPDATE USING (auth.uid() = client_id);

-- RLS Policies for services_micro (public read)
CREATE POLICY "Services micro are publicly readable" ON public.services_micro
FOR SELECT USING (true);

-- RLS Policies for admin_events (admin only)
CREATE POLICY "Admins can manage events" ON public.admin_events
FOR ALL USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  )
);

-- Add update triggers
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_micro_updated_at
  BEFORE UPDATE ON public.services_micro
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample services_micro data to match existing categories
INSERT INTO public.services_micro (category, subcategory, micro, questions_micro, questions_logistics) VALUES
('Home Maintenance', 'Plumbing', 'Leak Repair', 
 '[{"id": "leak_type", "label": "What type of leak?", "type": "select", "required": true, "options": [{"value": "faucet", "label": "Faucet"}, {"value": "pipe", "label": "Pipe"}, {"value": "toilet", "label": "Toilet"}]}]',
 '[{"id": "access", "label": "Is the leak easily accessible?", "type": "boolean", "required": true}, {"id": "tools", "label": "Do you have basic tools available?", "type": "boolean", "required": false}]'
),
('Home Maintenance', 'Electrical', 'Outlet Installation',
 '[{"id": "outlet_type", "label": "What type of outlet?", "type": "select", "required": true, "options": [{"value": "standard", "label": "Standard 110V"}, {"value": "gfci", "label": "GFCI"}, {"value": "usb", "label": "USB Outlet"}]}]',
 '[{"id": "location", "label": "Where is the installation needed?", "type": "text", "required": true}, {"id": "existing_wiring", "label": "Is there existing wiring?", "type": "boolean", "required": true}]'
),
('Cleaning Services', 'Deep Cleaning', 'Move-in/Move-out Cleaning',
 '[{"id": "property_size", "label": "Property size", "type": "select", "required": true, "options": [{"value": "studio", "label": "Studio"}, {"value": "1br", "label": "1 Bedroom"}, {"value": "2br", "label": "2+ Bedrooms"}]}]',
 '[{"id": "timeline", "label": "When do you need this completed?", "type": "date", "required": true}, {"id": "supplies", "label": "Should we bring cleaning supplies?", "type": "boolean", "required": true}]'
);