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

/**
 * Humanize a key by converting snake_case/kebab-case to readable text
 * Special handling for common patterns like q1, q2 → Question 1, Question 2
 */
function humanizeKey(key: string): string {
  // Handle common question key patterns: q1, q2, etc. → Question 1, Question 2
  if (/^q\d+$/i.test(key)) {
    const num = key.slice(1);
    return `Question ${num}`;
  }
  
  // Standard humanization for other keys
  return key
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

/**
 * Get readable question text with smart fallback:
 * 1. Try using aiHint (most descriptive)
 * 2. Humanize the key as last resort
 */
function getQuestionText(q: QuestionDef): string {
  // If aiHint exists, use it as the question
  if (q.aiHint && q.aiHint.length > 0) {
    return q.aiHint;
  }
  
  // Otherwise humanize the key
  return humanizeKey(q.key);
}

/**
 * Get readable option text with smart fallback:
 * 1. If i18nKey doesn't look like a key path, use it directly
 * 2. Otherwise humanize the value
 */
function getOptionText(option: { i18nKey: string; value: string }): string {
  // If i18nKey doesn't contain dots or looks readable, use it
  if (!option.i18nKey.includes('.') || /^[A-Z]/.test(option.i18nKey)) {
    return option.i18nKey;
  }
  
  // Otherwise humanize the value
  return humanizeKey(option.value);
}

export function transformPackToQuestions(questions: QuestionDef[]): AIQuestion[] {
  return questions.map((q, index) => {
    // Map question types
    let type: AIQuestion['type'] = 'textarea';
    
    switch (q.type) {
      case 'text':
        type = 'text';
        break;
      case 'number':
        type = 'text'; // Use text input for numbers with units
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
    
    // Get readable question text using smart fallback
    const questionText = getQuestionText(q);
    
    // Get readable option labels using smart fallback
    const options = q.options?.map(opt => getOptionText(opt)) || [];
    
    return {
      id: q.key || `q${index + 1}`,
      question: questionText,
      type,
      required: q.required || false,
      ...(options.length > 0 && { options })
    };
  });
}
