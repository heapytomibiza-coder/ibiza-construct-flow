import { z } from "zod"

export const projectTypes = [
  "kitchen",
  "bathroom",
  "extension",
  "pool_outdoor",
  "terrace_decking",
  "electrical_rewire",
  "ac_installation",
  "garden_structures",
] as const
export type ProjectType = (typeof projectTypes)[number]

export type SizePreset = {
  id: string
  name: string
  min: number
  max: number
  description: string
  typicalDurationDays: { min: number; max: number }
}

export const sizePresets: Record<ProjectType, SizePreset[]> = {
  kitchen: [
    {
      id: "kitchen-small",
      name: "Compact",
      min: 6,
      max: 9,
      description: "Galley or L-shape up to 9 m²",
      typicalDurationDays: { min: 18, max: 24 },
    },
    {
      id: "kitchen-medium",
      name: "Standard",
      min: 9,
      max: 14,
      description: "Roomy family kitchen between 9-14 m²",
      typicalDurationDays: { min: 24, max: 32 },
    },
    {
      id: "kitchen-large",
      name: "Entertainer",
      min: 14,
      max: 20,
      description: "Open concept kitchen with island",
      typicalDurationDays: { min: 32, max: 42 },
    },
  ],
  bathroom: [
    {
      id: "bathroom-small",
      name: "Guest",
      min: 4,
      max: 6,
      description: "Compact shower room up to 6 m²",
      typicalDurationDays: { min: 12, max: 16 },
    },
    {
      id: "bathroom-medium",
      name: "Family",
      min: 6,
      max: 9,
      description: "Comfortable bathroom with tub",
      typicalDurationDays: { min: 16, max: 22 },
    },
    {
      id: "bathroom-large",
      name: "Spa",
      min: 9,
      max: 14,
      description: "Luxury ensuite or wellness space",
      typicalDurationDays: { min: 20, max: 28 },
    },
  ],
  extension: [
    {
      id: "extension-small",
      name: "Guest Suite",
      min: 12,
      max: 18,
      description: "Guest suite or covered terrace pavilion",
      typicalDurationDays: { min: 30, max: 40 },
    },
    {
      id: "extension-medium",
      name: "Living Pavilion",
      min: 18,
      max: 28,
      description: "Mediterranean living pavilion with indoor-outdoor flow",
      typicalDurationDays: { min: 40, max: 54 },
    },
    {
      id: "extension-large",
      name: "Multi-room Wing",
      min: 28,
      max: 45,
      description: "Multi-room wing with terrace integration",
      typicalDurationDays: { min: 54, max: 72 },
    },
  ],
  pool_outdoor: [
    {
      id: "pool-small",
      name: "Small",
      min: 15,
      max: 25,
      description: "Poolside bar or compact outdoor kitchen",
      typicalDurationDays: { min: 35, max: 50 },
    },
    {
      id: "pool-medium",
      name: "Medium",
      min: 25,
      max: 40,
      description: "Full outdoor kitchen with pool surround",
      typicalDurationDays: { min: 50, max: 65 },
    },
    {
      id: "pool-large",
      name: "Large",
      min: 40,
      max: 60,
      description: "Estate-level pool complex with BBQ zone",
      typicalDurationDays: { min: 65, max: 85 },
    },
  ],
  terrace_decking: [
    {
      id: "terrace-compact",
      name: "Compact",
      min: 12,
      max: 20,
      description: "Cozy terrace or balcony deck",
      typicalDurationDays: { min: 20, max: 28 },
    },
    {
      id: "terrace-standard",
      name: "Standard",
      min: 20,
      max: 35,
      description: "Main terrace with dining space",
      typicalDurationDays: { min: 28, max: 38 },
    },
    {
      id: "terrace-expansive",
      name: "Expansive",
      min: 35,
      max: 55,
      description: "Multi-level deck or wraparound terrace",
      typicalDurationDays: { min: 38, max: 50 },
    },
  ],
  electrical_rewire: [
    {
      id: "electrical-apartment",
      name: "Apartment",
      min: 60,
      max: 90,
      description: "2-3 bedroom apartment full rewire",
      typicalDurationDays: { min: 8, max: 14 },
    },
    {
      id: "electrical-villa",
      name: "Villa",
      min: 90,
      max: 180,
      description: "Family villa with multi-zone circuits",
      typicalDurationDays: { min: 14, max: 22 },
    },
    {
      id: "electrical-estate",
      name: "Estate",
      min: 180,
      max: 300,
      description: "Large property with outbuildings",
      typicalDurationDays: { min: 22, max: 35 },
    },
  ],
  ac_installation: [
    {
      id: "ac-small",
      name: "2-3 Rooms",
      min: 40,
      max: 70,
      description: "Bedroom zone or apartment cooling",
      typicalDurationDays: { min: 5, max: 9 },
    },
    {
      id: "ac-medium",
      name: "Whole Floor",
      min: 70,
      max: 140,
      description: "Complete floor or large villa zone",
      typicalDurationDays: { min: 9, max: 14 },
    },
    {
      id: "ac-large",
      name: "Full Property",
      min: 140,
      max: 250,
      description: "Multi-level estate system",
      typicalDurationDays: { min: 14, max: 22 },
    },
  ],
  garden_structures: [
    {
      id: "garden-feature",
      name: "Feature",
      min: 8,
      max: 15,
      description: "Chill-out pod or outdoor shower",
      typicalDurationDays: { min: 25, max: 35 },
    },
    {
      id: "garden-multizone",
      name: "Multi-zone",
      min: 15,
      max: 30,
      description: "Guest casita or poolside changing room",
      typicalDurationDays: { min: 35, max: 45 },
    },
    {
      id: "garden-estate",
      name: "Estate",
      min: 30,
      max: 50,
      description: "Multi-room guest house or carport complex",
      typicalDurationDays: { min: 45, max: 60 },
    },
  ],
}

