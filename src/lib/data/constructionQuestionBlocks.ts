/**
 * Construction Question Blocks
 * DB-first question system with local fallback
 */

import { supabase } from '@/integrations/supabase/client';
import { uuidLookupLogger } from '@/lib/monitoring/uuidLookupLogger';
import { microServiceCache } from '@/lib/cache/microServiceCache';
import { retryUUIDLookup, uuidLookupCircuitBreaker } from '@/lib/utils/uuidLookupRetry';
import { 
  MicroServiceNotFoundError, 
  DatabaseConnectionError,
  UUIDErrorRecovery 
} from '@/lib/errors/UUIDLookupError';

// Define WizardQuestion type locally
export interface WizardQuestion {
  id: string
  question: string
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'date' | 'time' | 'datetime' | 'range' | 'checkbox' | 'radio' | 'file' | 'moving_from_location' | 'moving_to_location'
  required: boolean
  options?: string[]
  placeholder?: string
  accept?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  conditional?: {
    depends_on: string
    show_when: string | string[]
  }
  range?: {
    min: number
    max: number
    step?: number
  }
}

// Type for question pack from database
interface QuestionPackDef {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  helpText?: string;
  dependsOn?: {
    questionId: string;
    value: string | string[];
  };
  accept?: string;
}

// Transform database question to WizardQuestion format
function transformToWizardQuestion(q: QuestionPackDef): WizardQuestion {
  // Map question type
  let type: WizardQuestion['type'] = 'textarea';
  
  switch (q.type) {
    case 'text':
    case 'textarea':
      type = q.type;
      break;
    case 'select':
      type = 'select';
      break;
    case 'radio':
      type = 'radio';
      break;
    case 'checkbox':
      type = 'checkbox';
      break;
    case 'number':
      type = 'number';
      break;
    case 'file':
      type = 'file';
      break;
  }

  return {
    id: q.id,
    question: q.question,
    type,
    required: q.required || false,
    placeholder: q.placeholder,
    options: q.options?.map(opt => opt.label),
    accept: q.accept,
    conditional: q.dependsOn ? {
      depends_on: q.dependsOn.questionId,
      show_when: q.dependsOn.value
    } : undefined
  };
}

type ConstructionTrade = 'groundworks' | 'bathroom_renovation' | 'tiling' | 'roofing' | 'waterproofing'

interface ConstructionMicro {
  id: string
  label: string
  trade: ConstructionTrade
  matchers: string[]
  microQuestions: WizardQuestion[]
}

