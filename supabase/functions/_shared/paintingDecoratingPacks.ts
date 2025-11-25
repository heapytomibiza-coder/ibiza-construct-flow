/**
 * Painting & Decorating Question Packs
 * 4 detailed micro-service question packs
 */

export interface QuestionOption {
  value: string;
  label: string;
}

export interface QuestionDef {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'file';
  required: boolean;
  placeholder?: string;
  accept?: string;
  options?: QuestionOption[];
}

export interface MicroservicePack {
  microSlug: string;
  subcategorySlug: string;
  categorySlug: string;
  version: number;
  questions: QuestionDef[];
}

/**
 * Detailed pack: Cabinet painting
 */
const cabinetPaintingPack: MicroservicePack = {
  microSlug: "cabinet-painting",
  subcategorySlug: "cabinet-furniture-painting",
  categorySlug: "painting-decorating",
  version: 1,
  questions: [
    {
      id: "cabinet_location",
      question: "Where are the cabinets located?",
      type: "radio",
      required: true,
      options: [
        { value: "kitchen", label: "Kitchen" },
        { value: "bathroom", label: "Bathroom" },
        { value: "utility", label: "Utility room" },
        { value: "bedroom", label: "Bedroom wardrobe units" },
        { value: "other", label: "Other" }
      ]
    },
    {
      id: "cabinet_material",
      question: "What material are the cabinets?",
      type: "radio",
      required: true,
      options: [
        { value: "wood", label: "Wood" },
        { value: "mdf", label: "MDF" },
        { value: "laminate", label: "Laminate" },
        { value: "metal", label: "Metal" },
        { value: "mixed", label: "Mixed" },
        { value: "unsure", label: "Unsure" }
      ]
    },
    {
      id: "cabinet_condition",
      question: "What is the condition of the cabinets?",
      type: "radio",
      required: true,
      options: [
        { value: "good", label: "Good" },
        { value: "minor_wear", label: "Minor wear" },
        { value: "chipped", label: "Chipped/peeling" },
        { value: "grease", label: "Grease buildup" },
        { value: "heavily_worn", label: "Heavily worn" }
      ]
    },
    {
      id: "units_count",
      question: "How many doors/drawers are there?",
      type: "radio",
      required: true,
      options: [
        { value: "1_5", label: "1–5" },
        { value: "6_10", label: "6–10" },
        { value: "11_20", label: "11–20" },
        { value: "20_plus", label: "20+" }
      ]
    },
    {
      id: "finish_type",
      question: "What finish do you want?",
      type: "radio",
      required: true,
      options: [
        { value: "matt", label: "Matt" },
        { value: "satin", label: "Satin" },
        { value: "gloss", label: "Gloss" },
        { value: "sprayed", label: "Sprayed finish" },
        { value: "hand_painted", label: "Hand-painted" },
        { value: "not_sure", label: "Not sure" }
      ]
    },
    {
      id: "prep_needed",
      question: "Do you need preparation included?",
      type: "checkbox",
      required: false,
      options: [
        { value: "sanding", label: "Sanding" },
        { value: "degreasing", label: "Degreasing" },
        { value: "filling", label: "Filling & repairs" },
        { value: "primer", label: "Primer coat" },
        { value: "all", label: "All of the above" },
        { value: "not_sure", label: "Not sure" }
      ]
    }
  ]
};

/**
 * Detailed pack: Fence painting
 */
const fencePaintingPack: MicroservicePack = {
  microSlug: "fence-painting",
  subcategorySlug: "exterior-painting",
  categorySlug: "painting-decorating",
  version: 1,
  questions: [
    {
      id: "fence_material",
      question: "What is the fence made from?",
      type: "radio",
      required: true,
      options: [
        { value: "timber_panels", label: "Timber panels" },
        { value: "featheredge", label: "Featheredge boards" },
        { value: "metal", label: "Metal fence" },
        { value: "composite", label: "Composite fence" },
        { value: "unsure", label: "Unsure" }
      ]
    },
    {
      id: "fence_length",
      question: "Approximate length of fencing?",
      type: "radio",
      required: true,
      options: [
        { value: "up_to_10", label: "Up to 10m" },
        { value: "10_25", label: "10–25m" },
        { value: "25_50", label: "25–50m" },
        { value: "50_plus", label: "50m+" },
        { value: "not_sure", label: "Not sure" }
      ]
    },
    {
      id: "current_condition",
      question: "What condition is the fence in?",
      type: "radio",
      required: true,
      options: [
        { value: "good", label: "Good" },
        { value: "weathered", label: "Weathered" },
        { value: "peeling", label: "Peeling paint" },
        { value: "rot", label: "Rot/damage present" },
        { value: "mixed", label: "Mixed" }
      ]
    },
    {
      id: "paint_type",
      question: "What type of finish would you like?",
      type: "radio",
      required: true,
      options: [
        { value: "stain", label: "Stain" },
        { value: "fence_paint", label: "Fence paint" },
        { value: "oil_based", label: "Oil-based coating" },
        { value: "colour_change", label: "Colour change" },
        { value: "not_sure", label: "Not sure" }
      ]
    },
    {
      id: "old_paint",
      question: "Does old paint need removing or sanding?",
      type: "radio",
      required: true,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "some", label: "Some sections only" },
        { value: "not_sure", label: "Not sure" }
      ]
    },
    {
      id: "access",
      question: "How is the access to the fence?",
      type: "radio",
      required: true,
      options: [
        { value: "both_sides", label: "Easy access both sides" },
        { value: "one_side", label: "Access from one side only" },
        { value: "overgrown", label: "Overgrown vegetation" },
        { value: "uneven", label: "Uneven ground" },
        { value: "not_sure", label: "Not sure" }
      ]
    }
  ]
};

