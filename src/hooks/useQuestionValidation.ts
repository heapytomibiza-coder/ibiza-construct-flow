/**
 * Hook for managing question validation with touched state
 */

import { useState, useCallback } from 'react';
import { AIQuestion } from '@/hooks/useAIQuestions';

export interface ValidationState {
  touched: Set<string>;
  errors: Map<string, string>;
}

export function useQuestionValidation() {
  const [validationState, setValidationState] = useState<ValidationState>({
    touched: new Set(),
    errors: new Map()
  });

  const markAsTouched = useCallback((questionId: string) => {
    setValidationState(prev => ({
      ...prev,
      touched: new Set(prev.touched).add(questionId)
    }));
  }, []);

  const validateQuestion = useCallback((
    question: AIQuestion,
    value: any
  ): string | null => {
    if (!question.required) return null;

    // Check if value is empty
    if (value === undefined || value === null || value === '') {
      return 'This field is required';
    }

    // For arrays (checkboxes), check if at least one is selected
    if (Array.isArray(value) && value.length === 0) {
      return 'Please select at least one option';
    }

    return null;
  }, []);

  const shouldShowError = useCallback((questionId: string): boolean => {
    return validationState.touched.has(questionId);
  }, [validationState.touched]);

  const getValidationMessage = useCallback((
    question: AIQuestion,
    value: any
  ): { type: 'error' | 'success' | null; message: string | null } => {
    const error = validateQuestion(question, value);
    const isTouched = validationState.touched.has(question.id);

    if (!isTouched) {
      return { type: null, message: null };
    }

    if (error) {
      return { type: 'error', message: error };
    }

    if (question.required) {
      return { type: 'success', message: 'Complete' };
    }

    return { type: null, message: null };
  }, [validationState.touched, validateQuestion]);

  const isQuestionComplete = useCallback((
    question: AIQuestion,
    value: any
  ): boolean => {
    if (!question.required) return true;
    return validateQuestion(question, value) === null;
  }, [validateQuestion]);

  return {
    markAsTouched,
    shouldShowError,
    getValidationMessage,
    isQuestionComplete,
    validationState
  };
}
