/**
 * Enhanced Question Card Component
 * MVP Feature: No-typing Q&A with visual card selections
 * Supports: Radio, Checkbox, Card-grid selections, "Not sure" option
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface QuestionCardProps {
  questionId: string;
  question: string;
  type: 'single' | 'multiple' | 'text' | 'number';
  options?: QuestionOption[];
  value: any;
  required?: boolean;
  helpText?: string;
  onChange: (value: any) => void;
  onNotSure: () => void;
  questionNumber: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionId,
  question,
  type,
  options = [],
  value,
  required = false,
  helpText,
  onChange,
  onNotSure,
  questionNumber
}) => {
  const isAnswered = value !== undefined && value !== null && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true);
  const isNotSure = value === 'not_sure';

  const handleOptionClick = (optionValue: string) => {
    if (type === 'single') {
      onChange(optionValue);
    } else if (type === 'multiple') {
      const currentArray = Array.isArray(value) ? value : [];
      if (currentArray.includes(optionValue)) {
        onChange(currentArray.filter(v => v !== optionValue));
      } else {
        onChange([...currentArray, optionValue]);
      }
    }
  };

  const renderOptions = () => {
    if (type === 'single') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((option) => {
            const isSelected = value === option.value;
            
            return (
              <Card
                key={option.value}
                className={cn(
                  "p-4 cursor-pointer transition-all border-2 hover:shadow-md",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => handleOptionClick(option.value)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                  )}>
                    {isSelected && <Circle className="w-3 h-3 fill-white text-white" />}
                  </div>
                  <div className="flex-1">
                    {option.icon && <div className="mb-2">{option.icon}</div>}
                    <h4 className="font-medium text-foreground">{option.label}</h4>
                    {option.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      );
    }

    if (type === 'multiple') {
      const selectedValues = Array.isArray(value) ? value : [];
      
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            
            return (
              <Card
                key={option.value}
                className={cn(
                  "p-4 cursor-pointer transition-all border-2 hover:shadow-md",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => handleOptionClick(option.value)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                  )}>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    {option.icon && <div className="mb-2">{option.icon}</div>}
                    <h4 className="font-medium text-foreground">{option.label}</h4>
                    {option.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className={cn(
      "p-6 border-2 transition-all duration-200",
      isAnswered && !isNotSure ? "border-primary/20 bg-primary/5" : "border-border"
    )}>
      <div className="space-y-4">
        {/* Question Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                {questionNumber}
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                {question}
              </h3>
            </div>
            {helpText && (
              <p className="text-sm text-muted-foreground ml-11">{helpText}</p>
            )}
          </div>
          
          {isAnswered && !isNotSure && (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 flex-shrink-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Answered
            </Badge>
          )}
        </div>

        {/* Options */}
        {renderOptions()}

        {/* Not Sure Button */}
        <div className="pt-4 border-t flex items-center justify-between">
          <Button
            variant={isNotSure ? "default" : "outline"}
            size="sm"
            onClick={onNotSure}
            className={cn(
              "gap-2",
              isNotSure && "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <HelpCircle className="w-4 h-4" />
            {isNotSure ? "Marked as 'Not Sure'" : "Not sure / Skip for now"}
          </Button>
          
          {isNotSure && (
            <p className="text-xs text-muted-foreground">
              Professionals will follow up on this detail
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
