/**
 * Form System Types
 * Phase 19: Form Builder & Validation System
 * 
 * Type definitions for dynamic forms and validation
 */

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  validation?: ValidationRule[];
  options?: FieldOption[];
  conditionalLogic?: ConditionalLogic;
  metadata?: Record<string, any>;
  helperText?: string;
  grid?: GridConfig;
}

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'slider'
  | 'rating';

export interface FieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message?: string;
}

export type ValidationType =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'email'
  | 'url'
  | 'custom';

export interface ConditionalLogic {
  field: string;
  operator: ConditionalOperator;
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}

export type ConditionalOperator = 
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'greaterThan'
  | 'lessThan'
  | 'isEmpty'
  | 'isNotEmpty';

export interface GridConfig {
  span?: number;
  offset?: number;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  validation?: StepValidation;
}

export interface StepValidation {
  validateOnNext?: boolean;
  customValidation?: (values: FormValues) => ValidationErrors | null;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  steps?: FormStep[];
  fields?: FormField[];
  multiStep?: boolean;
  settings?: FormSettings;
}

export interface FormSettings {
  showProgress?: boolean;
  allowBack?: boolean;
  submitButtonText?: string;
  nextButtonText?: string;
  backButtonText?: string;
  resetOnSubmit?: boolean;
}

export interface FormValues {
  [key: string]: any;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormState {
  values: FormValues;
  errors: ValidationErrors;
  touched: Set<string>;
  isSubmitting: boolean;
  isValid: boolean;
  currentStep?: number;
}