const questionBlocks: Record<string, WizardQuestion[]> = {
  access_site_conditions: [
    {
      id: 'site_access',
      question: 'How easy is access for machinery or materials?',
      type: 'select',
      required: true,
      options: [
        'Easy – wide entrance and clear access',
        'Moderate – small truck/digger only',
        'Difficult – narrow or restricted access'
      ]
    },
    {
      id: 'site_clearance',
      question: 'Is there existing structure or debris to remove?',
      type: 'select',
      required: true,
      options: [
        'No, the site is clear',
        'Some debris or old materials',
        'Existing structure to demolish'
      ]
    }
  ],
  dimensions_quantities: [
    {
      id: 'work_area',
      question: 'What is the approximate area or scope of work?',
      type: 'select',
      required: true,
      options: [
        'Compact – under 50 m²',
        'Medium – 50–200 m²',
        'Large – over 200 m²'
      ]
    },
    {
      id: 'base_surface',
      question: 'What best describes the existing ground or surface?',
      type: 'select',
      required: false,
      options: [
        'Soil',
        'Mixed soil and rubble',
        'Mostly rock or concrete',
        'Existing finished surface (tiles/wood/concrete)'
      ]
    }
  ],
  materials_finish_level: [
    {
      id: 'finish_expectation',
      question: 'What finish level are you aiming for?',
      type: 'select',
      required: true,
      options: [
        'Practical/utility',
        'Standard residential',
        'High-end or premium finish'
      ]
    },
    {
      id: 'materials_supply',
      question: 'Who will supply the materials?',
      type: 'select',
      required: true,
      options: [
        'I will supply materials',
        'Pro to supply materials',
        'Mix: I have some materials already'
      ]
    }
  ],
  existing_state_demolition: [
    {
      id: 'existing_state',
      question: 'What is the current state of the area?',
      type: 'select',
      required: true,
      options: [
        'Empty shell',
        'Partially finished',
        'Fully finished space',
        'Occupied/active space'
      ]
    },
    {
      id: 'demolition_required',
      question: 'Is demolition or strip-out needed?',
      type: 'select',
      required: true,
      options: [
        'No demolition required',
        'Minor removal (fixtures/tiles)',
        'Full strip-out needed'
      ]
    }
  ],
  timing_constraints: [
    {
      id: 'start_timing',
      question: 'When do you want the work to start?',
      type: 'select',
      required: true,
      options: [
        'ASAP',
        'Within 2 weeks',
        'Within a month',
        'Flexible – discuss timing'
      ]
    },
    {
      id: 'site_constraints',
      question: 'Any timing, noise, or access constraints?',
      type: 'multiselect',
      required: false,
      options: [
        'None – work can proceed normally',
        'Daytime hours only',
        'Limited days (e.g., weekdays only)',
        'Quiet hours to respect neighbours'
      ]
    }
  ],
  budget_expectations: [
    {
      id: 'budget_band',
      question: 'What best describes your budget expectation?',
      type: 'select',
      required: false,
      options: [
        'Entry/essential (focus on cost)',
        'Balanced (value vs. quality)',
        'Premium (best materials & detail)',
        'Need guidance based on scope'
      ]
    }
  ],
  roof_type_condition: [
    {
      id: 'roof_type',
      question: 'What type of roof or surface is this?',
      type: 'select',
      required: true,
      options: [
        'Flat roof or terrace',
        'Pitched tile roof',
        'Mixed (flat + pitched areas)'
      ]
    },
    {
      id: 'roof_cover_material',
      question: 'What is the main existing surface?',
      type: 'select',
      required: true,
      options: [
        'Clay or concrete tiles',
        'Concrete slab',
        'Existing membrane or felt',
        'Stone / terrazzo finish',
        'Not sure'
      ]
    },
    {
      id: 'roof_height_access',
      question: 'How high is the roof and how easy is access?',
      type: 'select',
      required: true,
      options: [
        'Single-storey with easy access',
        'Two-storey, ladder access possible',
        'Three-storey or higher / difficult access'
      ]
    }
  ],

  leak_status: [
    {
      id: 'leak_severity',
      question: 'What best describes the leak or water problem?',
      type: 'select',
      required: true,
      options: [
        'Preventative – no leak yet, want protection',
        'Minor damp or stains inside',
        'Active leaks when it rains heavily',
        'Leaks even in light rain / severe issue'
      ]
    },
    {
      id: 'leak_location_known',
      question: 'Is the leak location known?',
      type: 'select',
      required: false,
      options: [
        'Yes – specific area is known',
        'Rough area only',
        'No – leak location is unclear'
      ]
    }
  ],

  exposure_weather: [
    {
      id: 'coastal_exposure',
      question: 'Is the property in a coastal/exposed location?',
      type: 'select',
      required: true,
      options: [
        'Yes – exposed to sea air / strong wind',
        'No – more sheltered / inland',
        'Not sure'
      ]
    },
    {
      id: 'sun_exposure',
      question: 'How exposed is the area to sun during the day?',
      type: 'select',
      required: false,
      options: [
        'Mostly shaded',
        'Partly exposed to sun',
        'Fully exposed to strong sun most of the day'
      ]
    }
  ],

  waterproofing_scope: [
    {
      id: 'waterproof_area_size',
      question: 'Approximate area to waterproof or repair',
      type: 'select',
      required: true,
      options: [
        'Small area (under 20 m²)',
        'Medium area (20–50 m²)',
        'Large area (50–100 m²)',
        'Very large (over 100 m²)'
      ]
    },
    {
      id: 'existing_waterproof_layer',
      question: 'What best describes the existing waterproofing?',
      type: 'select',
      required: true,
      options: [
        'No waterproofing / bare concrete',
        'Old or damaged membrane',
        'Tiled surface over old waterproofing',
        'Recently waterproofed but still leaking',
        'Not sure'
      ]
    },
    {
      id: 'standing_water',
      question: 'Does water tend to sit or pool on the surface after rain?',
      type: 'select',
      required: false,
      options: [
        'No – water drains well',
        'Some small puddles in places',
        'Frequent standing water / poor drainage'
      ]
    }
  ]
}

