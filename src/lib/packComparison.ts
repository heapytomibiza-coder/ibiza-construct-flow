/**
 * Business logic for pack comparison, diffing, and health checks
 */

import { Pack, QuestionDef, MicroserviceDef } from '@/types/packs';
import { ContentDiff, QuestionDiff, PackHealthCheck, RiskFlags } from '@/types/compare';
import { MicroserviceDefSchema } from '@/schemas/packs';

/**
 * Calculate content diff between active and draft packs
 */
export function calculateContentDiff(
  activeContent: MicroserviceDef | null,
  draftContent: MicroserviceDef | null
): ContentDiff | null {
  if (!activeContent && !draftContent) return null;

  const activeQuestions = activeContent?.questions || [];
  const draftQuestions = draftContent?.questions || [];

  const activeKeys = new Set(activeQuestions.map(q => q.key));
  const draftKeys = new Set(draftQuestions.map(q => q.key));

  const addedQuestions = draftQuestions
    .filter(q => !activeKeys.has(q.key))
    .map(q => q.key);

  const removedQuestions = activeQuestions
    .filter(q => !draftKeys.has(q.key))
    .map(q => q.key);

  const questions: QuestionDiff[] = [];
  const changedQuestions: string[] = [];

  // Process all questions
  const allKeys = new Set([...activeKeys, ...draftKeys]);
  allKeys.forEach(key => {
    const activeQ = activeQuestions.find(q => q.key === key);
    const draftQ = draftQuestions.find(q => q.key === key);

    if (!activeQ && draftQ) {
      questions.push({ key, status: 'added', draft: draftQ });
    } else if (activeQ && !draftQ) {
      questions.push({ key, status: 'removed', active: activeQ });
    } else if (activeQ && draftQ) {
      const changes = detectQuestionChanges(activeQ, draftQ);
      const hasChanges = Object.values(changes).some(v => v);
      
      if (hasChanges) {
        changedQuestions.push(key);
      }

      questions.push({
        key,
        status: hasChanges ? 'changed' : 'unchanged',
        active: activeQ,
        draft: draftQ,
        changes: hasChanges ? changes : undefined,
      });
    }
  });

  return {
    questionsCount: {
      active: activeQuestions.length,
      draft: draftQuestions.length,
      delta: draftQuestions.length - activeQuestions.length,
    },
    questions,
    addedQuestions,
    removedQuestions,
    changedQuestions,
  };
}

function detectQuestionChanges(active: QuestionDef, draft: QuestionDef) {
  return {
    type: active.type !== draft.type,
    required: active.required !== draft.required,
    options: JSON.stringify(active.options) !== JSON.stringify(draft.options),
    visibility: JSON.stringify(active.visibility) !== JSON.stringify(draft.visibility),
    aiHint: active.aiHint !== draft.aiHint,
  };
}

/**
 * Perform health checks on a pack
 */
export function performHealthCheck(content: MicroserviceDef | null): PackHealthCheck | null {
  if (!content) return null;

  // Schema validation
  const schemaResult = MicroserviceDefSchema.safeParse(content);
  
  // i18n coverage (simplified - in real app would check translation files)
  const allI18nKeys = extractI18nKeys(content);
  const i18nCoverage = {
    en: 1.0, // Assume 100% for now
    es: 0.95, // Mock 95% for Spanish
    missingKeys: [], // Would be populated from actual i18n files
  };

  // Pattern compliance (Perfect DNA slots)
  const expectedSlots = [
    'type_scope',
    'size_scale',
    'condition_prep',
    'materials_finish',
    'access_complexity',
    'extras',
  ];
  
  const mappedSlots = content.questions
    .filter(q => q.aiHint)
    .map(q => q.aiHint!.toLowerCase().replace(/\s+/g, '_'))
    .filter(hint => expectedSlots.some(slot => hint.includes(slot)));

  // Forbidden topics
  const forbiddenTopics = detectForbiddenTopics(content);

  return {
    schemaValid: schemaResult.success,
    schemaErrors: schemaResult.success ? undefined : schemaResult.error.issues.map(e => e.message),
    i18nCoverage,
    patternCompliance: {
      valid: mappedSlots.length >= 5, // At least 5 of 6 slots
      expectedSlots,
      mappedSlots,
      unmappedQuestions: content.questions
        .filter(q => !q.aiHint || !mappedSlots.includes(q.aiHint))
        .map(q => q.key),
    },
    forbiddenTopics,
  };
}

