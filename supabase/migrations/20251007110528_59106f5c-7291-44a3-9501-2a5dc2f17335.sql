-- Allow public read access to services_unified table
CREATE POLICY "Allow public read access to services"
ON public.services_unified
FOR SELECT
TO public
USING (true);