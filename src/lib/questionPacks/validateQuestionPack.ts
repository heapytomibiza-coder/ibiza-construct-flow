/**
 * Validation utilities for question packs
 */

import type { MicroserviceDef } from '@/types/packs';

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Validate a question pack before saving
 */
export function validateQuestionPack(content: MicroserviceDef): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check question count
  const qCount = content.questions.length;
  if (qCount < 4) {
    warnings.push(`Only ${qCount} questions provided. Recommended minimum is 4 for meaningful discovery.`);
  }
  if (qCount > 12) {
    warnings.push(`${qCount} questions may overwhelm users. Recommended maximum is 12.`);
  }
  if (qCount === 0) {
    errors.push('At least one question is required.');
  }
  
  // Check for duplicate question keys
  const keys = content.questions.map(q => q.key);
  const duplicateKeys = keys.filter((key, idx) => keys.indexOf(key) !== idx);
  if (duplicateKeys.length > 0) {
    errors.push(`Duplicate question keys found: ${duplicateKeys.join(', ')}`);
  }
  
  // Check for questions with options but wrong type
  content.questions.forEach((q, idx) => {
    if (q.options && q.options.length > 0 && !['single', 'multi'].includes(q.type)) {
      warnings.push(`Question ${idx + 1} has options but type is "${q.type}". Should be "single" or "multi".`);
    }
    
    if (['single', 'multi'].includes(q.type) && (!q.options || q.options.length === 0)) {
      errors.push(`Question ${idx + 1} is type "${q.type}" but has no options.`);
    }
  });
  
  // Check slug format
  if (!/^[a-z0-9-]+$/.test(content.slug)) {
    errors.push('Slug must be kebab-case (lowercase letters, numbers, and hyphens only).');
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Check if a slug already exists in the database
 */
export async function checkSlugExists(
  supabase: any,
  slug: string,
  excludePackId?: string
): Promise<boolean> {
  const query = supabase
    .from('question_packs')
    .select('pack_id')
    .eq('micro_slug', slug)
    .eq('is_active', true);
  
  if (excludePackId) {
    query.neq('pack_id', excludePackId);
  }
  
  const { data } = await query.single();
  return !!data;
}