/**
 * Detailed pack: House exterior
 */
const houseExteriorPack: MicroservicePack = {
  microSlug: "house-exterior",
  subcategorySlug: "exterior-painting",
  categorySlug: "painting-decorating",
  version: 1,
  questions: [
    {
      id: "property_type",
      question: "What type of property is it?",
      type: "radio",
      required: true,
      options: [
        { value: "detached", label: "Detached" },
        { value: "semi", label: "Semi-detached" },
        { value: "terraced", label: "Terraced" },
        { value: "apartment", label: "Apartment block" },
        { value: "commercial", label: "Commercial building" }
      ]
    },
    {
      id: "storeys",
      question: "How many storeys?",
      type: "radio",
      required: true,
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4_plus", label: "4+" },
        { value: "split", label: "Different heights / split levels" }
      ]
    },
    {
      id: "exterior_surface",
      question: "What type of exterior surface?",
      type: "radio",
      required: true,
      options: [
        { value: "rendered", label: "Rendered walls" },
        { value: "brick", label: "Brick" },
        { value: "cladding", label: "Cladding" },
        { value: "pebbledash", label: "Pebbledash" },
        { value: "mixed", label: "Mixed surfaces" },
        { value: "not_sure", label: "Not sure" }
      ]
    },
    {
      id: "current_condition",
      question: "What is the condition of the exterior?",
      type: "radio",
      required: true,
      options: [
        { value: "good", label: "Good" },
        { value: "minor_cracks", label: "Minor cracks" },
        { value: "peeling", label: "Peeling paint" },
        { value: "weathered", label: "Weathered" },
        { value: "major_repairs", label: "Major repairs needed" }
      ]
    },
    {
      id: "areas_to_paint",
      question: "Which areas need painting?",
      type: "checkbox",
      required: true,
      options: [
        { value: "walls", label: "Walls" },
        { value: "fascia", label: "Fascia/soffits" },
        { value: "windows_doors", label: "Windows/doors" },
        { value: "railings", label: "Railings/metalwork" },
        { value: "everything", label: "Everything" }
      ]
    },
    {
      id: "access_requirements",
      question: "What access is required?",
      type: "radio",
      required: true,
      options: [
        { value: "ladder", label: "Ladder access" },
        { value: "scaffolding", label: "Scaffolding needed" },
        { value: "cherry_picker", label: "Cherry picker" },
        { value: "unsure", label: "Unsure" }
      ]
    }
  ]
};

/**
 * Detailed pack: Room painting
 */
const roomPaintingPack: MicroservicePack = {
  microSlug: "room-painting",
  subcategorySlug: "interior-painting",
  categorySlug: "painting-decorating",
  version: 1,
  questions: [
    {
      id: "room_type",
      question: "Which room are you painting?",
      type: "radio",
      required: true,
      options: [
        { value: "living", label: "Living room" },
        { value: "bedroom", label: "Bedroom" },
        { value: "kitchen", label: "Kitchen" },
        { value: "bathroom", label: "Bathroom" },
        { value: "hallway", label: "Hallway/stairs" },
        { value: "multiple", label: "Multiple rooms" }
      ]
    },
    {
      id: "room_size",
      question: "What is the approximate room size?",
      type: "radio",
      required: true,
      options: [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
        { value: "very_large", label: "Very large / open plan" },
        { value: "multiple", label: "Multiple rooms" }
      ]
    },
    {
      id: "surfaces",
      question: "Which surfaces need painting?",
      type: "checkbox",
      required: true,
      options: [
        { value: "walls", label: "Walls" },
        { value: "ceiling", label: "Ceiling" },
        { value: "woodwork", label: "Woodwork" },
        { value: "radiators", label: "Radiators" },
        { value: "all", label: "All surfaces" }
      ]
    },
    {
      id: "paint_condition",
      question: "What is the condition of the existing surfaces?",
      type: "radio",
      required: true,
      options: [
        { value: "good", label: "Good" },
        { value: "minor_cracks", label: "Minor cracks" },
        { value: "peeling", label: "Peeling paint" },
        { value: "stains", label: "Stains/damp" },
        { value: "mixed", label: "Mixed condition" }
      ]
    },
    {
      id: "prep_work",
      question: "Do you need preparation included?",
      type: "checkbox",
      required: false,
      options: [
        { value: "filling", label: "Filling cracks" },
        { value: "sanding", label: "Sanding" },
        { value: "stain_block", label: "Stain blocking" },
        { value: "full_prep", label: "Full prep" },
        { value: "minimal", label: "Minimal prep" }
      ]
    },
    {
      id: "finish_type",
      question: "What paint finish would you like?",
      type: "radio",
      required: true,
      options: [
        { value: "matt", label: "Matt" },
        { value: "satin", label: "Satin" },
        { value: "soft_sheen", label: "Soft sheen" },
        { value: "gloss", label: "Gloss (for woodwork)" },
        { value: "not_sure", label: "Not sure" }
      ]
    }
  ]
};

export const paintingDecoratingQuestionPacks: MicroservicePack[] = [
  cabinetPaintingPack,
  fencePaintingPack,
  houseExteriorPack,
  roomPaintingPack
];
