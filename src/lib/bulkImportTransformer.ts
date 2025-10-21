/**
 * Bulk transformation utility for converting microservices_master JSON to question_packs format
 */

import { MicroserviceDef, QuestionDef, QuestionOption, QuestionType } from '@/types/packs';

// User's JSON format
interface UserMicroservice {
  service: string;
  category: string;
  questions: UserQuestion[];
}

interface UserQuestion {
  question: string;
  type: 'single_choice' | 'multi_choice' | 'text' | 'number' | 'scale' | 'yes_no';
  options?: string[];
  required?: boolean;
}

// Generate URL-friendly slug from service name
function generateSlug(serviceName: string): string {
  return serviceName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// Generate question key from question text
function generateQuestionKey(questionText: string, index: number): string {
  const base = questionText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);
  return base || `q${index + 1}`;
}

// Generate option value from option text
function generateOptionValue(optionText: string): string {
  return optionText
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/\//g, '_')
    .replace(/[^a-z0-9_]+/g, '')
    .replace(/^_+|_+$/g, '');
}

// Map user's question type to database question type
function mapQuestionType(userType: string): QuestionType {
  const typeMap: Record<string, QuestionType> = {
    'single_choice': 'single',
    'multi_choice': 'multi',
    'text': 'text',
    'number': 'number',
    'scale': 'scale',
    'yes_no': 'yesno'
  };
  return typeMap[userType] || 'text';
}

// Generate AI hint based on question content
function generateAiHint(question: string, type: string): string {
  const hints: Record<string, string> = {
    'single_choice': 'Understanding this choice helps professionals provide accurate quotes',
    'multi_choice': 'Multiple selections help identify the full scope of work needed',
    'text': 'Detailed description helps professionals understand specific requirements',
    'number': 'Specific measurements help professionals estimate materials and time',
    'scale': 'Rating helps professionals gauge expectations and complexity',
    'yes_no': 'This clarification helps professionals assess job requirements'
  };
  return hints[type] || 'This information helps professionals provide better service';
}

// Transform user's question to database format
function transformQuestion(userQuestion: UserQuestion, index: number): QuestionDef {
  const key = generateQuestionKey(userQuestion.question, index);
  const type = mapQuestionType(userQuestion.type);
  
  let options: QuestionOption[] | undefined;
  if (userQuestion.options && userQuestion.options.length > 0) {
    options = userQuestion.options.map((opt, optIndex) => ({
      i18nKey: opt,
      value: generateOptionValue(opt),
      order: optIndex
    }));
  }

  return {
    key,
    type,
    i18nKey: userQuestion.question,
    required: userQuestion.required ?? true,
    options,
    aiHint: generateAiHint(userQuestion.question, userQuestion.type)
  };
}

// Transform user's microservice to database format
export function transformMicroservice(userMicroservice: UserMicroservice): MicroserviceDef {
  const slug = generateSlug(userMicroservice.service);
  const i18nPrefix = slug.replace(/-/g, '.');

  const questions = userMicroservice.questions.map((q, index) => 
    transformQuestion(q, index)
  );

  return {
    id: crypto.randomUUID(),
    category: userMicroservice.category,
    name: userMicroservice.service,
    slug,
    i18nPrefix,
    questions
  };
}

// Validation result
export interface ValidationResult {
  microSlug: string;
  serviceName: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  questionCount: number;
}

// Validate transformed microservice
export function validateMicroservice(microservice: MicroserviceDef): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate slug
  if (!microservice.slug || microservice.slug.length < 3) {
    errors.push('Slug must be at least 3 characters');
  }

  // Validate questions count
  const qCount = microservice.questions.length;
  if (qCount === 0) {
    errors.push('No questions found');
  } else if (qCount < 4) {
    warnings.push(`Only ${qCount} questions. Recommended minimum is 4`);
  } else if (qCount > 12) {
    warnings.push(`${qCount} questions may overwhelm users. Recommended maximum is 12`);
  }

  // Validate each question
  microservice.questions.forEach((q, index) => {
    if (!q.key) {
      errors.push(`Question ${index + 1}: Missing key`);
    }
    if (!q.i18nKey) {
      errors.push(`Question ${index + 1}: Missing question text`);
    }
    if (['single', 'multi', 'scale'].includes(q.type) && (!q.options || q.options.length === 0)) {
      errors.push(`Question ${index + 1}: Type "${q.type}" requires options`);
    }
    
    // Check for duplicate keys
    const duplicateKeys = microservice.questions.filter(other => other.key === q.key);
    if (duplicateKeys.length > 1) {
      errors.push(`Question ${index + 1}: Duplicate key "${q.key}"`);
    }
  });

  return {
    microSlug: microservice.slug,
    serviceName: microservice.name,
    isValid: errors.length === 0,
    errors,
    warnings,
    questionCount: qCount
  };
}

// Bulk transform with validation
export interface BulkTransformResult {
  transformed: MicroserviceDef[];
  validations: ValidationResult[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    totalQuestions: number;
  };
}

export function bulkTransform(userMicroservices: UserMicroservice[]): BulkTransformResult {
  const transformed = userMicroservices.map(transformMicroservice);
  const validations = transformed.map(validateMicroservice);

  const valid = validations.filter(v => v.isValid).length;
  const totalQuestions = transformed.reduce((sum, m) => sum + m.questions.length, 0);

  return {
    transformed,
    validations,
    summary: {
      total: transformed.length,
      valid,
      invalid: transformed.length - valid,
      totalQuestions
    }
  };
}
