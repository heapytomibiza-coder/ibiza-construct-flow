/**
 * Pool & Spa Question Packs
 * Defines all 35 micro-service question sets for Pool & Spa category
 * 3 detailed packs + 32 generic packs
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
  slug: string;
  subcategorySlug: string;
  name: string;
  questions: QuestionDef[];
};

/**
 * Generic question builder for Pool & Spa services
 */
function buildGenericPoolSpaPack(
  slug: string,
  name: string,
  subcategorySlug: string
): MicroservicePackContent {
  const questions: QuestionDef[] = [
    {
      id: 'description',
      question: `Briefly describe what you need for "${name}".`,
      type: 'textarea',
      required: true,
      placeholder: "What\'s the job, which area/pool, and any key details?"
    },
    {
      id: 'property_type',
      question: 'What type of property is this?',
      type: 'radio',
      required: true,
      options: [
        { value: 'residential', label: 'Residential home' },
        { value: 'commercial', label: 'Commercial property' },
        { value: 'community', label: 'Community/HOA pool' },
        { value: 'hotel', label: 'Hotel/Resort' }
      ]
    },
    {
      id: 'pool_or_spa_type',
      question: 'What type of pool or spa?',
      type: 'radio',
      required: true,
      options: [
        { value: 'in-ground', label: 'In-ground pool' },
        { value: 'above-ground', label: 'Above-ground pool' },
        { value: 'hot-tub', label: 'Hot tub / Spa' },
        { value: 'plunge', label: 'Plunge pool' },
        { value: 'lap', label: 'Lap pool' },
        { value: 'not-sure', label: 'Not sure' }
      ]
    },
    {
      id: 'approx_size',
      question: 'Approximate size or dimensions?',
      type: 'text',
      required: false,
      placeholder: 'e.g., 10m x 5m, 30,000L, medium-sized'
    },
    {
      id: 'equipment_room_access',
      question: 'Is there existing equipment / pump room access?',
      type: 'radio',
      required: false,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not-sure', label: 'Not sure' }
      ]
    },
    {
      id: 'timeline',
      question: 'What\'s your preferred timeline?',
      type: 'radio',
      required: true,
      options: [
        { value: 'urgent', label: 'Urgent (within 48 hours)' },
        { value: 'soon', label: 'Soon (within 1-2 weeks)' },
        { value: 'flexible', label: 'Flexible' },
        { value: 'planning', label: 'Just planning' }
      ]
    },
    {
      id: 'photos',
      question: 'Upload any relevant photos (optional)',
      type: 'file',
      required: false,
      accept: 'image/*',
      helpText: 'Photos of the pool/spa, equipment, or problem area'
    }
  ];

  return { slug, subcategorySlug, name, questions };
}