const tradeBlocks: Record<ConstructionTrade, (keyof typeof questionBlocks)[]> = {
  groundworks: [
    'access_site_conditions',
    'dimensions_quantities',
    'existing_state_demolition',
    'timing_constraints',
    'budget_expectations'
  ],
  bathroom_renovation: [
    'dimensions_quantities',
    'materials_finish_level',
    'existing_state_demolition',
    'timing_constraints',
    'budget_expectations'
  ],
  tiling: [
    'access_site_conditions',
    'dimensions_quantities',
    'materials_finish_level',
    'timing_constraints',
    'budget_expectations'
  ],
  roofing: [
    'access_site_conditions',
    'dimensions_quantities',
    'roof_type_condition',
    'leak_status',
    'exposure_weather',
    'timing_constraints',
    'budget_expectations'
  ],
  waterproofing: [
    'access_site_conditions',
    'dimensions_quantities',
    'roof_type_condition',
    'waterproofing_scope',
    'leak_status',
    'exposure_weather',
    'materials_finish_level',
    'timing_constraints',
    'budget_expectations'
  ]
}

const constructionMicros: ConstructionMicro[] = [
  {
    id: 'excavation_site_prep',
    label: 'Excavation & Groundworks – Site Preparation',
    trade: 'groundworks',
    matchers: ['ground-worker', 'excavation', 'groundwork', 'site-preparation', 'site-prep'],
    microQuestions: [
      {
        id: 'foundation_depth_required',
        question: 'Do you need foundations or trenches dug to a specific depth?',
        type: 'select',
        required: true,
        options: ['No', 'Yes – please specify depth']
      },
      {
        id: 'foundation_depth_detail',
        question: 'If yes, what depth is required?',
        type: 'text',
        required: false,
        placeholder: 'e.g., 600mm for strip footing',
        conditional: {
          depends_on: 'foundation_depth_required',
          show_when: 'Yes – please specify depth'
        }
      },
      {
        id: 'spoil_handling',
        question: 'How should excavated material be handled?',
        type: 'select',
        required: true,
        options: ['Remove from site', 'Stockpile on site', 'Reuse for backfill']
      }
    ]
  },
  {
    id: 'concrete_foundations',
    label: 'Concrete Foundations & Footings',
    trade: 'groundworks',
    matchers: ['foundation', 'footing', 'concrete-pour', 'slab'],
    microQuestions: [
      {
        id: 'structural_drawings',
        question: 'Do you have structural drawings or engineering notes?',
        type: 'select',
        required: true,
        options: ['Yes, drawings are ready', 'In progress', 'Need guidance']
      },
      {
        id: 'reinforcement_needs',
        question: 'What reinforcement is required?',
        type: 'select',
        required: true,
        options: [
          'Standard mesh only',
          'Mesh + rebar cages',
          'Engineer-specified reinforcement'
        ]
      },
      {
        id: 'concrete_finish',
        question: 'Do you need a particular concrete finish or protection?',
        type: 'select',
        required: false,
        options: ['Standard float finish', 'Power float/smooth finish', 'Slip-resistant or brushed finish']
      }
    ]
  },
  {
    id: 'bathroom_full_renovation',
    label: 'Bathroom Renovation – Full Refurbishment',
    trade: 'bathroom_renovation',
    matchers: ['bathroom-renovation', 'bathroom', 'bathroom-full', 'bathroom-remodel'],
    microQuestions: [
      {
        id: 'layout_changes',
        question: 'Are you changing the layout or moving plumbing?',
        type: 'select',
        required: true,
        options: ['No layout changes', 'Minor shifts (same wall)', 'Major changes (new locations)']
      },
      {
        id: 'waterproofing_scope',
        question: 'What waterproofing do you require?',
        type: 'select',
        required: true,
        options: ['Shower area only', 'Wet room / full room', 'Not sure, need advice']
      },
      {
        id: 'fixture_scope',
        question: 'Which fixtures are included?',
        type: 'multiselect',
        required: true,
        options: ['Bath', 'Shower', 'Toilet', 'Vanity/Storage', 'Heated towel rail', 'Lighting/fans']
      }
    ]
  },
  {
    id: 'bathroom_light_refresh',
    label: 'Bathroom – Light Refresh',
    trade: 'bathroom_renovation',
    matchers: ['bathroom-refresh', 'bathroom-update', 'small-bathroom'],
    microQuestions: [
      {
        id: 'tile_replacement',
        question: 'Are you replacing tiles or keeping existing walls/floors?',
        type: 'select',
        required: true,
        options: ['Keep existing tiles', 'Replace shower tiles only', 'Retile walls and floors']
      },
      {
        id: 'fittings_swap',
        question: 'Which fittings need swapping?',
        type: 'multiselect',
        required: false,
        options: ['Tapware', 'Shower set', 'Vanity', 'Toilet', 'Lighting', 'Accessories (mirrors/rails)']
      }
    ]
  },
  {
    id: 'tiling_floor_walls',
    label: 'Floor & Wall Tiling',
    trade: 'tiling',
    matchers: ['tiling', 'tile', 'flooring', 'tiler'],
    microQuestions: [
      {
        id: 'tile_area_location',
        question: 'Where are you tiling?',
        type: 'multiselect',
        required: true,
        options: ['Bathroom walls', 'Shower area', 'Kitchen splashback', 'Living areas/floors', 'Exterior area']
      },
      {
        id: 'tile_material',
        question: 'What tile material and size are you using?',
        type: 'select',
        required: true,
        options: [
          'Ceramic/small format (<300mm)',
          'Porcelain/medium (300–600mm)',
          'Large format or stone (>600mm)',
          'Not decided yet'
        ]
      },
      {
        id: 'surface_prep',
        question: 'Is the substrate ready for tiling?',
        type: 'select',
        required: true,
        options: ['Yes, prepared and level', 'Needs levelling', 'Needs backer board or waterproofing']
      }
    ]
  },
  // === WATERPROOFING SERVICES ===
  {
    id: 'flat_roof_waterproofing',
    label: 'Flat Roof Waterproofing & Leak Repair',
    trade: 'waterproofing',
    matchers: [
      'flat-roof',
      'flat roof',
      'azotea',
      'roof-waterproofing',
      'roof-leak',
      'roof sealing',
      'flat roof leak'
    ],
    microQuestions: [
      {
        id: 'flat_roof_use_type',
        question: 'How is the flat roof or terrace used?',
        type: 'select',
        required: true,
        options: [
          'Purely technical (non-accessible roof)',
          'Occasional access (maintenance only)',
          'Regularly used terrace or chill-out area'
        ]
      },
      {
        id: 'flat_roof_finish_expectation',
        question: 'What finish level do you expect after waterproofing?',
        type: 'select',
        required: true,
        options: [
          'Hidden under tiles or another finish',
          'Visible but purely functional',
          'Visible and aesthetic (high-end terrace finish)'
        ]
      },
      {
        id: 'previous_roof_issues',
        question: 'Have there been previous repairs or patches in this area?',
        type: 'select',
        required: false,
        options: [
          'No previous repairs',
          'Yes – a few small patches',
          'Yes – many patches and previous repairs',
          'Not sure'
        ]
      }
    ]
  },
  {
    id: 'tile_roof_repairs',
    label: 'Tile Roof Repairs & Maintenance',
    trade: 'roofing',
    matchers: [
      'tile-roof',
      'roof tiles',
      'tejado',
      'tejados',
      'roof repair',
      'roof tiles repair'
    ],
    microQuestions: [
      {
        id: 'tile_roof_scope',
        question: 'What best describes the scope of tile roof work?',
        type: 'select',
        required: true,
        options: [
          'A few broken or slipped tiles',
          'One section/side of the roof',
          'Multiple sections or full roof inspection'
        ]
      },
      {
        id: 'tile_roof_structure_condition',
        question: 'Any visible sagging or structural concerns?',
        type: 'select',
        required: true,
        options: [
          'No – structure looks straight and sound',
          'Some minor uneven areas',
          'Visible sagging or suspected structural issue',
          'Not sure – need professional opinion'
        ]
      },
      {
        id: 'access_equipment',
        question: 'What access equipment do you think might be needed?',
        type: 'select',
        required: false,
        options: [
          'Standard ladder access should be enough',
          'Likely need scaffold or full edge protection',
          'Unsure – need roof specialist to advise'
        ]
      }
    ]
  },
  {
    id: 'terrace_waterproofing',
    label: 'Terrace & Balcony Waterproofing',
    trade: 'waterproofing',
    matchers: [
      'terrace',
      'terraza',
      'balcony',
      'balcon',
      'leak terrace',
      'terrace waterproofing',
      'water leaking below terrace'
    ],
    microQuestions: [
      {
        id: 'terrace_use_type',
        question: 'How is the terrace or balcony mainly used?',
        type: 'select',
        required: true,
        options: [
          'Occasional use (access only)',
          'Regular seating / chill-out area',
          'High-traffic terrace (dining / events)'
        ]
      },
      {
        id: 'terrace_under_space',
        question: 'What is directly underneath the leaking area?',
        type: 'select',
        required: true,
        options: [
          'Exterior space / garden',
          'Interior room or living space',
          'Garage or storage',
          'Not sure'
        ]
      },
      {
        id: 'terrace_rental_constraint',
        question: 'Do we need to work around tourist rentals or bookings?',
        type: 'select',
        required: false,
        options: [
          'No – terrace is free to use anytime',
          'Yes – limited windows between bookings',
          'Yes – but dates are flexible if needed'
        ]
      },
      {
        id: 'terrace_existing_surface',
        question: 'Current terrace surface finish',
        type: 'select',
        required: true,
        options: [
          'Ceramic or porcelain tiles',
          'Natural stone or terrazzo',
          'Painted or coated concrete',
          'Timber or composite decking',
          'Not sure'
        ]
      }
    ]
  }
]

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9/\-\s]+/g, ' ').trim()

