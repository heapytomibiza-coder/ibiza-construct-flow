/**
 * Transport Question Packs
 * Includes generic pack + 3 detailed packs (house-flat-move-local, small-van-jobs, same-day-local-delivery)
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
  options?: QuestionOption[];
  placeholder?: string;
  accept?: string;
}

export interface MicroservicePack {
  microSlug: string;
  subcategorySlug: string;
  categorySlug: string;
  version: number;
  questions: QuestionDef[];
}

/**
 * Generic Transport pack for most services
 */
const buildGenericTransportPack = (
  microSlug: string,
  readableName: string,
  subcategorySlug: string
): MicroservicePack => {
  const questions: QuestionDef[] = [
    {
      id: "transport_type",
      question: "What needs to be transported?",
      type: "textarea",
      required: true,
      placeholder: "Brief description of items, vehicle, or passengers"
    },
    {
      id: "from_location",
      question: "Collection location (from)?",
      type: "text",
      required: true,
      placeholder: "Address, postcode, or area"
    },
    {
      id: "to_location",
      question: "Delivery location (to)?",
      type: "text",
      required: true,
      placeholder: "Address, postcode, or area"
    },
    {
      id: "property_type_from",
      question: "What type of property at collection point?",
      type: "select",
      required: false,
      options: [
        { value: "apartment_lift", label: "Apartment with lift" },
        { value: "apartment_no_lift", label: "Apartment without lift" },
        { value: "house_villa", label: "House / villa" },
        { value: "commercial", label: "Commercial / office" },
        { value: "other", label: "Other" }
      ]
    },
    {
      id: "property_type_to",
      question: "What type of property at delivery point?",
      type: "select",
      required: false,
      options: [
        { value: "apartment_lift", label: "Apartment with lift" },
        { value: "apartment_no_lift", label: "Apartment without lift" },
        { value: "house_villa", label: "House / villa" },
        { value: "commercial", label: "Commercial / office" },
        { value: "other", label: "Other" }
      ]
    },
    {
      id: "approx_volume",
      question: "Approximate volume or size?",
      type: "select",
      required: true,
      options: [
        { value: "few_boxes", label: "A few boxes / small items" },
        { value: "small_van", label: "Small van load" },
        { value: "full_van", label: "Full van load" },
        { value: "multiple_trips", label: "Multiple van trips needed" },
        { value: "not_sure", label: "Not sure" }
      ]
    },
    {
      id: "preferred_date",
      question: "When would you like this done?",
      type: "select",
      required: true,
      options: [
        { value: "today_tomorrow", label: "Today / tomorrow if possible" },
        { value: "this_week", label: "This week" },
        { value: "next_week", label: "Next week" },
        { value: "flexible", label: "Flexible" }
      ]
    },
    {
      id: "access_notes",
      question: "Any access issues, parking restrictions, or ferry times?",
      type: "textarea",
      required: false,
      placeholder: "Narrow streets, ferry schedule, loading bay times, etc."
    },
    {
      id: "photos",
      question: "Do you have any photos to share?",
      type: "file",
      required: false,
      accept: "image/*"
    }
  ];

  return {
    microSlug,
    subcategorySlug,
    categorySlug: "transport-moving-delivery",
    version: 1,
    questions
  };
};

/**
 * Detailed pack: House/flat move (local)
 */