// ===================================
// DETAILED PACK 1: New pool installation
// ===================================
export const newPoolInstallationPack: MicroservicePackContent = {
  slug: 'new-pool-installation',
  subcategorySlug: 'pool-construction-installation',
  name: 'New pool installation',
  questions: [
    {
      id: 'location',
      question: 'Where will the pool be installed?',
      type: 'radio',
      required: true,
      options: [
        { value: 'garden', label: 'Back garden' },
        { value: 'side', label: 'Side of property' },
        { value: 'front', label: 'Front garden' },
        { value: 'terrace', label: 'Terrace/Rooftop' },
        { value: 'indoor', label: 'Indoor' },
        { value: 'other', label: 'Other location' }
      ]
    },
    {
      id: 'pool_style',
      question: 'What style of pool are you considering?',
      type: 'radio',
      required: true,
      options: [
        { value: 'standard', label: 'Standard rectangular' },
        { value: 'freeform', label: 'Freeform / organic shape' },
        { value: 'lap', label: 'Lap pool (long and narrow)' },
        { value: 'plunge', label: 'Plunge pool (small)' },
        { value: 'infinity', label: 'Infinity edge' },
        { value: 'not-sure', label: 'Not sure yet' }
      ]
    },
    {
      id: 'dimensions',
      question: 'Approximate dimensions or size?',
      type: 'text',
      required: false,
      placeholder: 'e.g., 10m x 5m, or "medium family pool"',
      helpText: 'Give us a rough idea of the pool size you have in mind'
    },
    {
      id: 'construction_type',
      question: 'Do you have a preference for construction type?',
      type: 'radio',
      required: false,
      options: [
        { value: 'concrete', label: 'Concrete (custom design, tiled)' },
        { value: 'fibreglass', label: 'Fibreglass (prefab shell)' },
        { value: 'vinyl', label: 'Vinyl liner' },
        { value: 'not-sure', label: 'Not sure / want advice' }
      ]
    },
    {
      id: 'features',
      question: 'Any special features you\'d like?',
      type: 'checkbox',
      required: false,
      options: [
        { value: 'steps', label: 'Built-in steps' },
        { value: 'bench', label: 'Built-in bench seating' },
        { value: 'spa', label: 'Integrated spa/hot tub' },
        { value: 'waterfall', label: 'Waterfall feature' },
        { value: 'lighting', label: 'Underwater lighting' },
        { value: 'heating', label: 'Pool heating system' },
        { value: 'cover', label: 'Automatic pool cover' }
      ]
    },
    {
      id: 'heating_interest',
      question: 'Are you interested in pool heating?',
      type: 'radio',
      required: false,
      options: [
        { value: 'solar', label: 'Yes, solar heating' },
        { value: 'electric', label: 'Yes, electric heating' },
        { value: 'heat-pump', label: 'Yes, heat pump' },
        { value: 'no', label: 'No heating needed' },
        { value: 'discuss', label: 'Want to discuss options' }
      ]
    },
    {
      id: 'budget_range',
      question: 'Rough budget range (optional)',
      type: 'radio',
      required: false,
      options: [
        { value: 'under-30k', label: 'Under £30,000' },
        { value: '30k-50k', label: '£30,000 - £50,000' },
        { value: '50k-75k', label: '£50,000 - £75,000' },
        { value: '75k-100k', label: '£75,000 - £100,000' },
        { value: 'over-100k', label: 'Over £100,000' },
        { value: 'flexible', label: 'Flexible / depends on design' }
      ]
    },
    {
      id: 'timeline',
      question: 'What\'s your preferred timeline?',
      type: 'radio',
      required: true,
      options: [
        { value: 'planning', label: 'Just exploring / planning' },
        { value: 'this-year', label: 'This year' },
        { value: 'next-6-months', label: 'Within 6 months' },
        { value: 'flexible', label: 'Flexible timing' }
      ]
    },
    {
      id: 'site_photos',
      question: 'Upload photos of the proposed site (optional)',
      type: 'file',
      required: false,
      accept: 'image/*',
      helpText: 'Photos help us understand your space and prepare better quotes'
    }
  ]
};

