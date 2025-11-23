/**
 * Commercial & Industrial Question Templates
 * Generic + 3 detailed flows for commercial projects
 */

import type { WizardQuestion } from './constructionQuestionBlocks';

interface MicroservicePack {
  microSlug: string;
  subcategorySlug: string;
  categorySlug: string;
  version: number;
  questions: WizardQuestion[];
}

/**
 * Generic Commercial & Industrial pack
 */
const buildGenericCommercialPack = (
  microSlug: string,
  readableName: string,
  subcategorySlug: string
): MicroservicePack => {
  const questions: WizardQuestion[] = [
    {
      id: 'business_type',
      question: 'What type of business or organisation is this for?',
      type: 'select',
      required: true,
      options: [
        'Office / admin',
        'Retail / shop',
        'Restaurant / bar / cafe',
        'Industrial / warehouse / workshop',
        'Public / educational / healthcare',
        'Other'
      ]
    },
    {
      id: 'property_status',
      question: 'What is the current status of the space?',
      type: 'select',
      required: true,
      options: [
        'Open and trading',
        'Closed for works',
        'New shell / empty space',
        'Occupied office with staff'
      ]
    },
    {
      id: 'approx_size',
      question: 'Approximate size of the area (if known)?',
      type: 'select',
      required: false,
      options: [
        'Under 100 m²',
        '100–300 m²',
        '300–600 m²',
        'Over 600 m²',
        'Not sure'
      ]
    },
    {
      id: 'working_hours_constraints',
      question: 'Are there restrictions on when work can be carried out?',
      type: 'select',
      required: true,
      options: [
        'Daytime weekdays is fine',
        'Evenings / nights / weekends only',
        'Mix of normal and out-of-hours',
        'Not sure yet'
      ]
    },
    {
      id: 'other_trades_required',
      question: 'Which trades are likely to be involved?',
      type: 'multiselect',
      required: false,
      options: [
        'Construction / partitions',
        'Electrics / lighting',
        'Air conditioning / ventilation',
        'Plumbing / drainage',
        'Painting / decorating',
        'Flooring'
      ]
    },
    {
      id: 'timeline',
      question: 'When would you like the work to start?',
      type: 'select',
      required: true,
      options: [
        'As soon as possible',
        'Within 1–3 months',
        'Within 3–6 months',
        'Flexible / early planning'
      ]
    },
    {
      id: 'budget_band',
      question: 'Do you have a rough budget band?',
      type: 'select',
      required: false,
      options: [
        'Under €20k',
        '€20k–€50k',
        '€50k–€100k',
        'Over €100k',
        'Not sure yet'
      ]
    },
    {
      id: 'description',
      question: `Briefly describe what you need for "${readableName}".`,
      type: 'textarea',
      required: true,
      placeholder: 'What needs doing, which areas, and any key requirements?'
    },
    {
      id: 'plans_photos',
      question: 'Do you have any plans, photos or drawings to share?',
      type: 'file',
      required: false,
      accept: 'image/*,application/pdf'
    }
  ];

  return {
    microSlug,
    subcategorySlug,
    categorySlug: 'commercial-industrial',
    version: 1,
    questions
  };
};

/**
 * Detailed pack: Office fit-outs
 */
