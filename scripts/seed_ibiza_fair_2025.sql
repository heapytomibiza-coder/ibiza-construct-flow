-- ============================================================================
-- Ibiza Home Meeting 2025: Complete Fair Showcase Seed Data
-- Creates 21 professional profiles (one per sector) with full data
-- ============================================================================

DO $$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
  v_pro_profile_id uuid;
  
  -- Sector slugs array
  v_sectors text[] := ARRAY[
    'construccion-reformas',
    'arquitectura',
    'materiales',
    'metalurgia',
    'proveedores',
    'aluminio-ventanas',
    'maquinaria-industrial',
    'rehabilitacion-fachadas',
    'puertas-ventanas',
    'interiorismo-decoracion',
    'cocinas',
    'equipamiento-integral',
    'domotica-sonorizacion',
    'electricidad-diseno',
    'maderas-ebanisteria',
    'piscinas-spa-wellness',
    'energias-sostenibilidad',
    'seguridad',
    'real-estate',
    'servicios',
    'marketing'
  ];
  
  v_sector text;
  v_company_name text;
  v_hero_line text;
  v_description text;
  v_services jsonb;
  v_specializations jsonb;
  v_ideal_clients text;
  v_usp jsonb;
  v_email text;
  v_years integer;
  v_team_size integer;
  v_min_value numeric;
  v_max_value numeric;
