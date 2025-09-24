import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MobileOptimizedInputProps {
  type: 'text' | 'email' | 'tel' | 'number' | 'time' | 'date' | 'textarea';
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  rows?: number;
  className?: string;
  error?: string;
  hint?: string;
}

export const MobileOptimizedInput = ({
  type,
  label,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  rows = 3,
  className,
  error,
  hint
}: MobileOptimizedInputProps) => {
  const getInputMode = (): "search" | "text" | "email" | "tel" | "numeric" | "url" | "none" | "decimal" | undefined => {
    switch (type) {
      case 'tel':
        return 'tel';
      case 'email':
        return 'email';
      case 'number':
        return 'numeric';
      default:
        return undefined;
    }
  };

  const getAutoComplete = () => {
    if (autoComplete) return autoComplete;
    
    switch (type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      default:
        return undefined;
    }
  };

  const baseProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      onChange(e.target.value),
    placeholder,
    required,
    autoComplete: getAutoComplete(),
    className: cn(
      "min-h-[48px] text-base", // Minimum 48px height for mobile accessibility
      error && "border-destructive focus:ring-destructive",
      className
    )
  };

  const inputProps = {
    ...baseProps,
    type: type === 'textarea' ? undefined : type,
    inputMode: getInputMode()
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <Textarea
          {...baseProps}
          rows={rows}
          className={cn(baseProps.className, "resize-none")}
        />
      ) : (
        <Input {...inputProps} />
      )}
      
      {hint && !error && (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};