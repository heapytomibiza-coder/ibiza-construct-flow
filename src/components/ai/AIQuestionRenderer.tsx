import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { AIQuestion } from '@/hooks/useAIQuestions';

type Primitive = string | number | boolean;
type AnswerMap = Record<string, Primitive | Primitive[] | File[] | null | undefined>;

interface QuestionMeta {
  priority?: 'core' | 'supporting';
  show_if?: Array<{ question: string; equals_any: string[] }>;
  accept?: string[];
  max_files?: number;
  authoring_type?: string;
  label?: string;
  hint?: string;
  always_show_core?: boolean;
  order?: number;
}

interface OptionLike {
  label?: string;
  value?: string;
}

interface AIQuestionRendererProps {
  questions: (AIQuestion & { meta?: QuestionMeta; options?: Array<string | OptionLike> })[];
  answers: AnswerMap;
  onAnswerChange: (questionId: string, answer: any) => void;
  onValidationChange?: (invalidRequired: string[]) => void;
  onAutoAdvance?: () => void;
}

/** Normalize an option to { label, value } */
function normOpt(opt: string | OptionLike): { label: string; value: string } {
  if (typeof opt === 'string') return { label: opt, value: opt };
  return { label: opt.label ?? String(opt.value ?? ''), value: String(opt.value ?? opt.label ?? '') };
}

/** Visibility check using equals_any (string compare) */
function matchesCondition(ans: any, equals_any: string[]): boolean {
  if (Array.isArray(ans)) return ans.some(v => equals_any.includes(String(v)));
  return ans != null && equals_any.includes(String(ans));
}

function shouldShowQuestion(
  q: AIQuestion & { meta?: QuestionMeta },
  answers: AnswerMap
): boolean {
  const showIf = q.meta?.show_if;
  if (!showIf || showIf.length === 0) return true;
  return showIf.every(cond => matchesCondition(answers[cond.question], cond.equals_any));
}

/** Sort: core first, then by meta.order if provided, else stable */
function sortQuestions(a: AIQuestion & { meta?: QuestionMeta }, b: AIQuestion & { meta?: QuestionMeta }) {
  const apri = a.meta?.priority === 'core' ? 0 : 1;
  const bpri = b.meta?.priority === 'core' ? 0 : 1;
  if (apri !== bpri) return apri - bpri;
  const ao = a.meta?.order ?? 1e9;
  const bo = b.meta?.order ?? 1e9;
  if (ao !== bo) return ao - bo;
  return 0;
}

