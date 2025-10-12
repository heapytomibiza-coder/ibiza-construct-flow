/**
 * Multi-Step Form Component
 * Phase 19: Form Builder & Validation System
 * 
 * Renders multi-step forms with navigation
 */

import { FormSchema } from '@/lib/forms/types';
import { useForm, useFormStep } from '@/hooks/forms';
import { FieldRenderer } from './FieldRenderer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiStepFormProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  className?: string;
}

export function MultiStepForm({
  schema,
  initialValues,
  onSubmit,
  className,
}: MultiStepFormProps) {
  const {
    currentStep,
    currentStepData,
    totalSteps,
    isFirstStep,
    isLastStep,
    progress,
    nextStep,
    previousStep,
    resetSteps,
  } = useFormStep(schema);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    isFieldVisible,
    isFieldDisabled,
  } = useForm({
    schema,
    initialValues,
    onSubmit: async (vals) => {
      await onSubmit(vals);
      resetSteps();
    },
    validateOnBlur: true,
  });

  const handleNext = () => {
    // Validate current step fields
    const stepFields = currentStepData?.fields || [];
    const hasErrors = stepFields.some(field => {
      setFieldTouched(field.name);
      return errors[field.name];
    });

    if (!hasErrors) {
      nextStep();
    }
  };

  if (!currentStepData) {
    return <div>Invalid form configuration</div>;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress */}
      {schema.settings?.showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Step Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
        {currentStepData.description && (
          <p className="text-muted-foreground">{currentStepData.description}</p>
        )}
      </div>

      {/* Step Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {currentStepData.fields.map((field) => {
          if (!isFieldVisible(field.name)) return null;

          return (
            <FieldRenderer
              key={field.id}
              field={field}
              value={values[field.name]}
              error={touched.has(field.name) ? errors[field.name] : undefined}
              onChange={(value) => setFieldValue(field.name, value)}
              onBlur={() => setFieldTouched(field.name)}
              disabled={isFieldDisabled(field.name)}
            />
          );
        })}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={previousStep}
            disabled={isFirstStep || !schema.settings?.allowBack}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {schema.settings?.backButtonText || 'Back'}
          </Button>

          {!isLastStep ? (
            <Button type="button" onClick={handleNext}>
              {schema.settings?.nextButtonText || 'Next'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Submitting...'
                : schema.settings?.submitButtonText || 'Submit'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
