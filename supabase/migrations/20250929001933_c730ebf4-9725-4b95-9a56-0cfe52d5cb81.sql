-- Enable RLS on service_name_map table and create policy
ALTER TABLE service_name_map ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read the mapping table
CREATE POLICY "Service name mappings are readable by authenticated users"
ON service_name_map
FOR SELECT
TO authenticated
USING (true);