export type QualityTier = {
  id: string
  tier: "budget" | "mid" | "premium"
  name: string
  multiplier: number
  description: string
  imageUrls: string[]
  highlights: string[]
}

export const qualityTiers: QualityTier[] = [
  {
    id: "tier-budget",
    tier: "budget",
    name: "Smart Saver",
    multiplier: 0.8,
    description: "Durable finishes with clever value engineering",
    imageUrls: [
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2",
      "https://images.unsplash.com/photo-1616628182501-1afd5c6cc8fb",
    ],
    highlights: [
      "Great for rentals or refresh projects",
      "Prefers easy-to-source fixtures",
      "Focus on rapid turnaround",
    ],
  },
  {
    id: "tier-mid",
    tier: "mid",
    name: "Signature",
    multiplier: 1,
    description: "Balanced design with trusted European brands",
    imageUrls: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    ],
    highlights: [
      "Mix of custom and catalog elements",
      "Ideal for primary residences",
      "Long-term warranty coverage",
    ],
  },
  {
    id: "tier-premium",
    tier: "premium",
    name: "Ibiza Luxe",
    multiplier: 1.35,
    description: "Design-led statement spaces with artisan finishes",
    imageUrls: [
      "https://images.unsplash.com/photo-1529429617124-aee0a9111d19",
      "https://images.unsplash.com/photo-1549187774-b4e9b0445b05",
      "https://images.unsplash.com/photo-1556911260-89d3534b1b8b",
    ],
    highlights: [
      "Bespoke millwork and stone",
      "Premium appliances and fixtures",
      "White-glove site coordination",
    ],
  },
]

export type ScopeBundle = {
  id: string
  projectType: ProjectType
  name: string
  description: string
  included: string[]
  excluded: string[]
  basePricePerSqm: number
  defaultSelected?: boolean
  educationBlurbs?: string[]
}

