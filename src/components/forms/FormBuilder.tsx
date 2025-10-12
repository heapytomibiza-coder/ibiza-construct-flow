/**
 * Form Builder Component
 * Phase 19: Form Builder & Validation System
 * 
 * Renders dynamic forms from schema
 */

import { FormSchema } from '@/lib/forms/types';
import { useForm } from '@/hooks/forms';
import { FieldRenderer } from './FieldRenderer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormBuilderProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  className?: string;
}

export function FormBuilder({
  schema,
  initialValues,
  onSubmit,
  className,
}: FormBuilderProps) {
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
    onSubmit,
    validateOnBlur: true,
  });

  const fields = schema.fields || [];

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="grid grid-cols-12 gap-4">
        {fields.map((field) => {
          if (!isFieldVisible(field.name)) return null;

          const span = field.grid?.span || 12;
          const offset = field.grid?.offset || 0;

          return (
            <div
              key={field.id}
              className={cn(
                `col-span-${span}`,
                offset > 0 && `col-start-${offset + 1}`
              )}
            >
              <FieldRenderer
                field={field}
                value={values[field.name]}
                error={touched.has(field.name) ? errors[field.name] : undefined}
                onChange={(value) => setFieldValue(field.name, value)}
                onBlur={() => setFieldTouched(field.name)}
                disabled={isFieldDisabled(field.name)}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Submitting...'
            : schema.settings?.submitButtonText || 'Submit'}
        </Button>
      </div>
    </form>
  );
}
