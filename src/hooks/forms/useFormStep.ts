/**
 * Form Step Hook
 * Phase 19: Form Builder & Validation System
 * 
 * React hook for multi-step form navigation
 */

import { useState, useCallback, useMemo } from 'react';
import { FormSchema } from '@/lib/forms/types';

export function useFormStep(schema: FormSchema) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = schema.steps || [];
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const currentStepData = useMemo(() => {
    return steps[currentStep];
  }, [steps, currentStep]);

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  }, [isLastStep]);

  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  const resetSteps = useCallback(() => {
    setCurrentStep(0);
  }, []);

  return {
    currentStep,
    currentStepData,
    totalSteps,
    isFirstStep,
    isLastStep,
    progress,
    nextStep,
    previousStep,
    goToStep,
    resetSteps,
  };
}
