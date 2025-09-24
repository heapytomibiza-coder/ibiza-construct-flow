-- Enhanced Payment and Dispute System Schema

-- Payment Methods Table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'card', -- card, bank_account, etc.
  brand TEXT, -- visa, mastercard, etc.
  last_four TEXT,
  expires_month INTEGER,
  expires_year INTEGER,
  is_default BOOLEAN NOT NULL DEFAULT false,
  billing_address JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoices Table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  job_id UUID,
  contract_id UUID,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  vat_rate NUMERIC DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  payment_method_id UUID,
  split_payment JSONB DEFAULT '{}', -- company vs personal split
  line_items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disputes Table
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_number TEXT NOT NULL UNIQUE,
  job_id UUID NOT NULL,
  contract_id UUID,
  invoice_id UUID,
  created_by UUID NOT NULL,
  disputed_against UUID NOT NULL,
  type TEXT NOT NULL, -- payment, quality, scope, timeline, etc.
  status TEXT NOT NULL DEFAULT 'open', -- open, in_review, escalated, resolved, closed
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  amount_disputed NUMERIC DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resolution_notes TEXT,
  resolution_amount NUMERIC DEFAULT 0,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  escalated_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE, -- 48-72hr resolution target
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dispute Evidence Table
CREATE TABLE public.dispute_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID NOT NULL,
  uploaded_by UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  description TEXT,
  evidence_type TEXT NOT NULL, -- photo, document, communication, invoice, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Escrow Milestones Table (enhanced)
CREATE TABLE public.escrow_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL,
  milestone_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, disputed
  completed_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_milestones ENABLE ROW LEVEL SECURITY;

-- Payment Methods Policies
CREATE POLICY "Users can manage their own payment methods" 
ON public.payment_methods 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Invoices Policies
CREATE POLICY "Users can view their invoices" 
ON public.invoices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage invoices" 
ON public.invoices 
FOR ALL 
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT profiles.id FROM profiles WHERE profiles.roles ? 'admin')
);

-- Disputes Policies
CREATE POLICY "Users can view disputes they're involved in" 
ON public.disputes 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  auth.uid() = disputed_against OR
  auth.uid() IN (SELECT profiles.id FROM profiles WHERE profiles.roles ? 'admin')
);

CREATE POLICY "Users can create disputes" 
ON public.disputes 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update disputes" 
ON public.disputes 
FOR UPDATE 
USING (
  auth.uid() IN (SELECT profiles.id FROM profiles WHERE profiles.roles ? 'admin')
);

-- Dispute Evidence Policies
CREATE POLICY "Users can view evidence for their disputes" 
ON public.dispute_evidence 
FOR SELECT 
USING (
  dispute_id IN (
    SELECT id FROM disputes 
    WHERE created_by = auth.uid() OR disputed_against = auth.uid()
  )
);

CREATE POLICY "Users can upload evidence for their disputes" 
ON public.dispute_evidence 
FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by AND
  dispute_id IN (
    SELECT id FROM disputes 
    WHERE created_by = auth.uid() OR disputed_against = auth.uid()
  )
);

-- Escrow Milestones Policies
CREATE POLICY "Users can view milestones for their contracts" 
ON public.escrow_milestones 
FOR SELECT 
USING (
  contract_id IN (
    SELECT id FROM contracts 
    WHERE client_id = auth.uid() OR tasker_id = auth.uid()
  )
);

-- Add update triggers
CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escrow_milestones_updated_at
BEFORE UPDATE ON public.escrow_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();