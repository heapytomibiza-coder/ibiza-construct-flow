/**
 * Utility functions for question handling
 */

import { AIQuestion } from '@/hooks/useAIQuestions';

/**
 * Converts i18n key to human-readable text as fallback
 * "tiler.floor.q1.title" → "What type of flooring?"
 * "tiler.floor.q1.label" → "Floor Q1 Label"
 */
export function extractReadableText(i18nKey: string): string {
  if (!i18nKey) return '';
  
  // Remove common prefixes and clean up
  const parts = i18nKey.split('.');
  const lastPart = parts[parts.length - 1];
  
  // Convert camelCase or snake_case to Title Case
  const readable = lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
  
  return readable || i18nKey;
}

/**
 * Groups questions into logical sections
 */
export interface QuestionGroup {
  id: string;
  title: string;
  subtitle?: string;
  questions: AIQuestion[];
}

export function groupQuestions(questions: AIQuestion[]): QuestionGroup[] {
  if (!questions || questions.length === 0) return [];

  // Categorize questions by type and content
  const coreQuestions: AIQuestion[] = [];
  const requirementQuestions: AIQuestion[] = [];
  const additionalQuestions: AIQuestion[] = [];

  questions.forEach(q => {
    const keyLower = (q.id || '').toLowerCase();
    const labelLower = (q.label || '').toLowerCase();
    
    // Core details: size, type, scope, main specifications
    if (
      keyLower.includes('size') ||
      keyLower.includes('type') ||
      keyLower.includes('area') ||
      keyLower.includes('scope') ||
      keyLower.includes('main') ||
      labelLower.includes('size') ||
      labelLower.includes('type') ||
      labelLower.includes('how many')
    ) {
      coreQuestions.push(q);
    }
    // Requirements: materials, timeline, access, conditions
    else if (
      keyLower.includes('material') ||
      keyLower.includes('timeline') ||
      keyLower.includes('date') ||
      keyLower.includes('access') ||
      keyLower.includes('condition') ||
      labelLower.includes('material') ||
      labelLower.includes('when') ||
      labelLower.includes('access')
    ) {
      requirementQuestions.push(q);
    }
    // Everything else
    else {
      additionalQuestions.push(q);
    }
  });

  const groups: QuestionGroup[] = [];

  if (coreQuestions.length > 0) {
    groups.push({
      id: 'core',
      title: 'Core Details',
      subtitle: 'Essential information about your project',
      questions: coreQuestions
    });
  }

  if (requirementQuestions.length > 0) {
    groups.push({
      id: 'requirements',
      title: 'Project Requirements',
      subtitle: 'Materials, timeline, and access',
      questions: requirementQuestions
    });
  }

  if (additionalQuestions.length > 0) {
    groups.push({
      id: 'additional',
      title: 'Additional Information',
      subtitle: 'Help us understand your preferences',
      questions: additionalQuestions
    });
  }

  // If no smart grouping worked, create a single group
  if (groups.length === 0 && questions.length > 0) {
    groups.push({
      id: 'all',
      title: 'Project Details',
      subtitle: 'Tell us about your project',
      questions: questions
    });
  }

  return groups;
}
