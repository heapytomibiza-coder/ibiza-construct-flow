-- ============================================================================
-- Ibiza Home Meeting 2025: Service Catalog for Fair Exhibitors
-- Creates detailed services for each of the 21 sectors
-- ============================================================================

DO $$
DECLARE
  v_sector_profiles RECORD;
  v_service_id uuid;
  v_micro_service_id uuid;
  
  -- Service templates by sector
  v_services jsonb;
BEGIN
  
  -- Loop through each demo profile and create their services
  FOR v_sector_profiles IN 
    SELECT 
      pp.id as profile_id,
      pp.user_id,
      pp.business_name,
      pp.subsector_tags,
      pp.short_slug
    FROM professional_profiles pp
    WHERE pp.is_demo_profile = true
      AND pp.featured_at_events @> '["ibiza-home-meeting-2025"]'::jsonb
  LOOP
    
    -- CONSTRUCCIÓN Y REFORMAS Services
    IF v_sector_profiles.business_name LIKE '%Construcciones%' THEN
      
      -- Service 1: Reforma Integral de Viviendas
      v_service_id := gen_random_uuid();
      INSERT INTO services (
        id,
        name,
        slug,
        category,
        subcategory,
        description,
        long_description,
        base_price,
        price_type,
        duration_estimate,
        is_active,
        featured,
        provider_id,
        images,
        tags,
        service_area,
        requirements
      ) VALUES (
        v_service_id,
        'Reforma Integral de Viviendas',
        'reforma-integral-viviendas-' || v_sector_profiles.short_slug,
        'Construcción y Reformas',
        'Reformas',
        'Reforma completa de viviendas en Ibiza. Gestión integral de todos los gremios, licencias y acabados.',
        E'Realizamos reformas integrales de viviendas en Ibiza con gestión completa del proyecto:\n\n• Demoliciones y trabajos preliminares\n• Nuevas distribuciones y tabiquería\n• Instalaciones eléctricas y fontanería\n• Carpintería interior y exterior\n• Revestimientos y acabados\n• Coordinación de todos los gremios\n• Gestión de licencias municipales\n• Limpieza final y entrega\n\nTrabajamos con materiales de primera calidad adaptados al clima mediterráneo. Presupuestos cerrados y seguimiento por hitos.',
        25000,
        'starting_at',
        '8-12 semanas',
        true,
        true,
        v_sector_profiles.user_id,
        '["https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]'::jsonb,
        '["reforma integral", "construcción", "gestión de obra", "ibiza"]'::jsonb,
        'Ibiza y Formentera',
        '["Proyecto básico o croquis", "Presupuesto previo de materiales", "Confirmación de licencias"]'::jsonb
      );
      
      INSERT INTO professional_service_items (
        professional_id, service_id, name, description, base_price, is_active, category
      ) VALUES (
        v_sector_profiles.profile_id, v_service_id,
        'Reforma Integral de Viviendas',
        'Reforma completa con gestión de todos los gremios',
        25000, true, 'construccion-reformas'
      );
      
      -- Service 2: Obra Nueva y Ampliaciones
      v_service_id := gen_random_uuid();
      INSERT INTO services (
        id, name, slug, category, subcategory, description, long_description,
        base_price, price_type, duration_estimate, is_active, featured, provider_id,
        images, tags, service_area, requirements
      ) VALUES (
        v_service_id,
        'Obra Nueva y Ampliaciones',
        'obra-nueva-ampliaciones-' || v_sector_profiles.short_slug,
        'Construcción y Reformas', 'Obra Nueva',
        'Construcción de obra nueva y ampliaciones en Ibiza. Desde cimentación hasta acabados finales.',
        E'Especialistas en obra nueva y ampliaciones:\n\n• Movimientos de tierra y cimentación\n• Estructura de hormigón y forjados\n• Muros de carga y cerramientos\n• Cubiertas y terrazas\n• Instalaciones completas\n• Acabados interiores y exteriores\n• Piscinas y zonas ajardinadas\n• Certificaciones y licencias\n\nEquipo con experiencia en normativa local de Ibiza. Trabajamos con arquitectos y aparejadores de confianza.',
        120000, 'starting_at', '6-18 meses', true, true, v_sector_profiles.user_id,
        '["https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800"]'::jsonb,
        '["obra nueva", "ampliación", "construcción", "estructura"]'::jsonb,
        'Ibiza', '["Proyecto de ejecución aprobado", "Licencia de obras", "Seguro decenal"]'::jsonb
      );
      
      INSERT INTO professional_service_items (
        professional_id, service_id, name, description, base_price, is_active, category
      ) VALUES (
        v_sector_profiles.profile_id, v_service_id,
        'Obra Nueva y Ampliaciones', 'Construcción desde cimentación hasta entrega',
        120000, true, 'construccion-reformas'
      );
      
      -- Service 3: Baños y Cocinas Completos
      v_service_id := gen_random_uuid();
      INSERT INTO services (
        id, name, slug, category, subcategory, description, long_description,
        base_price, price_type, duration_estimate, is_active, provider_id,
        images, tags, service_area
      ) VALUES (
        v_service_id,
        'Reforma de Baños y Cocinas',
        'reforma-banos-cocinas-' || v_sector_profiles.short_slug,
        'Construcción y Reformas', 'Reformas Parciales',
        'Reforma completa de baños y cocinas. Alicatado, fontanería, electricidad y carpintería.',
        E'Reformas especializadas en baños y cocinas:\n\n• Demolición y evacuación de escombros\n• Nuevas instalaciones de fontanería\n• Instalación eléctrica actualizada\n• Alicatado de suelos y paredes\n• Carpintería a medida o de serie\n• Griferías y sanitarios de calidad\n• Electrodomésticos integrados\n• Garantía de 2 años en instalaciones\n\nMateriales resistentes a la humedad y salitre. Trabajos rápidos sin comprometer calidad.',
        8500, 'starting_at', '2-4 semanas', true, v_sector_profiles.user_id,
        '["https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800"]'::jsonb,
        '["baños", "cocinas", "reforma", "alicatado"]'::jsonb,
        'Toda Ibiza'
      );
      
      INSERT INTO professional_service_items (
        professional_id, service_id, name, description, base_price, is_active, category
      ) VALUES (
        v_sector_profiles.profile_id, v_service_id,
        'Reforma de Baños y Cocinas', 'Reforma completa con garantías',
        8500, true, 'construccion-reformas'
      );
    
    -- ARQUITECTURA Services
    ELSIF v_sector_profiles.business_name LIKE '%Arquitectura%' THEN
      
      v_service_id := gen_random_uuid();
      INSERT INTO services (
        id, name, slug, category, subcategory, description, long_description,
        base_price, price_type, duration_estimate, is_active, featured, provider_id,
        images, tags, service_area, requirements
      ) VALUES (
        v_service_id,
        'Proyecto Básico y de Ejecución',
        'proyecto-basico-ejecucion-' || v_sector_profiles.short_slug,
        'Arquitectura', 'Proyectos',
        'Proyectos de arquitectura completos para obra nueva y reforma. Adaptados a normativa de Ibiza.',
        E'Desarrollo completo de proyectos arquitectónicos:\n\n• Estudio de viabilidad y planificación\n• Levantamiento topográfico\n• Proyecto básico para licencia\n• Proyecto de ejecución detallado\n• Coordinación con ingenierías\n• Memorias y mediciones\n• Pliego de condiciones\n• Presupuesto orientativo\n\nEspecialistas en normativa urbanística de Ibiza y Formentera. Diseño contemporáneo con soluciones bioclimáticas.',
        15000, 'starting_at', '2-4 meses', true, true, v_sector_profiles.user_id,
        '["https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800"]'::jsonb,
        '["arquitectura", "proyecto", "licencia", "planificación"]'::jsonb,
        'Ibiza y Formentera',
        '["Referencia catastral", "Documentación propiedad", "Ideas preliminares"]'::jsonb
      );
      
      INSERT INTO professional_service_items (
        professional_id, service_id, name, description, base_price, is_active, category
      ) VALUES (
        v_sector_profiles.profile_id, v_service_id,
        'Proyecto Básico y de Ejecución', 'Proyectos completos adaptados a Ibiza',
        15000, true, 'arquitectura'
      );
      
      v_service_id := gen_random_uuid();
      INSERT INTO services (
        id, name, slug, category, subcategory, description, long_description,
        base_price, price_type, duration_estimate, is_active, provider_id,
        images, tags, service_area
      ) VALUES (
        v_service_id,
        'Dirección de Obra',
        'direccion-obra-' || v_sector_profiles.short_slug,
        'Arquitectura', 'Dirección',
        'Dirección facultativa de obra con seguimiento semanal. Control de calidad y plazos.',
        E'Servicio completo de dirección de obra:\n\n• Visitas semanales a obra\n• Control de calidad de materiales\n• Supervisión de trabajos\n• Resolución de incidencias\n• Certificaciones de obra\n• Actas de replanteo y final de obra\n• Coordinación con constructora\n• Documentación fotográfica\n\nGarantizamos que la obra se ejecute según proyecto aprobado. Comunicación fluida con promotor.',
        8000, 'starting_at', 'Según duración obra', true, v_sector_profiles.user_id,
        '["https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800"]'::jsonb,
        '["dirección obra", "supervisión", "control calidad"]'::jsonb,
        'Ibiza y Formentera'
      );
      
      INSERT INTO professional_service_items (
        professional_id, service_id, name, description, base_price, is_active, category
      ) VALUES (
        v_sector_profiles.profile_id, v_service_id,
        'Dirección de Obra', 'Supervisión completa con visitas semanales',
        8000, true, 'arquitectura'
      );
    
    -- PISCINAS, SPA & WELLNESS Services
    ELSIF v_sector_profiles.business_name LIKE '%Piscinas%' THEN
      
      v_service_id := gen_random_uuid();
      INSERT INTO services (
        id, name, slug, category, subcategory, description, long_description,
        base_price, price_type, duration_estimate, is_active, featured, provider_id,
        images, tags, service_area, requirements
      ) VALUES (
        v_service_id,
        'Construcción de Piscina de Obra Nueva',
        'construccion-piscina-nueva-' || v_sector_profiles.short_slug,
        'Piscinas y Wellness', 'Construcción',
        'Piscinas de obra nueva con sistema de filtración y automatización. Diseño personalizado.',
        E'Construcción completa de piscinas:\n\n• Excavación y movimiento de tierras\n• Estructura de hormigón armado\n• Impermeabilización con lámina\n• Sistema de filtración y depuradora\n• Revestimiento (gresite, liner o piedra)\n• Coronación y zona perimetral\n• Iluminación LED subacuática\n• Sistema de cloración salina\n• Automatización y domótica\n• Mantenimiento primer año incluido\n\nPiscinas adaptadas a normativa para alquiler turístico. Sistemas de bajo consumo energético.',
        35000, 'starting_at', '6-10 semanas', true, true, v_sector_profiles.user_id,
        '["https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800"]'::jsonb,
        '["piscina", "construcción", "obra nueva", "wellness"]'::jsonb,
        'Ibiza y Formentera',
        '["Espacio disponible mínimo 20m²", "Acceso para maquinaria", "Licencia de obras"]'::jsonb
      );
      
      INSERT INTO professional_service_items (
        professional_id, service_id, name, description, base_price, is_active, category
      ) VALUES (
        v_sector_profiles.profile_id, v_service_id,
        'Construcción de Piscina Nueva', 'Piscina completa con garantías',
        35000, true, 'piscinas-spa-wellness'
      );
      
      v_service_id := gen_random_uuid();
      INSERT INTO services (
        id, name, slug, category, subcategory, description, long_description,
        base_price, price_type, duration_estimate, is_active, provider_id,
        images, tags, service_area
      ) VALUES (
        v_service_id,
        'Plan de Mantenimiento Anual',
        'mantenimiento-piscina-anual-' || v_sector_profiles.short_slug,
        'Piscinas y Wellness', 'Mantenimiento',
        'Mantenimiento profesional durante todo el año. Limpieza, análisis y tratamiento del agua.',
        E'Servicio de mantenimiento completo:\n\n• Visita semanal o quincenal\n• Limpieza de fondo y paredes\n• Análisis de pH y cloro\n• Tratamiento del agua\n• Revisión de filtros y depuradora\n• Limpieza de skimmers\n• Control de equipos automatizados\n• Puesta a punto de temporada\n• Servicio de urgencias 24/7\n• Informe mensual digital\n\nIdeal para propiedades de alquiler turístico. Garantizamos agua cristalina todo el año.',
        1800, 'per_year', 'Anual', true, v_sector_profiles.user_id,
        '["https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800"]'::jsonb,
        '["mantenimiento", "piscina", "limpieza", "tratamiento agua"]'::jsonb,
        'Toda Ibiza'
      );
      
      INSERT INTO professional_service_items (
        professional_id, service_id, name, description, base_price, is_active, category
      ) VALUES (
        v_sector_profiles.profile_id, v_service_id,
        'Plan de Mantenimiento Anual', 'Piscina perfecta todo el año',
        1800, true, 'piscinas-spa-wellness'
      );
    
    -- INTERIORISMO Services
    ELSIF v_sector_profiles.business_name LIKE '%Interiorismo%' THEN
      
      v_service_id := gen_random_uuid();
      INSERT INTO services (
        id, name, slug, category, subcategory, description, long_description,
        base_price, price_type, duration_estimate, is_active, featured, provider_id,
        images, tags, service_area
      ) VALUES (
        v_service_id,
        'Proyecto de Interiorismo Completo',
        'proyecto-interiorismo-' || v_sector_profiles.short_slug,
        'Interiorismo', 'Proyectos',
        'Diseño de interiores llave en mano. Estilo mediterráneo contemporáneo adaptado a Ibiza.',
        E'Proyecto completo de interiorismo:\n\n• Estudio de necesidades y briefing\n• Concept board y mood board\n• Planos de distribución y mobiliario\n• Selección de materiales y acabados\n• Render 3D fotorrealista\n• Shopping list de mobiliario\n• Coordinación con proveedores\n• Dirección de obra de interiorismo\n• Styling final y decoración\n• Reportaje fotográfico profesional\n\nEstilo mediterráneo con toques contemporáneos. Materiales naturales y colores que reflejan Ibiza.',
        12000, 'starting_at', '2-3 meses', true, true, v_sector_profiles.user_id,
        '["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800"]'::jsonb,
        '["interiorismo", "diseño", "decoración", "mediterráneo"]'::jsonb,
        'Ibiza y Formentera'
      );
      
      INSERT INTO professional_service_items (
        professional_id, service_id, name, description, base_price, is_active, category
      ) VALUES (
        v_sector_profiles.profile_id, v_service_id,
        'Proyecto de Interiorismo Completo', 'Diseño llave en mano estilo Ibiza',
        12000, true, 'interiorismo-decoracion'
      );
    
    -- ENERGÍAS Y SOSTENIBILIDAD Services
    ELSIF v_sector_profiles.business_name LIKE '%Energía Solar%' OR v_sector_profiles.business_name LIKE '%Energías%' THEN
      
      v_service_id := gen_random_uuid();
      INSERT INTO services (
        id, name, slug, category, subcategory, description, long_description,
        base_price, price_type, duration_estimate, is_active, featured, provider_id,
        images, tags, service_area, requirements
      ) VALUES (
        v_service_id,
        'Instalación Solar Fotovoltaica con Baterías',
        'instalacion-solar-baterias-' || v_sector_profiles.short_slug,
        'Energía y Sostenibilidad', 'Solar',
        'Sistema completo de autoconsumo solar con baterías. Ahorro del 70-90% en factura eléctrica.',
        E'Instalación completa de energía solar:\n\n• Estudio de viabilidad personalizado\n• Placas solares de última generación\n• Inversores híbridos con garantía\n• Baterías de litio para almacenamiento\n• Estructura de montaje en cubierta\n• Instalación eléctrica certificada\n• Conexión a red y legalización\n• Tramitación de subvenciones\n• Monitorización en tiempo real\n• Mantenimiento 5 años incluido\n\nSistemas dimensionados para clima de Ibiza. Financiación disponible desde 0% TAE.',
        18000, 'starting_at', '3-5 semanas', true, true, v_sector_profiles.user_id,
        '["https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800"]'::jsonb,
        '["solar", "fotovoltaica", "autoconsumo", "baterías", "ahorro"]'::jsonb,
        'Ibiza y Formentera',
        '["Factura eléctrica reciente", "Fotos de cubierta", "Orientación sur preferible"]'::jsonb
      );
      
      INSERT INTO professional_service_items (
        professional_id, service_id, name, description, base_price, is_active, category
      ) VALUES (
        v_sector_profiles.profile_id, v_service_id,
        'Instalación Solar con Baterías', 'Ahorra hasta 90% en luz',
        18000, true, 'energias-sostenibilidad'
      );
      
      v_service_id := gen_random_uuid();
      INSERT INTO services (
        id, name, slug, category, subcategory, description, long_description,
        base_price, price_type, duration_estimate, is_active, provider_id,
        images, tags, service_area
      ) VALUES (
        v_service_id,
        'Auditoría Energética Completa',
        'auditoria-energetica-' || v_sector_profiles.short_slug,
        'Energía y Sostenibilidad', 'Consultoría',
        'Análisis completo del consumo energético. Informe con recomendaciones de mejora y ahorro.',
        E'Auditoría energética profesional:\n\n• Análisis de consumo histórico\n• Inspección in situ de instalaciones\n• Termografía infrarroja de envolvente\n• Estudio de aislamientos\n• Revisión de climatización\n• Análisis de iluminación\n• Informe técnico detallado\n• Plan de mejoras priorizadas\n• Cálculo de retorno inversión\n• Certificado energético incluido\n\nIdentificamos ahorros inmediatos y mejoras a medio plazo. Ideal antes de reforma o para optimizar costes.',
        850, 'fixed', '1-2 semanas', true, v_sector_profiles.user_id,
        '["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"]'::jsonb,
        '["auditoría", "eficiencia", "ahorro", "certificado"]'::jsonb,
        'Ibiza'
      );
      
      INSERT INTO professional_service_items (
        professional_id, service_id, name, description, base_price, is_active, category
      ) VALUES (
        v_sector_profiles.profile_id, v_service_id,
        'Auditoría Energética', 'Descubre cómo ahorrar en tu factura',
        850, true, 'energias-sostenibilidad'
      );
    
    -- Default services for other sectors
    ELSE
      FOR i IN 1..3 LOOP
        v_service_id := gen_random_uuid();
        INSERT INTO services (
          id, name, slug, category, description, base_price, price_type,
          duration_estimate, is_active, provider_id, tags, service_area
        ) VALUES (
          v_service_id,
          'Servicio ' || i || ' - ' || v_sector_profiles.business_name,
          'servicio-' || i || '-' || v_sector_profiles.short_slug,
          COALESCE((v_sector_profiles.subsector_tags->0)::text, 'Servicios Generales'),
          'Servicio profesional especializado para ' || v_sector_profiles.business_name,
          1000 + (i * 500),
          'starting_at',
          '1-4 semanas',
          true,
          v_sector_profiles.user_id,
          jsonb_build_array('profesional', 'ibiza', 'calidad'),
          'Ibiza y Formentera'
        );
        
        INSERT INTO professional_service_items (
          professional_id, service_id, name, description, base_price, is_active
        ) VALUES (
          v_sector_profiles.profile_id, v_service_id,
          'Servicio ' || i,
          'Servicio especializado de ' || v_sector_profiles.business_name,
          1000 + (i * 500),
          true
        );
      END LOOP;
    END IF;
    
    RAISE NOTICE 'Created services for: %', v_sector_profiles.business_name;
    
  END LOOP;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Fair services seed complete!';
  RAISE NOTICE '====================================';
  
END $$;
