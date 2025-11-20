import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting taxonomy population from scratch...')

    // Step 1: Populate Categories
    const categories = [
      { name_en: 'Construction', name_es: 'Construcción', icon: 'hammer', display_order: 1, is_active: true },
      { name_en: 'Plumbing', name_es: 'Fontanería', icon: 'droplet', display_order: 2, is_active: true },
      { name_en: 'Electrical', name_es: 'Electricidad', icon: 'zap', display_order: 3, is_active: true },
      { name_en: 'Pool & Spa', name_es: 'Piscina y Spa', icon: 'waves', display_order: 4, is_active: true },
      { name_en: 'Cleaning', name_es: 'Limpieza', icon: 'sparkles', display_order: 5, is_active: true },
      { name_en: 'Gardening', name_es: 'Jardinería', icon: 'leaf', display_order: 6, is_active: true },
      { name_en: 'HVAC', name_es: 'Climatización', icon: 'wind', display_order: 7, is_active: true },
      { name_en: 'Painting', name_es: 'Pintura', icon: 'paintbrush', display_order: 8, is_active: true }
    ]

    const { error: catError, data: insertedCategories } = await supabase
      .from('service_categories')
      .upsert(categories, { onConflict: 'name_en' })
      .select('id, name_en')

    if (catError) throw new Error(`Category insert failed: ${catError.message}`)
    console.log(`✅ Inserted ${insertedCategories?.length || 0} categories`)

    const categoryMap = new Map(insertedCategories?.map(c => [c.name_en, c.id]) || [])

    // Step 2: Populate Subcategories
    const subcategories = [
      // Construction
      { category_id: categoryMap.get('Construction'), name_en: 'General Construction', name_es: 'Construcción General', is_active: true },
      { category_id: categoryMap.get('Construction'), name_en: 'Masonry', name_es: 'Albañilería', is_active: true },
      { category_id: categoryMap.get('Construction'), name_en: 'Carpentry', name_es: 'Carpintería', is_active: true },
      { category_id: categoryMap.get('Construction'), name_en: 'Roofing', name_es: 'Techado', is_active: true },
      
      // Plumbing
      { category_id: categoryMap.get('Plumbing'), name_en: 'General Plumbing', name_es: 'Fontanería General', is_active: true },
      { category_id: categoryMap.get('Plumbing'), name_en: 'Emergency Repairs', name_es: 'Reparaciones de Emergencia', is_active: true },
      { category_id: categoryMap.get('Plumbing'), name_en: 'Installation', name_es: 'Instalación', is_active: true },
      
      // Electrical
      { category_id: categoryMap.get('Electrical'), name_en: 'General Electrical', name_es: 'Electricidad General', is_active: true },
      { category_id: categoryMap.get('Electrical'), name_en: 'Lighting', name_es: 'Iluminación', is_active: true },
      { category_id: categoryMap.get('Electrical'), name_en: 'Smart Home', name_es: 'Hogar Inteligente', is_active: true },
      
      // Pool & Spa
      { category_id: categoryMap.get('Pool & Spa'), name_en: 'Pool Maintenance', name_es: 'Mantenimiento de Piscina', is_active: true },
      { category_id: categoryMap.get('Pool & Spa'), name_en: 'Pool Equipment', name_es: 'Equipo de Piscina', is_active: true },
      { category_id: categoryMap.get('Pool & Spa'), name_en: 'Spa Services', name_es: 'Servicios de Spa', is_active: true },
      
      // Cleaning
      { category_id: categoryMap.get('Cleaning'), name_en: 'House Cleaning', name_es: 'Limpieza de Casa', is_active: true },
      { category_id: categoryMap.get('Cleaning'), name_en: 'Commercial Cleaning', name_es: 'Limpieza Comercial', is_active: true },
      { category_id: categoryMap.get('Cleaning'), name_en: 'Deep Cleaning', name_es: 'Limpieza Profunda', is_active: true },
      
      // Gardening
      { category_id: categoryMap.get('Gardening'), name_en: 'Lawn Care', name_es: 'Cuidado del Césped', is_active: true },
      { category_id: categoryMap.get('Gardening'), name_en: 'Tree Services', name_es: 'Servicios de Árboles', is_active: true },
      { category_id: categoryMap.get('Gardening'), name_en: 'Landscaping', name_es: 'Paisajismo', is_active: true },
      
      // HVAC
      { category_id: categoryMap.get('HVAC'), name_en: 'AC Repair', name_es: 'Reparación de AC', is_active: true },
      { category_id: categoryMap.get('HVAC'), name_en: 'Heating', name_es: 'Calefacción', is_active: true },
      { category_id: categoryMap.get('HVAC'), name_en: 'Installation', name_es: 'Instalación', is_active: true },
      
      // Painting
      { category_id: categoryMap.get('Painting'), name_en: 'Interior Painting', name_es: 'Pintura Interior', is_active: true },
      { category_id: categoryMap.get('Painting'), name_en: 'Exterior Painting', name_es: 'Pintura Exterior', is_active: true },
      { category_id: categoryMap.get('Painting'), name_en: 'Specialty Finishes', name_es: 'Acabados Especiales', is_active: true }
    ]

    const { error: subError, data: insertedSubcategories } = await supabase
      .from('service_subcategories')
      .upsert(subcategories, { onConflict: 'name_en,category_id' })
      .select('id, name_en, service_categories!inner(name_en)')

    if (subError) throw new Error(`Subcategory insert failed: ${subError.message}`)
    console.log(`✅ Inserted ${insertedSubcategories?.length || 0} subcategories`)

    // Create subcategory map with format "CategoryName|SubcategoryName" -> ID
    const subMap = new Map()
    for (const sub of insertedSubcategories || []) {
      const categories = sub.service_categories as any
      const catName = Array.isArray(categories) ? categories[0]?.name_en : categories?.name_en
      if (catName && sub.name_en) {
        subMap.set(`${catName}|${sub.name_en}`, sub.id)
      }
    }

    // Step 3: Populate Microservices
    const microservices = [
      // Construction - General Construction
      { subcategory_id: subMap.get('Construction|General Construction'), name_en: 'Wall Construction', name_es: 'Construcción de Paredes', typical_duration_hours: 8, is_active: true },
      { subcategory_id: subMap.get('Construction|General Construction'), name_en: 'Floor Installation', name_es: 'Instalación de Pisos', typical_duration_hours: 6, is_active: true },
      { subcategory_id: subMap.get('Construction|General Construction'), name_en: 'Renovation', name_es: 'Renovación', typical_duration_hours: 16, is_active: true },
      
      // Construction - Masonry
      { subcategory_id: subMap.get('Construction|Masonry'), name_en: 'Brick Laying', name_es: 'Colocación de Ladrillos', typical_duration_hours: 8, is_active: true },
      { subcategory_id: subMap.get('Construction|Masonry'), name_en: 'Stone Work', name_es: 'Trabajo en Piedra', typical_duration_hours: 10, is_active: true },
      { subcategory_id: subMap.get('Construction|Masonry'), name_en: 'Retaining Wall', name_es: 'Muro de Contención', typical_duration_hours: 12, is_active: true },
      
      // Plumbing - General Plumbing
      { subcategory_id: subMap.get('Plumbing|General Plumbing'), name_en: 'Leak Repair', name_es: 'Reparación de Fugas', typical_duration_hours: 2, is_active: true },
      { subcategory_id: subMap.get('Plumbing|General Plumbing'), name_en: 'Pipe Replacement', name_es: 'Reemplazo de Tuberías', typical_duration_hours: 4, is_active: true },
      { subcategory_id: subMap.get('Plumbing|General Plumbing'), name_en: 'Drain Cleaning', name_es: 'Limpieza de Desagües', typical_duration_hours: 1, is_active: true },
      
      // Plumbing - Emergency Repairs
      { subcategory_id: subMap.get('Plumbing|Emergency Repairs'), name_en: 'Burst Pipe', name_es: 'Tubería Rota', typical_duration_hours: 2, is_active: true },
      { subcategory_id: subMap.get('Plumbing|Emergency Repairs'), name_en: 'Water Heater Emergency', name_es: 'Emergencia de Calentador', typical_duration_hours: 3, is_active: true },
      
      // Electrical - General Electrical
      { subcategory_id: subMap.get('Electrical|General Electrical'), name_en: 'Outlet Installation', name_es: 'Instalación de Enchufes', typical_duration_hours: 1, is_active: true },
      { subcategory_id: subMap.get('Electrical|General Electrical'), name_en: 'Circuit Breaker Repair', name_es: 'Reparación de Interruptores', typical_duration_hours: 2, is_active: true },
      { subcategory_id: subMap.get('Electrical|General Electrical'), name_en: 'Wiring Upgrade', name_es: 'Actualización de Cableado', typical_duration_hours: 8, is_active: true },
      
      // Pool & Spa - Pool Maintenance
      { subcategory_id: subMap.get('Pool & Spa|Pool Maintenance'), name_en: 'Pool Cleaning', name_es: 'Limpieza de Piscina', typical_duration_hours: 2, is_active: true },
      { subcategory_id: subMap.get('Pool & Spa|Pool Maintenance'), name_en: 'Chemical Balancing', name_es: 'Balance Químico', typical_duration_hours: 1, is_active: true },
      { subcategory_id: subMap.get('Pool & Spa|Pool Maintenance'), name_en: 'Filter Cleaning', name_es: 'Limpieza de Filtros', typical_duration_hours: 1, is_active: true },
      
      // Cleaning - House Cleaning
      { subcategory_id: subMap.get('Cleaning|House Cleaning'), name_en: 'Regular Cleaning', name_es: 'Limpieza Regular', typical_duration_hours: 3, is_active: true },
      { subcategory_id: subMap.get('Cleaning|House Cleaning'), name_en: 'Move-in/Move-out', name_es: 'Mudanza', typical_duration_hours: 6, is_active: true },
      
      // Gardening - Lawn Care
      { subcategory_id: subMap.get('Gardening|Lawn Care'), name_en: 'Lawn Mowing', name_es: 'Corte de Césped', typical_duration_hours: 1, is_active: true },
      { subcategory_id: subMap.get('Gardening|Lawn Care'), name_en: 'Fertilization', name_es: 'Fertilización', typical_duration_hours: 1, is_active: true },
      
      // HVAC - AC Repair
      { subcategory_id: subMap.get('HVAC|AC Repair'), name_en: 'AC Tune-up', name_es: 'Ajuste de AC', typical_duration_hours: 2, is_active: true },
      { subcategory_id: subMap.get('HVAC|AC Repair'), name_en: 'Refrigerant Recharge', name_es: 'Recarga de Refrigerante', typical_duration_hours: 1, is_active: true },
      
      // Painting - Interior Painting
      { subcategory_id: subMap.get('Painting|Interior Painting'), name_en: 'Room Painting', name_es: 'Pintura de Habitación', typical_duration_hours: 6, is_active: true },
      { subcategory_id: subMap.get('Painting|Interior Painting'), name_en: 'Cabinet Painting', name_es: 'Pintura de Gabinetes', typical_duration_hours: 8, is_active: true }
    ].filter(m => m.subcategory_id)

    const { error: microError, data: insertedMicro } = await supabase
      .from('service_micro_categories')
      .upsert(microservices, { onConflict: 'name_en,subcategory_id' })
      .select('id')

    if (microError) throw new Error(`Microservice insert failed: ${microError.message}`)
    console.log(`✅ Inserted ${insertedMicro?.length || 0} microservices`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Taxonomy populated successfully! /post page should now work.',
        counts: {
          categories: insertedCategories?.length || 0,
          subcategories: insertedSubcategories?.length || 0,
          microservices: insertedMicro?.length || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error populating taxonomy:', error)
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Failed to populate taxonomy'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