const officeFitOutsPack: MicroservicePack = {
  microSlug: 'office-fit-outs',
  subcategorySlug: 'office-fit-outs-refurbishments',
  categorySlug: 'commercial-industrial',
  version: 1,
  questions: [
    {
      id: 'office_use',
      question: 'What will the office mainly be used for?',
      type: 'select',
      required: true,
      options: [
        'General office / admin',
        'Call centre',
        'Creative / studio',
        'Client-facing / reception',
        'Mixed use'
      ]
    },
    {
      id: 'num_people',
      question: 'Roughly how many people will work in the space?',
      type: 'select',
      required: true,
      options: [
        'Up to 10 people',
        '10–25 people',
        '25–50 people',
        'More than 50 people',
        'Not sure yet'
      ]
    },
    {
      id: 'fitout_scope',
      question: 'What is the scope of the office fit-out?',
      type: 'multiselect',
      required: true,
      options: [
        'Partitions / offices / meeting rooms',
        'Ceilings and lighting',
        'Flooring',
        'Kitchen / tea point',
        'Reception area',
        'Desks, chairs and furniture',
        'Data, power and AV'
      ]
    },
    {
      id: 'design_stage',
      question: 'Where are you in the design process?',
      type: 'select',
      required: true,
      options: [
        'No design yet – need help',
        'Concept / basic layout only',
        'Detailed drawings ready',
        'Out to tender already'
      ]
    },
    {
      id: 'fitout_type',
      question: 'What type of fit-out best describes this project?',
      type: 'select',
      required: true,
      options: [
        'Cat A (basic landlord fit-out)',
        'Cat B (tenant fit-out)',
        'Refurbishment while occupied',
        'Not sure / need advice'
      ]
    },
    {
      id: 'trading_constraints',
      question: 'Are there constraints around keeping part of the office operational?',
      type: 'select',
      required: false,
      options: [
        'No – space will be empty',
        'Yes – some staff remain on site',
        'Yes – work must be phased in sections'
      ]
    },
    {
      id: 'timeline',
      question: 'When would you like the office ready for use?',
      type: 'select',
      required: true,
      options: [
        'Within 2 months',
        'Within 2–4 months',
        'Within 4–6 months',
        'Flexible'
      ]
    }
  ]
};

/**
 * Detailed pack: Retail spaces
 */
const retailSpacesPack: MicroservicePack = {
  microSlug: 'retail-spaces',
  subcategorySlug: 'retail-hospitality-leisure',
  categorySlug: 'commercial-industrial',
  version: 1,
  questions: [
    {
      id: 'retail_type',
      question: 'What type of retail or hospitality business is it?',
      type: 'select',
      required: true,
      options: [
        'Fashion / boutique',
        'Convenience / grocery',
        'Restaurant',
        'Bar / cafe',
        'Beauty / salon / spa',
        'Other'
      ]
    },
    {
      id: 'space_condition',
      question: 'What is the current condition of the space?',
      type: 'select',
      required: true,
      options: [
        'Shell and core (basic empty shell)',
        'White box (basic finished shell)',
        'Currently trading but needs refurb',
        'Vacant with old fit-out in place'
      ]
    },
    {
      id: 'customer_area_scope',
      question: 'What needs doing in the customer-facing area?',
      type: 'multiselect',
      required: true,
      options: [
        'Flooring',
        'Display units / shelving',
        'Counters / bars / reception',
        'Lighting and signage',
        'Decoration and finishes'
      ]
    },
    {
      id: 'back_of_house_scope',
      question: 'What needs doing in back-of-house or service areas?',
      type: 'multiselect',
      required: false,
      options: [
        'Kitchen / prep area',
        'Storage / stock room',
        'Staff areas / changing / office',
        'Customer / staff toilets'
      ]
    },
    {
      id: 'centre_rules',
      question: 'Is this inside a shopping centre or building with specific rules?',
      type: 'select',
      required: false,
      options: [
        'Yes – centre / building rules apply',
        'No – independent building / street unit',
        'Not sure'
      ]
    },
    {
      id: 'go_live_date',
      question: 'When do you plan to open or re-open to customers?',
      type: 'select',
      required: true,
      options: [
        'Within 1 month',
        'Within 1–3 months',
        'Within 3–6 months',
        'Flexible'
      ]
    }
  ]
};

/**
 * Detailed pack: Large commercial projects
 */
