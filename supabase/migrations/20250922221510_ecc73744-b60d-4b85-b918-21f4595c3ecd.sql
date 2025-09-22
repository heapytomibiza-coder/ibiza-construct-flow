-- Phase 1: Database Schema Alignment
-- Update existing tables and add missing tables per integration playbook

-- First, let's add missing status enums
CREATE TYPE job_status AS ENUM ('open', 'invited', 'offered', 'assigned', 'in_progress', 'complete_pending', 'complete', 'disputed', 'cancelled');
CREATE TYPE offer_status AS ENUM ('sent', 'accepted', 'declined', 'withdrawn', 'expired');
CREATE TYPE escrow_status AS ENUM ('none', 'funded', 'released', 'refunded');
CREATE TYPE budget_type AS ENUM ('fixed', 'hourly');

-- Update profiles table to match UserSession contract
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0;

-- Create services_micro table (enhanced version of services)
CREATE TABLE IF NOT EXISTS public.services_micro (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  micro TEXT NOT NULL,
  questions_micro JSONB DEFAULT '[]'::jsonb,
  questions_logistics JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table (enhanced version of bookings)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  micro_id UUID REFERENCES public.services_micro(id),
  title TEXT NOT NULL,
  description TEXT,
  answers JSONB DEFAULT '{}'::jsonb,
  budget_type budget_type DEFAULT 'fixed',
  budget_value NUMERIC,
  location JSONB,
  status job_status DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offers table
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id),
  tasker_id UUID NOT NULL,
  message TEXT,
  amount NUMERIC NOT NULL,
  type budget_type NOT NULL,
  status offer_status DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id),
  client_id UUID NOT NULL,
  tasker_id UUID NOT NULL,
  type budget_type NOT NULL,
  agreed_amount NUMERIC NOT NULL,
  escrow_status escrow_status DEFAULT 'none',
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create files table
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id),
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_events table for audit trail
CREATE TABLE public.admin_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.services_micro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies per playbook specifications

-- services_micro: publicly readable
CREATE POLICY "Services micro are publicly readable" 
ON public.services_micro FOR SELECT USING (true);

-- jobs: client can R/W own; invited taskers R; admin R/W
CREATE POLICY "Clients can manage their own jobs" 
ON public.jobs FOR ALL USING (auth.uid() = client_id);

CREATE POLICY "Taskers can view jobs they're invited to" 
ON public.jobs FOR SELECT USING (
  auth.uid() IN (
    SELECT tasker_id FROM public.offers WHERE job_id = jobs.id
  )
);

-- offers: tasker can R/W own; client R on job's offers; admin R/W
CREATE POLICY "Taskers can manage their own offers" 
ON public.offers FOR ALL USING (auth.uid() = tasker_id);

CREATE POLICY "Clients can view offers on their jobs" 
ON public.offers FOR SELECT USING (
  auth.uid() IN (
    SELECT client_id FROM public.jobs WHERE id = offers.job_id
  )
);

-- contracts: client/tasker can read; updates restricted
CREATE POLICY "Contract parties can view contracts" 
ON public.contracts FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = tasker_id
);

CREATE POLICY "Contract parties can update contracts" 
ON public.contracts FOR UPDATE USING (
  auth.uid() = client_id OR auth.uid() = tasker_id
);

-- messages: thread participants can R/W
CREATE POLICY "Thread participants can manage messages" 
ON public.messages FOR ALL USING (
  auth.uid() = sender_id OR 
  auth.uid() IN (
    SELECT client_id FROM public.jobs WHERE id::text = thread_id OR
    SELECT tasker_id FROM public.contracts WHERE job_id::text = thread_id
  )
);

-- files: job participants can R/W
CREATE POLICY "Job participants can manage files" 
ON public.files FOR ALL USING (
  auth.uid() IN (
    SELECT client_id FROM public.jobs WHERE id = files.job_id
    UNION
    SELECT tasker_id FROM public.contracts WHERE job_id = files.job_id
  )
);

-- admin_events: admin only
CREATE POLICY "Admin can manage audit events" 
ON public.admin_events FOR ALL USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE roles ? 'admin'
  )
);

-- Add updated_at triggers
CREATE TRIGGER update_services_micro_updated_at
  BEFORE UPDATE ON public.services_micro
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();