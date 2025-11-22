/**
 * Commercial & Industrial Question Packs
 * Includes generic pack + 3 detailed packs (office-fit-outs, retail-spaces, commercial-projects)
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
 * Generic Commercial & Industrial pack
 */
const buildGenericCommercialPack = (
  microSlug: string,
  readableName: string,
  subcategorySlug: string
): MicroservicePack => {
  const questions: QuestionDef[] = [
    {
      id: "business_type",
      question: "What type of business or organisation is this for?",
      type: "select",
      required: true,
      options: [
        { value: "office", label: "Office / admin" },
        { value: "retail", label: "Retail / shop" },
        { value: "hospitality", label: "Restaurant / bar / cafe" },
        { value: "industrial", label: "Industrial / warehouse / workshop" },
        { value: "public", label: "Public / educational / healthcare" },
        { value: "other", label: "Other" }
      ]
    },
    {
      id: "property_status",
      question: "What is the current status of the space?",
      type: "select",
      required: true,
      options: [
        { value: "trading", label: "Open and trading" },
        { value: "closed_for_works", label: "Closed for works" },
        { value: "new_shell", label: "New shell / empty space" },
        { value: "occupied_office", label: "Occupied office with staff" }
      ]
    },
    {
      id: "approx_size",
      question: "Approximate size of the area (if known)?",
      type: "select",
      required: false,
      options: [
        { value: "under_100", label: "Under 100 m²" },
        { value: "100_300", label: "100–300 m²" },
        { value: "300_600", label: "300–600 m²" },
        { value: "over_600", label: "Over 600 m²" },
        { value: "not_sure", label: "Not sure" }
      ]
    },
    {
      id: "working_hours_constraints",
      question: "Are there restrictions on when work can be carried out?",
      type: "select",
      required: true,
      options: [
        { value: "daytime_ok", label: "Daytime weekdays is fine" },
        { value: "out_of_hours", label: "Evenings / nights / weekends only" },
        { value: "mixed", label: "Mix of normal and out-of-hours" },
        { value: "not_sure", label: "Not sure yet" }
      ]
    },
    {
      id: "other_trades_required",
      question: "Which trades are likely to be involved?",
      type: "checkbox",
      required: false,
      options: [
        { value: "construction", label: "Construction / partitions" },
        { value: "electrical", label: "Electrics / lighting" },
        { value: "hvac", label: "Air conditioning / ventilation" },
        { value: "plumbing", label: "Plumbing / drainage" },
        { value: "decorating", label: "Painting / decorating" },
        { value: "flooring", label: "Flooring" }
      ]
    },
    {
      id: "timeline",
      question: "When would you like the work to start?",
      type: "select",
      required: true,
      options: [
        { value: "asap", label: "As soon as possible" },
        { value: "1_3_months", label: "Within 1–3 months" },
        { value: "3_6_months", label: "Within 3–6 months" },
        { value: "flexible", label: "Flexible / early planning" }
      ]
    },
    {
      id: "budget_band",
      question: "Do you have a rough budget band?",
      type: "select",
      required: false,
      options: [
        { value: "under_20k", label: "Under €20k" },
        { value: "20k_50k", label: "€20k–€50k" },
        { value: "50k_100k", label: "€50k–€100k" },
        { value: "over_100k", label: "Over €100k" },
        { value: "not_sure", label: "Not sure yet" }
      ]
    },
    {
      id: "description",
      question: `Briefly describe what you need for "${readableName}".`,
      type: "textarea",
      required: true,
      placeholder: "What needs doing, which areas, and any key requirements?"
    },
    {
      id: "plans_photos",
      question: "Do you have any plans, photos or drawings to share?",
      type: "file",
      required: false,
      accept: "image/*,application/pdf"
    }
  ];

  return {
    microSlug,
    subcategorySlug,
    categorySlug: "commercial-industrial",
    version: 1,
    questions
  };
};

/**
 * Detailed pack: Office fit-outs
 */