export const scopeBundles: ScopeBundle[] = [
  {
    id: "kitchen-core",
    projectType: "kitchen",
    name: "Core Refresh",
    description: "Cabinetry, worktops, lighting, and appliances",
    included: [
      "Cabinet removal and install",
      "Standard plumbing connections",
      "Appliance installation",
    ],
    excluded: [
      "Structural wall changes",
      "External window modifications",
      "HVAC reconfiguration",
    ],
    basePricePerSqm: 420,
    defaultSelected: true,
    educationBlurbs: [
      "Reusing existing appliance locations keeps MEP costs predictable.",
    ],
  },
  {
    id: "kitchen-full",
    projectType: "kitchen",
    name: "Full Renovation",
    description: "Layout change with premium fixtures",
    included: [
      "Plumbing and electrical rerouting",
      "Custom cabinetry",
      "Stone or sintered surfaces",
    ],
    excluded: [
      "Structural beams",
      "Roof modifications",
      "Window replacements",
    ],
    basePricePerSqm: 640,
    educationBlurbs: [
      "Allow 2-3 weeks for custom cabinetry fabrication.",
      "Premium worktops require coordinated templating visits.",
    ],
  },
  {
    id: "bathroom-core",
    projectType: "bathroom",
    name: "Essential",
    description: "Tile, sanitary ware, lighting, waterproofing",
    included: [
      "Tile removal and install",
      "Standard plumbing fixtures",
      "Lighting upgrade",
    ],
    excluded: [
      "Relocating drainage stacks",
      "Custom steam systems",
      "Structural slab adjustments",
    ],
    basePricePerSqm: 380,
    defaultSelected: true,
    educationBlurbs: [
      "Keeping plumbing within 1m saves on MEP allowances.",
    ],
  },
  {
    id: "bathroom-spa",
    projectType: "bathroom",
    name: "Spa Upgrade",
    description: "Freestanding tub, bespoke lighting, luxury finishes",
    included: [
      "Feature lighting",
      "Underfloor heating",
      "Freestanding tub installation",
    ],
    excluded: [
      "Structural slab recess",
      "Full HVAC redesign",
      "Sauna equipment",
    ],
    basePricePerSqm: 520,
    educationBlurbs: [
      "Plan for 48h curing periods for specialty waterproofing.",
    ],
  },
  {
    id: "extension-core",
    projectType: "extension",
    name: "Shell & Structure",
    description: "Envelope, insulation, first fix services",
    included: [
      "Foundations and structure",
      "Windows and doors",
      "First fix MEP",
    ],
    excluded: [
      "Full interior fit-out",
      "Kitchen installation",
      "Landscaping",
    ],
    basePricePerSqm: 760,
    defaultSelected: true,
    educationBlurbs: [
      "Site access planning prevents crane or ferry delays.",
    ],
  },
  {
    id: "extension-complete",
    projectType: "extension",
    name: "Turnkey",
    description: "Complete interior fit-out with finishes",
    included: [
      "Second fix MEP",
      "Interior finishes and decoration",
      "Joinery and lighting",
    ],
    excluded: [
      "Kitchen appliance packages",
      "Smart home programming",
      "Exterior landscaping",
    ],
    basePricePerSqm: 980,
    educationBlurbs: [
      "Allow 2-3 weeks for final inspections and sign-off.",
    ],
  },
  {
    id: "pool-core",
    projectType: "pool_outdoor",
    name: "Core Setup",
    description: "Pool tiling, outdoor counters, basic plumbing",
    included: [
      "Pool tiling refresh",
      "Outdoor counters",
      "Basic plumbing",
      "Weatherproof outlets",
    ],
    excluded: [
      "Structural pool shell",
      "Water features",
      "Custom BBQ equipment",
      "Landscape lighting",
    ],
    basePricePerSqm: 520,
    defaultSelected: true,
    educationBlurbs: [
      "Existing pool shell integrity check saves major structural costs",
    ],
  },
  {
    id: "pool-premium",
    projectType: "pool_outdoor",
    name: "Premium Features",
    description: "Built-in BBQ, stone cladding, LED lighting, water features",
    included: [
      "Built-in BBQ station",
      "Natural stone cladding",
      "LED pool lighting",
      "Water feature plumbing",
    ],
    excluded: [
      "Pool heating systems",
      "Automated covers",
      "Full outdoor AV systems",
    ],
    basePricePerSqm: 780,
    educationBlurbs: [
      "LED lighting must be IP68 rated for submersion safety",
    ],
  },
  {
    id: "terrace-standard",
    projectType: "terrace_decking",
    name: "Standard Deck",
    description: "Composite decking, basic substructure, lighting",
    included: [
      "Composite decking",
      "Basic substructure",
      "Perimeter lighting",
      "Drainage",
    ],
    excluded: [
      "Custom pergolas",
      "Built-in planters",
      "Glass balustrades",
    ],
    basePricePerSqm: 280,
    defaultSelected: true,
    educationBlurbs: [
      "Composite decking handles Ibiza sun better than untreated wood",
    ],
  },
  {
    id: "terrace-luxury",
    projectType: "terrace_decking",
    name: "Luxury Outdoor Living",
    description: "Hardwood decking, integrated planters, ambient lighting",
    included: [
      "Hardwood decking",
      "Integrated planters",
      "Ambient lighting zones",
      "Pergola structure",
    ],
    excluded: [
      "Retractable awnings",
      "Outdoor kitchens",
      "Irrigation automation",
    ],
    basePricePerSqm: 480,
    educationBlurbs: [
      "Hardwood requires annual oiling in Mediterranean climate",
    ],
  },
  {
    id: "electrical-essential",
    projectType: "electrical_rewire",
    name: "Essential Rewire",
    description: "Consumer unit upgrade, circuits, safety certification",
    included: [
      "Consumer unit upgrade",
      "New circuits",
      "Socket/switch replacement",
      "Safety certification",
    ],
    excluded: [
      "Smart home wiring",
      "EV charging",
      "Solar pre-wiring",
      "Home automation hubs",
    ],
    basePricePerSqm: 75,
    defaultSelected: true,
    educationBlurbs: [
      "Modern consumer units prevent nuisance tripping common in older properties",
    ],
  },
  {
    id: "electrical-smart",
    projectType: "electrical_rewire",
    name: "Smart-Ready Upgrade",
    description: "EV charging prep, automation wiring, solar pre-wiring",
    included: [
      "EV charging prep",
      "Home automation conduit",
      "Solar inverter space",
      "CAT6 data cabling",
    ],
    excluded: [
      "Actual smart devices",
      "Solar panels",
      "EV charger unit",
      "Security systems",
    ],
    basePricePerSqm: 115,
    educationBlurbs: [
      "Pre-wiring for solar saves €2,000+ vs retrofitting later",
    ],
  },
  {
    id: "ac-basic",
    projectType: "ac_installation",
    name: "Basic Cooling",
    description: "Split AC units, standard installation, basic controls",
    included: [
      "Split AC units",
      "Standard installation",
      "Basic wall controllers",
      "5yr warranty",
    ],
    excluded: [
      "Ducted systems",
      "Multi-zone control",
      "Air purification",
      "Smart thermostats",
    ],
    basePricePerSqm: 180,
    defaultSelected: true,
    educationBlurbs: [
      "Split systems are quieter and more efficient than window units",
    ],
  },
  {
    id: "ac-premium",
    projectType: "ac_installation",
    name: "Premium Climate",
    description: "Ducted system, multi-zone control, smart integration",
    included: [
      "Ducted system",
      "Multi-zone control",
      "HEPA filtration",
      "Smart integration",
      "10yr warranty",
    ],
    excluded: [
      "Underfloor cooling",
      "Full HVAC with heat recovery",
      "Industrial chillers",
    ],
    basePricePerSqm: 290,
    educationBlurbs: [
      "Ducted AC preserves clean wall aesthetics in luxury properties",
    ],
  },
  {
    id: "garden-foundation",
    projectType: "garden_structures",
    name: "Foundation Package",
    description: "Structural foundation, frame, roof, utilities first-fix",
    included: [
      "Structural foundation",
      "Frame",
      "Roof",
      "Weatherproofing",
      "First fix utilities",
    ],
    excluded: [
      "Interior finishes",
      "Furniture-grade joinery",
      "HVAC",
      "Landscaping",
    ],
    basePricePerSqm: 620,
    defaultSelected: true,
    educationBlurbs: [
      "Proper foundations prevent cracking in Ibiza's clay-rich soil",
    ],
  },
  {
    id: "garden-turnkey",
    projectType: "garden_structures",
    name: "Turnkey Structure",
    description: "Full interior fit-out with custom joinery and finishes",
    included: [
      "Interior finishes",
      "Custom joinery",
      "Lighting",
      "Plumbing/electrical second fix",
    ],
    excluded: [
      "Kitchen appliances",
      "Furniture",
      "Smart home systems",
      "Exterior landscaping",
    ],
    basePricePerSqm: 850,
    educationBlurbs: [
      "Guest casitas require separate utility meters for rental compliance",
    ],
  },
]

