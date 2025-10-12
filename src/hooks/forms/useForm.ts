/**
 * Form Hook
 * Phase 19: Form Builder & Validation System
 * 
 * React hook for form state management
 */

import { useState, useCallback, useMemo } from 'react';
import {
  FormSchema,
  FormValues,
  ValidationErrors,
  FormState,
  ValidationRule,
} from '@/lib/forms/types';
import { formValidator } from '@/lib/forms/validator';
import { conditionalLogic } from '@/lib/forms/conditionalLogic';

interface UseFormOptions {
  schema: FormSchema;
  initialValues?: FormValues;
  onSubmit: (values: FormValues) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useForm({
  schema,
  initialValues = {},
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions) {
  // Get all fields from schema
  const allFields = useMemo(() => {
    if (schema.fields) return schema.fields;
    if (schema.steps) {
      return schema.steps.flatMap(step => step.fields);
    }
    return [];
  }, [schema]);

  // Initialize form state
  const [state, setState] = useState<FormState>(() => {
    const values: FormValues = {};
    allFields.forEach(field => {
      values[field.name] = initialValues[field.name] ?? field.defaultValue ?? '';
    });

    return {
      values,
      errors: {},
      touched: new Set(),
      isSubmitting: false,
      isValid: true,
      currentStep: schema.multiStep ? 0 : undefined,
    };
  });

  // Build validation rules map
  const validationRules = useMemo(() => {
    const rules = new Map<string, ValidationRule[]>();
    allFields.forEach(field => {
      if (field.validation) {
        rules.set(field.name, field.validation);
      }
      if (field.required) {
        const existing = rules.get(field.name) || [];
        rules.set(field.name, [{ type: 'required' }, ...existing]);
      }
    });
    return rules;
  }, [allFields]);

  const validateForm = useCallback(() => {
    const errors = formValidator.validateForm(state.values, validationRules);
    const isValid = Object.keys(errors).length === 0;

    setState(prev => ({ ...prev, errors, isValid }));
    return isValid;
  }, [state.values, validationRules]);

  const validateField = useCallback(
    (name: string) => {
      const rules = validationRules.get(name);
      if (!rules) return null;

      const error = formValidator.validateField(state.values[name], rules, name);
      
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [name]: error || '',
        },
      }));

      return error;
    },
    [state.values, validationRules]
  );

  const setFieldValue = useCallback(
    (name: string, value: any) => {
      setState(prev => ({
        ...prev,
        values: {
          ...prev.values,
          [name]: value,
        },
      }));

      if (validateOnChange) {
        setTimeout(() => validateField(name), 0);
      }
    },
    [validateOnChange, validateField]
  );

  const setFieldTouched = useCallback((name: string, touched = true) => {
    setState(prev => {
      const newTouched = new Set(prev.touched);
      if (touched) {
        newTouched.add(name);
      } else {
        newTouched.delete(name);
      }
      return { ...prev, touched: newTouched };
    });

    if (validateOnBlur && touched) {
      validateField(name);
    }
  }, [validateOnBlur, validateField]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      setState(prev => ({ ...prev, isSubmitting: true }));

      const isValid = validateForm();

      if (isValid) {
        try {
          await onSubmit(state.values);
          
          if (schema.settings?.resetOnSubmit) {
            const values: FormValues = {};
            allFields.forEach(field => {
              values[field.name] = field.defaultValue ?? '';
            });
            setState(prev => ({
              ...prev,
              values,
              errors: {},
              touched: new Set(),
              isSubmitting: false,
            }));
          } else {
            setState(prev => ({ ...prev, isSubmitting: false }));
          }
        } catch (error) {
          setState(prev => ({ ...prev, isSubmitting: false }));
          throw error;
        }
      } else {
        setState(prev => ({ ...prev, isSubmitting: false }));
      }
    },
    [validateForm, onSubmit, state.values, schema.settings, allFields]
  );

  const resetForm = useCallback(() => {
    const values: FormValues = {};
    allFields.forEach(field => {
      values[field.name] = initialValues[field.name] ?? field.defaultValue ?? '';
    });

    setState({
      values,
      errors: {},
      touched: new Set(),
      isSubmitting: false,
      isValid: true,
      currentStep: schema.multiStep ? 0 : undefined,
    });
  }, [allFields, initialValues, schema.multiStep]);

  const getFieldProps = useCallback(
    (name: string) => ({
      name,
      value: state.values[name] ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFieldValue(name, e.target.value);
      },
      onBlur: () => setFieldTouched(name, true),
      error: state.touched.has(name) ? state.errors[name] : undefined,
    }),
    [state.values, state.errors, state.touched, setFieldValue, setFieldTouched]
  );

  const isFieldVisible = useCallback(
    (fieldName: string) => {
      const field = allFields.find(f => f.name === fieldName);
      if (!field?.conditionalLogic) return true;
      return conditionalLogic.shouldShow(field.conditionalLogic, state.values);
    },
    [allFields, state.values]
  );

  const isFieldDisabled = useCallback(
    (fieldName: string) => {
      const field = allFields.find(f => f.name === fieldName);
      if (field?.disabled) return true;
      if (!field?.conditionalLogic) return false;
      return !conditionalLogic.shouldEnable(field.conditionalLogic, state.values);
    },
    [allFields, state.values]
  );

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    resetForm,
    validateForm,
    validateField,
    getFieldProps,
    isFieldVisible,
    isFieldDisabled,
  };
}
