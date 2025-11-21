/**
 * Painting & Decorating Question Packs
 * Defines all 19 micro-service question sets for Painting & Decorating category
 * 3 detailed packs + 16 generic packs
 */

// Define types inline to avoid import issues in Deno
type QuestionOption = { value: string; label: string };

type QuestionDef = {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: QuestionOption[];
  helpText?: string;
  dependsOn?: {
    questionId: string;
    value: string | string[];
  };
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
};

export type MicroservicePackContent = {
  microSlug: string;
  subcategorySlug: string;
  categorySlug: string;
  name?: string;
  version: number;
  questions: QuestionDef[];
};

/**
 * Generic Painting & Decorating pack – works for most services.
 */
const buildGenericPaintingPack = (
  microSlug: string,
  readableName: string,
  subcategorySlug: string
): MicroservicePackContent => {
  const questions: QuestionDef[] = [
    {
      id: "description",
      question: `Briefly describe what you need for "${readableName}".`,
      type: "textarea",
      required: true,
      placeholder:
        "Which areas need work, what condition are they in now, and what finish or colours do you want?"
    },
    {
      id: "property_type",
      question: "What type of property is this?",
      type: "select",
      required: true,
      options: [
        { value: "apartment", label: "Apartment" },
        { value: "villa_house", label: "Villa / house" },
        { value: "community_building", label: "Community building" },
        { value: "hotel_guesthouse", label: "Hotel / guesthouse" },
        { value: "commercial", label: "Commercial property" },
        { value: "other", label: "Other" }
      ]
    },
    {
      id: "area_type",
      question: "Which areas are involved?",
      type: "checkbox",
      required: false,
      options: [
        { value: "bedrooms", label: "Bedrooms" },
        { value: "living_areas", label: "Living / lounge areas" },
        { value: "kitchen", label: "Kitchen" },
        { value: "bathrooms", label: "Bathrooms" },
        { value: "hallways_stairs", label: "Hallways / stairs" },
        { value: "exterior_walls", label: "Exterior walls / façades" },
        { value: "terrace_pergola", label: "Terrace / pergola / decking" }
      ]
    },
    {
      id: "current_condition",
      question: "What is the current condition of the surfaces?",
      type: "select",
      required: false,
      options: [
        { value: "good", label: "Good – just repainting / refreshing" },
        { value: "minor_defects", label: "Some cracks / small repairs needed" },
        { value: "poor", label: "Poor – flaking paint / damp / bigger repairs" },
        { value: "new_surfaces", label: "New plaster / new surfaces" },
        { value: "not_sure", label: "Not sure" }
      ]
    },
    {
      id: "colour_change",
      question: "Are you keeping similar colours or making a big colour change?",
      type: "select",
      required: false,
      options: [
        { value: "similar", label: "Similar colours" },
        { value: "big_change", label: "Big colour change (dark to light, etc.)" },
        { value: "not_decided", label: "Not decided yet – need advice" }
      ]
    },
    {
      id: "access_difficulty",
      question: "How is access to the areas that need painting?",
      type: "select",
      required: false,
      options: [
        { value: "easy", label: "Easy – ground floor, normal height" },
        { value: "high_ceilings", label: "High ceilings / awkward ladders" },
        { value: "exterior_height", label: "Exterior at height (scaffolding / lift likely)" },
        { value: "not_sure", label: "Not sure" }
      ]
    },
    {
      id: "furniture_status",
      question: "What is the furniture situation in the work areas?",
      type: "select",
      required: false,
      options: [
        { value: "empty", label: "Empty rooms / easy to work" },
        { value: "furnished_moveable", label: "Furnished but items can be moved" },
        { value: "heavily_furnished", label: "Heavily furnished / built-ins" }
      ]
    },
    {
      id: "urgency",
      question: "How urgent is this job?",
      type: "select",
      required: true,
      options: [
        { value: "emergency_damage", label: "Urgent – damage / damp / guests arriving" },
        { value: "soon", label: "Soon – within 1–2 weeks" },
        { value: "this_month", label: "Within this month" },
        { value: "flexible", label: "Flexible / planning ahead" }
      ]
    },
    {
      id: "photos",
      question: "Do you have any photos or videos of the areas to be painted?",
      type: "file",
      required: false,
      accept: "image/*,video/*"
    }
  ];

  return {
    microSlug,
    subcategorySlug,
    categorySlug: "painting-decorating",
    version: 1,
    questions
  };
};