const houseFlatMoveLocalPack: MicroservicePack = {
  microSlug: "house-flat-move-local",
  subcategorySlug: "home-office-moves",
  categorySlug: "transport-moving-delivery",
  version: 1,
  questions: [
    {
      id: "current_property_type",
      question: "Current property type?",
      type: "select",
      required: true,
      options: [
        { value: "apartment_lift", label: "Apartment with lift" },
        { value: "apartment_no_lift", label: "Apartment without lift / walk-up" },
        { value: "house_ground", label: "House / villa (ground floor)" },
        { value: "house_multi", label: "House / villa (multiple floors)" }
      ]
    },
    {
      id: "current_floor",
      question: "Which floor (if applicable)?",
      type: "select",
      required: false,
      options: [
        { value: "ground", label: "Ground floor" },
        { value: "1st", label: "1st floor" },
        { value: "2nd", label: "2nd floor" },
        { value: "3rd_plus", label: "3rd floor or higher" }
      ]
    },
    {
      id: "new_property_type",
      question: "New property type?",
      type: "select",
      required: true,
      options: [
        { value: "apartment_lift", label: "Apartment with lift" },
        { value: "apartment_no_lift", label: "Apartment without lift / walk-up" },
        { value: "house_ground", label: "House / villa (ground floor)" },
        { value: "house_multi", label: "House / villa (multiple floors)" }
      ]
    },
    {
      id: "new_floor",
      question: "Which floor at new property (if applicable)?",
      type: "select",
      required: false,
      options: [
        { value: "ground", label: "Ground floor" },
        { value: "1st", label: "1st floor" },
        { value: "2nd", label: "2nd floor" },
        { value: "3rd_plus", label: "3rd floor or higher" }
      ]
    },
    {
      id: "property_size",
      question: "Size of property being moved?",
      type: "select",
      required: true,
      options: [
        { value: "studio_1bed", label: "Studio / 1 bedroom" },
        { value: "2bed", label: "2 bedrooms" },
        { value: "3bed", label: "3 bedrooms" },
        { value: "4bed_plus", label: "4+ bedrooms" }
      ]
    },
    {
      id: "large_items",
      question: "Do you have any particularly large or heavy items?",
      type: "checkbox",
      required: false,
      options: [
        { value: "piano", label: "Piano" },
        { value: "large_sofa", label: "Large sofa / sectional" },
        { value: "heavy_furniture", label: "Heavy antique / solid furniture" },
        { value: "large_appliances", label: "Large appliances (fridge, washer)" },
        { value: "none", label: "No unusually large items" }
      ]
    },
    {
      id: "disassembly",
      question: "Do you need help with furniture disassembly/reassembly?",
      type: "radio",
      required: true,
      options: [
        { value: "yes_both", label: "Yes – disassemble and reassemble" },
        { value: "yes_disassemble", label: "Yes – disassemble only" },
        { value: "no", label: "No – furniture ready to move" }
      ]
    },
    {
      id: "packing_service",
      question: "Do you need packing/unpacking service?",
      type: "select",
      required: true,
      options: [
        { value: "full_packing", label: "Full packing service" },
        { value: "fragile_only", label: "Just fragile items" },
        { value: "materials_only", label: "Just supply boxes/materials" },
        { value: "no_packed", label: "No – I'll pack everything" }
      ]
    },
    {
      id: "move_date",
      question: "When is your move date?",
      type: "select",
      required: true,
      options: [
        { value: "within_week", label: "Within 1 week" },
        { value: "1_2_weeks", label: "1–2 weeks" },
        { value: "2_4_weeks", label: "2–4 weeks" },
        { value: "flexible", label: "Flexible / not fixed yet" }
      ]
    },
    {
      id: "time_window",
      question: "Do you have a specific time window (key handover, etc.)?",
      type: "text",
      required: false,
      placeholder: "E.g. 'Must complete by 3pm', 'Keys available from 10am'"
    }
  ]
};

/**
 * Detailed pack: Small van jobs / man with a van
 */
const smallVanJobsPack: MicroservicePack = {
  microSlug: "small-van-jobs",
  subcategorySlug: "man-with-van-small-moves",
  categorySlug: "transport-moving-delivery",
  version: 1,
  questions: [
    {
      id: "items_description",
      question: "What items need to be moved?",
      type: "textarea",
      required: true,
      placeholder: "E.g. '1 sofa, 1 fridge, 5 boxes', '1 mattress and bed frame'"
    },
    {
      id: "num_items",
      question: "Roughly how many items in total?",
      type: "select",
      required: true,
      options: [
        { value: "1_3", label: "1–3 items" },
        { value: "4_10", label: "4–10 items" },
        { value: "10_plus", label: "More than 10 items" }
      ]
    },
    {
      id: "item_size",
      question: "Size of largest item?",
      type: "select",
      required: false,
      options: [
        { value: "boxes_small", label: "Boxes / small items only" },
        { value: "chair_table", label: "Chair / small table size" },
        { value: "sofa_appliance", label: "Sofa / large appliance" },
        { value: "very_large", label: "Very large / bulky" }
      ]
    },
    {
      id: "items_ready",
      question: "Are items ready by the door or need to be carried?",
      type: "select",
      required: true,
      options: [
        { value: "ready_door", label: "Ready by the door" },
        { value: "need_carry_up", label: "Need to be carried up stairs" },
        { value: "need_carry_down", label: "Need to be carried down stairs" },
        { value: "in_place", label: "Still in place – need help moving to door" }
      ]
    },
    {
      id: "special_items",
      question: "Any fragile, heavy or special handling items?",
      type: "checkbox",
      required: false,
      options: [
        { value: "fragile", label: "Fragile / needs wrapping" },
        { value: "very_heavy", label: "Very heavy (requires 2 people)" },
        { value: "valuable", label: "Valuable / antique" },
        { value: "awkward", label: "Awkward shape or size" },
        { value: "none", label: "No special requirements" }
      ]
    },
    {
      id: "distance",
      question: "What is the distance/type of journey?",
      type: "select",
      required: true,
      options: [
        { value: "same_building", label: "Same building" },
        { value: "short_local", label: "Short local trip (under 5km)" },
        { value: "cross_island", label: "Across the island" },
        { value: "long_distance", label: "Long distance / different island" }
      ]
    },
    {
      id: "timing",
      question: "When do you need this done?",
      type: "select",
      required: true,
      options: [
        { value: "today", label: "Today" },
        { value: "tomorrow", label: "Tomorrow" },
        { value: "this_week", label: "Within this week" },
        { value: "flexible", label: "Flexible" }
      ]
    }
  ]
};

/**
 * Detailed pack: Same-day local delivery
 */
