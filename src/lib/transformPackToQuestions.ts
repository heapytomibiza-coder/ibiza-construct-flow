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
 * Clean up question text for display:
 * - Remove trailing ".?" patterns
 * - Ensure proper question mark ending
 */
function cleanQuestionText(text: string): string {
  if (!text) return '';
  // Remove trailing ".?" and replace with "?"
  let cleaned = text.replace(/\.\?$/, '?').replace(/\?{2,}$/, '?');
  // Ensure ends with question mark if it looks like a question
  if (!cleaned.endsWith('?') && !cleaned.endsWith('.')) {
    cleaned = cleaned + '?';
  }
  return cleaned.trim();
}

/**
 * Get readable question text with smart fallback:
 * 1. aiHint (PRIMARY - contains the actual question text)
 * 2. Humanize the key as last resort
 */
function getQuestionText(q: QuestionDef): string {
  // aiHint is the PRIMARY source for question text
  if (q.aiHint && q.aiHint.length > 5) {
    return cleanQuestionText(q.aiHint);
  }
  
  // Otherwise humanize the key
  return humanizeKey(q.key) + '?';
}

/**
 * Get readable option text with smart fallback:
 * 1. If i18nKey doesn't look like a key path, use it directly (e.g., "Interior", "Exterior")
 * 2. Otherwise humanize the value
 */
function getOptionText(option: { i18nKey: string; value: string }): string {
  // If i18nKey doesn't contain dots, it's already readable (e.g., "Interior", "Exterior")
  if (option.i18nKey && !option.i18nKey.includes('.')) {
    return option.i18nKey;
  }
  
  // If starts with capital letter, it's likely readable
  if (option.i18nKey && /^[A-Z]/.test(option.i18nKey)) {
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
    
    // Get readable question text using smart fallback (aiHint is PRIMARY)
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
