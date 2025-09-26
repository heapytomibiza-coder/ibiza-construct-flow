import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AIQuestion } from '@/hooks/useAIQuestions';
import { Sparkles } from 'lucide-react';

interface AIQuestionRendererProps {
  questions: AIQuestion[];
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, answer: any) => void;
}

export const AIQuestionRenderer: React.FC<AIQuestionRendererProps> = ({ 
  questions, 
  answers, 
  onAnswerChange 
}) => {
  const renderQuestion = (question: AIQuestion) => {
    const value = answers[question.id] || '';

    switch (question.type) {
      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) => onAnswerChange(question.id, newValue)}
            className="space-y-2"
          >
            {question.options.map((option, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition-all duration-200"
                onClick={() => onAnswerChange(question.id, option)}
              >
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="text-sm font-medium cursor-pointer flex-1">
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
            {question.options.map((option, index) => {
              const isSelected = selectedValues.includes(option);
              return (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/10 hover:bg-primary/20' 
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                  onClick={() => {
                    const newValues = isSelected
                      ? selectedValues.filter(v => v !== option)
                      : [...selectedValues, option];
                    onAnswerChange(question.id, newValues);
                  }}
                >
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, option]
                        : selectedValues.filter(v => v !== option);
                      onAnswerChange(question.id, newValues);
                    }}
                  />
                  <Label htmlFor={`${question.id}-${index}`} className="text-sm font-medium cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              );
            })}
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
            {question.options.map((option, index) => {
              const isSelected = multiSelectedValues.includes(option);
              const isDisabled = !isSelected && multiSelectedValues.length >= maxSelections;
              return (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    isDisabled
                      ? 'border-border/50 bg-muted/30 cursor-not-allowed'
                      : isSelected 
                        ? 'border-primary bg-primary/10 hover:bg-primary/20' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                  onClick={() => {
                    if (isDisabled) return;
                    const newValues = isSelected
                      ? multiSelectedValues.filter(v => v !== option)
                      : [...multiSelectedValues, option];
                    onAnswerChange(question.id, newValues);
                  }}
                >
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...multiSelectedValues, option]
                        : multiSelectedValues.filter(v => v !== option);
                      onAnswerChange(question.id, newValues);
                    }}
                  />
                  <Label 
                    htmlFor={`${question.id}-${index}`} 
                    className={`text-sm font-medium cursor-pointer flex-1 ${
                      isDisabled ? 'text-muted-foreground' : ''
                    }`}
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
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

  if (questions.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="animate-fade-in">Your specialised questions</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground animate-fade-in">
          Our AI is crafting personalized questions based on your specific service requirements
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderQuestion(question)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};