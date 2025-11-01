-- Fix infinite recursion in document sharing RLS policies
-- Security Issue: Circular dependency between shared_documents and document_collaborators

-- Create security definer function to break RLS recursion
CREATE OR REPLACE FUNCTION public.can_access_document(doc_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM document_collaborators
    WHERE document_id = doc_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM shared_documents
    WHERE id = doc_id AND created_by = auth.uid()
  )
$$;

-- Drop existing recursive policies
DROP POLICY IF EXISTS "Users can view documents they're collaborators on" ON public.shared_documents;
DROP POLICY IF EXISTS "Users can view collaborators on their documents" ON public.document_collaborators;

-- Create new policies using security definer function
CREATE POLICY "Users can view accessible documents"
ON public.shared_documents
FOR SELECT
USING (can_access_document(id));

CREATE POLICY "Users can view collaborators on accessible documents"
ON public.document_collaborators
FOR SELECT
USING (can_access_document(document_id));