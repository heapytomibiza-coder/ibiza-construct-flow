-- ============================================================================
-- Professional Discovery Seed: 8 diverse professionals + service redistribution
-- Creates a mix of business and personal profiles with realistic data
-- ============================================================================

DO $$
DECLARE
  -- Professional 1: Miguel Torres (Personal - Plumbing)
  v_miguel_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  
  -- Professional 2: Ibiza Construction Group (Business)
  v_construction_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
  
  -- Professional 3: Sofia Martínez (Personal - Cleaning)
  v_sofia_id uuid := '33333333-3333-3333-3333-333333333333'::uuid;
  
  -- Professional 4: GreenScape Ibiza (Business - Landscaping)
  v_greenscape_id uuid := '44444444-4444-4444-4444-444444444444'::uuid;
  
  -- Professional 5: Carlos Ruiz (Personal - Electrical)
  v_carlos_id uuid := '55555555-5555-5555-5555-555555555555'::uuid;
  
  -- Professional 6: Antonio López (Personal - Handyman)
  v_antonio_id uuid := '66666666-6666-6666-6666-666666666666'::uuid;
  
  -- Professional 7: Perfect Home Services (Business)
  v_perfect_id uuid := '77777777-7777-7777-7777-777777777777'::uuid;
  
  -- Professional 8: Elena Sánchez (Personal - Painting)
  v_elena_id uuid := '88888888-8888-8888-8888-888888888888'::uuid;