// ===================================
// DETAILED PACK 2: Regular pool cleaning
// ===================================
export const regularPoolCleaningPack: MicroservicePackContent = {
  slug: 'regular-pool-cleaning',
  subcategorySlug: 'pool-maintenance-cleaning',
  name: 'Regular pool cleaning',
  questions: [
    {
      id: 'frequency',
      question: 'How often do you need pool cleaning?',
      type: 'radio',
      required: true,
      options: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'fortnightly', label: 'Fortnightly (every 2 weeks)' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'one-off', label: 'One-off service' },
        { value: 'seasonal', label: 'Seasonal (summer months only)' }
      ]
    },
    {
      id: 'season_length',
      question: 'How many months per year is your pool open?',
      type: 'radio',
      required: true,
      options: [
        { value: 'year-round', label: 'Year-round (heated)' },
        { value: '6-months', label: 'About 6 months (May-October)' },
        { value: '4-months', label: 'About 4 months (June-September)' },
        { value: 'varies', label: 'Varies / seasonal' }
      ]
    },
    {
      id: 'pool_type',
      question: 'What type of pool?',
      type: 'radio',
      required: true,
      options: [
        { value: 'in-ground', label: 'In-ground pool' },
        { value: 'above-ground', label: 'Above-ground pool' },
        { value: 'plunge', label: 'Plunge pool' },
        { value: 'lap', label: 'Lap pool' }
      ]
    },
    {
      id: 'pool_size',
      question: 'Approximate pool size?',
      type: 'radio',
      required: true,
      options: [
        { value: 'small', label: 'Small (< 20,000L)' },
        { value: 'medium', label: 'Medium (20,000-40,000L)' },
        { value: 'large', label: 'Large (40,000-60,000L)' },
        { value: 'very-large', label: 'Very large (> 60,000L)' },
        { value: 'not-sure', label: 'Not sure' }
      ]
    },
    {
      id: 'tasks_needed',
      question: 'What tasks should be included? (select all)',
      type: 'checkbox',
      required: true,
      options: [
        { value: 'surface-skim', label: 'Surface skimming' },
        { value: 'vacuum', label: 'Vacuuming pool floor' },
        { value: 'brush-walls', label: 'Brushing walls and steps' },
        { value: 'empty-skimmers', label: 'Empty skimmer baskets' },
        { value: 'test-water', label: 'Water testing and balancing' },
        { value: 'add-chemicals', label: 'Add chemicals as needed' },
        { value: 'backwash-filter', label: 'Backwash filter' },
        { value: 'equipment-check', label: 'Check equipment (pump, heater, etc.)' }
      ]
    },
    {
      id: 'chemicals_supplied',
      question: 'Who provides the chemicals?',
      type: 'radio',
      required: true,
      options: [
        { value: 'professional', label: 'Professional to supply (I\'ll pay for them)' },
        { value: 'homeowner', label: 'I\'ll supply my own chemicals' },
        { value: 'discuss', label: 'Let\'s discuss' }
      ]
    },
    {
      id: 'access',
      question: 'Will you be home, or should we have key access?',
      type: 'radio',
      required: true,
      options: [
        { value: 'home', label: 'I\'ll be home' },
        { value: 'key-access', label: 'I can provide key/gate code' },
        { value: 'varies', label: 'Varies / flexible' }
      ]
    },
    {
      id: 'start_date',
      question: 'When would you like to start?',
      type: 'radio',
      required: true,
      options: [
        { value: 'asap', label: 'As soon as possible' },
        { value: 'next-week', label: 'Next week' },
        { value: 'next-month', label: 'Next month' },
        { value: 'flexible', label: 'Flexible / discuss' }
      ]
    },
    {
      id: 'pool_photos',
      question: 'Upload pool photos (optional)',
      type: 'file',
      required: false,
      accept: 'image/*',
      helpText: 'Photos help professionals assess your pool and equipment'
    }
  ]
};

