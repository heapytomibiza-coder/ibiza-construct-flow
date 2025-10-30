/**
 * New Question Pack Format Transformer
 * Converts the new template format to database schema
 */

import { z } from 'zod';
import { MicroserviceDef, QuestionDef, QuestionOption, VisibilityRule } from '@/types/packs';

// New format schema validation
export const NewFormatQuestion = z.object({
  id: z.string(),
  order: z.number(),
  label: z.string(),
  type: z.enum(['short_text', 'long_text', 'single_select', 'multi_select', 'file_upload']),
  placeholder: z.string().optional(),
  required: z.boolean(),
  help: z.string().optional(),
  output_key: z.string(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).optional(),
  visible_if: z.object({
    question_id: z.string(),
    equals: z.union([z.string(), z.number(), z.boolean()])
  }).optional(),
  min_selections: z.number().optional(),
  max_selections: z.number().optional(),
  accept: z.array(z.string()).optional(),
  max_files: z.number().optional(),
  max_total_mb: z.number().optional()
});

export const NewFormatPack = z.object({
  category: z.string(),
  subcategory: z.string(),
  microservice: z.string(),
  slug: z.string(),
  version: z.string(),
  locale: z.string(),
  metadata: z.object({
    id: z.string(),
    created_at: z.string(),
    source: z.string()
  }),
  questions: z.array(NewFormatQuestion),
  ai_generation_blueprint: z.any().optional()
});

export type NewFormatQuestionT = z.infer<typeof NewFormatQuestion>;
export type NewFormatPackT = z.infer<typeof NewFormatPack>;

// Type mapping from new format to database format
function mapQuestionType(newType: string): QuestionDef['type'] {
  const typeMap: Record<string, QuestionDef['type']> = {
    'short_text': 'text',
    'long_text': 'text',
    'single_select': 'single',
    'multi_select': 'multi',
    'file_upload': 'file'
  };
  return typeMap[newType] || 'text';
}

// Transform visible_if to visibility rule
function transformVisibility(visible_if?: { question_id: string; equals?: any }): VisibilityRule | undefined {
  if (!visible_if || visible_if.equals === undefined) return undefined;
  
  return {
    anyOf: [{
      questionKey: visible_if.question_id,
      equals: visible_if.equals
    }]
  };
}

// Transform single question with ui_config extraction
function transformQuestion(q: NewFormatQuestionT): {
  question: QuestionDef;
  ui_config: Record<string, any>;
} {
  const options: QuestionOption[] | undefined = q.options?.map((opt, idx) => ({
    value: opt.value,
    i18nKey: opt.label,
    order: idx
  }));

  const question: QuestionDef = {
    key: q.id,
    type: mapQuestionType(q.type),
    i18nKey: q.label,
    required: q.required,
    options,
    visibility: transformVisibility(q.visible_if),
    aiHint: q.output_key
  };

  // Extract UI-specific configuration
  const ui_config: Record<string, any> = {};
  if (q.placeholder) ui_config.placeholder = q.placeholder;
  if (q.help) ui_config.help = q.help;
  if (q.min_selections) ui_config.min_selections = q.min_selections;
  if (q.max_selections) ui_config.max_selections = q.max_selections;
  if (q.accept) ui_config.accept = q.accept;
  if (q.max_files) ui_config.max_files = q.max_files;
  if (q.max_total_mb) ui_config.max_total_mb = q.max_total_mb;

  return { question, ui_config };
}

/**
 * Main transformer: New format → Database format
 */
export function transformNewFormatPack(pack: unknown) {
  const parsed = NewFormatPack.parse(pack);
  
  const transformedQuestions = parsed.questions
    .sort((a, b) => a.order - b.order)
    .map(q => transformQuestion(q));
  
  const microserviceDef: MicroserviceDef = {
    id: crypto.randomUUID(),
    category: parsed.category,
    name: parsed.microservice,
    slug: parsed.slug,
    i18nPrefix: parsed.slug.replace(/\//g, '.'),
    questions: transformedQuestions.map(tq => tq.question)
  };

  // Aggregate ui_config for all questions
  const ui_config = transformedQuestions.reduce((acc, tq) => {
    if (Object.keys(tq.ui_config).length > 0) {
      acc[tq.question.key] = tq.ui_config;
    }
    return acc;
  }, {} as Record<string, any>);

  return {
    microserviceDef,
    ui_config,
    metadata: {
      source: parsed.metadata.source,
      locale: parsed.locale,
      version: parsed.version
    }
  };
}

/**
 * Batch transform multiple packs
 */
export function transformNewFormatPacks(packs: unknown[]): Array<{
  microserviceDef: MicroserviceDef;
  ui_config: Record<string, any>;
  metadata: any;
}> {
  return packs.map(pack => transformNewFormatPack(pack));
}

/**
 * Validate without transforming
 */
export function validateNewFormatPack(pack: unknown): { valid: boolean; errors?: any } {
  try {
    NewFormatPack.parse(pack);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        valid: false, 
        errors: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      };
    }
    return { valid: false, errors: [{ message: 'Unknown validation error' }] };
  }
}
