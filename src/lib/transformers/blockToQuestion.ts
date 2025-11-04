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
 * Transform all blocks in a service to AIQuestion array
 */
export function transformServiceToQuestions(
  service: ConstructionService
): AIQuestion[] {
  return service.blocks.map(transformBlockToAIQuestion);
}