export type AdderPriceType = "fixed" | "percentage" | "per_sqm"

export type CalculatorAdder = {
  id: string
  name: string
  category: "structural" | "mep" | "finishes"
  description: string
  tooltip?: string
  priceType: AdderPriceType
  priceValue: number
  appliesTo: ProjectType[]
}

export const calculatorAdders: CalculatorAdder[] = [
  {
    id: "adder-structural-wall",
    name: "Wall Removal",
    category: "structural",
    description: "Includes structural engineer sign-off",
    tooltip: "Required when opening up load-bearing walls",
    priceType: "fixed",
    priceValue: 2400,
    appliesTo: ["kitchen", "extension"],
  },
  {
    id: "adder-plumbing",
    name: "Plumbing Relocation",
    category: "mep",
    description: "Move water and waste up to 3m",
    priceType: "per_sqm",
    priceValue: 65,
    appliesTo: ["kitchen", "bathroom"],
  },
  {
    id: "adder-underfloor",
    name: "Underfloor Heating",
    category: "finishes",
    description: "Electric UFH with smart thermostat",
    priceType: "per_sqm",
    priceValue: 110,
    appliesTo: ["kitchen", "bathroom", "extension"],
  },
  {
    id: "adder-ibiza-logistics",
    name: "Island Logistics",
    category: "structural",
    description: "Barge coordination and ferry permits",
    tooltip: "Applies for mainland prefabrication deliveries",
    priceType: "percentage",
    priceValue: 0.08,
    appliesTo: ["extension", "kitchen"],
  },
  {
    id: "adder-salt-resistant",
    name: "Salt-Resistant Fixings",
    category: "finishes",
    description: "Marine-grade stainless steel hardware for coastal properties",
    tooltip: "Essential within 500m of coastline to prevent corrosion",
    priceType: "per_sqm",
    priceValue: 85,
    appliesTo: ["terrace_decking", "pool_outdoor", "garden_structures"],
  },
  {
    id: "adder-outdoor-shower",
    name: "Outdoor Shower Installation",
    category: "mep",
    description: "Hot & cold outdoor shower with mixer and drainage",
    tooltip: "Requires minimum 40mm waste connection",
    priceType: "fixed",
    priceValue: 1800,
    appliesTo: ["pool_outdoor", "terrace_decking", "garden_structures"],
  },
  {
    id: "adder-solar-prewiring",
    name: "Solar Pre-Wiring",
    category: "mep",
    description: "Conduit runs and isolators for future PV installation",
    tooltip: "Saves 60% vs retrofitting after roof is complete",
    priceType: "fixed",
    priceValue: 2400,
    appliesTo: ["electrical_rewire", "extension", "garden_structures"],
  },
  {
    id: "adder-three-phase",
    name: "Three-Phase Upgrade",
    category: "mep",
    description: "Upgrade from single-phase to three-phase supply",
    tooltip: "Required for properties over 150m² with multiple AC units",
    priceType: "fixed",
    priceValue: 3200,
    appliesTo: ["electrical_rewire", "ac_installation"],
  },
  {
    id: "adder-irrigation",
    name: "Irrigation System",
    category: "mep",
    description: "Automated drip irrigation with timer and rain sensor",
    tooltip: "Reduces water consumption by 40% vs manual watering",
    priceType: "per_sqm",
    priceValue: 45,
    appliesTo: ["terrace_decking", "garden_structures"],
  },
  {
    id: "adder-outdoor-audio",
    name: "Outdoor Audio Wiring",
    category: "mep",
    description: "Weather-resistant speaker zones with waterproof connectors",
    tooltip: "Must use IP65-rated speakers for pool areas",
    priceType: "per_sqm",
    priceValue: 35,
    appliesTo: ["pool_outdoor", "terrace_decking", "garden_structures"],
  },
  {
    id: "adder-pool-heat",
    name: "Pool Heat Pump",
    category: "mep",
    description: "Energy-efficient pool heating system (8kW)",
    tooltip: "Extends swim season by 4-5 months annually",
    priceType: "fixed",
    priceValue: 4500,
    appliesTo: ["pool_outdoor"],
  },
  {
    id: "adder-retaining-wall",
    name: "Retaining Wall",
    category: "structural",
    description: "Reinforced concrete retaining structure up to 2m height",
    tooltip: "Essential for sloped sites, includes drainage and waterproofing",
    priceType: "fixed",
    priceValue: 6800,
    appliesTo: ["terrace_decking", "pool_outdoor", "extension", "garden_structures"],
  },
]

