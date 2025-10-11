import { z } from "zod"

export const projectTypes = ["kitchen", "bathroom", "extension"] as const
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
      name: "Studio",
      min: 12,
      max: 18,
      description: "Single room addition or terrace enclosure",
      typicalDurationDays: { min: 30, max: 40 },
    },
    {
      id: "extension-medium",
      name: "Living",
      min: 18,
      max: 28,
      description: "Lounge or bedroom suite expansion",
      typicalDurationDays: { min: 40, max: 54 },
    },
    {
      id: "extension-large",
      name: "Grand",
      min: 28,
      max: 45,
      description: "Multi-room extension with structural work",
      typicalDurationDays: { min: 54, max: 72 },
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
}

export const baseRatesPerSqm: Record<ProjectType, number> = {
  kitchen: 1250,
  bathroom: 980,
  extension: 1420,
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
