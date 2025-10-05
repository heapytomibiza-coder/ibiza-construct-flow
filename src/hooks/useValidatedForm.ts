/**
 * Form validation hook
 * Integrates Zod schemas with React Hook Form
 */
import { useForm, UseFormProps, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useCallback } from 'react';

interface UseValidatedFormOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: z.ZodSchema<T>;
  onValidSubmit?: (data: T) => void | Promise<void>;
}

export const useValidatedForm = <T extends FieldValues>({
  schema,
  onValidSubmit,
  ...options
}: UseValidatedFormOptions<T>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<T>({
    ...options,
    resolver: zodResolver(schema)
  });
  
  const handleSubmit = useCallback(
    async (data: T) => {
      if (onValidSubmit) {
        setIsSubmitting(true);
        try {
          await onValidSubmit(data);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [onValidSubmit]
  );
  
  const setFieldError = useCallback(
    (field: Path<T>, message: string) => {
      form.setError(field, { type: 'manual', message });
    },
    [form]
  );
  
  const clearFieldError = useCallback(
    (field: Path<T>) => {
      form.clearErrors(field);
    },
    [form]
  );
  
  const validateField = useCallback(
    async (field: Path<T>) => {
      const isValid = await form.trigger(field);
      return isValid;
    },
    [form]
  );
  
  return {
    ...form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting,
    setFieldError,
    clearFieldError,
    validateField
  };
};

/**
 * Standalone field validation
 */
export const useFieldValidation = <T>(schema: z.ZodSchema<T>) => {
  const [error, setError] = useState<string | null>(null);
  
  const validate = useCallback(
    (value: unknown): boolean => {
      const result = schema.safeParse(value);
      
      if (result.success) {
        setError(null);
        return true;
      }
      
      setError(result.error.issues[0]?.message || 'Invalid value');
      return false;
    },
    [schema]
  );
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    error,
    validate,
    clearError,
    isValid: error === null
  };
};

/**
 * Multi-step form validation
 */
export const useMultiStepValidation = <T extends Record<string, any>>(
  schemas: Record<keyof T, z.ZodSchema>
) => {
  const [stepErrors, setStepErrors] = useState<Record<keyof T, string[]>>({} as Record<keyof T, string[]>);
  
  const validateStep = useCallback(
    (step: keyof T, data: unknown): boolean => {
      const schema = schemas[step];
      if (!schema) return true;
      
      const result = schema.safeParse(data);
      
      if (result.success) {
        setStepErrors(prev => ({ ...prev, [step]: [] }));
        return true;
      }
      
      const errors = result.error.issues.map(err => err.message);
      setStepErrors(prev => ({ ...prev, [step]: errors }));
      return false;
    },
    [schemas]
  );
  
  const validateAllSteps = useCallback(
    (data: T): boolean => {
      let isValid = true;
      const newErrors: Record<keyof T, string[]> = {} as Record<keyof T, string[]>;
      
      for (const step in schemas) {
        const schema = schemas[step];
        const stepData = data[step];
        const result = schema.safeParse(stepData);
        
        if (!result.success) {
          isValid = false;
          newErrors[step] = result.error.issues.map(err => err.message);
        } else {
          newErrors[step] = [];
        }
      }
      
      setStepErrors(newErrors);
      return isValid;
    },
    [schemas]
  );
  
  const clearStepErrors = useCallback((step: keyof T) => {
    setStepErrors(prev => ({ ...prev, [step]: [] }));
  }, []);
  
  const clearAllErrors = useCallback(() => {
    setStepErrors({} as Record<keyof T, string[]>);
  }, []);
  
  return {
    stepErrors,
    validateStep,
    validateAllSteps,
    clearStepErrors,
    clearAllErrors,
    hasErrors: Object.values(stepErrors).some(errors => errors.length > 0)
  };
};