BEGIN
  -- ============================================================================
  -- STEP 1: Create auth.users entries (if not exists)
  -- ============================================================================
  
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
  VALUES
    (v_miguel_id, 'miguel.torres@example.com', crypt('password123', gen_salt('bf')), now(), 
     '{"full_name": "Miguel Torres"}'::jsonb, now() - interval '2 years', now()),
    (v_construction_id, 'info@ibizaconstruction.com', crypt('password123', gen_salt('bf')), now(),
     '{"full_name": "Ibiza Construction Group"}'::jsonb, now() - interval '5 years', now()),
    (v_sofia_id, 'sofia.martinez@example.com', crypt('password123', gen_salt('bf')), now(),
     '{"full_name": "Sofia Martínez"}'::jsonb, now() - interval '3 years', now()),
    (v_greenscape_id, 'contact@greenscapeibiza.com', crypt('password123', gen_salt('bf')), now(),
     '{"full_name": "GreenScape Ibiza"}'::jsonb, now() - interval '4 years', now()),
    (v_carlos_id, 'carlos.ruiz@example.com', crypt('password123', gen_salt('bf')), now(),
     '{"full_name": "Carlos Ruiz"}'::jsonb, now() - interval '8 years', now()),
    (v_antonio_id, 'antonio.lopez@example.com', crypt('password123', gen_salt('bf')), now(),
     '{"full_name": "Antonio López"}'::jsonb, now() - interval '1 year', now()),
    (v_perfect_id, 'hello@perfecthome.com', crypt('password123', gen_salt('bf')), now(),
     '{"full_name": "Perfect Home Services"}'::jsonb, now() - interval '6 years', now()),
    (v_elena_id, 'elena.sanchez@example.com', crypt('password123', gen_salt('bf')), now(),
     '{"full_name": "Elena Sánchez"}'::jsonb, now() - interval '4 years', now())
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- STEP 2: Create profiles
  -- ============================================================================
  
  INSERT INTO public.profiles (id, full_name, avatar_url, bio, created_at, updated_at)
  VALUES
    (v_miguel_id, 'Miguel Torres', 'https://api.dicebear.com/7.x/avataaars/svg?seed=miguel',
     'Licensed plumber with 15 years experience. Specializing in emergency repairs and bathroom installations.',
     now() - interval '2 years', now()),
    (v_construction_id, 'Ibiza Construction Group', 'https://api.dicebear.com/7.x/initials/svg?seed=ICG',
     'Full-service construction company serving Ibiza since 2005. Licensed, insured, and committed to quality.',
     now() - interval '5 years', now()),
    (v_sofia_id, 'Sofia Martínez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia',
     'Professional cleaner offering reliable home and office cleaning services. Eco-friendly products available.',
     now() - interval '3 years', now()),
    (v_greenscape_id, 'GreenScape Ibiza', 'https://api.dicebear.com/7.x/initials/svg?seed=GS',
     'Award-winning landscaping company specializing in Mediterranean gardens and sustainable outdoor spaces.',
     now() - interval '4 years', now()),
    (v_carlos_id, 'Carlos Ruiz', 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
     'Certified electrician available 24/7 for emergencies. Residential and commercial work.',
     now() - interval '8 years', now()),
    (v_antonio_id, 'Antonio López', 'https://api.dicebear.com/7.x/avataaars/svg?seed=antonio',
     'Jack-of-all-trades handyman. No job too small! Available for quick fixes and small projects.',
     now() - interval '1 year', now()),
    (v_perfect_id, 'Perfect Home Services', 'https://api.dicebear.com/7.x/initials/svg?seed=PHS',
     'One-stop shop for all home maintenance needs. Our team of specialists handles everything from A to Z.',
     now() - interval '6 years', now()),
    (v_elena_id, 'Elena Sánchez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
     'Professional painter with an eye for detail. Interior and exterior painting, decorative finishes.',
     now() - interval '4 years', now())
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio;

  -- ============================================================================
  -- STEP 3: Assign professional roles
  -- ============================================================================
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES
    (v_miguel_id, 'professional'),
    (v_construction_id, 'professional'),
    (v_sofia_id, 'professional'),
    (v_greenscape_id, 'professional'),
    (v_carlos_id, 'professional'),
    (v_antonio_id, 'professional'),
    (v_perfect_id, 'professional'),
    (v_elena_id, 'professional')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- ============================================================================
  -- STEP 4: Create professional profiles
  -- ============================================================================
  
  INSERT INTO public.professional_profiles (
    user_id, business_name, primary_trade, hourly_rate, experience_years, 
    verification_status, is_active, created_at
  )
  VALUES
    (v_miguel_id, NULL, 'Plumbing', 45.00, '15', 'verified', true, now() - interval '2 years'),
    (v_construction_id, 'Ibiza Construction Group S.L.', 'Construction', 65.00, '20', 'verified', true, now() - interval '5 years'),
    (v_sofia_id, NULL, 'Cleaning', 30.00, '8', 'verified', true, now() - interval '3 years'),
    (v_greenscape_id, 'GreenScape Ibiza', 'Landscaping', 55.00, '12', 'verified', true, now() - interval '4 years'),
    (v_carlos_id, NULL, 'Electrical', 50.00, '18', 'verified', true, now() - interval '8 years'),
    (v_antonio_id, NULL, 'Handyman', 35.00, '5', 'pending', true, now() - interval '1 year'),
    (v_perfect_id, 'Perfect Home Services S.L.', 'Home Services', 60.00, '15', 'verified', true, now() - interval '6 years'),
    (v_elena_id, NULL, 'Painting', 40.00, '10', 'verified', true, now() - interval '4 years')
  ON CONFLICT (user_id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    primary_trade = EXCLUDED.primary_trade,
    hourly_rate = EXCLUDED.hourly_rate,
    experience_years = EXCLUDED.experience_years;

  -- ============================================================================
  -- STEP 5: Seed professional stats
  -- ============================================================================
  
  INSERT INTO public.professional_stats (
    professional_id, total_bookings, completed_bookings, total_reviews, 
    average_rating, completion_rate, response_rate, created_at
  )
  VALUES
    (v_miguel_id, 127, 124, 98, 4.9, 97.6, 95.0, now() - interval '2 years'),
    (v_construction_id, 89, 85, 71, 4.8, 95.5, 92.0, now() - interval '5 years'),
    (v_sofia_id, 203, 203, 156, 5.0, 100.0, 98.0, now() - interval '3 years'),
    (v_greenscape_id, 64, 61, 48, 4.7, 95.3, 88.0, now() - interval '4 years'),
    (v_carlos_id, 156, 151, 119, 4.9, 96.8, 97.0, now() - interval '8 years'),
    (v_antonio_id, 78, 72, 54, 4.6, 92.3, 85.0, now() - interval '1 year'),
    (v_perfect_id, 142, 136, 108, 4.8, 95.8, 93.0, now() - interval '6 years'),
    (v_elena_id, 91, 88, 72, 4.9, 96.7, 96.0, now() - interval '4 years')
  ON CONFLICT (professional_id) DO UPDATE SET
    total_bookings = EXCLUDED.total_bookings,
    completed_bookings = EXCLUDED.completed_bookings,
    total_reviews = EXCLUDED.total_reviews,
    average_rating = EXCLUDED.average_rating;

  -- ============================================================================
  -- STEP 6: Redistribute existing services among professionals
  -- ============================================================================
  
  -- Get existing service IDs and redistribute them
  -- This updates the professional_id for existing services
  
  -- Miguel Torres gets plumbing-related services (3 services)
  WITH miguel_services AS (
    SELECT id FROM public.professional_service_items 
    WHERE name ILIKE '%plumb%' OR name ILIKE '%leak%' OR name ILIKE '%drain%'
    LIMIT 3
  )
  UPDATE public.professional_service_items
  SET professional_id = v_miguel_id
  WHERE id IN (SELECT id FROM miguel_services);

  -- Sofia Martínez gets cleaning services (2 services)
  WITH sofia_services AS (
    SELECT id FROM public.professional_service_items 
    WHERE name ILIKE '%clean%'
    LIMIT 2
  )
  UPDATE public.professional_service_items
  SET professional_id = v_sofia_id
  WHERE id IN (SELECT id FROM sofia_services);

  -- GreenScape gets landscaping services (2 services)
  WITH greenscape_services AS (
    SELECT id FROM public.professional_service_items 
    WHERE name ILIKE '%garden%' OR name ILIKE '%landscape%' OR name ILIKE '%lawn%'
    LIMIT 2
  )
  UPDATE public.professional_service_items
  SET professional_id = v_greenscape_id
  WHERE id IN (SELECT id FROM greenscape_services);

  -- Carlos gets electrical services (2 services)
  WITH carlos_services AS (
    SELECT id FROM public.professional_service_items 
    WHERE name ILIKE '%electric%' OR name ILIKE '%wiring%'
    LIMIT 2
  )
  UPDATE public.professional_service_items
  SET professional_id = v_carlos_id
  WHERE id IN (SELECT id FROM carlos_services);

  -- Ibiza Construction gets construction services (2 services)
  WITH construction_services AS (
    SELECT id FROM public.professional_service_items 
    WHERE name ILIKE '%construction%' OR name ILIKE '%renovation%' OR name ILIKE '%building%'
    LIMIT 2
  )
  UPDATE public.professional_service_items
  SET professional_id = v_construction_id
  WHERE id IN (SELECT id FROM construction_services);

  -- Perfect Home Services gets general maintenance (2 services)
  WITH perfect_services AS (
    SELECT id FROM public.professional_service_items 
    WHERE name ILIKE '%maintenance%' OR name ILIKE '%repair%' OR name ILIKE '%hvac%'
    LIMIT 2
  )
  UPDATE public.professional_service_items
  SET professional_id = v_perfect_id
  WHERE id IN (SELECT id FROM perfect_services);

  -- Antonio gets handyman service (1 service)
  WITH antonio_services AS (
    SELECT id FROM public.professional_service_items 
    WHERE name ILIKE '%handyman%' OR name ILIKE '%assembly%'
    LIMIT 1
  )
  UPDATE public.professional_service_items
  SET professional_id = v_antonio_id
  WHERE id IN (SELECT id FROM antonio_services);

  -- Elena gets painting service (1 service)
  WITH elena_services AS (
    SELECT id FROM public.professional_service_items 
    WHERE name ILIKE '%paint%'
    LIMIT 1
  )
  UPDATE public.professional_service_items
  SET professional_id = v_elena_id
  WHERE id IN (SELECT id FROM elena_services);

  RAISE NOTICE 'Seed complete. Created 8 professionals and redistributed services.';
  RAISE NOTICE 'Miguel Torres: %', v_miguel_id;
  RAISE NOTICE 'Ibiza Construction: %', v_construction_id;
  RAISE NOTICE 'Sofia Martínez: %', v_sofia_id;
  RAISE NOTICE 'GreenScape: %', v_greenscape_id;
  RAISE NOTICE 'Carlos Ruiz: %', v_carlos_id;
  RAISE NOTICE 'Antonio López: %', v_antonio_id;
  RAISE NOTICE 'Perfect Home: %', v_perfect_id;
  RAISE NOTICE 'Elena Sánchez: %', v_elena_id;
END $$;
