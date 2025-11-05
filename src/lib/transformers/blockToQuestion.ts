/**
 * Block to Question Transformer
 * Converts JSON ServiceBlock definitions to AIQuestion format
 */

import { ServiceBlock, ConstructionService } from '@/types/construction-services';
import { AIQuestion } from '@/hooks/useAIQuestions';

/**
 * Transform a single ServiceBlock into an AIQuestion
 */
export function transformBlockToAIQuestion(block: ServiceBlock): AIQuestion {
  // Map type_selector to appropriate AIQuestion type
  if (block.type === 'type_selector') {
    return {
      id: block.id,
      type: block.config.multiSelect ? 'checkbox' : 'radio',
      label: block.title,
      required: block.required,
      options: block.config.options?.map(opt => ({
        label: opt.label,
        value: opt.value
      })) || [],
      meta: {
        priority: 'core',
        hint: block.description
      }
    };
  }
  
  // Map text_field to text type
  if (block.type === 'text_field') {
    return {
      id: block.id,
      type: 'text',
      label: block.title,
      required: block.required,
      meta: {
        priority: 'core',
        hint: block.description
      }
    };
  }
  
  // Fallback to text type
  return {
    id: block.id,
    type: 'text',
    label: block.title,
    required: block.required,
    meta: {
      priority: 'core',
      hint: block.description
    }
  };
}

/**
 * Logistics question IDs that should be filtered out from Step 4
 * These are handled in Step 5 (LogisticsStep)
 */
const LOGISTICS_QUESTION_IDS = [
  'job_location',
  'location',
  'start_time',
  'start_date',
  'preferred_date',
  'project_assets',
  'budget',
  'budget_range',
  'timeline',
  'completion_date',
  'access',
  'access_details',
  'consultation',
  'consultation_type'
];

/**
 * Transform all blocks in a service to AIQuestion array
 * Filters out logistics questions that are handled in Step 5
 */
export function transformServiceToQuestions(
  service: ConstructionService
): AIQuestion[] {
  // Filter out logistics questions
  const filteredBlocks = service.blocks.filter(
    block => !LOGISTICS_QUESTION_IDS.includes(block.id)
  );
  
  return filteredBlocks.map(transformBlockToAIQuestion);
}