const officeFitOutsPack: MicroservicePack = {
  microSlug: "office-fit-outs",
  subcategorySlug: "office-fit-outs-refurbishments",
  categorySlug: "commercial-industrial",
  version: 1,
  questions: [
    {
      id: "office_use",
      question: "What will the office mainly be used for?",
      type: "select",
      required: true,
      options: [
        { value: "general_admin", label: "General office / admin" },
        { value: "call_centre", label: "Call centre" },
        { value: "creative_studio", label: "Creative / studio" },
        { value: "client_facing", label: "Client-facing / reception" },
        { value: "mixed_use", label: "Mixed use" }
      ]
    },
    {
      id: "num_people",
      question: "Roughly how many people will work in the space?",
      type: "select",
      required: true,
      options: [
        { value: "up_to_10", label: "Up to 10 people" },
        { value: "10_25", label: "10–25 people" },
        { value: "25_50", label: "25–50 people" },
        { value: "over_50", label: "More than 50 people" },
        { value: "not_sure", label: "Not sure yet" }
      ]
    },
    {
      id: "fitout_scope",
      question: "What is the scope of the office fit-out?",
      type: "checkbox",
      required: true,
      options: [
        { value: "partitions", label: "Partitions / offices / meeting rooms" },
        { value: "ceilings_lighting", label: "Ceilings and lighting" },
        { value: "flooring", label: "Flooring" },
        { value: "kitchen_tea", label: "Kitchen / tea point" },
        { value: "reception", label: "Reception area" },
        { value: "furniture", label: "Desks, chairs and furniture" },
        { value: "data_power", label: "Data, power and AV" }
      ]
    },
    {
      id: "design_stage",
      question: "Where are you in the design process?",
      type: "select",
      required: true,
      options: [
        { value: "no_design", label: "No design yet – need help" },
        { value: "concept_only", label: "Concept / basic layout only" },
        { value: "detailed_drawings", label: "Detailed drawings ready" },
        { value: "tender_stage", label: "Out to tender already" }
      ]
    },
    {
      id: "fitout_type",
      question: "What type of fit-out best describes this project?",
      type: "select",
      required: true,
      options: [
        { value: "cat_a", label: "Cat A (basic landlord fit-out)" },
        { value: "cat_b", label: "Cat B (tenant fit-out)" },
        { value: "refurb_in_use", label: "Refurbishment while occupied" },
        { value: "not_sure", label: "Not sure / need advice" }
      ]
    },
    {
      id: "trading_constraints",
      question: "Are there constraints around keeping part of the office operational?",
      type: "select",
      required: false,
      options: [
        { value: "no", label: "No – space will be empty" },
        { value: "partial", label: "Yes – some staff remain on site" },
        { value: "phased", label: "Yes – work must be phased in sections" }
      ]
    },
    {
      id: "timeline",
      question: "When would you like the office ready for use?",
      type: "select",
      required: true,
      options: [
        { value: "within_2_months", label: "Within 2 months" },
        { value: "2_4_months", label: "Within 2–4 months" },
        { value: "4_6_months", label: "Within 4–6 months" },
        { value: "flexible", label: "Flexible" }
      ]
    }
  ]
};

/**
 * Detailed pack: Retail spaces
 */
