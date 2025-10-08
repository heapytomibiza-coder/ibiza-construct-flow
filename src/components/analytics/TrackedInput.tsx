import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUXMetrics } from '@/hooks/useUXMetrics';
import { InputHTMLAttributes, TextareaHTMLAttributes, useCallback } from 'react';

interface TrackedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  trackingName: string;
  fieldType?: string;
  onValidationError?: (error: string) => void;
}

interface TrackedTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  trackingName: string;
  fieldType?: string;
  onValidationError?: (error: string) => void;
}

export function TrackedInput({ 
  trackingName, 
  fieldType = 'text',
  onValidationError,
  onFocus,
  onBlur,
  ...props 
}: TrackedInputProps) {
  const { trackFormFieldFocus, trackValidationError } = useUXMetrics();

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    trackFormFieldFocus(trackingName, fieldType);
    onFocus?.(e);
  }, [trackingName, fieldType, trackFormFieldFocus, onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Check if required field is empty
    if (props.required && !e.target.value.trim()) {
      trackValidationError(trackingName, 'required_field', 'This field is required');
      onValidationError?.('This field is required');
    }
    onBlur?.(e);
  }, [trackingName, props.required, trackValidationError, onValidationError, onBlur]);

  return (
    <Input
      {...props}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}

export function TrackedTextarea({ 
  trackingName, 
  fieldType = 'textarea',
  onValidationError,
  onFocus,
  onBlur,
  ...props 
}: TrackedTextareaProps) {
  const { trackFormFieldFocus, trackValidationError } = useUXMetrics();

  const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    trackFormFieldFocus(trackingName, fieldType);
    onFocus?.(e);
  }, [trackingName, fieldType, trackFormFieldFocus, onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Check if required field is empty
    if (props.required && !e.target.value.trim()) {
      trackValidationError(trackingName, 'required_field', 'This field is required');
      onValidationError?.('This field is required');
    }
    onBlur?.(e);
  }, [trackingName, props.required, trackValidationError, onValidationError, onBlur]);

  return (
    <Textarea
      {...props}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}