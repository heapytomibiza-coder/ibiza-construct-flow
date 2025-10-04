-- Add foreign key constraint after cleaning orphaned records
ALTER TABLE professional_service_items
ADD CONSTRAINT professional_service_items_professional_id_fkey
FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE;