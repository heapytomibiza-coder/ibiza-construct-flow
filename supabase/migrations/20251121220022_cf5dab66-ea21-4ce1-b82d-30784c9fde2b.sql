-- Enable public viewing of active service items for Discovery page
-- This allows unauthenticated users to browse available services

DROP POLICY IF EXISTS "Public can view active service items" ON public.professional_service_items;

CREATE POLICY "Public can view active service items"
ON public.professional_service_items
FOR SELECT
TO public
USING (is_active = true);