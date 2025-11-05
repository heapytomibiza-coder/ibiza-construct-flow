/**
 * Transform construction-services.json format to question_packs.content format
 */

import type { ConstructionService, ServiceBlock } from '@/types/construction-services';
import type { MicroserviceDef, QuestionDef, QuestionOption } from '@/types/packs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Logistics question IDs that should be filtered out
 * These are handled in Step 5 (LogisticsStep)
 */
export const LOGISTICS_QUESTION_IDS = [
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
 * Transform ServiceBlock to QuestionDef
 */
function transformBlockToQuestionDef(block: ServiceBlock, index: number): QuestionDef {
  let type: QuestionDef['type'] = 'text';
  
  if (block.type === 'type_selector') {
    type = block.config.multiSelect ? 'multi' : 'single';
  } else if (block.type === 'text_field') {
    type = 'text';
  }
  
  const questionDef: QuestionDef = {
    key: `q${index + 1}`,
    type,
    i18nKey: `questions.${block.id}.title`,
    required: block.required || false,
    aiHint: block.description,
  };
  
  // Add options for radio/checkbox types
  if (type === 'single' || type === 'multi') {
    questionDef.options = block.config.options?.map((opt, idx) => ({
      i18nKey: `questions.${block.id}.options.${opt.value}`,
      value: opt.value,
      order: idx,
    })) || [];
  }
  
  return questionDef;
}

/**
 * Transform ConstructionService to MicroserviceDef
 */
export function transformServiceToContent(
  service: ConstructionService,
  microSlug: string
): MicroserviceDef {
  // Filter out logistics questions
  const filteredBlocks = service.blocks.filter(
    block => !LOGISTICS_QUESTION_IDS.includes(block.id)
  );
  
  const questions = filteredBlocks.map(transformBlockToQuestionDef);
  
  return {
    id: uuidv4(),
    category: 'construction', // Default category
    name: service.label,
    slug: microSlug,
    i18nPrefix: microSlug.replace(/-/g, '.'),
    questions,
  };
}

/**
 * Map service ID to micro_slug format
 */
export function mapServiceIdToMicroSlug(serviceId: string): string {
  // Most service IDs are already in kebab-case
  return serviceId;
}