// ===================================
// DETAILED PACK 3: Water problem solving
// ===================================
export const waterProblemSolvingPack: MicroservicePackContent = {
  slug: 'water-problem-solving',
  subcategorySlug: 'water-treatment-filtration',
  name: 'Water problem solving',
  questions: [
    {
      id: 'main_issue',
      question: 'What\'s the main water problem?',
      type: 'radio',
      required: true,
      options: [
        { value: 'cloudy', label: 'Cloudy or milky water' },
        { value: 'green', label: 'Green water (algae)' },
        { value: 'yellow-brown', label: 'Yellow or brown water' },
        { value: 'foam', label: 'Excessive foam' },
        { value: 'smell', label: 'Bad smell (chlorine or other)' },
        { value: 'irritation', label: 'Skin/eye irritation' },
        { value: 'staining', label: 'Staining on pool surface' },
        { value: 'multiple', label: 'Multiple issues' }
      ]
    },
    {
      id: 'issue_duration',
      question: 'How long has this been an issue?',
      type: 'radio',
      required: true,
      options: [
        { value: 'just-started', label: 'Just started (past few days)' },
        { value: '1-2-weeks', label: '1-2 weeks' },
        { value: '3-4-weeks', label: '3-4 weeks' },
        { value: 'longer', label: 'Longer than a month' },
        { value: 'recurring', label: 'Recurring problem' }
      ]
    },
    {
      id: 'recent_changes',
      question: 'Any recent changes to the pool or treatment?',
      type: 'checkbox',
      required: false,
      options: [
        { value: 'refilled', label: 'Pool was refilled or topped up' },
        { value: 'heavy-use', label: 'Heavy use / pool party' },
        { value: 'weather', label: 'Heavy rain or storms' },
        { value: 'new-chemicals', label: 'Switched chemical brand' },
        { value: 'equipment-issue', label: 'Equipment problem (pump, filter)' },
        { value: 'none', label: 'No recent changes' }
      ]
    },
    {
      id: 'filtration_status',
      question: 'Is your filtration system working?',
      type: 'radio',
      required: true,
      options: [
        { value: 'yes', label: 'Yes, running normally' },
        { value: 'yes-slow', label: 'Yes, but seems slow/weak' },
        { value: 'no', label: 'No / not working' },
        { value: 'not-sure', label: 'Not sure' }
      ]
    },
    {
      id: 'water_testing',
      question: 'Have you tested the water recently?',
      type: 'radio',
      required: true,
      options: [
        { value: 'yes-normal', label: 'Yes, levels seem normal' },
        { value: 'yes-off', label: 'Yes, levels are off' },
        { value: 'no', label: 'No, haven\'t tested' },
        { value: 'no-kit', label: 'No test kit available' }
      ]
    },
    {
      id: 'chemicals_available',
      question: 'Do you have pool chemicals on hand?',
      type: 'radio',
      required: false,
      options: [
        { value: 'yes-full', label: 'Yes, full stock' },
        { value: 'some', label: 'Some basics' },
        { value: 'none', label: 'None / need to purchase' },
        { value: 'not-sure', label: 'Not sure what I have' }
      ]
    },
    {
      id: 'urgency',
      question: 'How urgent is this?',
      type: 'radio',
      required: true,
      options: [
        { value: 'emergency', label: 'Emergency (pool unusable, event coming up)' },
        { value: 'soon', label: 'Soon (within a few days)' },
        { value: 'normal', label: 'Normal priority' },
        { value: 'flexible', label: 'Flexible timing' }
      ]
    },
    {
      id: 'problem_photos',
      question: 'Upload photos of the water issue (optional)',
      type: 'file',
      required: false,
      accept: 'image/*',
      helpText: 'Photos of the water color/condition really help diagnose the problem'
    }
  ]
};

