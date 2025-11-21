-- Add service bookmarks table
CREATE TABLE IF NOT EXISTS service_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES professional_service_items(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, service_id)
);

-- Add RLS policies for bookmarks
ALTER TABLE service_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON service_bookmarks;
CREATE POLICY "Users can view own bookmarks"
  ON service_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON service_bookmarks;
CREATE POLICY "Users can insert own bookmarks"
  ON service_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON service_bookmarks;
CREATE POLICY "Users can delete own bookmarks"
  ON service_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Add service view tracking
CREATE TABLE IF NOT EXISTS service_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES professional_service_items(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE service_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service views are public for reading" ON service_views;
CREATE POLICY "Service views are public for reading"
  ON service_views FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can log service views" ON service_views;
CREATE POLICY "Anyone can log service views"
  ON service_views FOR INSERT
  WITH CHECK (true);

-- Add view counter function
CREATE OR REPLACE FUNCTION get_service_view_count(p_service_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(DISTINCT session_id)::INTEGER
  FROM service_views
  WHERE service_id = p_service_id;
$$ LANGUAGE SQL SECURITY DEFINER;