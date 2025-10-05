-- Add foreign key columns to link reviews to specific work units
ALTER TABLE professional_reviews
  ADD COLUMN job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  ADD COLUMN contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL,
  ADD COLUMN milestone_id uuid REFERENCES escrow_milestones(id) ON DELETE CASCADE;

-- Ensure one review per client per milestone (business rule enforcement)
CREATE UNIQUE INDEX IF NOT EXISTS ux_reviews_client_milestone
  ON professional_reviews (client_id, milestone_id)
  WHERE milestone_id IS NOT NULL;

-- Performance: lookups by milestone/job
CREATE INDEX IF NOT EXISTS ix_reviews_milestone ON professional_reviews (milestone_id);
CREATE INDEX IF NOT EXISTS ix_reviews_job ON professional_reviews (job_id);

-- Admin override audit table
CREATE TABLE IF NOT EXISTS escrow_release_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid REFERENCES escrow_milestones(id) ON DELETE CASCADE NOT NULL,
  admin_id uuid REFERENCES profiles(id) NOT NULL,
  reason text NOT NULL,
  released_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS for override audit
ALTER TABLE escrow_release_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage release overrides"
  ON escrow_release_overrides
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));