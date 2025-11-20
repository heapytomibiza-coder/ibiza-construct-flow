/**
 * Construction Question Blocks
 * Local-first question system for construction services
 */

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

type ConstructionTrade = 'groundworks' | 'bathroom_renovation' | 'tiling'

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
      type: 'select',
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
    'access_site_conditions',
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

  // Look up UUID with caching, retry, and error handling
  let microUuid: string | null = null;
  const lookupStartTime = performance.now();
  let fallbackUsed = false;
  
  try {
    // Check cache first
    const cachedUuid = microServiceCache.get(matchedMicro.id);
    if (cachedUuid) {
      const lookupTimeMs = Math.round(performance.now() - lookupStartTime);
      microUuid = cachedUuid;
      uuidLookupLogger.logSuccess(matchedMicro.id, microUuid, lookupTimeMs, false);
      console.log('[UUID Lookup] Cache hit for:', matchedMicro.id);
    } else {
      // Lookup from database with retry and circuit breaker
      const lookupOperation = async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('micro_services')
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