export type LocationFactor = {
  id: string
  name: string
  upliftPercentage: number
  notes?: string
  isDefault?: boolean
}

export const locationFactors: LocationFactor[] = [
  {
    id: "location-ibiza",
    name: "Ibiza Island",
    upliftPercentage: 0.12,
    notes: "Includes ferry logistics and import duties",
    isDefault: true,
  },
  {
    id: "location-mainland",
    name: "Spanish Mainland",
    upliftPercentage: 0,
    notes: "Standard mainland sourcing",
  },
  {
    id: "location-formentera",
    name: "Formentera",
    upliftPercentage: 0.18,
    notes: "Additional barge transport requirements",
  },
]

export type CostTemplate = {
  labourPercentage: number
  materialsPercentage: number
  permitsPercentage: number
  contingencyPercentage: number
  disposalPercentage: number
}

export const costTemplates: Record<ProjectType, Record<QualityTier["id"], CostTemplate>> = {
  kitchen: {
    "tier-budget": {
      labourPercentage: 0.42,
      materialsPercentage: 0.32,
      permitsPercentage: 0.05,
      contingencyPercentage: 0.12,
      disposalPercentage: 0.09,
    },
    "tier-mid": {
      labourPercentage: 0.4,
      materialsPercentage: 0.35,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.11,
      disposalPercentage: 0.08,
    },
    "tier-premium": {
      labourPercentage: 0.38,
      materialsPercentage: 0.4,
      permitsPercentage: 0.05,
      contingencyPercentage: 0.12,
      disposalPercentage: 0.05,
    },
  },
  bathroom: {
    "tier-budget": {
      labourPercentage: 0.44,
      materialsPercentage: 0.3,
      permitsPercentage: 0.05,
      contingencyPercentage: 0.13,
      disposalPercentage: 0.08,
    },
    "tier-mid": {
      labourPercentage: 0.42,
      materialsPercentage: 0.33,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.11,
      disposalPercentage: 0.08,
    },
    "tier-premium": {
      labourPercentage: 0.4,
      materialsPercentage: 0.38,
      permitsPercentage: 0.05,
      contingencyPercentage: 0.12,
      disposalPercentage: 0.05,
    },
  },
  extension: {
    "tier-budget": {
      labourPercentage: 0.46,
      materialsPercentage: 0.28,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.12,
      disposalPercentage: 0.08,
    },
    "tier-mid": {
      labourPercentage: 0.44,
      materialsPercentage: 0.31,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.11,
      disposalPercentage: 0.08,
    },
    "tier-premium": {
      labourPercentage: 0.42,
      materialsPercentage: 0.35,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.11,
      disposalPercentage: 0.06,
    },
  },
  pool_outdoor: {
    "tier-budget": {
      labourPercentage: 0.48,
      materialsPercentage: 0.3,
      permitsPercentage: 0.07,
      contingencyPercentage: 0.1,
      disposalPercentage: 0.05,
    },
    "tier-mid": {
      labourPercentage: 0.45,
      materialsPercentage: 0.34,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.1,
      disposalPercentage: 0.05,
    },
    "tier-premium": {
      labourPercentage: 0.42,
      materialsPercentage: 0.38,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.1,
      disposalPercentage: 0.04,
    },
  },
  terrace_decking: {
    "tier-budget": {
      labourPercentage: 0.4,
      materialsPercentage: 0.38,
      permitsPercentage: 0.05,
      contingencyPercentage: 0.12,
      disposalPercentage: 0.05,
    },
    "tier-mid": {
      labourPercentage: 0.38,
      materialsPercentage: 0.42,
      permitsPercentage: 0.05,
      contingencyPercentage: 0.1,
      disposalPercentage: 0.05,
    },
    "tier-premium": {
      labourPercentage: 0.35,
      materialsPercentage: 0.46,
      permitsPercentage: 0.04,
      contingencyPercentage: 0.1,
      disposalPercentage: 0.05,
    },
  },
  electrical_rewire: {
    "tier-budget": {
      labourPercentage: 0.55,
      materialsPercentage: 0.25,
      permitsPercentage: 0.08,
      contingencyPercentage: 0.1,
      disposalPercentage: 0.02,
    },
    "tier-mid": {
      labourPercentage: 0.52,
      materialsPercentage: 0.28,
      permitsPercentage: 0.08,
      contingencyPercentage: 0.1,
      disposalPercentage: 0.02,
    },
    "tier-premium": {
      labourPercentage: 0.48,
      materialsPercentage: 0.32,
      permitsPercentage: 0.08,
      contingencyPercentage: 0.1,
      disposalPercentage: 0.02,
    },
  },
  ac_installation: {
    "tier-budget": {
      labourPercentage: 0.58,
      materialsPercentage: 0.24,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.1,
      disposalPercentage: 0.02,
    },
    "tier-mid": {
      labourPercentage: 0.54,
      materialsPercentage: 0.28,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.1,
      disposalPercentage: 0.02,
    },
    "tier-premium": {
      labourPercentage: 0.5,
      materialsPercentage: 0.32,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.1,
      disposalPercentage: 0.02,
    },
  },
  garden_structures: {
    "tier-budget": {
      labourPercentage: 0.46,
      materialsPercentage: 0.28,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.12,
      disposalPercentage: 0.08,
    },
    "tier-mid": {
      labourPercentage: 0.44,
      materialsPercentage: 0.31,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.11,
      disposalPercentage: 0.08,
    },
    "tier-premium": {
      labourPercentage: 0.42,
      materialsPercentage: 0.35,
      permitsPercentage: 0.06,
      contingencyPercentage: 0.11,
      disposalPercentage: 0.06,
    },
  },
}

export const baseRatesPerSqm: Record<ProjectType, number> = {
  kitchen: 1250,
  bathroom: 980,
  extension: 1420,
  pool_outdoor: 1650,
  terrace_decking: 780,
  electrical_rewire: 95,
  ac_installation: 220,
  garden_structures: 980,
}

export const calculatorStateSchema = z.object({
  projectType: z.enum(projectTypes),
  sizePresetId: z.string(),
  qualityTierId: z.string(),
  scopeBundleIds: z.array(z.string()),
  adderIds: z.array(z.string()),
  locationId: z.string(),
  size: z.number().positive(),
})

export type CalculatorState = z.infer<typeof calculatorStateSchema>

export const defaultState: CalculatorState = {
  projectType: "kitchen",
  sizePresetId: sizePresets.kitchen[0].id,
  qualityTierId: qualityTiers[1].id,
  scopeBundleIds: scopeBundles.filter((bundle) => bundle.projectType === "kitchen" && bundle.defaultSelected).map((bundle) => bundle.id),
  adderIds: [],
  locationId: locationFactors.find((location) => location.isDefault)?.id ?? locationFactors[0].id,
  size: Math.round((sizePresets.kitchen[0].min + sizePresets.kitchen[0].max) / 2),
}
