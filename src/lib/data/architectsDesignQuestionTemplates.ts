/**
 * Architects & Design Question Pack Templates
 * 6 micro-services across Interior Design, Residential Architects, and Structural Engineers
 */

import type { MicroserviceDef } from '@/types/packs';
import { v4 as uuidv4 } from 'uuid';

export const architectsDesignQuestionPacks: MicroserviceDef[] = [
  // Interior Design: 3D Visualization
  {
    id: uuidv4(),
    category: 'architects-design',
    name: '3D Visualization',
    slug: '3d-visualization',
    i18nPrefix: 'architects.interior_design.3d_visualization',
    questions: [
      {
        key: 'q1',
        type: 'single',
        i18nKey: 'architects.interior_design.3d_visualization.q1.title',
        required: true,
        options: [
          { i18nKey: 'Early concept', value: 'early_concept', order: 1 },
          { i18nKey: 'Design development', value: 'design_development', order: 2 },
          { i18nKey: 'Marketing/sales images', value: 'marketing_sales', order: 3 },
          { i18nKey: 'Planning/client approval', value: 'planning_approval', order: 4 },
          { i18nKey: 'Other', value: 'other', order: 5 }
        ],
        aiHint: 'purpose of 3D visuals'
      },
      {
        key: 'q2',
        type: 'single',
        i18nKey: 'architects.interior_design.3d_visualization.q2.title',
        required: true,
        options: [
          { i18nKey: 'Apartment', value: 'apartment', order: 1 },
          { i18nKey: 'Villa/house', value: 'villa_house', order: 2 },
          { i18nKey: 'Commercial space', value: 'commercial', order: 3 },
          { i18nKey: 'Outdoor/landscape', value: 'outdoor_landscape', order: 4 },
          { i18nKey: 'Mixed-use', value: 'mixed_use', order: 5 },
          { i18nKey: 'Other', value: 'other', order: 6 }
        ],
        aiHint: 'space type to visualize'
      },
      {
        key: 'q3',
        type: 'single',
        i18nKey: 'architects.interior_design.3d_visualization.q3.title',
        required: true,
        options: [
          { i18nKey: 'Single room', value: 'single_room', order: 1 },
          { i18nKey: 'Several rooms', value: 'several_rooms', order: 2 },
          { i18nKey: 'Whole property', value: 'whole_property', order: 3 },
          { i18nKey: 'Building exterior', value: 'exterior', order: 4 },
          { i18nKey: 'Full site/masterplan', value: 'masterplan', order: 5 }
        ],
        aiHint: 'scope of 3D work'
      },
      {
        key: 'q4',
        type: 'multi',
        i18nKey: 'architects.interior_design.3d_visualization.q4.title',
        required: true,
        options: [
          { i18nKey: 'Simple sketches', value: 'sketches', order: 1 },
          { i18nKey: 'Dimensioned plans', value: 'plans', order: 2 },
          { i18nKey: 'Full CAD/BIM model', value: 'cad_bim', order: 3 },
          { i18nKey: 'Photos of existing space', value: 'photos', order: 4 },
          { i18nKey: 'Moodboard/reference images', value: 'moodboard', order: 5 }
        ],
        aiHint: 'available information'
      },
      {
        key: 'q5',
        type: 'single',
        i18nKey: 'architects.interior_design.3d_visualization.q5.title',
        required: true,
        options: [
          { i18nKey: 'Basic massing and layout', value: 'basic', order: 1 },
          { i18nKey: 'Styled visuals with materials and furniture', value: 'styled', order: 2 },
          { i18nKey: 'Photorealistic images with lighting and details', value: 'photorealistic', order: 3 },
          { i18nKey: 'Animation/fly-through', value: 'animation', order: 4 }
        ],
        aiHint: 'realism level'
      },
      {
        key: 'q6',
        type: 'single',
        i18nKey: 'architects.interior_design.3d_visualization.q6.title',
        required: true,
        options: [
          { i18nKey: '1–2', value: '1_2', order: 1 },
          { i18nKey: '3–5', value: '3_5', order: 2 },
          { i18nKey: 'More than 5', value: 'more_5', order: 3 },
          { i18nKey: 'Not sure yet', value: 'unsure', order: 4 }
        ],
        aiHint: 'number of views'
      },
      {
        key: 'q7',
        type: 'single',
        i18nKey: 'architects.interior_design.3d_visualization.q7.title',
        required: true,
        options: [
          { i18nKey: 'Match what\'s already there', value: 'match_existing', order: 1 },
          { i18nKey: 'Use my chosen items/brands', value: 'my_choices', order: 2 },
          { i18nKey: 'Propose full styling and furniture', value: 'propose_styling', order: 3 },
          { i18nKey: 'Mix of both', value: 'mix', order: 4 }
        ],
        aiHint: 'furniture styling approach'
      }
    ]
  },

  // Interior Design: Space Planning
  {
    id: uuidv4(),
    category: 'architects-design',
    name: 'Space Planning',
    slug: 'space-planning',
    i18nPrefix: 'architects.interior_design.space_planning',
    questions: [
      {
        key: 'q1',
        type: 'single',
        i18nKey: 'architects.interior_design.space_planning.q1.title',
        required: true,
        options: [
          { i18nKey: 'Home (living areas/bedrooms)', value: 'home', order: 1 },
          { i18nKey: 'Kitchen/dining', value: 'kitchen_dining', order: 2 },
          { i18nKey: 'Office/workspace', value: 'office', order: 3 },
          { i18nKey: 'Hospitality/retail', value: 'hospitality_retail', order: 4 },
          { i18nKey: 'Mixed-use', value: 'mixed_use', order: 5 },
          { i18nKey: 'Other', value: 'other', order: 6 }
        ],
        aiHint: 'space type'
      },
      {
        key: 'q2',
        type: 'single',
        i18nKey: 'architects.interior_design.space_planning.q2.title',
        required: true,
        options: [
          { i18nKey: 'Existing space to be improved', value: 'existing', order: 1 },
          { i18nKey: 'New build or shell', value: 'new_build', order: 2 },
          { i18nKey: 'Combination of both', value: 'combination', order: 3 }
        ],
        aiHint: 'existing vs new'
      },
      {
        key: 'q3',
        type: 'multi',
        i18nKey: 'architects.interior_design.space_planning.q3.title',
        required: true,
        options: [
          { i18nKey: 'Better flow/circulation', value: 'flow', order: 1 },
          { i18nKey: 'More storage', value: 'storage', order: 2 },
          { i18nKey: 'More seating/working areas', value: 'seating', order: 3 },
          { i18nKey: 'Create separate zones', value: 'zones', order: 4 },
          { i18nKey: 'Open-plan feel', value: 'open_plan', order: 5 },
          { i18nKey: 'Other', value: 'other', order: 6 }
        ],
        aiHint: 'main goals'
      },
      {
        key: 'q4',
        type: 'single',
        i18nKey: 'architects.interior_design.space_planning.q4.title',
        required: true,
        options: [
          { i18nKey: 'Single person', value: 'single', order: 1 },
          { i18nKey: 'Couple', value: 'couple', order: 2 },
          { i18nKey: 'Family', value: 'family', order: 3 },
          { i18nKey: 'Small team', value: 'small_team', order: 4 },
          { i18nKey: 'Larger team', value: 'large_team', order: 5 },
          { i18nKey: 'Guests/customers', value: 'guests', order: 6 }
        ],
        aiHint: 'users count'
      },
      {
        key: 'q5',
        type: 'multi',
        i18nKey: 'architects.interior_design.space_planning.q5.title',
        required: false,
        options: [
          { i18nKey: 'Plumbing points', value: 'plumbing', order: 1 },
          { i18nKey: 'Structural walls/columns', value: 'structural', order: 2 },
          { i18nKey: 'Existing built-in furniture', value: 'built_in', order: 3 },
          { i18nKey: 'Doors/windows', value: 'doors_windows', order: 4 },
          { i18nKey: 'None of these', value: 'none', order: 5 }
        ],
        aiHint: 'fixed elements'
      },
      {
        key: 'q6',
        type: 'multi',
        i18nKey: 'architects.interior_design.space_planning.q6.title',
        required: false,
        options: [
          { i18nKey: 'Accessibility', value: 'accessibility', order: 1 },
          { i18nKey: 'Children or elderly users', value: 'children_elderly', order: 2 },
          { i18nKey: 'Pets', value: 'pets', order: 3 },
          { i18nKey: 'Audio-visual equipment', value: 'av', order: 4 },
          { i18nKey: 'Flexible/convertible use', value: 'flexible', order: 5 },
          { i18nKey: 'Storage-heavy', value: 'storage', order: 6 }
        ],
        aiHint: 'special requirements'
      },
      {
        key: 'q7',
        type: 'single',
        i18nKey: 'architects.interior_design.space_planning.q7.title',
        required: true,
        options: [
          { i18nKey: 'Measured plans available', value: 'plans_available', order: 1 },
          { i18nKey: 'Rough sketch with dimensions', value: 'rough_sketch', order: 2 },
          { i18nKey: 'No drawings yet – measurement needed', value: 'measurement_needed', order: 3 }
        ],
        aiHint: 'measurement status'
      }
    ]
  },

  // Residential Architects: House Extension Plans
  {
    id: uuidv4(),
    category: 'architects-design',
    name: 'House Extension Plans',
    slug: 'house-extension-plans',
    i18nPrefix: 'architects.residential.house_extension',
    questions: [
      {
        key: 'q1',
        type: 'single',
        i18nKey: 'architects.residential.house_extension.q1.title',
        required: true,
        options: [
          { i18nKey: 'Rear extension', value: 'rear', order: 1 },
          { i18nKey: 'Side extension', value: 'side', order: 2 },
          { i18nKey: 'Wrap-around extension', value: 'wrap_around', order: 3 },
          { i18nKey: 'Roof/loft conversion', value: 'loft', order: 4 },
          { i18nKey: 'Additional storey', value: 'storey', order: 5 },
          { i18nKey: 'Other', value: 'other', order: 6 }
        ],
        aiHint: 'extension type'
      },
      {
        key: 'q2',
        type: 'single',
        i18nKey: 'architects.residential.house_extension.q2.title',
        required: true,
        options: [
          { i18nKey: 'Detached house', value: 'detached', order: 1 },
          { i18nKey: 'Semi-detached', value: 'semi_detached', order: 2 },
          { i18nKey: 'Terraced', value: 'terraced', order: 3 },
          { i18nKey: 'Apartment/duplex', value: 'apartment', order: 4 },
          { i18nKey: 'Rural finca/farmhouse', value: 'finca', order: 5 },
          { i18nKey: 'Other', value: 'other', order: 6 }
        ],
        aiHint: 'property type'
      },
      {
        key: 'q3',
        type: 'multi',
        i18nKey: 'architects.residential.house_extension.q3.title',
        required: true,
        options: [
          { i18nKey: 'Larger kitchen/living space', value: 'kitchen_living', order: 1 },
          { i18nKey: 'Extra bedroom(s)', value: 'bedrooms', order: 2 },
          { i18nKey: 'Home office/studio', value: 'office', order: 3 },
          { i18nKey: 'Annex/guest suite', value: 'annex', order: 4 },
          { i18nKey: 'Storage/utility', value: 'storage', order: 5 },
          { i18nKey: 'Other', value: 'other', order: 6 }
        ],
        aiHint: 'extension reasons'
      },
      {
        key: 'q4',
        type: 'single',
        i18nKey: 'architects.residential.house_extension.q4.title',
        required: true,
        options: [
          { i18nKey: 'Small (up to one extra room)', value: 'small', order: 1 },
          { i18nKey: 'Medium (2–3 rooms)', value: 'medium', order: 2 },
          { i18nKey: 'Large (multiple rooms or levels)', value: 'large', order: 3 },
          { i18nKey: 'Not sure yet', value: 'unsure', order: 4 }
        ],
        aiHint: 'extension size'
      },
      {
        key: 'q5',
        type: 'single',
        i18nKey: 'architects.residential.house_extension.q5.title',
        required: true,
        options: [
          { i18nKey: 'Clear sketches and ideas', value: 'clear_ideas', order: 1 },
          { i18nKey: 'Some rough ideas', value: 'rough_ideas', order: 2 },
          { i18nKey: 'Only inspirational images', value: 'inspiration', order: 3 },
          { i18nKey: 'Starting from scratch', value: 'from_scratch', order: 4 }
        ],
        aiHint: 'existing ideas'
      },
      {
        key: 'q6',
        type: 'single',
        i18nKey: 'architects.residential.house_extension.q6.title',
        required: true,
        options: [
          { i18nKey: 'Mostly independent structure', value: 'independent', order: 1 },
          { i18nKey: 'Some new openings in existing walls', value: 'openings', order: 2 },
          { i18nKey: 'Major structural changes', value: 'major_changes', order: 3 },
          { i18nKey: 'Not sure', value: 'unsure', order: 4 }
        ],
        aiHint: 'structural alterations'
      },
      {
        key: 'q7',
        type: 'multi',
        i18nKey: 'architects.residential.house_extension.q7.title',
        required: false,
        options: [
          { i18nKey: 'Conservation area/listed building', value: 'conservation', order: 1 },
          { i18nKey: 'Community rules', value: 'community_rules', order: 2 },
          { i18nKey: 'Previous refusals', value: 'refusals', order: 3 },
          { i18nKey: 'None that I know of', value: 'none', order: 4 },
          { i18nKey: 'Not sure', value: 'unsure', order: 5 }
        ],
        aiHint: 'planning constraints'
      }
    ]
  },

  // Residential Architects: Planning Drawings
  {
    id: uuidv4(),
    category: 'architects-design',
    name: 'Planning Drawings',
    slug: 'planning-drawings',
    i18nPrefix: 'architects.residential.planning_drawings',
    questions: [
      {
        key: 'q1',
        type: 'single',
        i18nKey: 'architects.residential.planning_drawings.q1.title',
        required: true,
        options: [
          { i18nKey: 'New build home', value: 'new_build', order: 1 },
          { i18nKey: 'Extension/alteration', value: 'extension', order: 2 },
          { i18nKey: 'Change of use', value: 'change_use', order: 3 },
          { i18nKey: 'Regularising existing works', value: 'regularising', order: 4 },
          { i18nKey: 'Other', value: 'other', order: 5 }
        ],
        aiHint: 'project type'
      },
      {
        key: 'q2',
        type: 'single',
        i18nKey: 'architects.residential.planning_drawings.q2.title',
        required: true,
        options: [
          { i18nKey: 'Pre-application advice', value: 'pre_app', order: 1 },
          { i18nKey: 'Full planning application', value: 'full_planning', order: 2 },
          { i18nKey: 'Outline planning', value: 'outline', order: 3 },
          { i18nKey: 'Retrospective/regularisation', value: 'retrospective', order: 4 },
          { i18nKey: 'Not sure', value: 'unsure', order: 5 }
        ],
        aiHint: 'planning stage'
      },
      {
        key: 'q3',
        type: 'multi',
        i18nKey: 'architects.residential.planning_drawings.q3.title',
        required: true,
        options: [
          { i18nKey: 'Existing and proposed floor plans', value: 'floor_plans', order: 1 },
          { i18nKey: 'Elevations', value: 'elevations', order: 2 },
          { i18nKey: 'Sections', value: 'sections', order: 3 },
          { i18nKey: 'Site/location plans', value: 'site_plans', order: 4 },
          { i18nKey: 'Roof/landscape plans', value: 'roof_landscape', order: 5 },
          { i18nKey: 'Not sure – need guidance', value: 'need_guidance', order: 6 }
        ],
        aiHint: 'required drawings'
      },
      {
        key: 'q4',
        type: 'single',
        i18nKey: 'architects.residential.planning_drawings.q4.title',
        required: true,
        options: [
          { i18nKey: 'Full measured survey', value: 'full_survey', order: 1 },
          { i18nKey: 'Partial drawings', value: 'partial', order: 2 },
          { i18nKey: 'Old/basic plans only', value: 'old_plans', order: 3 },
          { i18nKey: 'No measured drawings yet', value: 'no_drawings', order: 4 }
        ],
        aiHint: 'survey status'
      },
      {
        key: 'q5',
        type: 'multi',
        i18nKey: 'architects.residential.planning_drawings.q5.title',
        required: false,
        options: [
          { i18nKey: 'Overlooking/over-shadowing concerns', value: 'overlooking', order: 1 },
          { i18nKey: 'Party wall boundaries', value: 'party_wall', order: 2 },
          { i18nKey: 'Shared access/drive', value: 'shared_access', order: 3 },
          { i18nKey: 'None that I know of', value: 'none', order: 4 },
          { i18nKey: 'Not sure', value: 'unsure', order: 5 }
        ],
        aiHint: 'neighbor sensitivities'
      },
      {
        key: 'q6',
        type: 'single',
        i18nKey: 'architects.residential.planning_drawings.q6.title',
        required: true,
        options: [
          { i18nKey: 'Yes – clear local design code', value: 'clear_code', order: 1 },
          { i18nKey: 'Some informal style expectations', value: 'informal', order: 2 },
          { i18nKey: 'No known guidelines', value: 'no_guidelines', order: 3 },
          { i18nKey: 'Not sure', value: 'unsure', order: 4 }
        ],
        aiHint: 'design guidelines'
      },
      {
        key: 'q7',
        type: 'multi',
        i18nKey: 'architects.residential.planning_drawings.q7.title',
        required: false,
        options: [
          { i18nKey: 'Structural engineer', value: 'structural', order: 1 },
          { i18nKey: 'Interior designer', value: 'interior', order: 2 },
          { i18nKey: 'Landscape designer', value: 'landscape', order: 3 },
          { i18nKey: 'Energy/sustainability consultant', value: 'energy', order: 4 },
          { i18nKey: 'None yet', value: 'none', order: 5 }
        ],
        aiHint: 'consultant coordination'
      }
    ]
  },

  // Structural Engineers: Load Assessment
  {
    id: uuidv4(),
    category: 'architects-design',
    name: 'Load Assessment',
    slug: 'load-assessment',
    i18nPrefix: 'architects.structural.load_assessment',
    questions: [
      {
        key: 'q1',
        type: 'single',
        i18nKey: 'architects.structural.load_assessment.q1.title',
        required: true,
        options: [
          { i18nKey: 'Opening in a load-bearing wall', value: 'wall_opening', order: 1 },
          { i18nKey: 'New beam or lintel', value: 'beam_lintel', order: 2 },
          { i18nKey: 'New floor or mezzanine', value: 'floor_mezzanine', order: 3 },
          { i18nKey: 'Roof alteration', value: 'roof', order: 4 },
          { i18nKey: 'Balcony/terrace/deck', value: 'balcony', order: 5 },
          { i18nKey: 'Retaining wall', value: 'retaining_wall', order: 6 },
          { i18nKey: 'Other', value: 'other', order: 7 }
        ],
        aiHint: 'structure element type'
      },
      {
        key: 'q2',
        type: 'single',
        i18nKey: 'architects.structural.load_assessment.q2.title',
        required: true,
        options: [
          { i18nKey: 'New design', value: 'new_design', order: 1 },
          { i18nKey: 'Verifying an existing element', value: 'verify_existing', order: 2 },
          { i18nKey: 'Assessing cracks/movement', value: 'assess_damage', order: 3 },
          { i18nKey: 'Combination', value: 'combination', order: 4 }
        ],
        aiHint: 'new vs existing'
      },
      {
        key: 'q3',
        type: 'single',
        i18nKey: 'architects.structural.load_assessment.q3.title',
        required: true,
        options: [
          { i18nKey: 'Residential house/apartment', value: 'residential', order: 1 },
          { i18nKey: 'Commercial building', value: 'commercial', order: 2 },
          { i18nKey: 'Industrial/agricultural building', value: 'industrial', order: 3 },
          { i18nKey: 'External garden/landscape structure', value: 'external', order: 4 },
          { i18nKey: 'Other', value: 'other', order: 5 }
        ],
        aiHint: 'building type'
      },
      {
        key: 'q4',
        type: 'multi',
        i18nKey: 'architects.structural.load_assessment.q4.title',
        required: true,
        options: [
          { i18nKey: 'Masonry walls', value: 'masonry', order: 1 },
          { i18nKey: 'Concrete frame/slab', value: 'concrete', order: 2 },
          { i18nKey: 'Steel beams/columns', value: 'steel', order: 3 },
          { i18nKey: 'Timber frame', value: 'timber', order: 4 },
          { i18nKey: 'Mixed or unsure', value: 'mixed', order: 5 }
        ],
        aiHint: 'materials involved'
      },
      {
        key: 'q5',
        type: 'multi',
        i18nKey: 'architects.structural.load_assessment.q5.title',
        required: false,
        options: [
          { i18nKey: 'Architect\'s plans', value: 'architect_plans', order: 1 },
          { i18nKey: 'Previous structural drawings', value: 'structural_drawings', order: 2 },
          { i18nKey: 'Simple sketches with sizes', value: 'sketches', order: 3 },
          { i18nKey: 'Photos only', value: 'photos', order: 4 },
          { i18nKey: 'None yet', value: 'none', order: 5 }
        ],
        aiHint: 'available documentation'
      },
      {
        key: 'q6',
        type: 'multi',
        i18nKey: 'architects.structural.load_assessment.q6.title',
        required: false,
        options: [
          { i18nKey: 'Cracks in walls/ceilings', value: 'cracks', order: 1 },
          { i18nKey: 'Doors/windows sticking', value: 'sticking', order: 2 },
          { i18nKey: 'Sagging or deflection', value: 'sagging', order: 3 },
          { i18nKey: 'Water damage', value: 'water_damage', order: 4 },
          { i18nKey: 'None visible', value: 'none', order: 5 }
        ],
        aiHint: 'distress signs'
      },
      {
        key: 'q7',
        type: 'single',
        i18nKey: 'architects.structural.load_assessment.q7.title',
        required: true,
        options: [
          { i18nKey: 'Normal domestic use', value: 'domestic', order: 1 },
          { i18nKey: 'High storage load', value: 'storage', order: 2 },
          { i18nKey: 'Commercial or public use', value: 'commercial', order: 3 },
          { i18nKey: 'Heavy equipment or special loads', value: 'heavy_equipment', order: 4 }
        ],
        aiHint: 'intended use'
      }
    ]
  },

  // Structural Engineers: Structural Calculations
  {
    id: uuidv4(),
    category: 'architects-design',
    name: 'Structural Calculations',
    slug: 'structural-calculations',
    i18nPrefix: 'architects.structural.structural_calculations',
    questions: [
      {
        key: 'q1',
        type: 'single',
        i18nKey: 'architects.structural.structural_calculations.q1.title',
        required: true,
        options: [
          { i18nKey: 'House extension/renovation', value: 'house_extension', order: 1 },
          { i18nKey: 'New residential building', value: 'new_residential', order: 2 },
          { i18nKey: 'Commercial/office fit-out', value: 'commercial', order: 3 },
          { i18nKey: 'Industrial or specialist structure', value: 'industrial', order: 4 },
          { i18nKey: 'Other', value: 'other', order: 5 }
        ],
        aiHint: 'project type'
      },
      {
        key: 'q2',
        type: 'multi',
        i18nKey: 'architects.structural.structural_calculations.q2.title',
        required: true,
        options: [
          { i18nKey: 'Beams/lintels', value: 'beams', order: 1 },
          { i18nKey: 'Columns or posts', value: 'columns', order: 2 },
          { i18nKey: 'Floor structures', value: 'floors', order: 3 },
          { i18nKey: 'Roof structure', value: 'roof', order: 4 },
          { i18nKey: 'Foundations', value: 'foundations', order: 5 },
          { i18nKey: 'Retaining walls', value: 'retaining_walls', order: 6 },
          { i18nKey: 'Other', value: 'other', order: 7 }
        ],
        aiHint: 'structural elements'
      },
      {
        key: 'q3',
        type: 'single',
        i18nKey: 'architects.structural.structural_calculations.q3.title',
        required: true,
        options: [
          { i18nKey: 'Building control/permit submission', value: 'building_control', order: 1 },
          { i18nKey: 'Architect coordination', value: 'architect', order: 2 },
          { i18nKey: 'Contractor/workshop fabrication', value: 'contractor', order: 3 },
          { i18nKey: 'Bank/insurer', value: 'bank_insurer', order: 4 },
          { i18nKey: 'Other', value: 'other', order: 5 }
        ],
        aiHint: 'purpose of calculations'
      },
      {
        key: 'q4',
        type: 'multi',
        i18nKey: 'architects.structural.structural_calculations.q4.title',
        required: false,
        options: [
          { i18nKey: 'Complete architectural plans', value: 'arch_plans', order: 1 },
          { i18nKey: 'Outline sketches only', value: 'sketches', order: 2 },
          { i18nKey: 'Soil/site investigation report', value: 'soil_report', order: 3 },
          { i18nKey: 'Previous structural reports', value: 'structural_reports', order: 4 },
          { i18nKey: 'None of these yet', value: 'none', order: 5 }
        ],
        aiHint: 'available information'
      },
      {
        key: 'q5',
        type: 'multi',
        i18nKey: 'architects.structural.structural_calculations.q5.title',
        required: false,
        options: [
          { i18nKey: 'Heavy equipment or storage', value: 'heavy_equipment', order: 1 },
          { i18nKey: 'Roof terrace or pool', value: 'roof_terrace', order: 2 },
          { i18nKey: 'Large openings or cantilevers', value: 'large_openings', order: 3 },
          { i18nKey: 'Crowd/public loading', value: 'crowd_loading', order: 4 },
          { i18nKey: 'Vibration-sensitive use', value: 'vibration', order: 5 },
          { i18nKey: 'None special', value: 'none', order: 6 }
        ],
        aiHint: 'unusual loads'
      },
      {
        key: 'q6',
        type: 'single',
        i18nKey: 'architects.structural.structural_calculations.q6.title',
        required: true,
        options: [
          { i18nKey: 'Steel frame', value: 'steel', order: 1 },
          { i18nKey: 'Concrete', value: 'concrete', order: 2 },
          { i18nKey: 'Timber', value: 'timber', order: 3 },
          { i18nKey: 'Masonry', value: 'masonry', order: 4 },
          { i18nKey: 'Hybrid/mix', value: 'hybrid', order: 5 },
          { i18nKey: 'Open to engineer\'s recommendation', value: 'open', order: 6 }
        ],
        aiHint: 'construction material'
      },
      {
        key: 'q7',
        type: 'single',
        i18nKey: 'architects.structural.structural_calculations.q7.title',
        required: true,
        options: [
          { i18nKey: 'Yes – ongoing input expected', value: 'ongoing', order: 1 },
          { i18nKey: 'Possibly for key stages only', value: 'key_stages', order: 2 },
          { i18nKey: 'One-off calculations is enough', value: 'one_off', order: 3 },
          { i18nKey: 'Not sure yet', value: 'unsure', order: 4 }
        ],
        aiHint: 'ongoing involvement'
      }
    ]
  }
];