export const buildConstructionWizardQuestions = async (categories: string[]) => {
  if (!categories || categories.length === 0) {
    return { questions: [] as WizardQuestion[], microId: null as string | null, microUuid: null as string | null }
  }

  const normalizedInputs = categories.flatMap(cat => {
    const normalized = normalize(cat)
    const pieces = normalized.split(/[\/\s]+/).filter(Boolean)
    return [normalized, ...pieces]
  })

  const matchedMicro = constructionMicros.find(micro =>
    micro.matchers.some(matcher =>
      normalizedInputs.some(input => input.includes(matcher))
    )
  )

  if (!matchedMicro) {
    return { questions: [] as WizardQuestion[], microId: null as string | null, microUuid: null as string | null }
  }

  // ========== TRY DATABASE QUESTION PACK FIRST ==========
  // Check both the original input slugs AND the matched micro ID for database packs
  const lookupStartTime = performance.now();
  let microUuid: string | null = null;
  let fallbackUsed = false;
  
  // Build list of potential slugs to check: original inputs + matched ID
  const potentialSlugs = [
    ...categories.map(cat => normalize(cat).replace(/\s+/g, '-')), // Original input as slug
    matchedMicro.id.replace(/_/g, '-'), // Matched ID with hyphens
    matchedMicro.id // Matched ID as-is
  ];
  
  // Dedupe and filter empty
  const uniqueSlugs = [...new Set(potentialSlugs.filter(Boolean))];
  console.log('[Question Pack] Checking DB for slugs:', uniqueSlugs);
  
  // Try each potential slug for a question pack
  for (const slug of uniqueSlugs) {
    try {
      const { data: packData, error: packError } = await supabase
        .from('question_packs')
        .select('content')
        .eq('micro_slug', slug)
        .eq('is_active', true)
        .eq('status', 'approved')
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!packError && packData?.content) {
        const content = packData.content as { questions?: QuestionPackDef[] };
        if (content.questions && Array.isArray(content.questions) && content.questions.length > 0) {
          // Found database questions - use them!
          const transformedQuestions = content.questions.map(transformToWizardQuestion);
          
          console.log(`[Question Pack] ✅ Loaded ${transformedQuestions.length} questions from DB for slug: ${slug}`);
          
          // Also try to get UUID for analytics
          const { data: microData } = await supabase
            .from('service_micro_categories')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();
          
          return {
            questions: transformedQuestions,
            microId: slug,
            microUuid: microData?.id || null
          };
        }
      }
    } catch (err) {
      console.warn(`[Question Pack] Error checking slug ${slug}:`, err);
    }
  }
  
  console.log('[Question Pack] No DB pack found for any slug, checking UUID lookup...');
  
  try {
    // Check cache first
    const cachedUuid = microServiceCache.get(matchedMicro.id);
    if (cachedUuid) {
      microUuid = cachedUuid;
      console.log('[UUID Lookup] Cache hit for:', matchedMicro.id);
    } else {
      // Lookup from database with retry and circuit breaker
      const lookupOperation = async () => {
        const { data, error } = await supabase
          .from('service_micro_categories')
          .select('id')
          .eq('slug', matchedMicro.id)
          .maybeSingle();
        
        if (error) {
          throw new DatabaseConnectionError(matchedMicro.id, error);
        }
        
        if (!data) {
          throw new MicroServiceNotFoundError(matchedMicro.id);
        }
        
        return data.id;
      };

      try {
        // Execute with circuit breaker and retry
        microUuid = await uuidLookupCircuitBreaker.execute(async () => {
          return await retryUUIDLookup(
            lookupOperation,
            { maxRetries: 2, initialDelayMs: 100, maxDelayMs: 1000, backoffMultiplier: 2 },
            (attempt, error) => {
              console.log(`[UUID Lookup] Retry ${attempt} for ${matchedMicro.id}:`, error);
            }
          );
        });

        const lookupTimeMs = Math.round(performance.now() - lookupStartTime);
        
        if (microUuid) {
          // Cache successful lookup
          microServiceCache.set(matchedMicro.id, microUuid);
          uuidLookupLogger.logSuccess(matchedMicro.id, microUuid, lookupTimeMs, fallbackUsed);
          console.log('[UUID Lookup] Database lookup successful:', matchedMicro.id, '→', microUuid);
        }
      } catch (lookupError) {
        const lookupTimeMs = Math.round(performance.now() - lookupStartTime);
        
        // Handle specific errors
        if (lookupError instanceof MicroServiceNotFoundError) {
          // Service not in database - use fallback (slug only)
          fallbackUsed = true;
          uuidLookupLogger.logSuccess(matchedMicro.id, 'fallback', lookupTimeMs, fallbackUsed);
          console.warn('[UUID Lookup] Service not found, using fallback:', matchedMicro.id);
        } else if (UUIDErrorRecovery.isRecoverable(lookupError)) {
          // Recoverable error - use fallback
          fallbackUsed = true;
          const errorMessage = lookupError instanceof Error ? lookupError.message : 'Unknown error';
          uuidLookupLogger.logFailure(matchedMicro.id, lookupTimeMs, errorMessage);
          console.warn('[UUID Lookup] Recoverable error, using fallback:', errorMessage);
        } else {
          // Non-recoverable error
          const errorMessage = lookupError instanceof Error ? lookupError.message : 'Unknown error';
          uuidLookupLogger.logFailure(matchedMicro.id, lookupTimeMs, errorMessage);
          throw lookupError;
        }
      }
    }
  } catch (error) {
    const lookupTimeMs = Math.round(performance.now() - lookupStartTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[UUID Lookup] Critical error:', error);
    uuidLookupLogger.logFailure(matchedMicro.id, lookupTimeMs, errorMessage);
    // Continue with fallback (microUuid remains null)
  }

  // ========== FALLBACK: USE EXISTING HARDCODED QUESTIONS ==========
  console.log(`[Question Pack] Using hardcoded fallback questions for: ${matchedMicro.id}`);
  
  const blockIds = tradeBlocks[matchedMicro.trade]
  const sharedQuestions = blockIds.flatMap(blockId => questionBlocks[blockId])

  const combinedQuestions = [...sharedQuestions, ...matchedMicro.microQuestions]
  const uniqueQuestions: WizardQuestion[] = []
  const seen = new Set<string>()

  combinedQuestions.forEach(question => {
    if (!seen.has(question.id)) {
      seen.add(question.id)
      uniqueQuestions.push(question)
    }
  })

  return { questions: uniqueQuestions, microId: matchedMicro.id, microUuid }
}
