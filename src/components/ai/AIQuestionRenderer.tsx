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

  if (questions.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="animate-fade-in">Hold tight while we load your specialized questions</span>
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