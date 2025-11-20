import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting taxonomy population...')

    // Step 1: Populate Categories
    const categories = [
      { name: 'Construction', slug: 'construction', icon_emoji: '🔨', icon_name: 'hammer', display_order: 1, is_active: true },
      { name: 'Plumbing', slug: 'plumbing', icon_emoji: '💧', icon_name: 'droplet', display_order: 2, is_active: true },
      { name: 'Electrical', slug: 'electrical', icon_emoji: '⚡', icon_name: 'zap', display_order: 3, is_active: true },
      { name: 'Pool & Spa', slug: 'pool-spa', icon_emoji: '🌊', icon_name: 'waves', display_order: 4, is_active: true },
      { name: 'Cleaning', slug: 'cleaning', icon_emoji: '✨', icon_name: 'sparkles', display_order: 5, is_active: true },
      { name: 'Gardening', slug: 'gardening', icon_emoji: '🌿', icon_name: 'leaf', display_order: 6, is_active: true },
      { name: 'HVAC', slug: 'hvac', icon_emoji: '🌬️', icon_name: 'wind', display_order: 7, is_active: true },
      { name: 'Painting', slug: 'painting', icon_emoji: '🎨', icon_name: 'paintbrush', display_order: 8, is_active: true }
    ]

    const { error: catError, data: insertedCategories } = await supabase
      .from('service_categories')
      .upsert(categories, { onConflict: 'slug' })
      .select('id, name, slug')

    if (catError) throw new Error(`Category insert failed: ${catError.message}`)
    console.log(`✅ Inserted ${insertedCategories?.length || 0} categories`)

    const categoryMap = new Map(insertedCategories?.map(c => [c.name, c.id]) || [])

    // Step 2: Populate Subcategories
    const subcategories = [
      // Construction
      { category_id: categoryMap.get('Construction'), name: 'General Construction', slug: 'general-construction', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Construction'), name: 'Masonry', slug: 'masonry', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Construction'), name: 'Carpentry', slug: 'carpentry', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Construction'), name: 'Roofing', slug: 'roofing', display_order: 4, is_active: true },
      
      // Plumbing
      { category_id: categoryMap.get('Plumbing'), name: 'General Plumbing', slug: 'general-plumbing', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Plumbing'), name: 'Emergency Repairs', slug: 'emergency-repairs', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Plumbing'), name: 'Installation', slug: 'installation', display_order: 3, is_active: true },
      
      // Electrical
      { category_id: categoryMap.get('Electrical'), name: 'General Electrical', slug: 'general-electrical', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Electrical'), name: 'Lighting', slug: 'lighting', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Electrical'), name: 'Smart Home', slug: 'smart-home', display_order: 3, is_active: true },
      
      // Pool & Spa
      { category_id: categoryMap.get('Pool & Spa'), name: 'Pool Maintenance', slug: 'pool-maintenance', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Pool & Spa'), name: 'Pool Equipment', slug: 'pool-equipment', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Pool & Spa'), name: 'Spa Services', slug: 'spa-services', display_order: 3, is_active: true },
      
      // Cleaning
      { category_id: categoryMap.get('Cleaning'), name: 'House Cleaning', slug: 'house-cleaning', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Cleaning'), name: 'Commercial Cleaning', slug: 'commercial-cleaning', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Cleaning'), name: 'Deep Cleaning', slug: 'deep-cleaning', display_order: 3, is_active: true },
      
      // Gardening
      { category_id: categoryMap.get('Gardening'), name: 'Lawn Care', slug: 'lawn-care', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Gardening'), name: 'Landscaping', slug: 'landscaping', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Gardening'), name: 'Tree Services', slug: 'tree-services', display_order: 3, is_active: true },
      
      // HVAC
      { category_id: categoryMap.get('HVAC'), name: 'AC Repair', slug: 'ac-repair', display_order: 1, is_active: true },
      { category_id: categoryMap.get('HVAC'), name: 'Heating', slug: 'heating', display_order: 2, is_active: true },
      { category_id: categoryMap.get('HVAC'), name: 'Ventilation', slug: 'ventilation', display_order: 3, is_active: true },
      
      // Painting
      { category_id: categoryMap.get('Painting'), name: 'Interior Painting', slug: 'interior-painting', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Painting'), name: 'Exterior Painting', slug: 'exterior-painting', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Painting'), name: 'Specialty Finishes', slug: 'specialty-finishes', display_order: 3, is_active: true }
    ]

    const { error: subError, data: insertedSubcategories } = await supabase
      .from('service_subcategories')
      .upsert(subcategories.filter(s => s.category_id), { onConflict: 'category_id,slug' })
      .select('id, name, slug, category_id')

    if (subError) throw new Error(`Subcategory insert failed: ${subError.message}`)
    console.log(`✅ Inserted ${insertedSubcategories?.length || 0} subcategories`)

    // Create mapping: slug -> subcategory_id
    const subcategoryMap = new Map(insertedSubcategories?.map(s => [s.slug, s.id]) || [])

    // Step 3: Populate Microservices
    const microservices = [
      // Plumbing
      { subcategory_id: subcategoryMap.get('general-plumbing'), name: 'Leak Repair', slug: 'leak-repair', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('general-plumbing'), name: 'Drain Cleaning', slug: 'drain-cleaning', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('general-plumbing'), name: 'Pipe Repair', slug: 'pipe-repair', display_order: 3, is_active: true },
      { subcategory_id: subcategoryMap.get('general-plumbing'), name: 'Faucet Repair', slug: 'faucet-repair', display_order: 4, is_active: true },
      { subcategory_id: subcategoryMap.get('general-plumbing'), name: 'Toilet Repair', slug: 'toilet-repair', display_order: 5, is_active: true },
      { subcategory_id: subcategoryMap.get('emergency-repairs'), name: 'Burst Pipe', slug: 'burst-pipe', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('emergency-repairs'), name: 'Water Heater Emergency', slug: 'water-heater-emergency', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('emergency-repairs'), name: 'Sewer Backup', slug: 'sewer-backup', display_order: 3, is_active: true },
      { subcategory_id: subcategoryMap.get('installation'), name: 'Water Heater Installation', slug: 'water-heater-installation', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('installation'), name: 'Dishwasher Installation', slug: 'dishwasher-installation', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('installation'), name: 'Washing Machine Installation', slug: 'washing-machine-installation', display_order: 3, is_active: true },
      
      // Electrical
      { subcategory_id: subcategoryMap.get('general-electrical'), name: 'Outlet Installation', slug: 'outlet-installation', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('general-electrical'), name: 'Switch Repair', slug: 'switch-repair', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('general-electrical'), name: 'Circuit Breaker Repair', slug: 'circuit-breaker-repair', display_order: 3, is_active: true },
      { subcategory_id: subcategoryMap.get('general-electrical'), name: 'Wiring Upgrade', slug: 'wiring-upgrade', display_order: 4, is_active: true },
      { subcategory_id: subcategoryMap.get('lighting'), name: 'Light Fixture Installation', slug: 'light-fixture-installation', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('lighting'), name: 'Outdoor Lighting', slug: 'outdoor-lighting', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('lighting'), name: 'LED Upgrade', slug: 'led-upgrade', display_order: 3, is_active: true },
      
      // Pool & Spa
      { subcategory_id: subcategoryMap.get('pool-maintenance'), name: 'Pool Cleaning', slug: 'pool-cleaning', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('pool-maintenance'), name: 'Chemical Balance', slug: 'chemical-balance', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('pool-equipment'), name: 'Pump Repair', slug: 'pump-repair', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('pool-equipment'), name: 'Filter Replacement', slug: 'filter-replacement', display_order: 2, is_active: true },
      
      // Cleaning
      { subcategory_id: subcategoryMap.get('house-cleaning'), name: 'Standard Cleaning', slug: 'standard-cleaning', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('house-cleaning'), name: 'Move-in/Move-out', slug: 'move-in-move-out', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('deep-cleaning'), name: 'Deep Kitchen Clean', slug: 'deep-kitchen-clean', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('deep-cleaning'), name: 'Deep Bathroom Clean', slug: 'deep-bathroom-clean', display_order: 2, is_active: true },
      
      // Construction
      { subcategory_id: subcategoryMap.get('general-construction'), name: 'Wall Repair', slug: 'wall-repair', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('general-construction'), name: 'Ceiling Repair', slug: 'ceiling-repair', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('carpentry'), name: 'Cabinet Installation', slug: 'cabinet-installation', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('carpentry'), name: 'Door Installation', slug: 'door-installation', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('roofing'), name: 'Roof Repair', slug: 'roof-repair', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('roofing'), name: 'Gutter Installation', slug: 'gutter-installation', display_order: 2, is_active: true },
      
      // Gardening
      { subcategory_id: subcategoryMap.get('lawn-care'), name: 'Lawn Mowing', slug: 'lawn-mowing', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('lawn-care'), name: 'Fertilization', slug: 'fertilization', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('landscaping'), name: 'Garden Design', slug: 'garden-design', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('tree-services'), name: 'Tree Trimming', slug: 'tree-trimming', display_order: 1, is_active: true },
      
      // HVAC
      { subcategory_id: subcategoryMap.get('ac-repair'), name: 'AC Maintenance', slug: 'ac-maintenance', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('ac-repair'), name: 'AC Installation', slug: 'ac-installation', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('heating'), name: 'Heater Repair', slug: 'heater-repair', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('heating'), name: 'Heater Installation', slug: 'heater-installation', display_order: 2, is_active: true },
      
      // Painting
      { subcategory_id: subcategoryMap.get('interior-painting'), name: 'Room Painting', slug: 'room-painting', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('interior-painting'), name: 'Cabinet Painting', slug: 'cabinet-painting', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('exterior-painting'), name: 'House Exterior', slug: 'house-exterior', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('exterior-painting'), name: 'Fence Painting', slug: 'fence-painting', display_order: 2, is_active: true }
    ]

    const { error: microError, data: insertedMicro } = await supabase
      .from('service_micro_categories')
      .upsert(microservices.filter(m => m.subcategory_id), { onConflict: 'subcategory_id,slug' })
      .select('id, name, slug')

    if (microError) throw new Error(`Microservice insert failed: ${microError.message}`)
    console.log(`✅ Inserted ${insertedMicro?.length || 0} microservices`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Service taxonomy restored successfully',
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
