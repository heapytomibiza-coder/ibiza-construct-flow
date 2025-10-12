/**
 * Field Renderer Component
 * Phase 19: Form Builder & Validation System
 * 
 * Renders form fields based on type
 */

import { FormField } from '@/lib/forms/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface FieldRendererProps {
  field: FormField;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onBlur: () => void;
  disabled?: boolean;
}

export function FieldRenderer({
  field,
  value,
  error,
  onChange,
  onBlur,
  disabled,
}: FieldRendererProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'tel':
      case 'url':
      case 'number':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled || field.disabled}
            className={cn(error && 'border-destructive')}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled || field.disabled}
            className={cn(error && 'border-destructive')}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={onChange}
            disabled={disabled || field.disabled}
          >
            <SelectTrigger className={cn(error && 'border-destructive')}>
              <SelectValue placeholder={field.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={String(option.value)}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={onChange}
            disabled={disabled || field.disabled}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={String(option.value)}
                  id={`${field.name}-${option.value}`}
                  disabled={option.disabled}
                />
                <Label htmlFor={`${field.name}-${option.value}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value || false}
              onCheckedChange={onChange}
              disabled={disabled || field.disabled}
            />
            <Label
              htmlFor={field.name}
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </Label>
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.name}
              checked={value || false}
              onCheckedChange={onChange}
              disabled={disabled || field.disabled}
            />
            <Label htmlFor={field.name}>{field.label}</Label>
          </div>
        );

      case 'date':
      case 'time':
      case 'datetime':
        return (
          <Input
            type={field.type === 'datetime' ? 'datetime-local' : field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled || field.disabled}
            className={cn(error && 'border-destructive')}
          />
        );

      case 'slider':
        return (
          <Slider
            value={[value || 0]}
            onValueChange={(vals) => onChange(vals[0])}
            disabled={disabled || field.disabled}
            max={100}
            step={1}
          />
        );

      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };

  const showLabel = field.type !== 'checkbox' && field.type !== 'switch';

  return (
    <div className="space-y-2">
      {showLabel && (
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {renderField()}
      {field.helperText && !error && (
        <p className="text-sm text-muted-foreground">{field.helperText}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