/**
 * Detailed pack: Full interior repaint (whole property)
 */
const fullInteriorRepaintPack: MicroservicePackContent = {
  microSlug: "full-property-interior-painting",
  subcategorySlug: "interior-painting-decorating",
  categorySlug: "painting-decorating",
  version: 1,
  questions: [
    {
      id: "property_size",
      question: "Roughly how big is the property?",
      type: "select",
      required: true,
      options: [
        { value: "studio_1bed", label: "Studio / 1 bedroom" },
        { value: "2_3bed", label: "2–3 bedrooms" },
        { value: "4_5bed", label: "4–5 bedrooms" },
        { value: "6plus", label: "6+ bedrooms / large villa" }
      ]
    },
    {
      id: "rooms_included",
      question: "Which rooms should be included in the repaint?",
      type: "checkbox",
      required: true,
      options: [
        { value: "all_rooms", label: "All rooms" },
        { value: "bedrooms_only", label: "Mainly bedrooms" },
        { value: "living_kitchen", label: "Living areas & kitchen" },
        { value: "hallways_stairs", label: "Hallways / stairs" },
        { value: "bathrooms", label: "Bathrooms" }
      ]
    },
    {
      id: "surfaces_to_paint",
      question: "Which interior surfaces need painting?",
      type: "checkbox",
      required: true,
      options: [
        { value: "walls", label: "Walls" },
        { value: "ceilings", label: "Ceilings" },
        { value: "woodwork", label: "Woodwork (doors, frames, skirting)" },
        { value: "radiators", label: "Radiators" },
        { value: "other", label: "Other surfaces" }
      ]
    },
    {
      id: "prep_level",
      question: "How much preparation work do you think is needed?",
      type: "select",
      required: false,
      options: [
        { value: "light", label: "Light prep – minor filling & sanding" },
        { value: "medium", label: "Medium – some cracks / repair work" },
        { value: "heavy", label: "Heavy – damp / flaking paint / bigger repairs" },
        { value: "not_sure", label: "Not sure – need advice" }
      ]
    },
    {
      id: "paint_supply",
      question: "Who should supply the paint and materials?",
      type: "radio",
      required: true,
      options: [
        { value: "contractor", label: "Contractor supplies all paint & materials" },
        { value: "client", label: "I will supply the paint" },
        { value: "mixed", label: "Mixed – I have some, need advice for the rest" }
      ]
    },
    {
      id: "occupation_status",
      question: "Will the property be occupied while the work is done?",
      type: "select",
      required: true,
      options: [
        { value: "occupied", label: "Yes – people will be staying there" },
        { value: "partly_occupied", label: "Partly occupied / some days empty" },
        { value: "empty", label: "No – property will be empty" }
      ]
    },
    {
      id: "timeline",
      question: "When would you like the interior repaint to be completed?",
      type: "select",
      required: true,
      options: [
        { value: "asap", label: "As soon as possible" },
        { value: "within_month", label: "Within the next month" },
        { value: "low_season", label: "Prefer low / off-season" },
        { value: "flexible", label: "Flexible" }
      ]
    }
  ]
};

/**
 * Detailed pack: Full exterior / façade repaint
 */
