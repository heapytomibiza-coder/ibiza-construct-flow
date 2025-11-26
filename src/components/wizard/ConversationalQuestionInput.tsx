import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { cn } from '@/lib/utils';

interface OptionLike {
  label?: string;
  value?: string;
  description?: string; // Add support for option descriptions
}

interface QuestionMeta {
  accept?: string[];
  max_files?: number;
  authoring_type?: string;
}

interface ConversationalQuestionInputProps {
  question: {
    id: string;
    type: string;
    label?: string;
    required?: boolean;
    options?: Array<string | OptionLike>;
    meta?: QuestionMeta;
    min?: number;
    max?: number;
    step?: number;
    maxSelections?: number;
  };
  value: any;
  onChange: (value: any) => void;
}

/** Normalize an option to { label, value, description } */
function normOpt(opt: string | OptionLike): { label: string; value: string; description?: string } {
  if (typeof opt === 'string') return { label: opt, value: opt };
  return { 
    label: opt.label ?? String(opt.value ?? ''), 
    value: String(opt.value ?? opt.label ?? ''),
    description: opt.description
  };
}

export const ConversationalQuestionInput: React.FC<ConversationalQuestionInputProps> = ({
  question,
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  const qid = question.id;

  // FILE / ASSET
  if (question.type === 'file' || question.meta?.authoring_type === 'asset_upload') {
    const accept = (question.meta?.accept ?? ['image/*']).join(',');
    const maxFiles = question.meta?.max_files ?? 3;
    const files = Array.isArray(value) ? (value as File[]) : [];

    return (
      <div className="space-y-2">
        <Input
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => {
            const fs = Array.from(e.target.files || []).slice(0, maxFiles);
            onChange(fs);
          }}
          aria-describedby={`${qid}-desc`}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
        <p id={`${qid}-desc`} className="text-xs text-muted-foreground">
          Up to {maxFiles} file{maxFiles > 1 ? 's' : ''} • {accept || 'any'}
        </p>
        {files?.length > 0 && (
          <ul className="text-xs text-muted-foreground list-disc ml-5">
            {files.map((f, i) => <li key={i}>{f.name}</li>)}
          </ul>
        )}
      </div>
    );
  }

  // GUARD options - normalize them
  const normOptions = question.options ? question.options.map(normOpt) : [];

  switch (question.type) {
    case 'radio': {
      const radioVal = value == null ? '' : String(value);
      return (
        <RadioGroup
          value={radioVal}
          onValueChange={(newValue) => onChange(newValue)}
          className={cn(
            "grid gap-1.5",
            normOptions.length <= 3 ? "grid-cols-2 sm:grid-cols-3" :
            normOptions.length <= 6 ? "grid-cols-2 sm:grid-cols-3" :
            "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
          )}
        >
          {normOptions.map((opt, index) => {
            const oid = `${qid}-${index}`;
            const optLabel = opt.label.startsWith('microservices.') || opt.label.startsWith('questions.')
              ? t(opt.label)
              : opt.label;
            const optDescription = opt.description?.startsWith('microservices.') || opt.description?.startsWith('questions.')
              ? t(opt.description)
              : opt.description;
            const isSelected = radioVal === opt.value;
            return (
              <div 
                key={oid} 
                className={`relative p-2 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-card hover:border-primary/30'
                }`}
                onClick={() => onChange(opt.value)}
              >
                <RadioGroupItem value={opt.value} id={oid} className="sr-only" />
                <Label htmlFor={oid} className="cursor-pointer space-y-0.5 block">
                  <div className="text-sm font-semibold leading-tight">
                    {optLabel}
                  </div>
                  {optDescription && (
                    <div className="text-xs text-muted-foreground leading-snug">
                      {optDescription}
                    </div>
                  )}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      );
    }

    case 'select': {
      const selVal = value == null ? '' : String(value);
      // Use tile-based selection instead of dropdown
      return (
        <div className={cn(
          "grid gap-1.5",
          normOptions.length <= 3 ? "grid-cols-2 sm:grid-cols-3" :
          normOptions.length <= 6 ? "grid-cols-2 sm:grid-cols-3" :
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
        )}>
          {normOptions.map((opt, index) => {
            const oid = `${qid}-${index}`;
            const optLabel = opt.label.startsWith('microservices.') || opt.label.startsWith('questions.')
              ? t(opt.label)
              : opt.label;
            const optDescription = opt.description?.startsWith('microservices.') || opt.description?.startsWith('questions.')
              ? t(opt.description)
              : opt.description;
            const isSelected = selVal === opt.value;
            return (
              <button
                key={oid}
                type="button"
                onClick={() => onChange(opt.value)}
                className={`text-left p-2 rounded-lg border-2 transition-all hover:shadow-md ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold leading-tight">
                    {optLabel}
                  </div>
                  {optDescription && (
                    <div className="text-xs text-muted-foreground leading-snug">
                      {optDescription}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    case 'checkbox': {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className={cn(
          "grid gap-1.5",
          normOptions.length <= 3 ? "grid-cols-2 sm:grid-cols-3" :
          normOptions.length <= 6 ? "grid-cols-2 sm:grid-cols-3" :
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
        )}>
          {normOptions.map((opt, index) => {
            const oid = `${qid}-${index}`;
            const checked = selected.includes(opt.value);
            const optLabel = opt.label.startsWith('microservices.') || opt.label.startsWith('questions.')
              ? t(opt.label)
              : opt.label;
            const optDescription = opt.description?.startsWith('microservices.') || opt.description?.startsWith('questions.')
              ? t(opt.description)
              : opt.description;
            return (
              <div 
                key={oid} 
                className={`relative p-2 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                  checked 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-card hover:border-primary/30'
                }`}
                onClick={() => {
                  const next = checked ? selected.filter(v => v !== opt.value) : [...selected, opt.value];
                  onChange(next);
                }}
              >
                <Checkbox
                  id={oid}
                  checked={checked}
                  onCheckedChange={(c) => {
                    const next = c ? [...selected, opt.value] : selected.filter(v => v !== opt.value);
                    onChange(next);
                  }}
                  className="absolute top-2 right-2"
                />
                <Label htmlFor={oid} className="cursor-pointer space-y-0.5 block pr-7">
                  <div className="text-sm font-semibold leading-tight">
                    {optLabel}
                  </div>
                  {optDescription && (
                    <div className="text-xs text-muted-foreground leading-snug">
                      {optDescription}
                    </div>
                  )}
                </Label>
              </div>
            );
          })}
        </div>
      );
    }

    case 'multiple-choice': {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      const maxSelections = question.maxSelections ?? 2;
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-3">
            Select up to {maxSelections} option{maxSelections > 1 ? 's' : ''}
          </p>
          {normOptions.map((opt, index) => {
            const oid = `${qid}-${index}`;
            const isChecked = selected.includes(opt.value);
            const disabled = !isChecked && selected.length >= maxSelections;
            const optLabel = opt.label.startsWith('microservices.') || opt.label.startsWith('questions.')
              ? t(opt.label)
              : opt.label;
            return (
              <div key={oid} className="flex items-center space-x-3">
                <Checkbox
                  id={oid}
                  checked={isChecked}
                  disabled={disabled}
                  onCheckedChange={(c) => {
                    const next = c ? [...selected, opt.value] : selected.filter(v => v !== opt.value);
                    onChange(next);
                  }}
                />
                <Label
                  htmlFor={oid}
                  className={`text-base font-normal cursor-pointer ${disabled ? 'text-muted-foreground' : ''}`}
                >
                  {optLabel}
                </Label>
              </div>
            );
          })}
          {selected.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selected.length}/{maxSelections} selected
            </p>
          )}
        </div>
      );
    }

    case 'text': {
      return (
        <Input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="text-base"
        />
      );
    }

    case 'textarea': {
      return (
        <Textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="resize-y text-base"
        />
      );
    }

    case 'number': {
      const numVal = typeof value === 'number' ? value : value === '' ? '' : Number(value ?? '');
      return (
        <Input
          type="number"
          value={Number.isNaN(numVal) ? '' : numVal}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? '' : Number(v));
          }}
          className="text-base"
        />
      );
    }

    case 'yesno': {
      const boolVal = typeof value === 'boolean' ? value : null;
      const current = boolVal === null ? '' : String(boolVal);
      return (
        <RadioGroup
          value={current}
          onValueChange={(v) => onChange(v === 'true')}
          className="grid grid-cols-2 gap-3 max-w-md mx-auto"
        >
          {[
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ].map((opt, i) => {
            const oid = `${qid}-yn-${i}`;
            const isSelected = current === opt.value;
            return (
              <div 
                key={oid} 
                className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-card hover:border-primary/30'
                }`}
                onClick={() => onChange(opt.value === 'true')}
              >
                <RadioGroupItem value={opt.value} id={oid} className="sr-only" />
                <Label htmlFor={oid} className="text-base font-semibold cursor-pointer text-center block">
                  {opt.label}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      );
    }

    case 'scale': {
      const min = question.min ?? 1;
      const max = question.max ?? 10;
      const step = question.step ?? 1;
      const numVal = typeof value === 'number' ? value : min;
      return (
        <div className="space-y-3">
          <Slider
            value={[numVal]}
            min={min}
            max={max}
            step={step}
            onValueChange={(vals) => onChange(vals[0])}
          />
          <p className="text-sm text-muted-foreground text-center font-medium">{numVal}</p>
        </div>
      );
    }

    default:
      return null;
  }
};