const retailSpacesPack: MicroservicePack = {
  microSlug: "retail-spaces",
  subcategorySlug: "retail-hospitality-leisure",
  categorySlug: "commercial-industrial",
  version: 1,
  questions: [
    {
      id: "retail_type",
      question: "What type of retail or hospitality business is it?",
      type: "select",
      required: true,
      options: [
        { value: "fashion", label: "Fashion / boutique" },
        { value: "convenience", label: "Convenience / grocery" },
        { value: "restaurant", label: "Restaurant" },
        { value: "bar_cafe", label: "Bar / cafe" },
        { value: "beauty", label: "Beauty / salon / spa" },
        { value: "other", label: "Other" }
      ]
    },
    {
      id: "space_condition",
      question: "What is the current condition of the space?",
      type: "select",
      required: true,
      options: [
        { value: "shell_core", label: "Shell and core (basic empty shell)" },
        { value: "white_box", label: "White box (basic finished shell)" },
        { value: "trading_needs_refurb", label: "Currently trading but needs refurb" },
        { value: "vacant_existing_fitout", label: "Vacant with old fit-out in place" }
      ]
    },
    {
      id: "customer_area_scope",
      question: "What needs doing in the customer-facing area?",
      type: "checkbox",
      required: true,
      options: [
        { value: "flooring", label: "Flooring" },
        { value: "display_shelving", label: "Display units / shelving" },
        { value: "counter_bar", label: "Counters / bars / reception" },
        { value: "lighting_signage", label: "Lighting and signage" },
        { value: "decor", label: "Decoration and finishes" }
      ]
    },
    {
      id: "back_of_house_scope",
      question: "What needs doing in back-of-house or service areas?",
      type: "checkbox",
      required: false,
      options: [
        { value: "kitchen_prep", label: "Kitchen / prep area" },
        { value: "storage", label: "Storage / stock room" },
        { value: "staff_areas", label: "Staff areas / changing / office" },
        { value: "toilets", label: "Customer / staff toilets" }
      ]
    },
    {
      id: "centre_rules",
      question: "Is this inside a shopping centre or building with specific rules?",
      type: "radio",
      required: false,
      options: [
        { value: "yes", label: "Yes – centre / building rules apply" },
        { value: "no", label: "No – independent building / street unit" },
        { value: "not_sure", label: "Not sure" }
      ]
    },
    {
      id: "go_live_date",
      question: "When do you plan to open or re-open to customers?",
      type: "select",
      required: true,
      options: [
        { value: "within_1_month", label: "Within 1 month" },
        { value: "1_3_months", label: "Within 1–3 months" },
        { value: "3_6_months", label: "Within 3–6 months" },
        { value: "flexible", label: "Flexible" }
      ]
    }
  ]
};

/**
 * Detailed pack: Large commercial projects
 */
const commercialProjectsPack: MicroservicePack = {
  microSlug: "commercial-projects",
  subcategorySlug: "office-fit-outs-refurbishments",
  categorySlug: "commercial-industrial",
  version: 1,
  questions: [
    {
      id: "project_type",
      question: "What best describes this commercial project?",
      type: "select",
      required: true,
      options: [
        { value: "multi_area_refurb", label: "Refurbishment of several areas/floors" },
        { value: "new_fit_out", label: "Full fit-out of a new space" },
        { value: "reconfiguration", label: "Reconfiguration / extension of existing space" },
        { value: "mixed_use", label: "Mixed-use commercial project" }
      ]
    },
    {
      id: "project_size",
      question: "Approximate project size or rough budget band?",
      type: "select",
      required: true,
      options: [
        { value: "under_50k", label: "Under €50k" },
        { value: "50k_150k", label: "€50k–€150k" },
        { value: "150k_500k", label: "€150k–€500k" },
        { value: "over_500k", label: "Over €500k" },
        { value: "not_sure", label: "Not sure yet" }
      ]
    },
    {
      id: "delivery_model",
      question: "What delivery model are you looking for?",
      type: "select",
      required: true,
      options: [
        { value: "design_and_build", label: "Design and build" },
        { value: "build_only", label: "Build only (design already done)" },
        { value: "pm_coordination", label: "Project management and coordination" },
        { value: "not_sure", label: "Not sure / need advice" }
      ]
    },
    {
      id: "documentation_status",
      question: "What documentation do you already have?",
      type: "checkbox",
      required: false,
      options: [
        { value: "concept_designs", label: "Concept designs" },
        { value: "technical_drawings", label: "Technical drawings" },
        { value: "specification", label: "Specification / scope of works" },
        { value: "planning_approved", label: "Planning permission approved (if needed)" },
        { value: "none", label: "None yet" }
      ]
    },
    {
      id: "timetable_constraints",
      question: "Are there key dates or constraints to work around?",
      type: "checkbox",
      required: false,
      options: [
        { value: "lease_dates", label: "Lease start / end dates" },
        { value: "trading_dates", label: "Trading / seasonal opening dates" },
        { value: "phasing", label: "Need phased works to keep some areas open" },
        { value: "other", label: "Other constraints" }
      ]
    },
    {
      id: "decision_stage",
      question: "Where are you in your decision process?",
      type: "select",
      required: true,
      options: [
        { value: "early_feasibility", label: "Early feasibility / budgeting" },
        { value: "tendering", label: "Putting the work out to tender" },
        { value: "shortlisting", label: "Shortlisting contractors now" },
        { value: "ready_to_appoint", label: "Ready to appoint a contractor" }
      ]
    },
    {
      id: "timeline",
      question: "When do you expect site works to start?",
      type: "select",
      required: true,
      options: [
        { value: "within_3_months", label: "Within 3 months" },
        { value: "3_6_months", label: "Within 3–6 months" },
        { value: "6_12_months", label: "Within 6–12 months" },
        { value: "flexible", label: "Flexible" }
      ]
    }
  ]
};

