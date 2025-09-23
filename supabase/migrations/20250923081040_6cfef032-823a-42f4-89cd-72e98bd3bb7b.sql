-- Create documents table for professional verification
CREATE TABLE public.professional_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('insurance', 'business_license', 'tax_certificate', 'certification', 'portfolio')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired')),
  verification_notes TEXT,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.professional_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for document access
CREATE POLICY "Professionals can view their own documents" 
ON public.professional_documents 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can insert their own documents" 
ON public.professional_documents 
FOR INSERT 
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their own documents" 
ON public.professional_documents 
FOR UPDATE 
USING (auth.uid() = professional_id);

CREATE POLICY "Admins can view all documents" 
ON public.professional_documents 
FOR ALL 
USING (auth.uid() IN ( SELECT id FROM profiles WHERE roles ? 'admin'));

-- Create storage bucket for professional documents
INSERT INTO storage.buckets (id, name, public) VALUES ('professional-documents', 'professional-documents', false);

-- Create policies for document storage
CREATE POLICY "Professionals can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'professional-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Professionals can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'professional-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'professional-documents' AND auth.uid() IN ( SELECT id FROM profiles WHERE roles ? 'admin'));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_professional_documents_updated_at
BEFORE UPDATE ON public.professional_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();