export const AIQuestionRenderer: React.FC<AIQuestionRendererProps> = ({
  questions,
  answers,
  onAnswerChange,
  onValidationChange,
  onAutoAdvance,
}) => {
  /** Compute visible questions with progressive disclosure */
  const visibleQuestions = useMemo(() => {
    if (!Array.isArray(questions)) return [];
    const filtered = questions.filter(q => {
      const isCore = q.meta?.priority === 'core';
      const forceShow = isCore && q.meta?.always_show_core === true;
      return forceShow ? true : shouldShowQuestion(q, answers);
    });
    return [...filtered].sort(sortQuestions);
  }, [questions, answers]);

  /** Required validation for visible questions */
  const invalidRequired = useMemo(() => {
    const missing: string[] = [];
    for (const q of visibleQuestions) {
      if (!q.required) continue;
      const val = answers[q.id];
      const hasValue =
        val instanceof FileList
          ? val.length > 0
          : Array.isArray(val)
            ? val.length > 0
            : val === 0 || val === false
              ? true
              : !!val;
      if (!hasValue) missing.push(q.id);
    }
    return missing;
  }, [visibleQuestions, answers]);

  React.useEffect(() => {
    onValidationChange?.(invalidRequired);
    
    // Auto-advance when all required questions are answered
    if (invalidRequired.length === 0 && onAutoAdvance && visibleQuestions.length > 0) {
      const timer = setTimeout(() => {
        onAutoAdvance();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [invalidRequired, onValidationChange, onAutoAdvance, visibleQuestions.length]);

  if (!questions || questions.length === 0) return null;

  const renderQuestion = (question: AIQuestion & { meta?: QuestionMeta; options?: Array<string | OptionLike> }) => {
    const qid = question.id;
    const value = answers[qid];
    const label = question.meta?.label || question.label || qid;
    const hint = question.meta?.hint;

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
              onAnswerChange(qid, fs);
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
            onValueChange={(newValue) => onAnswerChange(qid, newValue)}
            className="space-y-2"
          >
            {normOptions.map((opt, index) => {
              const oid = `${qid}-${index}`;
              return (
                <div key={oid} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={oid} />
                  <Label htmlFor={oid} className="text-sm">{opt.label}</Label>
                </div>
              );
            })}
          </RadioGroup>
        );
      }

      case 'select': {
        const selVal = value == null ? '' : String(value);
        return (
          <Select value={selVal} onValueChange={(v) => onAnswerChange(qid, v)}>
            <SelectTrigger aria-label={label}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {normOptions.map((opt, index) => (
                <SelectItem key={`${qid}-${index}`} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case 'checkbox': {
        const selected = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div className="space-y-2">
            {normOptions.map((opt, index) => {
              const oid = `${qid}-${index}`;
              const checked = selected.includes(opt.value);
              return (
                <div key={oid} className="flex items-center space-x-2">
                  <Checkbox
                    id={oid}
                    checked={checked}
                    onCheckedChange={(c) => {
                      const next = c ? [...selected, opt.value] : selected.filter(v => v !== opt.value);
                      onAnswerChange(qid, next);
                    }}
                  />
                  <Label htmlFor={oid} className="text-sm">{opt.label}</Label>
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
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              Select up to {maxSelections} option{maxSelections > 1 ? 's' : ''}
            </p>
            {normOptions.map((opt, index) => {
              const oid = `${qid}-${index}`;
              const isChecked = selected.includes(opt.value);
              const disabled = !isChecked && selected.length >= maxSelections;
              return (
                <div key={oid} className="flex items-center space-x-2">
                  <Checkbox
                    id={oid}
                    checked={isChecked}
                    disabled={disabled}
                    onCheckedChange={(c) => {
                      const next = c ? [...selected, opt.value] : selected.filter(v => v !== opt.value);
                      onAnswerChange(qid, next);
                    }}
                  />
                  <Label
                    htmlFor={oid}
                    className={`text-sm ${disabled ? 'text-muted-foreground' : ''}`}
                  >
                    {opt.label}
                  </Label>
                </div>
              );
            })}
            {selected.length > 0 && (
              <p className="text-xs text-muted-foreground">
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
            onChange={(e) => onAnswerChange(qid, e.target.value)}
            aria-label={label}
          />
        );
      }

      case 'textarea': {
        return (
          <Textarea
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onAnswerChange(qid, e.target.value)}
            aria-label={label}
            rows={4}
            className="resize-y"
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
              onAnswerChange(qid, v === '' ? '' : Number(v));
            }}
            aria-label={label}
          />
        );
      }

      case 'yesno': {
        const boolVal = typeof value === 'boolean' ? value : null;
        const current = boolVal === null ? '' : String(boolVal);
        return (
          <RadioGroup
            value={current}
            onValueChange={(v) => onAnswerChange(qid, v === 'true')}
            className="space-y-2"
          >
            {[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ].map((opt, i) => {
              const oid = `${qid}-yn-${i}`;
              return (
                <div key={oid} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={oid} />
                  <Label htmlFor={oid} className="text-sm">{opt.label}</Label>
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
          <div className="space-y-2">
            <Slider
              value={[numVal]}
              min={min}
              max={max}
              step={step}
              onValueChange={(vals) => onAnswerChange(qid, vals[0])}
              aria-label={label}
            />
            <p className="text-xs text-muted-foreground">{numVal}</p>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Card className="w-full animate-fade-in shadow-sm md:shadow-md">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 md:gap-3 text-base md:text-lg">
          <span>Your specialised questions</span>
        </CardTitle>
        <p className="text-xs md:text-sm text-muted-foreground">
          Answer core questions first, then we'll show relevant follow-ups
        </p>
        {invalidRequired.length > 0 && (
          <p className="text-xs text-destructive">
            {invalidRequired.length} required question{invalidRequired.length > 1 ? 's are' : ' is'} missing.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        {visibleQuestions.map((q) => {
          const isCore = q.meta?.priority === 'core';
          const isRequired = !!q.required;
          const label = q.meta?.label || q.label || q.id;
          const hint = q.meta?.hint;
          const missing = invalidRequired.includes(q.id);
          return (
            <div key={q.id} className="space-y-2 md:space-y-3">
              <Label className="text-sm md:text-base font-medium" htmlFor={`${q.id}-field`}>
                {label}
                {isRequired && <span className="text-destructive ml-1">*</span>}
                {isCore && <span className="ml-2 text-xs text-muted-foreground">(core)</span>}
              </Label>
              {hint && <p className="text-xs md:text-sm text-muted-foreground">{hint}</p>}
              <div id={`${q.id}-field`}>
                {renderQuestion(q)}
              </div>
              {missing && (
                <p className="text-xs text-destructive">This question is required.</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