const fullExteriorRepaintPack: MicroservicePackContent = {
  microSlug: "exterior-house-repainting",
  subcategorySlug: "exterior-painting-facades",
  categorySlug: "painting-decorating",
  version: 1,
  questions: [
    {
      id: "building_type",
      question: "What type of building needs exterior painting?",
      type: "select",
      required: true,
      options: [
        { value: "detached_villa", label: "Detached villa / house" },
        { value: "townhouse", label: "Townhouse / semi-detached" },
        { value: "apartment_block", label: "Apartment block / community building" },
        { value: "commercial", label: "Commercial building" }
      ]
    },
    {
      id: "storeys",
      question: "How many storeys / levels does the building have?",
      type: "select",
      required: true,
      options: [
        { value: "one_storey", label: "Single storey" },
        { value: "two_storey", label: "Two storeys" },
        { value: "three_four", label: "3–4 storeys" },
        { value: "five_plus", label: "5+ storeys" }
      ]
    },
    {
      id: "surface_type",
      question: "What type of exterior surface is it?",
      type: "checkbox",
      required: true,
      options: [
        { value: "render_smooth", label: "Smooth render" },
        { value: "render_textured", label: "Textured / rough render" },
        { value: "stone", label: "Stone" },
        { value: "wood_cladding", label: "Wood cladding" },
        { value: "metal", label: "Metal surfaces / railings" }
      ]
    },
    {
      id: "exterior_condition",
      question: "What is the condition of the exterior surfaces?",
      type: "select",
      required: false,
      options: [
        { value: "good", label: "Good – mainly colour refresh" },
        { value: "cracks", label: "Some cracks / minor repairs" },
        { value: "flaking", label: "Flaking paint / weather damage" },
        { value: "damp_issues", label: "Damp / water ingress issues" },
        { value: "not_sure", label: "Not sure" }
      ]
    },
    {
      id: "access_method",
      question: "How can the painter access higher areas?",
      type: "select",
      required: false,
      options: [
        { value: "ladders_only", label: "Ladders only are needed" },
        { value: "scaffolding_required", label: "Scaffolding likely required" },
        { value: "cherry_picker", label: "Cherry picker / lift access possible" },
        { value: "not_sure", label: "Not sure – need assessment" }
      ]
    },
    {
      id: "coastal_exposure",
      question: "Is the property in a coastal / high exposure location?",
      type: "radio",
      required: false,
      options: [
        { value: "yes_coastal", label: "Yes – near the sea / high exposure" },
        { value: "no_inland", label: "No – more sheltered / inland" },
        { value: "not_sure", label: "Not sure / mixed" }
      ]
    },
    {
      id: "timeline",
      question: "When would you like the exterior repaint done?",
      type: "select",
      required: true,
      options: [
        { value: "asap", label: "As soon as possible" },
        { value: "this_season", label: "This season" },
        { value: "low_season", label: "Prefer low / off-season" },
        { value: "flexible", label: "Flexible" }
      ]
    }
  ]
};

/**
 * Detailed pack: Decking & pergola paint / stain (envelope of the house)
 */
const deckingPergolaPack: MicroservicePackContent = {
  microSlug: "decking-pergola-paint-stain",
  subcategorySlug: "woodwork-decking-pergolas",
  categorySlug: "painting-decorating",
  version: 1,
  questions: [
    {
      id: "structure_type",
      question: "What needs treating or painting?",
      type: "checkbox",
      required: true,
      options: [
        { value: "decking", label: "Decking / terrace flooring" },
        { value: "pergola", label: "Pergola / shade structures" },
        { value: "outdoor_furniture", label: "Outdoor wooden furniture" },
        { value: "fencing_railings", label: "Fencing / railings" }
      ]
    },
    {
      id: "wood_condition",
      question: "What is the condition of the wood?",
      type: "select",
      required: true,
      options: [
        { value: "good", label: "Good – just refreshing existing finish" },
        { value: "worn_grey", label: "Weathered / grey, needs reviving" },
        { value: "flaking_peeling", label: "Flaking paint / peeling stain" },
        { value: "damage_rot", label: "Some damage / possible rot" }
      ]
    },
    {
      id: "finish_preference",
      question: "What type of finish do you prefer?",
      type: "select",
      required: false,
      options: [
        { value: "clear_oil", label: "Clear oil / natural look" },
        { value: "semi_transparent", label: "Semi-transparent stain" },
        { value: "solid_colour", label: "Solid colour paint" },
        { value: "not_sure", label: "Not sure – need advice" }
      ]
    },
    {
      id: "approx_area_size",
      question: "Do you know the approximate size of the area?",
      type: "text",
      required: false,
      placeholder: "Approximate m² or length x width if known"
    },
    {
      id: "sun_exposure",
      question: "How exposed is the area to sun and weather?",
      type: "select",
      required: false,
      options: [
        { value: "full_sun", label: "Full sun most of the day" },
        { value: "partial_shade", label: "Partly shaded" },
        { value: "mostly_shaded", label: "Mostly shaded / protected" },
        { value: "near_sea", label: "Near the sea / high exposure" }
      ]
    },
    {
      id: "furniture_move",
      question: "Will the area be cleared before work, or should the contractor move items?",
      type: "select",
      required: false,
      options: [
        { value: "client_clears", label: "I can clear everything before work" },
        { value: "contractor_moves", label: "Contractor should move some items" },
        { value: "mixed", label: "Mixed – some cleared, some need help" }
      ]
    },
    {
      id: "timeline",
      question: "When would you like this work to be done?",
      type: "select",
      required: true,
      options: [
        { value: "asap", label: "As soon as possible" },
        { value: "before_season", label: "Before the main season starts" },
        { value: "after_season", label: "After the season / low season" },
        { value: "flexible", label: "Flexible" }
      ]
    }
  ]
};