function extractI18nKeys(content: MicroserviceDef): string[] {
  const keys: string[] = [];
  keys.push(content.i18nPrefix);
  
  content.questions.forEach(q => {
    keys.push(q.i18nKey);
    q.options?.forEach(opt => keys.push(opt.i18nKey));
  });
  
  return keys;
}

function detectForbiddenTopics(content: MicroserviceDef) {
  const questions = content.questions;
  const violations: string[] = [];
  
  const hasLocationQuestions = questions.some(q => 
    q.i18nKey.toLowerCase().includes('location') || 
    q.i18nKey.toLowerCase().includes('address')
  );
  
  const hasDateQuestions = questions.some(q => 
    q.i18nKey.toLowerCase().includes('date') || 
    q.i18nKey.toLowerCase().includes('when')
  );
  
  const hasBudgetQuestions = questions.some(q => 
    q.i18nKey.toLowerCase().includes('budget') || 
    q.i18nKey.toLowerCase().includes('price')
  );

  if (hasLocationQuestions) violations.push('Contains location/address questions');
  if (hasDateQuestions) violations.push('Contains date/timing questions');
  if (hasBudgetQuestions) violations.push('Contains budget/pricing questions');

  return {
    hasLocationQuestions,
    hasDateQuestions,
    hasBudgetQuestions,
    violations,
  };
}

/**
 * Calculate risk flags for a draft pack
 */
export function calculateRiskFlags(
  draftContent: MicroserviceDef | null,
  draftHealth: PackHealthCheck | null,
  contentDiff: ContentDiff | null
): RiskFlags | null {
  if (!draftContent || !draftHealth) return null;

  const messages: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';

  // Question count validation
  const questionCountInvalid = draftContent.questions.length < 6 || draftContent.questions.length > 8;
  if (questionCountInvalid) {
    messages.push(`Question count: ${draftContent.questions.length} (expected 6-8)`);
    severity = 'medium';
  }

  // Free text questions
  const hasFreeTextQuestions = draftContent.questions.some(q => q.type === 'text');
  if (hasFreeTextQuestions) {
    messages.push('Contains free-text questions');
  }

  // Missing i18n keys
  const missingI18nKeys = draftHealth.i18nCoverage.missingKeys.length > 0;
  if (missingI18nKeys) {
    messages.push(`Missing ${draftHealth.i18nCoverage.missingKeys.length} i18n keys`);
    severity = 'high';
  }

  // Visibility rules changed
  const visibilityRulesChanged = contentDiff?.changedQuestions.some(key => {
    const diff = contentDiff.questions.find(q => q.key === key);
    return diff?.changes?.visibility;
  }) || false;
  
  if (visibilityRulesChanged) {
    messages.push('Visibility rules have changed - review carefully');
    severity = severity === 'low' ? 'medium' : severity;
  }

  // Payload size
  const payloadSize = JSON.stringify(draftContent).length;
  const largePayloadSize = payloadSize > 50000; // 50kb
  if (largePayloadSize) {
    messages.push(`Large payload: ${(payloadSize / 1024).toFixed(1)}kb`);
  }

  // Schema errors
  if (!draftHealth.schemaValid) {
    messages.push('Schema validation failed');
    severity = 'high';
  }

  // Forbidden topics
  if (draftHealth.forbiddenTopics.violations.length > 0) {
    messages.push(...draftHealth.forbiddenTopics.violations);
    severity = 'high';
  }

  return {
    questionCountInvalid,
    hasFreeTextQuestions,
    missingI18nKeys,
    visibilityRulesChanged,
    largePayloadSize,
    severity,
    messages,
  };
}