/**
 * Remaining Commercial & Industrial micro-services → generic pack
 */
const genericCommercialServices: {
  microSlug: string;
  name: string;
  subcategorySlug: string;
}[] = [
  // Office Fit-Outs and Refurbishments (others)
  { microSlug: "office-refurbishments", name: "Office refurbishments", subcategorySlug: "office-fit-outs-refurbishments" },
  { microSlug: "coworking-shared-offices", name: "Co-working and shared offices", subcategorySlug: "office-fit-outs-refurbishments" },
  { microSlug: "meeting-boardrooms", name: "Meeting and boardrooms", subcategorySlug: "office-fit-outs-refurbishments" },

  // Retail, Hospitality and Leisure (others)
  { microSlug: "restaurant-bar-fitouts", name: "Restaurant and bar fit-outs", subcategorySlug: "retail-hospitality-leisure" },
  { microSlug: "cafe-takeaway-refurbishments", name: "Cafe and takeaway refurbishments", subcategorySlug: "retail-hospitality-leisure" },
  { microSlug: "clubs-venue-fitouts", name: "Clubs and venue fit-outs", subcategorySlug: "retail-hospitality-leisure" },
  { microSlug: "popup-temporary-shops", name: "Pop-up and temporary shops", subcategorySlug: "retail-hospitality-leisure" },

  // Industrial, Warehouse and Storage
  { microSlug: "warehouse-fitouts", name: "Warehouse fit-outs", subcategorySlug: "industrial-warehouse-storage" },
  { microSlug: "industrial-unit-refurbishments", name: "Industrial unit refurbishments", subcategorySlug: "industrial-warehouse-storage" },
  { microSlug: "racking-storage-systems", name: "Racking and storage systems", subcategorySlug: "industrial-warehouse-storage" },
  { microSlug: "loading-bay-access-works", name: "Loading bay and access works", subcategorySlug: "industrial-warehouse-storage" },
  { microSlug: "clean-rooms-specialist-areas", name: "Clean rooms and specialist areas", subcategorySlug: "industrial-warehouse-storage" },

  // Commercial Maintenance and Repairs
  { microSlug: "general-commercial-repairs", name: "General commercial repairs", subcategorySlug: "commercial-maintenance-repairs" },
  { microSlug: "planned-maintenance-contracts", name: "Planned maintenance contracts", subcategorySlug: "commercial-maintenance-repairs" },
  { microSlug: "emergency-callouts", name: "Emergency call-outs", subcategorySlug: "commercial-maintenance-repairs" },
  { microSlug: "common-areas-stairwells", name: "Common areas and stairwells", subcategorySlug: "commercial-maintenance-repairs" },
  { microSlug: "shopfront-facade-repairs", name: "Shopfront and facade repairs", subcategorySlug: "commercial-maintenance-repairs" },

  // Building Services and Compliance
  { microSlug: "fire-safety-works", name: "Fire safety works", subcategorySlug: "building-services-compliance" },
  { microSlug: "accessibility-improvements", name: "Accessibility improvements", subcategorySlug: "building-services-compliance" },
  { microSlug: "partitioning-layout-changes", name: "Partitioning and layout changes", subcategorySlug: "building-services-compliance" },
  { microSlug: "acoustic-treatments", name: "Acoustic treatments", subcategorySlug: "building-services-compliance" },
  { microSlug: "signage-wayfinding", name: "Signage and wayfinding", subcategorySlug: "building-services-compliance" }
];

const genericCommercialPacks: MicroservicePack[] = genericCommercialServices.map(s =>
  buildGenericCommercialPack(s.microSlug, s.name, s.subcategorySlug)
);

export const commercialIndustrialQuestionPacks: MicroservicePack[] = [
  officeFitOutsPack,
  retailSpacesPack,
  commercialProjectsPack,
  ...genericCommercialPacks
];
