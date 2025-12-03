/**
 * Transport & Logistics Question Packs
 * 6 micro-services with tile-based questions (per user spec):
 * - All core questions: single/multi select (tiles)
 * - Second-to-last: textarea (additional info)
 * - Last: file upload (photos)
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

// Helper to create options
function opts(...labels: string[]): QuestionOption[] {
  return labels.map((label, i) => ({
    value: label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, ''),
    label
  }));
}

// ============================================
// 1. MAN WITH A VAN
// ============================================
const manWithVan: MicroservicePack = {
  microSlug: 'man-with-van',
  subcategorySlug: 'small-moves-deliveries',
  categorySlug: 'transport-logistics',
  version: 1,
  questions: [
    {
      id: 'q1',
      question: 'What are you mainly moving?',
      type: 'radio',
      required: true,
      options: opts('Furniture', 'Appliances', 'Boxes and bags', 'Mixed household items', 'Office items')
    },
    {
      id: 'q2',
      question: 'Approximately how many items or boxes need to be moved?',
      type: 'radio',
      required: true,
      options: opts('1–5 items', '6–15 items', '16–30 items', 'More than 30 items')
    },
    {
      id: 'q3',
      question: 'Do you have any heavy or bulky items?',
      type: 'checkbox',
      required: false,
      options: opts('Sofa or corner sofa', 'Bed or mattress', 'Wardrobe or large cupboard', 'Fridge or freezer', 'Washing machine or dryer', 'No heavy or bulky items')
    },
    {
      id: 'q4',
      question: 'What is access like at the pickup location?',
      type: 'radio',
      required: true,
      options: opts('Ground floor with easy access', '1–2 floors with stairs', '3+ floors with stairs', 'Lift available', 'Long walk from parking to entrance')
    },
    {
      id: 'q5',
      question: 'What is access like at the delivery location?',
      type: 'radio',
      required: true,
      options: opts('Ground floor with easy access', '1–2 floors with stairs', '3+ floors with stairs', 'Lift available', 'Long walk from parking to entrance')
    },
    {
      id: 'q6',
      question: 'Do you need the driver to help with loading or unloading?',
      type: 'radio',
      required: true,
      options: opts('Help with both loading and unloading', 'Help with loading only', 'Help with unloading only', 'No help needed, just transport')
    },
    {
      id: 'q7',
      question: 'Are there any access restrictions at either location (narrow roads, gate codes, low ceilings, etc.)?',
      type: 'textarea',
      required: false,
      placeholder: 'Describe any special access requirements or restrictions...'
    },
    {
      id: 'q8',
      question: 'Please upload any photos of the items or access areas that will help the driver understand the job.',
      type: 'file',
      required: false,
      accept: 'image/*,application/pdf'
    }
  ]
};

// ============================================
// 2. FURNITURE & APPLIANCE DELIVERY
// ============================================
const furnitureApplianceDelivery: MicroservicePack = {
  microSlug: 'furniture-appliance-delivery',
  subcategorySlug: 'small-moves-deliveries',
  categorySlug: 'transport-logistics',
  version: 1,
  questions: [
    {
      id: 'q1',
      question: 'What do you need delivered?',
      type: 'radio',
      required: true,
      options: opts('Furniture', 'Appliances', 'Furniture and appliances', 'Mixed household items')
    },
    {
      id: 'q2',
      question: 'How many main items need to be delivered?',
      type: 'radio',
      required: true,
      options: opts('1 item', '2–3 items', '4–6 items', 'More than 6 items')
    },
    {
      id: 'q3',
      question: 'Will any items need to be moved up or down stairs at the pickup location?',
      type: 'radio',
      required: true,
      options: opts('No stairs, ground floor only', '1–2 floors with stairs', '3+ floors with stairs', 'Lift available')
    },
    {
      id: 'q4',
      question: 'Will any items need to be moved up or down stairs at the delivery location?',
      type: 'radio',
      required: true,
      options: opts('No stairs, ground floor only', '1–2 floors with stairs', '3+ floors with stairs', 'Lift available')
    },
    {
      id: 'q5',
      question: 'How close can the vehicle park to the entrance at the delivery address?',
      type: 'radio',
      required: true,
      options: opts('Right outside the entrance', 'Within 10 metres', '10–25 metres away', 'More than 25 metres away', 'Unsure')
    },
    {
      id: 'q6',
      question: 'Do you need the driver to install or connect any appliances?',
      type: 'radio',
      required: true,
      options: opts('No, delivery only', 'Yes, install or connect appliances', 'Not sure yet, need advice')
    },
    {
      id: 'q7',
      question: 'Are there any special handling requirements (fragile, high value, awkward size, etc.)?',
      type: 'textarea',
      required: false,
      placeholder: 'Describe any special handling needs...'
    },
    {
      id: 'q8',
      question: 'Please upload any photos of the items or access areas that will help with the delivery.',
      type: 'file',
      required: false,
      accept: 'image/*,application/pdf'
    }
  ]
};

// ============================================
// 3. CRANE HIRE
// ============================================
const craneHire: MicroservicePack = {
  microSlug: 'crane-hire',
  subcategorySlug: 'heavy-lifting-equipment',
  categorySlug: 'transport-logistics',
  version: 1,
  questions: [
    {
      id: 'q1',
      question: 'What do you need the crane to lift?',
      type: 'radio',
      required: true,
      options: opts('Building materials (steel, beams, trusses)', 'Hot tub or pool', 'Roofing materials or tiles', 'Containers or cabins', 'Machinery or equipment', 'Other (will explain at the end)')
    },
    {
      id: 'q2',
      question: 'What is the approximate weight of the heaviest item to be lifted?',
      type: 'radio',
      required: true,
      options: opts('Up to 500 kg', '500 kg – 1 tonne', '1 – 3 tonnes', 'More than 3 tonnes', 'Unsure')
    },
    {
      id: 'q3',
      question: 'What height does the crane need to reach?',
      type: 'radio',
      required: true,
      options: opts('Up to 5 metres (single storey)', '5–10 metres (2 storeys)', '10–15 metres (3–4 storeys)', '15–25 metres (5+ storeys)', 'Higher than 25 metres', 'Unsure, need advice')
    },
    {
      id: 'q4',
      question: 'What is access like for the crane at the site?',
      type: 'checkbox',
      required: false,
      options: opts('Wide road access', 'Narrow road access', 'Low bridges or cables nearby', 'Tight entrance or gateway', 'Limited turning space', 'Unsure, need advice')
    },
    {
      id: 'q5',
      question: 'What are the ground conditions where the crane will need to set up?',
      type: 'radio',
      required: true,
      options: opts('Solid concrete or tarmac', 'Paved area', 'Compacted soil or gravel', 'Soft or uneven ground', 'Unsure')
    },
    {
      id: 'q6',
      question: 'Do you need the crane company to provide an operator and lifting team?',
      type: 'radio',
      required: true,
      options: opts('Crane with operator only', 'Crane with operator and lifting team', 'Not sure, need advice')
    },
    {
      id: 'q7',
      question: 'Are there any obstructions near the lift area (trees, power lines, nearby buildings, etc.) or anything else we should know?',
      type: 'textarea',
      required: false,
      placeholder: 'Describe any obstructions or other considerations...'
    },
    {
      id: 'q8',
      question: 'Please upload any site photos, drawings, or plans that will help assess the lift.',
      type: 'file',
      required: false,
      accept: 'image/*,application/pdf'
    }
  ]
};

// ============================================
// 4. HEAVY EQUIPMENT TRANSPORT
// ============================================
const heavyEquipmentTransport: MicroservicePack = {
  microSlug: 'heavy-equipment-transport',
  subcategorySlug: 'heavy-lifting-equipment',
  categorySlug: 'transport-logistics',
  version: 1,
  questions: [
    {
      id: 'q1',
      question: 'What type of equipment needs transporting?',
      type: 'radio',
      required: true,
      options: opts('Mini digger or small excavator', 'Full-size excavator or plant', 'Forklift or telehandler', 'Generator or compressor', 'Agricultural machinery', 'Industrial machinery', 'Other heavy equipment')
    },
    {
      id: 'q2',
      question: 'What is the approximate weight of the equipment?',
      type: 'radio',
      required: true,
      options: opts('Up to 1 tonne', '1–3 tonnes', '3–7 tonnes', '7–20 tonnes', 'More than 20 tonnes', 'Unsure')
    },
    {
      id: 'q3',
      question: 'What are the approximate overall dimensions?',
      type: 'radio',
      required: true,
      options: opts('Small (fits on a standard trailer)', 'Medium (requires a flatbed lorry)', 'Large (requires a low-loader)', 'Very large (may need escort or special planning)', 'Unsure, need advice')
    },
    {
      id: 'q4',
      question: 'How will the equipment be loaded at the pickup location?',
      type: 'radio',
      required: true,
      options: opts('It can be driven onto the vehicle', 'Forklift available on site', 'Crane available on site', 'Winch or ramps needed', 'Unsure')
    },
    {
      id: 'q5',
      question: 'How will the equipment be unloaded at the delivery location?',
      type: 'radio',
      required: true,
      options: opts('It can be driven off the vehicle', 'Forklift available on site', 'Crane available on site', 'Winch or ramps needed', 'Unsure')
    },
    {
      id: 'q6',
      question: 'Are there any access restrictions at either location (narrow roads, low bridges, tight entrances, etc.)?',
      type: 'textarea',
      required: false,
      placeholder: 'Describe any access restrictions...'
    },
    {
      id: 'q7',
      question: 'Please upload any photos of the equipment and access areas that will help with planning transport.',
      type: 'file',
      required: false,
      accept: 'image/*,application/pdf'
    }
  ]
};

// ============================================
// 5. SKIP HIRE & DELIVERY
// ============================================
const skipHireDelivery: MicroservicePack = {
  microSlug: 'skip-hire-delivery',
  subcategorySlug: 'waste-materials',
  categorySlug: 'transport-logistics',
  version: 1,
  questions: [
    {
      id: 'q1',
      question: 'What type of waste will go into the skip?',
      type: 'checkbox',
      required: true,
      options: opts('General household waste', 'Garden waste', 'Builders\' rubble or hardcore', 'Wood', 'Metal', 'Soil or earth', 'Mixed waste or unsure')
    },
    {
      id: 'q2',
      question: 'What size skip do you think you need?',
      type: 'radio',
      required: true,
      options: opts('Small / mini skip', 'Medium / midi skip', 'Standard builders\' skip', 'Large skip', 'Unsure, need advice')
    },
    {
      id: 'q3',
      question: 'Where do you plan to place the skip?',
      type: 'radio',
      required: true,
      options: opts('On a private driveway', 'On private land (garden, yard, etc.)', 'On the road outside the property', 'Not sure yet, need advice')
    },
    {
      id: 'q4',
      question: 'Is there suitable access for a large truck to deliver and collect the skip?',
      type: 'checkbox',
      required: false,
      options: opts('Wide road access', 'Narrow road access', 'Low bridge or cables nearby', 'Tight gateway or entrance', 'Steep hill or uneven road', 'Unsure, need advice')
    },
    {
      id: 'q5',
      question: 'Roughly how long do you expect to need the skip?',
      type: 'radio',
      required: true,
      options: opts('1–3 days', '4–7 days', '1–2 weeks', 'Longer than 2 weeks', 'Unsure')
    },
    {
      id: 'q6',
      question: 'Are there any restrictions or considerations (permits, neighbours, shared driveway, etc.)?',
      type: 'textarea',
      required: false,
      placeholder: 'Describe any restrictions or special considerations...'
    },
    {
      id: 'q7',
      question: 'Please upload any photos of the access area or where the skip will be placed.',
      type: 'file',
      required: false,
      accept: 'image/*,application/pdf'
    }
  ]
};

// ============================================
// 6. MATERIAL DELIVERY
// ============================================
const materialDelivery: MicroservicePack = {
  microSlug: 'material-delivery',
  subcategorySlug: 'waste-materials',
  categorySlug: 'transport-logistics',
  version: 1,
  questions: [
    {
      id: 'q1',
      question: 'What materials do you need delivered?',
      type: 'checkbox',
      required: true,
      options: opts('Sand', 'Gravel or aggregate', 'Cement', 'Bricks', 'Blocks', 'Timber', 'Tiles', 'Bags of material', 'Other building materials')
    },
    {
      id: 'q2',
      question: 'How much material do you need delivered?',
      type: 'radio',
      required: true,
      options: opts('Small load (up to 1 tonne or 1 pallet)', 'Medium load (1–3 tonnes or 2–4 pallets)', 'Large load (3–10 tonnes or 5–10 pallets)', 'Bulk load (10+ tonnes or full lorry)', 'Multiple deliveries needed')
    },
    {
      id: 'q3',
      question: 'How is the material packaged?',
      type: 'radio',
      required: true,
      options: opts('Bulk loose', 'Tonne bags', 'Small bags', 'Pallets', 'Mixed packaging')
    },
    {
      id: 'q4',
      question: 'How close can the delivery vehicle get to the drop-off point?',
      type: 'radio',
      required: true,
      options: opts('Right next to the drop-off point', 'Within 10 metres', '10–25 metres away', 'More than 25 metres away', 'Unsure')
    },
    {
      id: 'q5',
      question: 'Do you need offloading equipment to be provided?',
      type: 'radio',
      required: true,
      options: opts('Tail lift only', 'Crane offload needed', 'Forklift will be available on site', 'Manual offload only', 'Unsure, need advice')
    },
    {
      id: 'q6',
      question: 'Are there any site or access restrictions (steep drive, narrow road, low trees, shared access, etc.)?',
      type: 'textarea',
      required: false,
      placeholder: 'Describe any site or access restrictions...'
    },
    {
      id: 'q7',
      question: 'Please upload any photos or site plans that will help with planning the delivery.',
      type: 'file',
      required: false,
      accept: 'image/*,application/pdf'
    }
  ]
};

// Export all 6 transport packs
export const transportQuestionPacks: MicroservicePack[] = [
  manWithVan,
  furnitureApplianceDelivery,
  craneHire,
  heavyEquipmentTransport,
  skipHireDelivery,
  materialDelivery
];