const commercialProjectsPack: MicroservicePack = {
  microSlug: 'commercial-projects',
  subcategorySlug: 'office-fit-outs-refurbishments',
  categorySlug: 'commercial-industrial',
  version: 1,
  questions: [
    {
      id: 'project_type',
      question: 'What best describes this commercial project?',
      type: 'select',
      required: true,
      options: [
        'Refurbishment of several areas/floors',
        'Full fit-out of a new space',
        'Reconfiguration / extension of existing space',
        'Mixed-use commercial project'
      ]
    },
    {
      id: 'project_size',
      question: 'Approximate project size or rough budget band?',
      type: 'select',
      required: true,
      options: [
        'Under €50k',
        '€50k–€150k',
        '€150k–€500k',
        'Over €500k',
        'Not sure yet'
      ]
    },
    {
      id: 'delivery_model',
      question: 'What delivery model are you looking for?',
      type: 'select',
      required: true,
      options: [
        'Design and build',
        'Build only (design already done)',
        'Project management and coordination',
        'Not sure / need advice'
      ]
    },
    {
      id: 'documentation_status',
      question: 'What documentation do you already have?',
      type: 'multiselect',
      required: false,
      options: [
        'Concept designs',
        'Technical drawings',
        'Specification / scope of works',
        'Planning permission approved (if needed)',
        'None yet'
      ]
    },
    {
      id: 'timetable_constraints',
      question: 'Are there key dates or constraints to work around?',
      type: 'multiselect',
      required: false,
      options: [
        'Lease start / end dates',
        'Trading / seasonal opening dates',
        'Need phased works to keep some areas open',
        'Other constraints'
      ]
    },
    {
      id: 'decision_stage',
      question: 'Where are you in your decision process?',
      type: 'select',
      required: true,
      options: [
        'Early feasibility / budgeting',
        'Putting the work out to tender',
        'Shortlisting contractors now',
        'Ready to appoint a contractor'
      ]
    },
    {
      id: 'timeline',
      question: 'When do you expect site works to start?',
      type: 'select',
      required: true,
      options: [
        'Within 3 months',
        'Within 3–6 months',
        'Within 6–12 months',
        'Flexible'
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
  { microSlug: 'office-refurbishments',           name: 'Office refurbishments',            subcategorySlug: 'office-fit-outs-refurbishments' },
  { microSlug: 'coworking-shared-offices',        name: 'Co-working and shared offices',    subcategorySlug: 'office-fit-outs-refurbishments' },
  { microSlug: 'meeting-boardrooms',              name: 'Meeting and boardrooms',           subcategorySlug: 'office-fit-outs-refurbishments' },

  // Retail, Hospitality and Leisure (others)
  { microSlug: 'restaurant-bar-fitouts',          name: 'Restaurant and bar fit-outs',      subcategorySlug: 'retail-hospitality-leisure' },
  { microSlug: 'cafe-takeaway-refurbishments',    name: 'Cafe and takeaway refurbishments', subcategorySlug: 'retail-hospitality-leisure' },
  { microSlug: 'clubs-venue-fitouts',             name: 'Clubs and venue fit-outs',         subcategorySlug: 'retail-hospitality-leisure' },
  { microSlug: 'popup-temporary-shops',           name: 'Pop-up and temporary shops',       subcategorySlug: 'retail-hospitality-leisure' },

  // Industrial, Warehouse and Storage
  { microSlug: 'warehouse-fitouts',               name: 'Warehouse fit-outs',               subcategorySlug: 'industrial-warehouse-storage' },
  { microSlug: 'industrial-unit-refurbishments',  name: 'Industrial unit refurbishments',   subcategorySlug: 'industrial-warehouse-storage' },
  { microSlug: 'racking-storage-systems',         name: 'Racking and storage systems',      subcategorySlug: 'industrial-warehouse-storage' },
  { microSlug: 'loading-bay-access-works',        name: 'Loading bay and access works',     subcategorySlug: 'industrial-warehouse-storage' },
  { microSlug: 'clean-rooms-specialist-areas',    name: 'Clean rooms and specialist areas', subcategorySlug: 'industrial-warehouse-storage' },

  // Commercial Maintenance and Repairs
  { microSlug: 'general-commercial-repairs',      name: 'General commercial repairs',       subcategorySlug: 'commercial-maintenance-repairs' },
  { microSlug: 'planned-maintenance-contracts',   name: 'Planned maintenance contracts',    subcategorySlug: 'commercial-maintenance-repairs' },
  { microSlug: 'emergency-callouts',              name: 'Emergency call-outs',              subcategorySlug: 'commercial-maintenance-repairs' },
  { microSlug: 'common-areas-stairwells',         name: 'Common areas and stairwells',      subcategorySlug: 'commercial-maintenance-repairs' },
  { microSlug: 'shopfront-facade-repairs',        name: 'Shopfront and facade repairs',     subcategorySlug: 'commercial-maintenance-repairs' },

  // Building Services and Compliance
  { microSlug: 'fire-safety-works',               name: 'Fire safety works',                subcategorySlug: 'building-services-compliance' },
  { microSlug: 'accessibility-improvements',      name: 'Accessibility improvements',       subcategorySlug: 'building-services-compliance' },
  { microSlug: 'partitioning-layout-changes',     name: 'Partitioning and layout changes',  subcategorySlug: 'building-services-compliance' },
  { microSlug: 'acoustic-treatments',             name: 'Acoustic treatments',              subcategorySlug: 'building-services-compliance' },
  { microSlug: 'signage-wayfinding',              name: 'Signage and wayfinding',           subcategorySlug: 'building-services-compliance' }
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

/**
 * Taxonomy definitions for Commercial & Industrial
 */
export const commercialIndustrialSubcategories = [
  {
    name: 'Office Fit-Outs and Refurbishments',
    slug: 'office-fit-outs-refurbishments',
    icon: 'Building2',
    services: [
      { name: 'Office fit-outs',                slug: 'office-fit-outs' },
      { name: 'Office refurbishments',          slug: 'office-refurbishments' },
      { name: 'Co-working and shared offices',  slug: 'coworking-shared-offices' },
      { name: 'Meeting and boardrooms',         slug: 'meeting-boardrooms' },
      { name: 'Large commercial projects',      slug: 'commercial-projects' }
    ]
  },
  {
    name: 'Retail, Hospitality and Leisure',
    slug: 'retail-hospitality-leisure',
    icon: 'Store',
    services: [
      { name: 'Retail spaces',                  slug: 'retail-spaces' },
      { name: 'Restaurant and bar fit-outs',    slug: 'restaurant-bar-fitouts' },
      { name: 'Cafe and takeaway refurbishments', slug: 'cafe-takeaway-refurbishments' },
      { name: 'Clubs and venue fit-outs',       slug: 'clubs-venue-fitouts' },
      { name: 'Pop-up and temporary shops',     slug: 'popup-temporary-shops' }
    ]
  },
  {
    name: 'Industrial, Warehouse and Storage',
    slug: 'industrial-warehouse-storage',
    icon: 'Warehouse',
    services: [
      { name: 'Warehouse fit-outs',             slug: 'warehouse-fitouts' },
      { name: 'Industrial unit refurbishments', slug: 'industrial-unit-refurbishments' },
      { name: 'Racking and storage systems',    slug: 'racking-storage-systems' },
      { name: 'Loading bay and access works',   slug: 'loading-bay-access-works' },
      { name: 'Clean rooms and specialist areas', slug: 'clean-rooms-specialist-areas' }
    ]
  },
  {
    name: 'Commercial Maintenance and Repairs',
    slug: 'commercial-maintenance-repairs',
    icon: 'Wrench',
    services: [
      { name: 'General commercial repairs',     slug: 'general-commercial-repairs' },
      { name: 'Planned maintenance contracts',  slug: 'planned-maintenance-contracts' },
      { name: 'Emergency call-outs',            slug: 'emergency-callouts' },
      { name: 'Common areas and stairwells',    slug: 'common-areas-stairwells' },
      { name: 'Shopfront and facade repairs',   slug: 'shopfront-facade-repairs' }
    ]
  },
  {
    name: 'Building Services and Compliance',
    slug: 'building-services-compliance',
    icon: 'ShieldCheck',
    services: [
      { name: 'Fire safety works',              slug: 'fire-safety-works' },
      { name: 'Accessibility improvements',     slug: 'accessibility-improvements' },
      { name: 'Partitioning and layout changes',slug: 'partitioning-layout-changes' },
      { name: 'Acoustic treatments',            slug: 'acoustic-treatments' },
      { name: 'Signage and wayfinding',         slug: 'signage-wayfinding' }
    ]
  }
];
