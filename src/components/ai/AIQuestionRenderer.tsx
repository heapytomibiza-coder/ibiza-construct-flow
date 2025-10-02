import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { AIQuestion } from '@/hooks/useAIQuestions';

type AnswerMap = Record<string, string | string[] | number | boolean>;

interface QuestionMeta {
  priority?: 'core' | 'supporting';
  show_if?: Array<{ question: string; equals_any: string[] }>;
  accept?: string[];
  max_files?: number;
  authoring_type?: string;
  label?: string;
}

interface AIQuestionRendererProps {
  questions: (AIQuestion & { meta?: QuestionMeta })[];
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, answer: any) => void;
}

// Check if question should be visible based on show_if conditions
function shouldShowQuestion(q: AIQuestion & { meta?: QuestionMeta }, answers: AnswerMap): boolean {
  const showIf = q.meta?.show_if;
  if (!showIf || showIf.length === 0) return true;
  
  return showIf.every(condition => {
    const ans = answers[condition.question];
    if (Array.isArray(ans)) {
      return ans.some(v => condition.equals_any.includes(String(v)));
    }
    return ans != null && condition.equals_any.includes(String(ans));
  });
}

// Get visible questions with progressive disclosure
function getVisibleQuestions(
  questions: (AIQuestion & { meta?: QuestionMeta })[],
  answers: AnswerMap
): (AIQuestion & { meta?: QuestionMeta })[] {
  // Always show core questions first
  const core = questions.filter(q => q.meta?.priority === 'core');
  
  // Show supporting questions only if their conditions are met
  const supporting = questions.filter(
    q => q.meta?.priority !== 'core' && shouldShowQuestion(q, answers)
  );
  
  return [...core, ...supporting];
}

export const AIQuestionRenderer: React.FC<AIQuestionRendererProps> = ({ 
  questions, 
  answers, 
  onAnswerChange 
}) => {
  // Apply progressive disclosure
  const visibleQuestions = getVisibleQuestions(questions, answers);

  const renderQuestion = (question: AIQuestion & { meta?: QuestionMeta }) => {
    const value = answers[question.id] || '';
    const questionLabel = question.meta?.label || question.label;

    // Handle file upload (asset_upload type)
    if (question.meta?.authoring_type === 'asset_upload') {
      const accept = question.meta?.accept?.join(',') || 'image/*';
      const maxFiles = question.meta?.max_files ?? 3;
      
      return (
        <div className="space-y-2">
          <Input
            type="file"
            accept={accept}
            multiple={maxFiles > 1}
            onChange={(e) => {
              const files = Array.from(e.target.files || []).slice(0, maxFiles);
              onAnswerChange(question.id, files);
            }}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          <p className="text-xs text-muted-foreground">
            Up to {maxFiles} file(s) • {accept}
          </p>
        </div>
      );
    }

    switch (question.type) {
      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) => onAnswerChange(question.id, newValue)}
            className="space-y-2"
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(newValue) => onAnswerChange(question.id, newValue)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    onAnswerChange(question.id, newValues);
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'multiple-choice':
        const multiSelectedValues = Array.isArray(value) ? value : [];
        const maxSelections = question.maxSelections || 2;
        return (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              Select up to {maxSelections} option{maxSelections > 1 ? 's' : ''}
            </p>
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={multiSelectedValues.includes(option)}
                  disabled={!multiSelectedValues.includes(option) && multiSelectedValues.length >= maxSelections}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...multiSelectedValues, option]
                      : multiSelectedValues.filter(v => v !== option);
                    onAnswerChange(question.id, newValues);
                  }}
                />
                <Label 
                  htmlFor={`${question.id}-${index}`} 
                  className={`text-sm ${
                    !multiSelectedValues.includes(option) && multiSelectedValues.length >= maxSelections 
                      ? 'text-muted-foreground' 
                      : ''
                  }`}
                >
                  {option}
                </Label>
              </div>
            ))}
            {multiSelectedValues.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {multiSelectedValues.length}/{maxSelections} selected
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="animate-fade-in">Your specialised questions</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground animate-fade-in">
          Answer core questions first, then we'll show relevant follow-ups
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {visibleQuestions.map((question) => (
          <div key={question.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {question.meta?.label || question.label}
              {question.required && <span className="text-destructive ml-1">*</span>}
              {question.meta?.priority === 'core' && (
                <span className="ml-2 text-xs text-muted-foreground">(core)</span>
              )}
            </Label>
            {renderQuestion(question)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};