BEGIN
  
  FOREACH v_sector IN ARRAY v_sectors
  LOOP
    -- Generate unique IDs
    v_user_id := gen_random_uuid();
    v_profile_id := gen_random_uuid();
    v_pro_profile_id := gen_random_uuid();
    
    -- Set data based on sector
    CASE v_sector
      WHEN 'construccion-reformas' THEN
        v_company_name := 'Construcciones Ibiza Demo';
        v_hero_line := 'Equipos de construcción y reforma para villas, fincas y locales en toda Ibiza.';
        v_description := 'Empresa con base en Ibiza especializada en obra nueva, reformas integrales y gestión completa de proyectos. Coordinamos todos los gremios, cuidamos los detalles de acabado y hablamos el idioma de promotores, arquitectos y clientes particulares.';
        v_services := '["Reforma integral de viviendas","Obra nueva y ampliaciones","Estructuras, forjados y cubiertas","Baños y cocinas completos","Coordinación de gremios y licencias","Mantenimiento y pequeñas actuaciones"]'::jsonb;
        v_specializations := '["Villas de lujo","Hoteles y alojamientos turísticos","Locales de restauración"]'::jsonb;
        v_ideal_clients := 'Promotores, arquitectos, propietarios de villas, hoteles y restaurantes que buscan un equipo serio, puntual y acostumbrado a trabajar en Ibiza.';
        v_usp := '["Un solo interlocutor para toda la obra","Equipo estable en la isla todo el año","Presupuestos claros y seguimiento por hitos"]'::jsonb;
        v_years := 10;
        v_team_size := 18;
        v_min_value := 5000;
        v_max_value := 500000;
        
      WHEN 'arquitectura' THEN
        v_company_name := 'Estudio Arquitectura Ibiza Demo';
        v_hero_line := 'Estudio de arquitectura especializado en villas contemporáneas y proyectos llave en mano en Ibiza y Formentera.';
        v_description := 'Desarrollamos proyectos de arquitectura desde el concepto hasta la dirección de obra, coordinando ingenierías y tramitación de licencias. Combinamos diseño contemporáneo, normativa local y soluciones sostenibles adaptadas al clima de la isla.';
        v_services := '["Proyectos básicos y de ejecución","Direcciones de obra y coordinación de seguridad","Legalizaciones y proyectos de actividad","Reformas integrales de vivienda y hotel","Certificados energéticos e ITE"]'::jsonb;
        v_specializations := '["Villas de alto nivel","Reforma de hoteles y turismo","Ampliaciones y cambios de uso"]'::jsonb;
        v_ideal_clients := 'Promotores, inversores y propietarios que buscan un equipo técnico que conozca la normativa de Ibiza y sepa coordinar obra y constructoras.';
        v_usp := '["Experiencia con planeamiento y normativa local","Acompañamiento completo hasta fin de obra","Integración de soluciones bioclimáticas"]'::jsonb;
        v_years := 12;
        v_team_size := 6;
        v_min_value := 15000;
        v_max_value := 200000;
        
      WHEN 'materiales' THEN
        v_company_name := 'Materiales Construcción Ibiza Demo';
        v_hero_line := 'Proveedores de materiales de alto rendimiento para obra nueva y reforma.';
        v_description := 'Distribuimos materiales de construcción de primeras marcas con entrega en obra y asesoría técnica. Especialistas en soluciones para clima mediterráneo y proyectos de alta gama en Ibiza.';
        v_services := '["Piedra natural y porcelánico","Superficies técnicas","Revestimientos de fachada","Suelos interiores/exteriores","Soluciones para cocinas y baños","Asesoría técnica de producto"]'::jsonb;
        v_specializations := '["Materiales premium","Grandes volúmenes para promotoras","Entrega rápida en temporada"]'::jsonb;
        v_ideal_clients := 'Constructoras, arquitectos, promotores y particulares que buscan calidad, servicio y conocimiento técnico.';
        v_usp := '["Stock permanente en Ibiza","Entrega en 24-48h","Asesoramiento técnico gratuito"]'::jsonb;
        v_years := 15;
        v_team_size := 12;
        v_min_value := 500;
        v_max_value := 100000;
        
      WHEN 'piscinas-spa-wellness' THEN
        v_company_name := 'Piscinas Ibiza Wellness Demo';
        v_hero_line := 'Construcción, reforma y mantenimiento de piscinas, spas y zonas wellness en villas, hoteles y clubes de Ibiza.';
        v_description := 'Creamos y mantenemos espacios de agua y bienestar adaptados al uso intensivo de la isla. Desde piscinas de obra nueva hasta jacuzzis, spas y sistemas de filtración de bajo consumo.';
        v_services := '["Construcción de piscinas de obra nueva","Revestimiento y coronación de piscinas existentes","Instalación de jacuzzis y spas","Sistemas de cloración salina y dosificación automática","Mantenimiento periódico y puesta a punto de temporada"]'::jsonb;
        v_specializations := '["Piscinas para alquiler turístico","Hoteles y beach clubs","Reformas rápidas fuera de temporada"]'::jsonb;
        v_ideal_clients := 'Propietarios de villas, gestores de propiedades, hoteles y promotores que necesitan una empresa que responda rápido y cuide la calidad del agua todo el año.';
        v_usp := '["Servicio integral: obra, instalaciones y mantenimiento","Asesoría en eficiencia energética de bombas e iluminación","Plan de mantenimiento adaptado a alquiler turístico"]'::jsonb;
        v_years := 8;
        v_team_size := 10;
        v_min_value := 3000;
        v_max_value := 150000;
        
      WHEN 'interiorismo-decoracion' THEN
        v_company_name := 'Interiorismo Ibiza Demo';
        v_hero_line := 'Estudios de interiorismo y decoración con enfoque residencial, hotelero y comercial.';
        v_description := 'Diseñamos espacios interiores que reflejan el estilo mediterráneo contemporáneo de Ibiza. Trabajamos proyectos completos o asesoría puntual en decoración y styling.';
        v_services := '["Diseño de interiores","Selección de mobiliario","Styling y decoración","Proyectos llave en mano","Decoración floral para eventos"]'::jsonb;
        v_specializations := '["Villas de lujo","Hoteles boutique","Restaurantes y locales"]'::jsonb;
        v_ideal_clients := 'Propietarios de villas, hoteleros y empresarios que buscan crear espacios únicos y funcionales.';
        v_usp := '["Estilo mediterráneo contemporáneo","Red de proveedores exclusivos","Entrega en plazos ajustados"]'::jsonb;
        v_years := 7;
        v_team_size := 5;
        v_min_value := 8000;
        v_max_value := 200000;
        
      WHEN 'energias-sostenibilidad' THEN
        v_company_name := 'Energía Solar Ibiza Demo';
        v_hero_line := 'Soluciones de energía solar, eficiencia y sostenibilidad para viviendas y negocios.';
        v_description := 'Instalamos sistemas de energía renovable y eficiencia energética adaptados al clima de Ibiza. Especialistas en autoconsumo solar y auditorías energéticas.';
        v_services := '["Placas solares","Baterías y autoconsumo","Auditorías energéticas","Sistemas de agua caliente eficiente","Instalación y mantenimiento"]'::jsonb;
        v_specializations := '["Autoconsumo para villas","Hoteles y negocios","Baterías y almacenamiento"]'::jsonb;
        v_ideal_clients := 'Propietarios de viviendas, hoteles y negocios que quieren reducir costes energéticos y ser más sostenibles.';
        v_usp := '["Financiación disponible","Tramitación de subvenciones","Mantenimiento 5 años incluido"]'::jsonb;
        v_years := 6;
        v_team_size := 8;
        v_min_value := 5000;
        v_max_value := 80000;
        
      ELSE
        -- Default values for other sectors
        v_company_name := 'Empresa ' || initcap(replace(v_sector, '-', ' ')) || ' Demo';
        v_hero_line := 'Servicios profesionales de ' || replace(v_sector, '-', ' ') || ' en Ibiza.';
        v_description := 'Empresa especializada en ' || replace(v_sector, '-', ' ') || ' con años de experiencia en Ibiza y Formentera.';
        v_services := '["Servicio 1","Servicio 2","Servicio 3","Servicio 4","Servicio 5"]'::jsonb;
        v_specializations := '["Especialidad 1","Especialidad 2","Especialidad 3"]'::jsonb;
        v_ideal_clients := 'Clientes que buscan servicios de calidad en ' || replace(v_sector, '-', ' ') || '.';
        v_usp := '["Experiencia local","Calidad garantizada","Servicio personalizado"]'::jsonb;
        v_years := 8;
        v_team_size := 7;
        v_min_value := 1000;
        v_max_value := 50000;
    END CASE;
    
    v_email := 'demo+' || v_sector || '@ibizafair.com';
    
    -- 1. Insert auth user
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      v_user_id,
      v_email,
      crypt('IbizaFair2025!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_company_name),
      false,
      'authenticated'
    );
    
    -- 2. Insert profile
    INSERT INTO public.profiles (
      id,
      full_name,
      avatar_url,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      v_company_name,
      'https://api.dicebear.com/7.x/initials/svg?seed=' || v_company_name,
      now(),
      now()
    );
    
    -- 3. Insert user_role
    INSERT INTO public.user_roles (
      user_id,
      role
    ) VALUES (
      v_user_id,
      'professional'::app_role
    );
    
    -- 4. Insert professional_profile
    INSERT INTO public.professional_profiles (
      id,
      user_id,
      business_name,
      bio,
      hourly_rate,
      years_experience,
      location,
      availability_status,
      is_verified,
      created_at,
      updated_at,
      -- New fair fields
      subsector_tags,
      ideal_clients,
      unique_selling_points,
      team_size,
      min_project_value,
      max_project_value,
      typical_project_duration,
      seasonality,
      emergency_service,
      max_projects_in_parallel,
      sustainability_practices,
      social_links,
      short_slug,
      company_type,
      whatsapp,
      address,
      featured_at_events,
      is_demo_profile
    ) VALUES (
      v_pro_profile_id,
      v_user_id,
      v_company_name,
      v_hero_line || ' ' || v_description,
      75.00 + (random() * 50),
      v_years,
      'Ibiza',
      'available',
      true,
      now(),
      now(),
      -- New fair fields
      v_specializations,
      v_ideal_clients,
      v_usp,
      v_team_size,
      v_min_value,
      v_max_value,
      '2-12 semanas',
      'Todo el año',
      v_sector IN ('piscinas-spa-wellness', 'electricidad-diseno', 'seguridad'),
      v_team_size / 3,
      '["Gestión de residuos certificada","Uso de materiales sostenibles","Eficiencia energética"]'::jsonb,
      jsonb_build_object(
        'instagram', 'https://instagram.com/' || replace(v_sector, '-', ''),
        'facebook', 'https://facebook.com/' || replace(v_sector, '-', '')
      ),
      lower(replace(v_company_name, ' ', '-')),
      'business',
      '+34 6' || lpad(floor(random() * 100000000)::text, 8, '0'),
      'Polígono Industrial, Ibiza',
      '["ibiza-home-meeting-2025"]'::jsonb,
      true
    );
    
    -- 5. Insert professional_stats
    INSERT INTO public.professional_stats (
      professional_id,
      jobs_completed,
      total_earnings,
      average_rating,
      total_reviews,
      response_rate,
      on_time_completion_rate,
      client_satisfaction_rate,
      repeat_client_rate,
      updated_at
    ) VALUES (
      v_pro_profile_id,
      15 + floor(random() * 35)::integer,
      (25000 + (random() * 100000))::numeric,
      4.5 + (random() * 0.5),
      8 + floor(random() * 15)::integer,
      0.92 + (random() * 0.08),
      0.88 + (random() * 0.12),
      0.90 + (random() * 0.10),
      0.35 + (random() * 0.25),
      now()
    );
    
    -- 6. Insert professional_verifications
    INSERT INTO public.professional_verifications (
      professional_id,
      verification_type,
      status,
      verified_at,
      expires_at,
      verified_by
    ) VALUES
      (v_pro_profile_id, 'identity', 'verified', now(), now() + interval '1 year', null),
      (v_pro_profile_id, 'business', 'verified', now(), now() + interval '1 year', null);
    
    -- 7. Insert professional_portfolio items
    INSERT INTO public.professional_portfolio (
      professional_id,
      title,
      description,
      image_url,
      project_date,
      client_testimonial,
      created_at
    ) VALUES
      (v_pro_profile_id, 'Proyecto Villa Cala ' || v_sector, 'Proyecto destacado en ' || v_company_name, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', now() - interval '6 months', 'Excelente trabajo, muy profesionales.', now()),
      (v_pro_profile_id, 'Reforma Hotel ' || v_sector, 'Reforma completa de hotel en Ibiza', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', now() - interval '1 year', 'Cumplieron todos los plazos perfectamente.', now());
    
    -- 8. Insert professional_service_items
    FOR i IN 1..5 LOOP
      INSERT INTO public.professional_service_items (
        professional_id,
        name,
        description,
        base_price,
        price_unit,
        category,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        v_pro_profile_id,
        (v_services->(i-1))::text,
        'Servicio profesional de ' || (v_services->(i-1))::text,
        (1000 + (random() * 5000))::numeric,
        'project',
        v_sector,
        true,
        now(),
        now()
      );
    END LOOP;
    
    -- 9. Insert reviews
    INSERT INTO public.reviews (
      professional_id,
      client_id,
      rating,
      comment,
      created_at
    ) VALUES
      (v_pro_profile_id, (SELECT id FROM profiles WHERE id != v_user_id LIMIT 1), 5, 'Trabajo excelente, muy recomendable. Volveré a contratar sus servicios.', now() - interval '2 months'),
      (v_pro_profile_id, (SELECT id FROM profiles WHERE id != v_user_id OFFSET 1 LIMIT 1), 4, 'Buen servicio y atención profesional. Cumplieron con los plazos.', now() - interval '4 months');
    
    RAISE NOTICE 'Created demo profile for sector: % (%)', v_sector, v_company_name;
    
  END LOOP;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Seed complete! Created 21 professional profiles for Ibiza Home Meeting 2025';
  RAISE NOTICE '====================================';
  
END $$;
