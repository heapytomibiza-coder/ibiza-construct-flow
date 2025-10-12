/**
 * Form Components (react-hook-form wrappers)
 * Backward compatibility for existing forms
 */

import * as React from 'react';
import { UseFormReturn, FieldValues, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Form Context Provider
type FormContextValue<TFieldValues extends FieldValues = FieldValues> = UseFormReturn<TFieldValues>;

const FormContext = React.createContext<FormContextValue | null>(null);

export function Form<TFieldValues extends FieldValues = FieldValues>({
  children,
  ...props
}: React.PropsWithChildren<UseFormReturn<TFieldValues>>) {
  return (
    <FormContext.Provider value={props as FormContextValue}>
      {children}
    </FormContext.Provider>
  );
}

// Input Form Field
interface InputFormFieldProps {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function InputFormField({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  icon,
  className,
}: InputFormFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn('space-y-2', className)}>
          {label && <Label htmlFor={name}>{label}</Label>}
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {icon}
              </div>
            )}
            <Input
              {...field}
              id={name}
              type={type}
              placeholder={placeholder}
              className={cn(
                icon && 'pl-10',
                fieldState.error && 'border-destructive'
              )}
            />
          </div>
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}

// Textarea Form Field
interface TextareaFormFieldProps {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function TextareaFormField({
  control,
  name,
  label,
  placeholder,
  rows = 4,
  className,
}: TextareaFormFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn('space-y-2', className)}>
          {label && <Label htmlFor={name}>{label}</Label>}
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            rows={rows}
            className={cn(fieldState.error && 'border-destructive')}
          />
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