const sameDayLocalDeliveryPack: MicroservicePack = {
  microSlug: "same-day-local-delivery",
  subcategorySlug: "delivery-courier",
  categorySlug: "transport-moving-delivery",
  version: 1,
  questions: [
    {
      id: "parcel_type",
      question: "What type of items are being delivered?",
      type: "select",
      required: true,
      options: [
        { value: "documents", label: "Documents / papers" },
        { value: "small_parcel", label: "Small parcel (under 5kg)" },
        { value: "medium_parcel", label: "Medium parcel (5–20kg)" },
        { value: "large_bulky", label: "Large or bulky items" },
        { value: "food_perishable", label: "Food / perishable" }
      ]
    },
    {
      id: "num_items",
      question: "How many items/parcels?",
      type: "select",
      required: true,
      options: [
        { value: "1", label: "1 item" },
        { value: "2_5", label: "2–5 items" },
        { value: "6_10", label: "6–10 items" },
        { value: "more_than_10", label: "More than 10 items" }
      ]
    },
    {
      id: "special_handling",
      question: "Any special handling requirements?",
      type: "checkbox",
      required: false,
      options: [
        { value: "fragile", label: "Fragile" },
        { value: "high_value", label: "High value / insurance needed" },
        { value: "temperature", label: "Temperature controlled" },
        { value: "signature", label: "Signature required on delivery" },
        { value: "none", label: "No special requirements" }
      ]
    },
    {
      id: "pickup_location",
      question: "Pickup location?",
      type: "text",
      required: true,
      placeholder: "Full address or area"
    },
    {
      id: "delivery_location",
      question: "Delivery location?",
      type: "text",
      required: true,
      placeholder: "Full address or area"
    },
    {
      id: "timing_requirement",
      question: "When does this need to be delivered?",
      type: "select",
      required: true,
      options: [
        { value: "within_2_hours", label: "Within 2 hours" },
        { value: "today_afternoon", label: "Today afternoon" },
        { value: "today_evening", label: "Today evening" },
        { value: "tomorrow_morning", label: "Tomorrow morning" }
      ]
    },
    {
      id: "frequency",
      question: "Is this a one-off or regular delivery?",
      type: "radio",
      required: true,
      options: [
        { value: "one_off", label: "One-off delivery" },
        { value: "regular_weekly", label: "Regular (weekly)" },
        { value: "regular_daily", label: "Regular (daily)" },
        { value: "occasional", label: "Occasional / ad-hoc" }
      ]
    }
  ]
};

/**
 * Remaining Transport micro-services → generic pack
 */
const genericTransportServices: {
  microSlug: string;
  name: string;
  subcategorySlug: string;
}[] = [
  // Home and Office Moves (others)
  { microSlug: "house-flat-move-long-distance", name: "House or flat move (long distance)", subcategorySlug: "home-office-moves" },
  { microSlug: "office-business-moves",         name: "Office and business moves",          subcategorySlug: "home-office-moves" },
  { microSlug: "single-large-item-transport",   name: "Single large item transport",        subcategorySlug: "home-office-moves" },

  // Man with a Van & Small Moves (others)
  { microSlug: "few-items-partial-move",        name: "Few items / partial move",           subcategorySlug: "man-with-van-small-moves" },
  { microSlug: "store-shop-collections",        name: "Store / shop collections",           subcategorySlug: "man-with-van-small-moves" },
  { microSlug: "rubbish-tip-runs",              name: "Rubbish / tip runs",                 subcategorySlug: "man-with-van-small-moves" },

  // Delivery and Courier (others)
  { microSlug: "scheduled-delivery",            name: "Scheduled delivery",                 subcategorySlug: "delivery-courier" },
  { microSlug: "document-sensitive-delivery",   name: "Document / sensitive delivery",      subcategorySlug: "delivery-courier" },
  { microSlug: "regular-courier-runs",          name: "Regular courier runs",               subcategorySlug: "delivery-courier" },

  // Passenger & Airport Transfers
  { microSlug: "airport-transfers",             name: "Airport transfers",                  subcategorySlug: "passenger-airport-transfers" },
  { microSlug: "staff-crew-transport",          name: "Staff / crew transport",             subcategorySlug: "passenger-airport-transfers" },
  { microSlug: "event-shuttle-service",         name: "Event shuttle service",              subcategorySlug: "passenger-airport-transfers" },

  // Vehicle Transport & Recovery
  { microSlug: "car-motorbike-transport",       name: "Car or motorbike transport",         subcategorySlug: "vehicle-transport-recovery" },
  { microSlug: "breakdown-recovery",            name: "Breakdown recovery",                 subcategorySlug: "vehicle-transport-recovery" },
  { microSlug: "boat-jet-ski-transport",        name: "Boat / jet-ski trailer transport",   subcategorySlug: "vehicle-transport-recovery" }
];

const genericTransportPacks: MicroservicePack[] = genericTransportServices.map(s =>
  buildGenericTransportPack(s.microSlug, s.name, s.subcategorySlug)
);

export const transportQuestionPacks: MicroservicePack[] = [
  houseFlatMoveLocalPack,
  smallVanJobsPack,
  sameDayLocalDeliveryPack,
  ...genericTransportPacks
];
