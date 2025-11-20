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

    // Step 1: Populate Categories (15 total: 9 core + 6 specialist)
    const categories = [
      // Core Trade Categories
      { name: 'Construction', slug: 'construction', icon_emoji: '🏗️', icon_name: 'Building2', display_order: 1, category_group: 'STRUCTURAL', is_active: true, examples: ['New builds', 'Extensions', 'Renovations', 'Structural work'] },
      { name: 'Carpentry', slug: 'carpentry', icon_emoji: '🔨', icon_name: 'Hammer', display_order: 2, category_group: 'STRUCTURAL', is_active: true, examples: ['Custom furniture', 'Doors', 'Decking', 'Joinery'] },
      { name: 'Plumbing', slug: 'plumbing', icon_emoji: '💧', icon_name: 'Droplet', display_order: 3, category_group: 'MEP', is_active: true, examples: ['Leak repairs', 'Pipe installation', 'Bathroom fitting', 'Water heaters'] },
      { name: 'Electrical', slug: 'electrical', icon_emoji: '⚡', icon_name: 'Zap', display_order: 4, category_group: 'MEP', is_active: true, examples: ['Rewiring', 'Socket installation', 'Lighting', 'Smart home'] },
      { name: 'HVAC', slug: 'hvac', icon_emoji: '🌬️', icon_name: 'Wind', display_order: 5, category_group: 'MEP', is_active: true, examples: ['Air conditioning', 'Heating', 'Ventilation', 'Installation'] },
      { name: 'Painting & Decorating', slug: 'painting-decorating', icon_emoji: '🎨', icon_name: 'Paintbrush', display_order: 6, category_group: 'FINISHES', is_active: true, examples: ['Interior painting', 'Exterior painting', 'Decorating', 'Wallpapering'] },
      { name: 'Gardening & Landscaping', slug: 'gardening-landscaping', icon_emoji: '🌿', icon_name: 'Leaf', display_order: 7, category_group: 'EXTERIOR', is_active: true, examples: ['Garden design', 'Lawn care', 'Tree services', 'Landscaping'] },
      { name: 'Cleaning', slug: 'cleaning', icon_emoji: '✨', icon_name: 'Sparkles', display_order: 8, category_group: 'SERVICES', is_active: true, examples: ['House cleaning', 'Deep cleaning', 'Commercial cleaning', 'End of tenancy'] },
      { name: 'Pool & Spa', slug: 'pool-spa', icon_emoji: '🌊', icon_name: 'Waves', display_order: 9, category_group: 'EXTERIOR', is_active: true, examples: ['Pool installation', 'Pool maintenance', 'Spa services', 'Repairs'] },
      
      // Specialist Categories
      { name: 'Architects & Design', slug: 'architects-design', icon_emoji: '📐', icon_name: 'Ruler', display_order: 10, category_group: 'PROFESSIONAL', is_active: true, examples: ['Building plans', 'Interior design', '3D renders', 'Structural calculations'] },
      { name: 'Kitchen & Bathroom', slug: 'kitchen-bathroom', icon_emoji: '🚿', icon_name: 'Bath', display_order: 11, category_group: 'PROFESSIONAL', is_active: true, examples: ['Kitchen fitting', 'Bathroom design', 'Wetrooms', 'Cabinet installation'] },
      { name: 'Floors, Doors & Windows', slug: 'floors-doors-windows', icon_emoji: '🚪', icon_name: 'DoorOpen', display_order: 12, category_group: 'PROFESSIONAL', is_active: true, examples: ['Flooring', 'Window installation', 'Door fitting', 'Double glazing'] },
      { name: 'Handyman & General Services', slug: 'handyman-general', icon_emoji: '🔧', icon_name: 'Wrench', display_order: 13, category_group: 'SERVICES', is_active: true, examples: ['General repairs', 'Furniture assembly', 'Odd jobs', 'Maintenance'] },
      { name: 'Commercial & Industrial', slug: 'commercial-industrial', icon_emoji: '🏢', icon_name: 'Building', display_order: 14, category_group: 'PROFESSIONAL', is_active: true, examples: ['Office fit-outs', 'Retail spaces', 'Commercial projects', 'Industrial work'] },
      { name: 'Legal & Regulatory', slug: 'legal-regulatory', icon_emoji: '📋', icon_name: 'FileText', display_order: 15, category_group: 'PROFESSIONAL', is_active: true, examples: ['Building permits', 'Planning applications', 'Compliance', 'Legal support'] }
    ]

    const { error: catError, data: insertedCategories } = await supabase
      .from('service_categories')
      .upsert(categories, { onConflict: 'slug' })
      .select('id, name, slug')

    if (catError) throw new Error(`Category insert failed: ${catError.message}`)
    console.log(`✅ Inserted ${insertedCategories?.length || 0} categories`)

    const categoryMap = new Map(insertedCategories?.map(c => [c.name, c.id]) || [])

    // Step 2: Populate Subcategories (expanded comprehensively)
    const subcategories = [
      // Construction - 10 subcategories
      { category_id: categoryMap.get('Construction'), name: 'General Construction', slug: 'general-construction', icon_name: 'Building2', icon_emoji: '🏗️', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Construction'), name: 'Masonry', slug: 'masonry', icon_name: 'Square', icon_emoji: '🧱', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Construction'), name: 'Roofing', slug: 'roofing', icon_name: 'Home', icon_emoji: '🏠', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Construction'), name: 'Tiling', slug: 'tiling', icon_name: 'Layers', icon_emoji: '⬜', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Construction'), name: 'Plastering', slug: 'plastering', icon_name: 'Paintbrush', icon_emoji: '🏗️', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Construction'), name: 'Bricklaying', slug: 'bricklaying', icon_name: 'Square', icon_emoji: '🧱', display_order: 6, is_active: true },
      { category_id: categoryMap.get('Construction'), name: 'Concrete Work', slug: 'concrete-work', icon_name: 'HardHat', icon_emoji: '🏗️', display_order: 7, is_active: true },
      { category_id: categoryMap.get('Construction'), name: 'Extensions & Conversions', slug: 'extensions-conversions', icon_name: 'Building', icon_emoji: '🏡', display_order: 8, is_active: true },
      { category_id: categoryMap.get('Construction'), name: 'Structural Work', slug: 'structural-work', icon_name: 'HardHat', icon_emoji: '⚙️', display_order: 9, is_active: true },
      { category_id: categoryMap.get('Construction'), name: 'Demolition', slug: 'demolition', icon_name: 'Hammer', icon_emoji: '🔨', display_order: 10, is_active: true },
      
      // Carpentry - 8 subcategories
      { category_id: categoryMap.get('Carpentry'), name: 'Custom Furniture', slug: 'custom-furniture', icon_name: 'Wrench', icon_emoji: '🪑', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Carpentry'), name: 'Doors & Windows', slug: 'doors-windows', icon_name: 'DoorOpen', icon_emoji: '🚪', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Carpentry'), name: 'Decking & Outdoor', slug: 'decking-outdoor', icon_name: 'Leaf', icon_emoji: '🌳', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Carpentry'), name: 'General Joinery', slug: 'general-joinery', icon_name: 'Hammer', icon_emoji: '🔨', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Carpentry'), name: 'Built-in Wardrobes', slug: 'built-in-wardrobes', icon_name: 'Square', icon_emoji: '🚪', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Carpentry'), name: 'Staircases', slug: 'staircases', icon_name: 'Layers', icon_emoji: '🪜', display_order: 6, is_active: true },
      { category_id: categoryMap.get('Carpentry'), name: 'Shelving & Storage', slug: 'shelving-storage', icon_name: 'Square', icon_emoji: '📚', display_order: 7, is_active: true },
      { category_id: categoryMap.get('Carpentry'), name: 'Skirting & Architrave', slug: 'skirting-architrave', icon_name: 'Ruler', icon_emoji: '📐', display_order: 8, is_active: true },
      
      // Plumbing - 8 subcategories
      { category_id: categoryMap.get('Plumbing'), name: 'General Plumbing', slug: 'general-plumbing', icon_name: 'Wrench', icon_emoji: '🔧', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Plumbing'), name: 'Emergency Repairs', slug: 'emergency-repairs', icon_name: 'Droplet', icon_emoji: '💧', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Plumbing'), name: 'Bathroom Installation', slug: 'bathroom-installation', icon_name: 'Bath', icon_emoji: '🚿', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Plumbing'), name: 'Kitchen Plumbing', slug: 'kitchen-plumbing', icon_name: 'Droplet', icon_emoji: '🍽️', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Plumbing'), name: 'Boiler Installation', slug: 'boiler-installation', icon_name: 'Zap', icon_emoji: '🔥', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Plumbing'), name: 'Drainage', slug: 'drainage', icon_name: 'Droplet', icon_emoji: '💧', display_order: 6, is_active: true },
      { category_id: categoryMap.get('Plumbing'), name: 'Water Heaters', slug: 'water-heaters', icon_name: 'Zap', icon_emoji: '♨️', display_order: 7, is_active: true },
      { category_id: categoryMap.get('Plumbing'), name: 'Gas Services', slug: 'gas-services', icon_name: 'Zap', icon_emoji: '🔥', display_order: 8, is_active: true },
      
      // Electrical - 8 subcategories
      { category_id: categoryMap.get('Electrical'), name: 'General Electrical', slug: 'general-electrical', icon_name: 'Zap', icon_emoji: '⚡', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Electrical'), name: 'Lighting', slug: 'lighting', icon_name: 'Zap', icon_emoji: '💡', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Electrical'), name: 'Smart Home', slug: 'smart-home', icon_name: 'Zap', icon_emoji: '🏡', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Electrical'), name: 'Rewiring', slug: 'rewiring', icon_name: 'Zap', icon_emoji: '🔌', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Electrical'), name: 'Fuse Box', slug: 'fuse-box', icon_name: 'Square', icon_emoji: '⚡', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Electrical'), name: 'EV Charging', slug: 'ev-charging', icon_name: 'Zap', icon_emoji: '🔌', display_order: 6, is_active: true },
      { category_id: categoryMap.get('Electrical'), name: 'Security Systems', slug: 'security-systems', icon_name: 'Zap', icon_emoji: '🔒', display_order: 7, is_active: true },
      { category_id: categoryMap.get('Electrical'), name: 'Emergency Electrician', slug: 'emergency-electrician', icon_name: 'Zap', icon_emoji: '🚨', display_order: 8, is_active: true },
      
      // HVAC - 7 subcategories
      { category_id: categoryMap.get('HVAC'), name: 'Air Conditioning', slug: 'air-conditioning', icon_name: 'Wind', icon_emoji: '❄️', display_order: 1, is_active: true },
      { category_id: categoryMap.get('HVAC'), name: 'Heating', slug: 'heating', icon_name: 'Wind', icon_emoji: '🔥', display_order: 2, is_active: true },
      { category_id: categoryMap.get('HVAC'), name: 'Ventilation', slug: 'ventilation', icon_name: 'Wind', icon_emoji: '🌬️', display_order: 3, is_active: true },
      { category_id: categoryMap.get('HVAC'), name: 'Boiler Repair', slug: 'boiler-repair', icon_name: 'Wrench', icon_emoji: '🔧', display_order: 4, is_active: true },
      { category_id: categoryMap.get('HVAC'), name: 'Heat Pump Installation', slug: 'heat-pump-installation', icon_name: 'Zap', icon_emoji: '♨️', display_order: 5, is_active: true },
      { category_id: categoryMap.get('HVAC'), name: 'Radiator Installation', slug: 'radiator-installation', icon_name: 'Square', icon_emoji: '🔥', display_order: 6, is_active: true },
      { category_id: categoryMap.get('HVAC'), name: 'Duct Cleaning', slug: 'duct-cleaning', icon_name: 'Wind', icon_emoji: '🌬️', display_order: 7, is_active: true },
      
      // Painting & Decorating - 7 subcategories
      { category_id: categoryMap.get('Painting & Decorating'), name: 'Interior Painting', slug: 'interior-painting', icon_name: 'Paintbrush', icon_emoji: '🎨', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Painting & Decorating'), name: 'Exterior Painting', slug: 'exterior-painting', icon_name: 'Paintbrush', icon_emoji: '🏠', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Painting & Decorating'), name: 'Wallpapering', slug: 'wallpapering', icon_name: 'Paintbrush', icon_emoji: '🖼️', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Painting & Decorating'), name: 'Spray Painting', slug: 'spray-painting', icon_name: 'Paintbrush', icon_emoji: '🎨', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Painting & Decorating'), name: 'Fence Painting', slug: 'fence-painting', icon_name: 'Leaf', icon_emoji: '🌳', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Painting & Decorating'), name: 'Commercial Painting', slug: 'commercial-painting', icon_name: 'Building', icon_emoji: '🏢', display_order: 6, is_active: true },
      { category_id: categoryMap.get('Painting & Decorating'), name: 'Restoration', slug: 'restoration', icon_name: 'Paintbrush', icon_emoji: '🖌️', display_order: 7, is_active: true },
      
      // Gardening & Landscaping - 9 subcategories
      { category_id: categoryMap.get('Gardening & Landscaping'), name: 'Lawn Care', slug: 'lawn-care', icon_name: 'Leaf', icon_emoji: '🌱', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Gardening & Landscaping'), name: 'Garden Design', slug: 'garden-design', icon_name: 'Leaf', icon_emoji: '🌿', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Gardening & Landscaping'), name: 'Tree Services', slug: 'tree-services', icon_name: 'Leaf', icon_emoji: '🌳', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Gardening & Landscaping'), name: 'Hedge Trimming', slug: 'hedge-trimming', icon_name: 'Leaf', icon_emoji: '🌿', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Gardening & Landscaping'), name: 'Paving & Driveways', slug: 'paving-driveways', icon_name: 'Square', icon_emoji: '🛣️', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Gardening & Landscaping'), name: 'Fencing', slug: 'fencing', icon_name: 'Square', icon_emoji: '🚧', display_order: 6, is_active: true },
      { category_id: categoryMap.get('Gardening & Landscaping'), name: 'Artificial Grass', slug: 'artificial-grass', icon_name: 'Leaf', icon_emoji: '🌱', display_order: 7, is_active: true },
      { category_id: categoryMap.get('Gardening & Landscaping'), name: 'Garden Clearance', slug: 'garden-clearance', icon_name: 'Leaf', icon_emoji: '🗑️', display_order: 8, is_active: true },
      { category_id: categoryMap.get('Gardening & Landscaping'), name: 'Irrigation Systems', slug: 'irrigation-systems', icon_name: 'Droplet', icon_emoji: '💧', display_order: 9, is_active: true },
      
      // Cleaning - 8 subcategories
      { category_id: categoryMap.get('Cleaning'), name: 'House Cleaning', slug: 'house-cleaning', icon_name: 'Sparkles', icon_emoji: '✨', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Cleaning'), name: 'Commercial Cleaning', slug: 'commercial-cleaning', icon_name: 'Building', icon_emoji: '🏢', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Cleaning'), name: 'Deep Cleaning', slug: 'deep-cleaning', icon_name: 'Sparkles', icon_emoji: '✨', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Cleaning'), name: 'End of Tenancy', slug: 'end-of-tenancy', icon_name: 'Home', icon_emoji: '🏠', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Cleaning'), name: 'Carpet Cleaning', slug: 'carpet-cleaning', icon_name: 'Sparkles', icon_emoji: '🧹', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Cleaning'), name: 'Window Cleaning', slug: 'window-cleaning', icon_name: 'Sparkles', icon_emoji: '🪟', display_order: 6, is_active: true },
      { category_id: categoryMap.get('Cleaning'), name: 'Oven Cleaning', slug: 'oven-cleaning', icon_name: 'Sparkles', icon_emoji: '🔥', display_order: 7, is_active: true },
      { category_id: categoryMap.get('Cleaning'), name: 'Pressure Washing', slug: 'pressure-washing', icon_name: 'Droplet', icon_emoji: '💦', display_order: 8, is_active: true },
      
      // Pool & Spa - 6 subcategories
      { category_id: categoryMap.get('Pool & Spa'), name: 'Pool Maintenance', slug: 'pool-maintenance', icon_name: 'Waves', icon_emoji: '🌊', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Pool & Spa'), name: 'Pool Installation', slug: 'pool-installation', icon_name: 'Waves', icon_emoji: '🏊', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Pool & Spa'), name: 'Pool Repair', slug: 'pool-repair', icon_name: 'Wrench', icon_emoji: '🔧', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Pool & Spa'), name: 'Spa Services', slug: 'spa-services', icon_name: 'Waves', icon_emoji: '♨️', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Pool & Spa'), name: 'Pool Heating', slug: 'pool-heating', icon_name: 'Zap', icon_emoji: '🔥', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Pool & Spa'), name: 'Pool Equipment', slug: 'pool-equipment', icon_name: 'Wrench', icon_emoji: '⚙️', display_order: 6, is_active: true },
      
      // Architects & Design - 6 subcategories
      { category_id: categoryMap.get('Architects & Design'), name: 'Residential Architects', slug: 'residential-architects', icon_name: 'Ruler', icon_emoji: '🏠', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Architects & Design'), name: 'Interior Design', slug: 'interior-design', icon_name: 'Paintbrush', icon_emoji: '🎨', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Architects & Design'), name: 'Structural Engineers', slug: 'structural-engineers', icon_name: 'HardHat', icon_emoji: '⚙️', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Architects & Design'), name: 'Building Surveyors', slug: 'building-surveyors', icon_name: 'Ruler', icon_emoji: '📐', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Architects & Design'), name: '3D Visualization', slug: '3d-visualization', icon_name: 'Layers', icon_emoji: '🖼️', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Architects & Design'), name: 'Planning Consultants', slug: 'planning-consultants', icon_name: 'FileText', icon_emoji: '📋', display_order: 6, is_active: true },
      
      // Kitchen & Bathroom - 7 subcategories
      { category_id: categoryMap.get('Kitchen & Bathroom'), name: 'Kitchen Installation', slug: 'kitchen-installation', icon_name: 'Bath', icon_emoji: '🍽️', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Kitchen & Bathroom'), name: 'Bathroom Fitting', slug: 'bathroom-fitting', icon_name: 'Bath', icon_emoji: '🚿', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Kitchen & Bathroom'), name: 'Kitchen Design', slug: 'kitchen-design', icon_name: 'Ruler', icon_emoji: '📐', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Kitchen & Bathroom'), name: 'Bathroom Design', slug: 'bathroom-design', icon_name: 'Ruler', icon_emoji: '📐', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Kitchen & Bathroom'), name: 'Wetrooms', slug: 'wetrooms', icon_name: 'Droplet', icon_emoji: '💧', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Kitchen & Bathroom'), name: 'Kitchen Worktops', slug: 'kitchen-worktops', icon_name: 'Square', icon_emoji: '⬜', display_order: 6, is_active: true },
      { category_id: categoryMap.get('Kitchen & Bathroom'), name: 'Tiling', slug: 'kitchen-bathroom-tiling', icon_name: 'Layers', icon_emoji: '⬜', display_order: 7, is_active: true },
      
      // Floors, Doors & Windows - 8 subcategories
      { category_id: categoryMap.get('Floors, Doors & Windows'), name: 'Flooring Installation', slug: 'flooring-installation', icon_name: 'Layers', icon_emoji: '📏', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Floors, Doors & Windows'), name: 'Laminate Flooring', slug: 'laminate-flooring', icon_name: 'Layers', icon_emoji: '📏', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Floors, Doors & Windows'), name: 'Hardwood Flooring', slug: 'hardwood-flooring', icon_name: 'Layers', icon_emoji: '🪵', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Floors, Doors & Windows'), name: 'Door Installation', slug: 'door-installation', icon_name: 'DoorOpen', icon_emoji: '🚪', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Floors, Doors & Windows'), name: 'Window Installation', slug: 'window-installation', icon_name: 'Square', icon_emoji: '🪟', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Floors, Doors & Windows'), name: 'Double Glazing', slug: 'double-glazing', icon_name: 'Square', icon_emoji: '🪟', display_order: 6, is_active: true },
      { category_id: categoryMap.get('Floors, Doors & Windows'), name: 'Floor Sanding', slug: 'floor-sanding', icon_name: 'Layers', icon_emoji: '🪵', display_order: 7, is_active: true },
      { category_id: categoryMap.get('Floors, Doors & Windows'), name: 'Garage Doors', slug: 'garage-doors', icon_name: 'DoorOpen', icon_emoji: '🚪', display_order: 8, is_active: true },
      
      // Handyman & General Services - 6 subcategories
      { category_id: categoryMap.get('Handyman & General Services'), name: 'General Repairs', slug: 'general-repairs', icon_name: 'Wrench', icon_emoji: '🔧', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Handyman & General Services'), name: 'Furniture Assembly', slug: 'furniture-assembly', icon_name: 'Wrench', icon_emoji: '🪑', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Handyman & General Services'), name: 'TV Mounting', slug: 'tv-mounting', icon_name: 'Wrench', icon_emoji: '📺', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Handyman & General Services'), name: 'Picture Hanging', slug: 'picture-hanging', icon_name: 'Wrench', icon_emoji: '🖼️', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Handyman & General Services'), name: 'Property Maintenance', slug: 'property-maintenance', icon_name: 'Home', icon_emoji: '🏠', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Handyman & General Services'), name: 'Multi-Trade', slug: 'multi-trade', icon_name: 'Wrench', icon_emoji: '🔧', display_order: 6, is_active: true },
      
      // Commercial & Industrial - 6 subcategories
      { category_id: categoryMap.get('Commercial & Industrial'), name: 'Office Fit-outs', slug: 'office-fitouts', icon_name: 'Building', icon_emoji: '🏢', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Commercial & Industrial'), name: 'Retail Spaces', slug: 'retail-spaces', icon_name: 'Building', icon_emoji: '🏪', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Commercial & Industrial'), name: 'Industrial Projects', slug: 'industrial-projects', icon_name: 'Building', icon_emoji: '🏭', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Commercial & Industrial'), name: 'Warehouses', slug: 'warehouses', icon_name: 'Building', icon_emoji: '📦', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Commercial & Industrial'), name: 'Restaurant Fit-outs', slug: 'restaurant-fitouts', icon_name: 'Building', icon_emoji: '🍽️', display_order: 5, is_active: true },
      { category_id: categoryMap.get('Commercial & Industrial'), name: 'Facilities Management', slug: 'facilities-management', icon_name: 'Building', icon_emoji: '⚙️', display_order: 6, is_active: true },
      
      // Legal & Regulatory - 5 subcategories
      { category_id: categoryMap.get('Legal & Regulatory'), name: 'Building Permits', slug: 'building-permits', icon_name: 'FileText', icon_emoji: '📋', display_order: 1, is_active: true },
      { category_id: categoryMap.get('Legal & Regulatory'), name: 'Planning Applications', slug: 'planning-applications', icon_name: 'FileText', icon_emoji: '📋', display_order: 2, is_active: true },
      { category_id: categoryMap.get('Legal & Regulatory'), name: 'Building Regulations', slug: 'building-regulations', icon_name: 'FileText', icon_emoji: '📜', display_order: 3, is_active: true },
      { category_id: categoryMap.get('Legal & Regulatory'), name: 'Party Wall Agreements', slug: 'party-wall-agreements', icon_name: 'FileText', icon_emoji: '🏘️', display_order: 4, is_active: true },
      { category_id: categoryMap.get('Legal & Regulatory'), name: 'Building Inspections', slug: 'building-inspections', icon_name: 'FileText', icon_emoji: '🔍', display_order: 5, is_active: true }
    ]

    const { error: subError, data: insertedSubcategories } = await supabase
      .from('service_subcategories')
      .upsert(subcategories.filter(s => s.category_id), { onConflict: 'category_id,slug' })
      .select('id, name, slug, category_id')

    if (subError) throw new Error(`Subcategory insert failed: ${subError.message}`)
    console.log(`✅ Inserted ${insertedSubcategories?.length || 0} subcategories`)

    const subcategoryMap = new Map(insertedSubcategories?.map(s => [s.slug, s.id]) || [])

    // Step 3: Populate Microservices (existing + new ones for specialist categories)
    const microservices = [
      // Plumbing microservices (existing)
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
      
      // Electrical microservices (existing)
      { subcategory_id: subcategoryMap.get('general-electrical'), name: 'Outlet Installation', slug: 'outlet-installation', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('general-electrical'), name: 'Switch Repair', slug: 'switch-repair', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('general-electrical'), name: 'Circuit Breaker Repair', slug: 'circuit-breaker-repair', display_order: 3, is_active: true },
      { subcategory_id: subcategoryMap.get('general-electrical'), name: 'Wiring Upgrade', slug: 'wiring-upgrade', display_order: 4, is_active: true },
      { subcategory_id: subcategoryMap.get('lighting'), name: 'Light Fixture Installation', slug: 'light-fixture-installation', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('lighting'), name: 'Outdoor Lighting', slug: 'outdoor-lighting', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('lighting'), name: 'LED Upgrade', slug: 'led-upgrade', display_order: 3, is_active: true },
      
      // Pool & Spa microservices (existing)
      { subcategory_id: subcategoryMap.get('pool-maintenance'), name: 'Pool Cleaning', slug: 'pool-cleaning', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('pool-maintenance'), name: 'Chemical Balance', slug: 'chemical-balance', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('pool-equipment'), name: 'Pump Repair', slug: 'pump-repair', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('pool-equipment'), name: 'Filter Replacement', slug: 'filter-replacement', display_order: 2, is_active: true },
      
      // Cleaning microservices (existing)
      { subcategory_id: subcategoryMap.get('house-cleaning'), name: 'Standard Cleaning', slug: 'standard-cleaning', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('house-cleaning'), name: 'Move-in/Move-out', slug: 'move-in-move-out', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('deep-cleaning'), name: 'Deep Kitchen Clean', slug: 'deep-kitchen-clean', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('deep-cleaning'), name: 'Deep Bathroom Clean', slug: 'deep-bathroom-clean', display_order: 2, is_active: true },
      
      // Construction microservices (existing + expanded)
      { subcategory_id: subcategoryMap.get('general-construction'), name: 'Wall Repair', slug: 'wall-repair', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('general-construction'), name: 'Ceiling Repair', slug: 'ceiling-repair', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('carpentry'), name: 'Cabinet Installation', slug: 'cabinet-installation', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('carpentry'), name: 'Door Installation', slug: 'door-installation-carpentry', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('roofing'), name: 'Roof Repair', slug: 'roof-repair', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('roofing'), name: 'Gutter Installation', slug: 'gutter-installation', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('tiling'), name: 'Floor Tiling', slug: 'floor-tiling', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('tiling'), name: 'Wall Tiling', slug: 'wall-tiling', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('plastering'), name: 'Wall Plastering', slug: 'wall-plastering', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('plastering'), name: 'Ceiling Plastering', slug: 'ceiling-plastering', display_order: 2, is_active: true },
      
      // Gardening microservices (existing)
      { subcategory_id: subcategoryMap.get('lawn-care'), name: 'Lawn Mowing', slug: 'lawn-mowing', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('lawn-care'), name: 'Fertilization', slug: 'fertilization', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('landscaping'), name: 'Garden Design', slug: 'garden-design', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('tree-services'), name: 'Tree Trimming', slug: 'tree-trimming', display_order: 1, is_active: true },
      
      // HVAC microservices (existing)
      { subcategory_id: subcategoryMap.get('ac-repair'), name: 'AC Maintenance', slug: 'ac-maintenance', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('ac-repair'), name: 'AC Installation', slug: 'ac-installation', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('heating'), name: 'Heater Repair', slug: 'heater-repair', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('heating'), name: 'Heater Installation', slug: 'heater-installation', display_order: 2, is_active: true },
      
      // Painting microservices (existing)
      { subcategory_id: subcategoryMap.get('interior-painting'), name: 'Room Painting', slug: 'room-painting', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('interior-painting'), name: 'Cabinet Painting', slug: 'cabinet-painting', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('exterior-painting'), name: 'House Exterior', slug: 'house-exterior', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('exterior-painting'), name: 'Fence Painting', slug: 'fence-painting', display_order: 2, is_active: true },
      
      // NEW: Architects & Design microservices
      { subcategory_id: subcategoryMap.get('residential-architects'), name: 'House Extension Plans', slug: 'house-extension-plans', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('residential-architects'), name: 'Planning Drawings', slug: 'planning-drawings', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('interior-design'), name: '3D Visualization', slug: '3d-visualization', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('interior-design'), name: 'Space Planning', slug: 'space-planning', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('structural-engineers'), name: 'Structural Calculations', slug: 'structural-calculations', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('structural-engineers'), name: 'Load Assessment', slug: 'load-assessment', display_order: 2, is_active: true },
      
      // NEW: Kitchen & Bathroom microservices
      { subcategory_id: subcategoryMap.get('kitchen-installation'), name: 'Full Kitchen Fit', slug: 'full-kitchen-fit', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('kitchen-installation'), name: 'Worktop Installation', slug: 'worktop-installation', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('bathroom-fitting'), name: 'Full Bathroom Fit', slug: 'full-bathroom-fit', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('bathroom-fitting'), name: 'Wetroom Installation', slug: 'wetroom-installation', display_order: 2, is_active: true },
      
      // NEW: Floors, Doors & Windows microservices
      { subcategory_id: subcategoryMap.get('flooring'), name: 'Hardwood Flooring', slug: 'hardwood-flooring', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('flooring'), name: 'Vinyl Flooring', slug: 'vinyl-flooring', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('door-installation'), name: 'Interior Doors', slug: 'interior-doors', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('door-installation'), name: 'Exterior Doors', slug: 'exterior-doors', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('window-fitting'), name: 'Double Glazing', slug: 'double-glazing', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('window-fitting'), name: 'Window Replacement', slug: 'window-replacement', display_order: 2, is_active: true },
      
      // NEW: Handyman microservices
      { subcategory_id: subcategoryMap.get('general-repairs'), name: 'Picture Hanging', slug: 'picture-hanging', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('general-repairs'), name: 'Small Repairs', slug: 'small-repairs', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('furniture-assembly'), name: 'Flat-Pack Assembly', slug: 'flat-pack-assembly', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('furniture-assembly'), name: 'Furniture Installation', slug: 'furniture-installation', display_order: 2, is_active: true },
      
      // NEW: Commercial & Industrial microservices
      { subcategory_id: subcategoryMap.get('office-fitouts'), name: 'Office Partitions', slug: 'office-partitions', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('office-fitouts'), name: 'Office Renovation', slug: 'office-renovation', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('retail-spaces'), name: 'Shop Fitting', slug: 'shop-fitting', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('retail-spaces'), name: 'Retail Display', slug: 'retail-display', display_order: 2, is_active: true },
      
      // NEW: Legal & Regulatory microservices
      { subcategory_id: subcategoryMap.get('building-permits'), name: 'Building Control Application', slug: 'building-control-application', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('building-permits'), name: 'Town Hall Permits', slug: 'town-hall-permits', display_order: 2, is_active: true },
      { subcategory_id: subcategoryMap.get('planning-applications'), name: 'Planning Permission', slug: 'planning-permission', display_order: 1, is_active: true },
      { subcategory_id: subcategoryMap.get('planning-applications'), name: 'Change of Use', slug: 'change-of-use', display_order: 2, is_active: true }
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
        message: 'Service taxonomy populated successfully with 14 categories',
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