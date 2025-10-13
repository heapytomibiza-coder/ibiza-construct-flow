import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MicroCategory {
  subcategory_id: string
  name_en: string
  name_es: string
  typical_duration_hours: number
  ibiza_priority?: boolean
  icon?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current counts
    const { data: counts } = await supabase.rpc('get_taxonomy_counts')
    console.log('Current counts:', counts)

    // Get all subcategories to map names to IDs
    const { data: subcategories } = await supabase
      .from('service_subcategories')
      .select('id, name_en, category_id, service_categories(name_en)')
      .eq('is_active', true)

    if (!subcategories) {
      throw new Error('Could not fetch subcategories')
    }

    const subMap = new Map(subcategories.map(s => [`${s.service_categories?.name_en}|${s.name_en}`, s.id]))

    // Define the additional 169 micro-categories needed
    const newMicros: MicroCategory[] = [
      // Pool Maintenance & Care (30 total - adding ~15 more)
      { subcategory_id: subMap.get('Pool & Spa|Pool Maintenance')!, name_en: 'Pool pH Level Testing', name_es: 'Prueba de pH de Piscina', typical_duration_hours: 0.5, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Pool Maintenance')!, name_en: 'Pool Chemical Balancing', name_es: 'Equilibrio Químico de Piscina', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Pool Maintenance')!, name_en: 'Pool Tile Cleaning', name_es: 'Limpieza de Azulejos de Piscina', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Pool Maintenance')!, name_en: 'Pool Algae Treatment', name_es: 'Tratamiento de Algas de Piscina', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Pool Maintenance')!, name_en: 'Pool Winterization', name_es: 'Preparación de Piscina para Invierno', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Pool Equipment')!, name_en: 'Pool Heater Installation', name_es: 'Instalación de Calentador de Piscina', typical_duration_hours: 6, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Pool Equipment')!, name_en: 'Pool Cover Installation', name_es: 'Instalación de Cubierta de Piscina', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Pool Equipment')!, name_en: 'Automatic Pool Cleaner Setup', name_es: 'Configuración de Limpiador Automático', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Pool Equipment')!, name_en: 'Pool Light Installation', name_es: 'Instalación de Luz de Piscina', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Spa Services')!, name_en: 'Hot Tub Water Change', name_es: 'Cambio de Agua de Jacuzzi', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Spa Services')!, name_en: 'Spa Jet Repair', name_es: 'Reparación de Jets de Spa', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Spa Services')!, name_en: 'Spa Cover Replacement', name_es: 'Reemplazo de Cubierta de Spa', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Water Features')!, name_en: 'Fountain Installation', name_es: 'Instalación de Fuente', typical_duration_hours: 8, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Water Features')!, name_en: 'Waterfall Maintenance', name_es: 'Mantenimiento de Cascada', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Pool & Spa|Water Features')!, name_en: 'Pond Pump Repair', name_es: 'Reparación de Bomba de Estanque', typical_duration_hours: 2, ibiza_priority: true },

      // HVAC & Climate Control (25 total - adding ~12 more)
      { subcategory_id: subMap.get('HVAC & Climate Control|Air Conditioning')!, name_en: 'AC Refrigerant Recharge', name_es: 'Recarga de Refrigerante AC', typical_duration_hours: 1.5, ibiza_priority: true },
      { subcategory_id: subMap.get('HVAC & Climate Control|Air Conditioning')!, name_en: 'AC Coil Cleaning', name_es: 'Limpieza de Bobinas AC', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('HVAC & Climate Control|Air Conditioning')!, name_en: 'Central AC Installation', name_es: 'Instalación de AC Central', typical_duration_hours: 16, ibiza_priority: true },
      { subcategory_id: subMap.get('HVAC & Climate Control|Air Conditioning')!, name_en: 'Ductless Mini-Split Installation', name_es: 'Instalación Mini-Split Sin Conductos', typical_duration_hours: 8, ibiza_priority: true },
      { subcategory_id: subMap.get('HVAC & Climate Control|Air Conditioning')!, name_en: 'AC Thermostat Replacement', name_es: 'Reemplazo de Termostato AC', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('HVAC & Climate Control|Heating Systems')!, name_en: 'Boiler Service', name_es: 'Servicio de Caldera', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('HVAC & Climate Control|Heating Systems')!, name_en: 'Radiator Bleeding', name_es: 'Purga de Radiador', typical_duration_hours: 0.5, ibiza_priority: true },
      { subcategory_id: subMap.get('HVAC & Climate Control|Heating Systems')!, name_en: 'Underfloor Heating Repair', name_es: 'Reparación de Calefacción por Suelo Radiante', typical_duration_hours: 6, ibiza_priority: true },
      { subcategory_id: subMap.get('HVAC & Climate Control|Ventilation')!, name_en: 'Exhaust Fan Installation', name_es: 'Instalación de Ventilador de Extracción', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('HVAC & Climate Control|Ventilation')!, name_en: 'Ductwork Sealing', name_es: 'Sellado de Conductos', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('HVAC & Climate Control|Ventilation')!, name_en: 'Whole-House Fan Installation', name_es: 'Instalación de Ventilador para Toda la Casa', typical_duration_hours: 6, ibiza_priority: true },
      { subcategory_id: subMap.get('HVAC & Climate Control|Energy Efficiency')!, name_en: 'HVAC Energy Audit', name_es: 'Auditoría Energética HVAC', typical_duration_hours: 3, ibiza_priority: true },

      // Plumbing & Water Systems (25 total - adding ~12 more)
      { subcategory_id: subMap.get('Plumbing & Water Systems|General Plumbing')!, name_en: 'Pipe Leak Detection', name_es: 'Detección de Fugas en Tuberías', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Plumbing & Water Systems|General Plumbing')!, name_en: 'Pipe Insulation', name_es: 'Aislamiento de Tuberías', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Plumbing & Water Systems|General Plumbing')!, name_en: 'Sump Pump Installation', name_es: 'Instalación de Bomba de Sumidero', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Plumbing & Water Systems|General Plumbing')!, name_en: 'Backflow Prevention Device Installation', name_es: 'Instalación de Dispositivo de Prevención de Reflujo', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Plumbing & Water Systems|Drainage')!, name_en: 'Septic Tank Pumping', name_es: 'Bombeo de Fosa Séptica', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Plumbing & Water Systems|Drainage')!, name_en: 'French Drain Installation', name_es: 'Instalación de Drenaje Francés', typical_duration_hours: 8, ibiza_priority: true },
      { subcategory_id: subMap.get('Plumbing & Water Systems|Drainage')!, name_en: 'Catch Basin Cleaning', name_es: 'Limpieza de Sumidero', typical_duration_hours: 1.5, ibiza_priority: true },
      { subcategory_id: subMap.get('Plumbing & Water Systems|Water Heaters')!, name_en: 'Tankless Water Heater Installation', name_es: 'Instalación de Calentador de Agua Sin Tanque', typical_duration_hours: 6, ibiza_priority: true },
      { subcategory_id: subMap.get('Plumbing & Water Systems|Water Heaters')!, name_en: 'Water Heater Anode Rod Replacement', name_es: 'Reemplazo de Ánodo de Calentador de Agua', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Plumbing & Water Systems|Fixtures')!, name_en: 'Bidet Installation', name_es: 'Instalación de Bidé', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Plumbing & Water Systems|Fixtures')!, name_en: 'Shower Door Installation', name_es: 'Instalación de Mampara de Ducha', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Plumbing & Water Systems|Water Treatment')!, name_en: 'Water Pressure Regulator Installation', name_es: 'Instalación de Regulador de Presión de Agua', typical_duration_hours: 2, ibiza_priority: true },

      // Electrical & Lighting (25 total - adding ~12 more)
      { subcategory_id: subMap.get('Electrical & Lighting|Electrical Services')!, name_en: 'Circuit Breaker Replacement', name_es: 'Reemplazo de Interruptor Automático', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Electrical & Lighting|Electrical Services')!, name_en: 'GFCI Outlet Installation', name_es: 'Instalación de Enchufe GFCI', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Electrical & Lighting|Electrical Services')!, name_en: 'Electrical Panel Upgrade', name_es: 'Actualización de Panel Eléctrico', typical_duration_hours: 8, ibiza_priority: true },
      { subcategory_id: subMap.get('Electrical & Lighting|Electrical Services')!, name_en: 'Whole-House Surge Protection', name_es: 'Protección contra Sobretensiones para Toda la Casa', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Electrical & Lighting|Electrical Services')!, name_en: 'Generator Installation', name_es: 'Instalación de Generador', typical_duration_hours: 12, ibiza_priority: true },
      { subcategory_id: subMap.get('Electrical & Lighting|Lighting')!, name_en: 'Chandelier Installation', name_es: 'Instalación de Lámpara de Araña', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Electrical & Lighting|Lighting')!, name_en: 'Track Lighting Installation', name_es: 'Instalación de Iluminación de Riel', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Electrical & Lighting|Lighting')!, name_en: 'Motion Sensor Light Installation', name_es: 'Instalación de Luz con Sensor de Movimiento', typical_duration_hours: 1.5, ibiza_priority: true },
      { subcategory_id: subMap.get('Electrical & Lighting|Lighting')!, name_en: 'Under-Cabinet Lighting', name_es: 'Iluminación Bajo Gabinete', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Electrical & Lighting|Solar Power')!, name_en: 'Solar Battery Storage Installation', name_es: 'Instalación de Almacenamiento de Batería Solar', typical_duration_hours: 8, ibiza_priority: true },
      { subcategory_id: subMap.get('Electrical & Lighting|Solar Power')!, name_en: 'Solar Inverter Replacement', name_es: 'Reemplazo de Inversor Solar', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Electrical & Lighting|EV Charging')!, name_en: 'Level 2 EV Charger Installation', name_es: 'Instalación de Cargador EV Nivel 2', typical_duration_hours: 4, ibiza_priority: true },

      // Garden & Landscaping (20 total - adding ~10 more)
      { subcategory_id: subMap.get('Garden & Landscaping|Garden Maintenance')!, name_en: 'Hedge Trimming', name_es: 'Recorte de Setos', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Garden & Landscaping|Garden Maintenance')!, name_en: 'Mulching Service', name_es: 'Servicio de Acolchado', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Garden & Landscaping|Garden Maintenance')!, name_en: 'Fertilization Service', name_es: 'Servicio de Fertilización', typical_duration_hours: 1.5, ibiza_priority: true },
      { subcategory_id: subMap.get('Garden & Landscaping|Irrigation')!, name_en: 'Irrigation System Winterization', name_es: 'Preparación de Sistema de Riego para Invierno', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Garden & Landscaping|Irrigation')!, name_en: 'Sprinkler Head Replacement', name_es: 'Reemplazo de Cabezal de Rociador', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Garden & Landscaping|Landscaping')!, name_en: 'Retaining Wall Installation', name_es: 'Instalación de Muro de Contención', typical_duration_hours: 16, ibiza_priority: true },
      { subcategory_id: subMap.get('Garden & Landscaping|Landscaping')!, name_en: 'Paver Patio Installation', name_es: 'Instalación de Patio con Adoquines', typical_duration_hours: 24, ibiza_priority: true },
      { subcategory_id: subMap.get('Garden & Landscaping|Landscaping')!, name_en: 'Garden Edging Installation', name_es: 'Instalación de Borde de Jardín', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Garden & Landscaping|Tree Services')!, name_en: 'Stump Grinding', name_es: 'Trituración de Tocón', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Garden & Landscaping|Tree Services')!, name_en: 'Tree Cabling & Bracing', name_es: 'Cableado y Refuerzo de Árbol', typical_duration_hours: 4, ibiza_priority: true },

      // Cleaning Services (20 total - adding ~10 more)
      { subcategory_id: subMap.get('Cleaning Services|House Cleaning')!, name_en: 'Move-In/Move-Out Cleaning', name_es: 'Limpieza de Mudanza', typical_duration_hours: 6, ibiza_priority: true },
      { subcategory_id: subMap.get('Cleaning Services|House Cleaning')!, name_en: 'Post-Construction Cleaning', name_es: 'Limpieza Post-Construcción', typical_duration_hours: 8, ibiza_priority: true },
      { subcategory_id: subMap.get('Cleaning Services|House Cleaning')!, name_en: 'Eco-Friendly Cleaning', name_es: 'Limpieza Ecológica', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Cleaning Services|Deep Cleaning')!, name_en: 'Oven Deep Cleaning', name_es: 'Limpieza Profunda de Horno', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Cleaning Services|Deep Cleaning')!, name_en: 'Refrigerator Deep Cleaning', name_es: 'Limpieza Profunda de Refrigerador', typical_duration_hours: 1.5, ibiza_priority: true },
      { subcategory_id: subMap.get('Cleaning Services|Deep Cleaning')!, name_en: 'Grout Cleaning', name_es: 'Limpieza de Lechada', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Cleaning Services|Specialized Cleaning')!, name_en: 'Chandelier Cleaning', name_es: 'Limpieza de Lámpara de Araña', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Cleaning Services|Specialized Cleaning')!, name_en: 'Pressure Washing Driveway', name_es: 'Lavado a Presión de Entrada', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Cleaning Services|Laundry Services')!, name_en: 'Dry Cleaning Pickup & Delivery', name_es: 'Recogida y Entrega de Tintorería', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Cleaning Services|Laundry Services')!, name_en: 'Bedding & Linens Cleaning', name_es: 'Limpieza de Ropa de Cama', typical_duration_hours: 2, ibiza_priority: true },

      // Smart Home & Technology (18 total - adding ~8 more)
      { subcategory_id: subMap.get('Smart Home & Technology|Smart Home Setup')!, name_en: 'Smart Doorbell Installation', name_es: 'Instalación de Timbre Inteligente', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Smart Home & Technology|Smart Home Setup')!, name_en: 'Smart Lock Installation', name_es: 'Instalación de Cerradura Inteligente', typical_duration_hours: 1.5, ibiza_priority: true },
      { subcategory_id: subMap.get('Smart Home & Technology|Smart Home Setup')!, name_en: 'Smart Blinds Installation', name_es: 'Instalación de Persianas Inteligentes', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Smart Home & Technology|Security Systems')!, name_en: 'Doorbell Camera Installation', name_es: 'Instalación de Cámara de Timbre', typical_duration_hours: 1.5, ibiza_priority: true },
      { subcategory_id: subMap.get('Smart Home & Technology|Security Systems')!, name_en: 'Motion Detector Installation', name_es: 'Instalación de Detector de Movimiento', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Smart Home & Technology|Home Theater')!, name_en: 'Surround Sound Installation', name_es: 'Instalación de Sonido Envolvente', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Smart Home & Technology|Home Theater')!, name_en: 'TV Wall Mounting', name_es: 'Montaje de TV en Pared', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Smart Home & Technology|Network & WiFi')!, name_en: 'Mesh WiFi System Installation', name_es: 'Instalación de Sistema WiFi Mesh', typical_duration_hours: 2, ibiza_priority: true },

      // Pest Control (15 total - adding ~7 more)
      { subcategory_id: subMap.get('Pest Control|General Pest Control')!, name_en: 'Ant Control', name_es: 'Control de Hormigas', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Pest Control|General Pest Control')!, name_en: 'Spider Control', name_es: 'Control de Arañas', typical_duration_hours: 1.5, ibiza_priority: true },
      { subcategory_id: subMap.get('Pest Control|General Pest Control')!, name_en: 'Cockroach Extermination', name_es: 'Exterminación de Cucarachas', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Pest Control|Termite Control')!, name_en: 'Termite Soil Treatment', name_es: 'Tratamiento de Suelo contra Termitas', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Pest Control|Termite Control')!, name_en: 'Termite Bait Station Installation', name_es: 'Instalación de Estación de Cebo para Termitas', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Pest Control|Rodent Control')!, name_en: 'Rat Trapping', name_es: 'Captura de Ratas', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Pest Control|Wildlife Control')!, name_en: 'Bird Netting Installation', name_es: 'Instalación de Red para Pájaros', typical_duration_hours: 4, ibiza_priority: true },

      // Home Maintenance & Repair (remaining categories - adding ~70 more across all other categories)
      { subcategory_id: subMap.get('Home Maintenance & Repair|General Maintenance')!, name_en: 'Gutter Guard Installation', name_es: 'Instalación de Protector de Canalón', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Home Maintenance & Repair|General Maintenance')!, name_en: 'Weatherstripping Installation', name_es: 'Instalación de Burlete', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Home Maintenance & Repair|General Maintenance')!, name_en: 'Caulking Service', name_es: 'Servicio de Sellado', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Home Maintenance & Repair|Appliance Repair')!, name_en: 'Refrigerator Repair', name_es: 'Reparación de Refrigerador', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Home Maintenance & Repair|Appliance Repair')!, name_en: 'Washing Machine Repair', name_es: 'Reparación de Lavadora', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Home Maintenance & Repair|Appliance Repair')!, name_en: 'Dryer Vent Cleaning', name_es: 'Limpieza de Ventilación de Secadora', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Home Maintenance & Repair|Handyman Services')!, name_en: 'Door Lock Repair', name_es: 'Reparación de Cerradura de Puerta', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Home Maintenance & Repair|Handyman Services')!, name_en: 'Cabinet Hinge Repair', name_es: 'Reparación de Bisagra de Gabinete', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Home Maintenance & Repair|Handyman Services')!, name_en: 'Picture Hanging', name_es: 'Colgado de Cuadros', typical_duration_hours: 0.5, ibiza_priority: true },

      // Carpentry & Woodwork
      { subcategory_id: subMap.get('Carpentry & Woodwork|Custom Carpentry')!, name_en: 'Built-In Shelving', name_es: 'Estanterías Empotradas', typical_duration_hours: 8, ibiza_priority: true },
      { subcategory_id: subMap.get('Carpentry & Woodwork|Custom Carpentry')!, name_en: 'Custom Closet Build', name_es: 'Construcción de Armario Personalizado', typical_duration_hours: 16, ibiza_priority: true },
      { subcategory_id: subMap.get('Carpentry & Woodwork|Cabinetry')!, name_en: 'Cabinet Refinishing', name_es: 'Refinamiento de Gabinetes', typical_duration_hours: 12, ibiza_priority: true },
      { subcategory_id: subMap.get('Carpentry & Woodwork|Cabinetry')!, name_en: 'Cabinet Hardware Installation', name_es: 'Instalación de Herrajes de Gabinete', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Carpentry & Woodwork|Flooring')!, name_en: 'Hardwood Floor Refinishing', name_es: 'Refinamiento de Piso de Madera', typical_duration_hours: 16, ibiza_priority: true },
      { subcategory_id: subMap.get('Carpentry & Woodwork|Flooring')!, name_en: 'Laminate Flooring Installation', name_es: 'Instalación de Piso Laminado', typical_duration_hours: 12, ibiza_priority: true },
      
      // Painting & Decorating
      { subcategory_id: subMap.get('Painting & Decorating|Interior Painting')!, name_en: 'Ceiling Painting', name_es: 'Pintura de Techo', typical_duration_hours: 6, ibiza_priority: true },
      { subcategory_id: subMap.get('Painting & Decorating|Interior Painting')!, name_en: 'Trim & Baseboard Painting', name_es: 'Pintura de Molduras y Zócalos', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Painting & Decorating|Interior Painting')!, name_en: 'Cabinet Painting', name_es: 'Pintura de Gabinetes', typical_duration_hours: 12, ibiza_priority: true },
      { subcategory_id: subMap.get('Painting & Decorating|Exterior Painting')!, name_en: 'Fence Painting', name_es: 'Pintura de Cerca', typical_duration_hours: 8, ibiza_priority: true },
      { subcategory_id: subMap.get('Painting & Decorating|Exterior Painting')!, name_en: 'Deck Staining', name_es: 'Teñido de Terraza', typical_duration_hours: 8, ibiza_priority: true },
      { subcategory_id: subMap.get('Painting & Decorating|Specialty Finishes')!, name_en: 'Faux Finish Painting', name_es: 'Pintura con Acabado Falso', typical_duration_hours: 8, ibiza_priority: true },

      // Roofing & Exteriors
      { subcategory_id: subMap.get('Roofing & Exteriors|Roof Repair')!, name_en: 'Flat Roof Repair', name_es: 'Reparación de Techo Plano', typical_duration_hours: 6, ibiza_priority: true },
      { subcategory_id: subMap.get('Roofing & Exteriors|Roof Repair')!, name_en: 'Skylight Repair', name_es: 'Reparación de Tragaluz', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Roofing & Exteriors|Roof Repair')!, name_en: 'Chimney Flashing Repair', name_es: 'Reparación de Tapajuntas de Chimenea', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Roofing & Exteriors|Gutter Services')!, name_en: 'Downspout Installation', name_es: 'Instalación de Bajante', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Roofing & Exteriors|Gutter Services')!, name_en: 'Rain Barrel Installation', name_es: 'Instalación de Barril de Lluvia', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Roofing & Exteriors|Siding')!, name_en: 'Vinyl Siding Repair', name_es: 'Reparación de Revestimiento de Vinilo', typical_duration_hours: 4, ibiza_priority: true },

      // Windows & Doors
      { subcategory_id: subMap.get('Windows & Doors|Window Services')!, name_en: 'Storm Window Installation', name_es: 'Instalación de Ventana de Tormenta', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Windows & Doors|Window Services')!, name_en: 'Window Well Installation', name_es: 'Instalación de Pozo de Ventana', typical_duration_hours: 6, ibiza_priority: true },
      { subcategory_id: subMap.get('Windows & Doors|Door Services')!, name_en: 'Storm Door Installation', name_es: 'Instalación de Puerta de Tormenta', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Windows & Doors|Door Services')!, name_en: 'Sliding Glass Door Repair', name_es: 'Reparación de Puerta de Vidrio Corrediza', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Windows & Doors|Glass Services')!, name_en: 'Shower Door Replacement', name_es: 'Reemplazo de Puerta de Ducha', typical_duration_hours: 3, ibiza_priority: true },

      // Flooring & Tiling
      { subcategory_id: subMap.get('Flooring & Tiling|Tile Installation')!, name_en: 'Mosaic Tile Installation', name_es: 'Instalación de Azulejos de Mosaico', typical_duration_hours: 12, ibiza_priority: true },
      { subcategory_id: subMap.get('Flooring & Tiling|Tile Installation')!, name_en: 'Subway Tile Backsplash', name_es: 'Salpicadero de Azulejos de Metro', typical_duration_hours: 6, ibiza_priority: true },
      { subcategory_id: subMap.get('Flooring & Tiling|Floor Installation')!, name_en: 'Cork Flooring Installation', name_es: 'Instalación de Piso de Corcho', typical_duration_hours: 12, ibiza_priority: true },
      { subcategory_id: subMap.get('Flooring & Tiling|Floor Installation')!, name_en: 'Bamboo Flooring Installation', name_es: 'Instalación de Piso de Bambú', typical_duration_hours: 12, ibiza_priority: true },

      // Interior Design
      { subcategory_id: subMap.get('Interior Design|Design Consultation')!, name_en: 'Color Consultation', name_es: 'Consulta de Color', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Interior Design|Design Consultation')!, name_en: 'Furniture Layout Planning', name_es: 'Planificación de Distribución de Muebles', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Interior Design|Window Treatments')!, name_en: 'Curtain Rod Installation', name_es: 'Instalación de Barra de Cortina', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Interior Design|Window Treatments')!, name_en: 'Roman Shade Installation', name_es: 'Instalación de Persiana Romana', typical_duration_hours: 2, ibiza_priority: true },

      // Moving & Storage
      { subcategory_id: subMap.get('Moving & Storage|Moving Services')!, name_en: 'Furniture Disassembly', name_es: 'Desmontaje de Muebles', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Moving & Storage|Moving Services')!, name_en: 'Piano Moving', name_es: 'Mudanza de Piano', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Moving & Storage|Packing Services')!, name_en: 'Fragile Items Packing', name_es: 'Embalaje de Artículos Frágiles', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Moving & Storage|Storage Solutions')!, name_en: 'Climate-Controlled Storage', name_es: 'Almacenamiento con Control de Clima', typical_duration_hours: 1, ibiza_priority: true },

      // Outdoor Living
      { subcategory_id: subMap.get('Outdoor Living|Deck & Patio')!, name_en: 'Deck Railing Installation', name_es: 'Instalación de Barandilla de Terraza', typical_duration_hours: 8, ibiza_priority: true },
      { subcategory_id: subMap.get('Outdoor Living|Deck & Patio')!, name_en: 'Pergola Installation', name_es: 'Instalación de Pérgola', typical_duration_hours: 16, ibiza_priority: true },
      { subcategory_id: subMap.get('Outdoor Living|Outdoor Kitchens')!, name_en: 'Built-In Grill Installation', name_es: 'Instalación de Parrilla Empotrada', typical_duration_hours: 8, ibiza_priority: true },
      { subcategory_id: subMap.get('Outdoor Living|Fencing')!, name_en: 'Chain Link Fence Installation', name_es: 'Instalación de Cerca de Eslabones', typical_duration_hours: 12, ibiza_priority: true },

      // Seasonal Services
      { subcategory_id: subMap.get('Seasonal Services|Winter Services')!, name_en: 'Ice Dam Removal', name_es: 'Eliminación de Represa de Hielo', typical_duration_hours: 3, ibiza_priority: true },
      { subcategory_id: subMap.get('Seasonal Services|Winter Services')!, name_en: 'Roof Snow Removal', name_es: 'Eliminación de Nieve del Techo', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Seasonal Services|Spring Services')!, name_en: 'Spring Yard Cleanup', name_es: 'Limpieza de Jardín de Primavera', typical_duration_hours: 4, ibiza_priority: true },
      { subcategory_id: subMap.get('Seasonal Services|Fall Services')!, name_en: 'Leaf Removal', name_es: 'Eliminación de Hojas', typical_duration_hours: 3, ibiza_priority: true },

      // Emergency Services
      { subcategory_id: subMap.get('Emergency Services|Emergency Plumbing')!, name_en: 'Emergency Pipe Burst Repair', name_es: 'Reparación de Emergencia de Tubería Rota', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Emergency Services|Emergency Electrical')!, name_en: 'Emergency Power Outage Service', name_es: 'Servicio de Emergencia por Corte de Energía', typical_duration_hours: 2, ibiza_priority: true },
      { subcategory_id: subMap.get('Emergency Services|Emergency Locksmith')!, name_en: 'Emergency Lock Change', name_es: 'Cambio de Cerradura de Emergencia', typical_duration_hours: 1, ibiza_priority: true },
      { subcategory_id: subMap.get('Emergency Services|Water Damage')!, name_en: 'Emergency Water Extraction', name_es: 'Extracción de Agua de Emergencia', typical_duration_hours: 4, ibiza_priority: true },
    ]

    // Filter out any that don't have valid subcategory IDs
    const validMicros = newMicros.filter(m => m.subcategory_id)

    console.log(`Attempting to insert ${validMicros.length} new micro-categories`)

    // Insert in batches to avoid timeouts
    const batchSize = 50
    let inserted = 0
    
    for (let i = 0; i < validMicros.length; i += batchSize) {
      const batch = validMicros.slice(i, i + batchSize)
      const { error } = await supabase
        .from('services_micro')
        .insert(batch.map(m => ({
          ...m,
          is_active: true,
          display_order: 0
        })))
      
      if (error) {
        console.error(`Batch ${i / batchSize + 1} error:`, error)
      } else {
        inserted += batch.length
        console.log(`Inserted batch ${i / batchSize + 1}: ${batch.length} micros`)
      }
    }

    // Get final counts
    const { data: finalCounts } = await supabase
      .from('services_micro')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        total_micros: finalCounts?.length || 0,
        message: `Successfully added ${inserted} micro-categories. Total: ${finalCounts?.length || 0}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
