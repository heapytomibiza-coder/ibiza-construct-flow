-- Rating aggregation view
CREATE OR REPLACE VIEW public_profile_ratings AS
SELECT
  reviewee_id AS professional_id,
  COUNT(*) AS reviews_count,
  AVG(rating) AS rating_avg,
  AVG((category_ratings->>'quality')::numeric) FILTER (WHERE category_ratings ? 'quality') as quality_avg,
  AVG((category_ratings->>'reliability')::numeric) FILTER (WHERE category_ratings ? 'reliability') as reliability_avg,
  AVG((category_ratings->>'communication')::numeric) FILTER (WHERE category_ratings ? 'communication') as communication_avg
FROM reviews
GROUP BY reviewee_id;

-- Searchable services view
CREATE OR REPLACE VIEW searchable_services AS
SELECT
  psi.id AS service_item_id,
  psi.name AS service_name,
  psi.description,
  psi.base_price AS price,
  psi.pricing_type,
  psi.category,
  psi.subcategory,
  psi.micro,
  psi.professional_id,
  p.display_name AS professional_name,
  p.location,
  p.avatar_url,
  COALESCE(r.rating_avg, 0) AS rating_avg,
  COALESCE(r.reviews_count, 0) AS reviews_count,
  psi.portfolio_images,
  psi.featured_image
FROM professional_service_items psi
JOIN profiles p ON p.id = psi.professional_id
LEFT JOIN public_profile_ratings r ON r.professional_id = psi.professional_id
WHERE psi.is_active = true;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_rating ON reviews(reviewee_id, rating);
CREATE INDEX IF NOT EXISTS idx_psi_category_price ON professional_service_items(category, base_price) WHERE is_active = true;