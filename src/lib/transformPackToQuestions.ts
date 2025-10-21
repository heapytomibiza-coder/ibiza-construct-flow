/**
 * Transform MicroserviceDef questions to AIQuestion format
 * Used when loading questions from question_packs table
 */

import { QuestionDef } from '@/types/packs';

export interface AIQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select';
  required?: boolean;
  options?: string[];
}

export function transformPackToQuestions(questions: QuestionDef[]): AIQuestion[] {
  return questions.map((q, index) => {
    // Map question types
    let type: AIQuestion['type'] = 'textarea';
    
    switch (q.type) {
      case 'text':
      case 'number':
        type = 'text';
        break;
      case 'single':
      case 'yesno':
      case 'scale':
        type = 'radio';
        break;
      case 'multi':
        type = 'checkbox';
        break;
      default:
        type = 'textarea';
    }
    
    // Extract option labels
    const options = q.options?.map(opt => opt.i18nKey) || [];
    
    return {
      id: q.key || `q${index + 1}`,
      question: q.i18nKey,
      type,
      required: q.required || false,
      ...(options.length > 0 && { options })
    };
  });
}