/**
 * Remaining Painting & Decorating micro-services → generic pack
 */
const genericPaintingServices: { microSlug: string; name: string; subcategorySlug: string }[] = [
  // Interior painting & decorating (others)
  { microSlug: "single-room-painting",             name: "Single room painting",                        subcategorySlug: "interior-painting-decorating" },
  { microSlug: "feature-wall-design",              name: "Feature wall / accent design",                subcategorySlug: "interior-painting-decorating" },
  { microSlug: "wallpaper-installation",           name: "Wallpaper installation",                      subcategorySlug: "interior-painting-decorating" },
  { microSlug: "wallpaper-removal-prep",           name: "Wallpaper removal & preparation",             subcategorySlug: "interior-painting-decorating" },
  { microSlug: "plaster-repair-prep-before-paint", name: "Plaster repair & prep before painting",       subcategorySlug: "interior-painting-decorating" },

  // Exterior painting & façades (others)
  { microSlug: "facade-repainting-render",         name: "Façade repainting on render",                 subcategorySlug: "exterior-painting-facades" },
  { microSlug: "exterior-wood-windows-doors",      name: "Exterior wood windows & doors",               subcategorySlug: "exterior-painting-facades" },
  { microSlug: "exterior-metal-railings",          name: "Exterior railings & metalwork",               subcategorySlug: "exterior-painting-facades" },
  { microSlug: "anti-damp-exterior-treatment",     name: "Anti-damp / weatherproof exterior treatments",subcategorySlug: "exterior-painting-facades" },

  // Woodwork, decking & pergolas (others)
  { microSlug: "interior-woodwork-painting-trim",  name: "Interior woodwork & trim painting",           subcategorySlug: "woodwork-decking-pergolas" },
  { microSlug: "kitchen-cabinet-spraying",         name: "Kitchen cabinet painting / spraying",         subcategorySlug: "woodwork-decking-pergolas" },
  { microSlug: "varnish-oil-wood-maintenance",     name: "Varnish / oil & wood maintenance",            subcategorySlug: "woodwork-decking-pergolas" },

  // Specialist coatings & effects
  { microSlug: "microcement-walls-floors",         name: "Microcement on walls / floors",               subcategorySlug: "specialist-coatings-effects" },
  { microSlug: "epoxy-garage-floor-coating",       name: "Epoxy / specialist floor coatings",           subcategorySlug: "specialist-coatings-effects" },
  { microSlug: "decorative-effects-textures",      name: "Decorative paint effects & textures",         subcategorySlug: "specialist-coatings-effects" },
  { microSlug: "anti-mould-stain-blocking",        name: "Anti-mould & stain-blocking solutions",       subcategorySlug: "specialist-coatings-effects" }
];

const genericPaintingPacks: MicroservicePackContent[] = genericPaintingServices.map(s =>
  buildGenericPaintingPack(s.microSlug, s.name, s.subcategorySlug)
);

export const paintingDecoratingQuestionPacks: MicroservicePackContent[] = [
  fullInteriorRepaintPack,
  fullExteriorRepaintPack,
  deckingPergolaPack,
  ...genericPaintingPacks
];