// ===================================
// GENERIC POOL & SPA SERVICES
// ===================================
export const genericPoolSpaServices = [
  // Pool construction & installation (remaining 4 after detailed)
  { slug: 'concrete-tiled-pools', name: 'Concrete and tiled pools', subcategorySlug: 'pool-construction-installation' },
  { slug: 'prefab-fibreglass-pools', name: 'Prefab and fibreglass pools', subcategorySlug: 'pool-construction-installation' },
  { slug: 'plunge-small-pools', name: 'Plunge and small pools', subcategorySlug: 'pool-construction-installation' },
  { slug: 'pool-renovation-refurbishment', name: 'Pool renovation and refurbishment', subcategorySlug: 'pool-construction-installation' },
  
  // Pool maintenance & cleaning (remaining 6 after detailed)
  { slug: 'one-off-deep-clean', name: 'One-off deep clean', subcategorySlug: 'pool-maintenance-cleaning' },
  { slug: 'spring-opening-winterizing', name: 'Spring opening and winterizing', subcategorySlug: 'pool-maintenance-cleaning' },
  { slug: 'filter-cleaning-replacement', name: 'Filter cleaning and replacement', subcategorySlug: 'pool-maintenance-cleaning' },
  { slug: 'pump-servicing', name: 'Pump servicing', subcategorySlug: 'pool-maintenance-cleaning' },
  { slug: 'skimmer-drain-maintenance', name: 'Skimmer and drain maintenance', subcategorySlug: 'pool-maintenance-cleaning' },
  { slug: 'pool-cover-repair-replacement', name: 'Pool cover repair and replacement', subcategorySlug: 'pool-maintenance-cleaning' },
  
  // Water treatment & filtration (remaining 7 after detailed)
  { slug: 'cloudy-discoloured-water-treatment', name: 'Cloudy or discoloured water treatment', subcategorySlug: 'water-treatment-filtration' },
  { slug: 'algae-removal-prevention', name: 'Algae removal and prevention', subcategorySlug: 'water-treatment-filtration' },
  { slug: 'filtration-system-installation', name: 'Filtration system installation', subcategorySlug: 'water-treatment-filtration' },
  { slug: 'filtration-system-upgrades', name: 'Filtration system upgrades', subcategorySlug: 'water-treatment-filtration' },
  { slug: 'saltwater-chlorinator-installation', name: 'Saltwater chlorinator installation', subcategorySlug: 'water-treatment-filtration' },
  { slug: 'uv-sterilization-systems', name: 'UV sterilization systems', subcategorySlug: 'water-treatment-filtration' },
  { slug: 'water-testing-balance', name: 'Water testing and balance', subcategorySlug: 'water-treatment-filtration' },
  
  // Heating & energy systems (all 7)
  { slug: 'solar-pool-heating', name: 'Solar pool heating', subcategorySlug: 'heating-energy-systems' },
  { slug: 'electric-pool-heaters', name: 'Electric pool heaters', subcategorySlug: 'heating-energy-systems' },
  { slug: 'heat-pump-installation', name: 'Heat pump installation', subcategorySlug: 'heating-energy-systems' },
  { slug: 'gas-pool-heaters', name: 'Gas pool heaters', subcategorySlug: 'heating-energy-systems' },
  { slug: 'pool-heating-repairs', name: 'Pool heating repairs', subcategorySlug: 'heating-energy-systems' },
  { slug: 'pool-blankets-covers', name: 'Pool blankets and covers', subcategorySlug: 'heating-energy-systems' },
  { slug: 'energy-efficiency-upgrades', name: 'Energy efficiency upgrades', subcategorySlug: 'heating-energy-systems' },
  
  // Spas & hot tubs (all 8)
  { slug: 'hot-tub-installation', name: 'Hot tub installation', subcategorySlug: 'spa-hot-tubs' },
  { slug: 'spa-servicing-maintenance', name: 'Spa servicing and maintenance', subcategorySlug: 'spa-hot-tubs' },
  { slug: 'hot-tub-repair', name: 'Hot tub repair', subcategorySlug: 'spa-hot-tubs' },
  { slug: 'spa-jets-plumbing', name: 'Spa jets and plumbing', subcategorySlug: 'spa-hot-tubs' },
  { slug: 'spa-cover-replacement', name: 'Spa cover replacement', subcategorySlug: 'spa-hot-tubs' },
  { slug: 'hot-tub-electrical-work', name: 'Hot tub electrical work', subcategorySlug: 'spa-hot-tubs' },
  { slug: 'spa-water-treatment', name: 'Spa water treatment', subcategorySlug: 'spa-hot-tubs' },
  { slug: 'jacuzzi-installation-repair', name: 'Jacuzzi installation and repair', subcategorySlug: 'spa-hot-tubs' }
];

// Build generic packs
export const genericPoolSpaPacks = genericPoolSpaServices.map(service =>
  buildGenericPoolSpaPack(service.slug, service.name, service.subcategorySlug)
);

// ===================================
// EXPORT ALL PACKS (3 detailed + 32 generic = 35 total)
// ===================================
export const poolSpaQuestionPacks: MicroservicePackContent[] = [
  newPoolInstallationPack,
  regularPoolCleaningPack,
  waterProblemSolvingPack,
  ...genericPoolSpaPacks
];
