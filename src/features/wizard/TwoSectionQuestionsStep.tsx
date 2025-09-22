import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { generalQuestions, Question } from './generalQuestions';

interface TwoSectionQuestionsStepProps {
  generalAnswers: Record<string, any>;
  microAnswers: Record<string, any>;
  microQuestions: Question[];
  onGeneralChange: (questionId: string, value: any) => void;
  onMicroChange: (questionId: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const TwoSectionQuestionsStep: React.FC<TwoSectionQuestionsStepProps> = ({
  generalAnswers,
  microAnswers,
  microQuestions,
  onGeneralChange,
  onMicroChange,
  onNext,
  onBack,
}) => {

  const renderQuestion = (
    question: Question, 
    value: any, 
    onChange: (questionId: string, value: any) => void,
    section: 'general' | 'micro'
  ) => {
    const questionKey = `${section}-${question.id}`;
    
    switch (question.type) {
      case 'text':
        return (
          <Input
            id={questionKey}
            type="text"
            placeholder={question.placeholder}
            value={value || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={questionKey}
            placeholder={question.placeholder}
            value={value || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            className="min-h-[100px]"
          />
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={(val) => onChange(question.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        const isOtherSelected = question.allowOther && value === 'Other';
        return (
          <div className="space-y-3">
            <RadioGroup
              value={value || ''}
              onValueChange={(val) => onChange(question.id, val)}
              className="space-y-2"
            >
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${questionKey}-${option}`} />
                  <Label htmlFor={`${questionKey}-${option}`} className="text-sm font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {isOtherSelected && (
              <Input
                type="text"
                placeholder="Please specify"
                value={value?.includes('Other:') ? value.replace('Other:', '').trim() : ''}
                onChange={(e) => onChange(question.id, `Other: ${e.target.value}`)}
                className="ml-6 mt-2"
              />
            )}
          </div>
        );

      case 'checkbox':
        const checkboxValue = value || [];
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${questionKey}-${option}`}
                  checked={checkboxValue.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange(question.id, [...checkboxValue, option]);
                    } else {
                      onChange(question.id, checkboxValue.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`${questionKey}-${option}`} className="text-sm font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'slider':
        const sliderValue = value || question.min || 0;
        return (
          <div className="space-y-4">
            <Slider
              value={[sliderValue]}
              onValueChange={(vals) => onChange(question.id, vals[0])}
              max={question.max || 100}
              min={question.min || 0}
              step={question.step || 1}
              className="w-full"
            />
            <div className="text-center text-sm text-muted-foreground">
              Value: {sliderValue}
            </div>
          </div>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(question.id, date?.toISOString())}
                disabled={(date) => date < new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        );

      case 'file':
        return (
          <Input
            id={questionKey}
            type="file"
            accept={question.accept}
            onChange={(e) => {
              const files = e.target.files;
              onChange(question.id, files ? Array.from(files) : []);
            }}
            multiple
          />
        );

      default:
        return null;
    }
  };

  const isFormValid = () => {
    // Check required general questions
    const requiredGeneral = generalQuestions.filter(q => q.required);
    for (const question of requiredGeneral) {
      if (!generalAnswers[question.id]) return false;
    }

    // Check required micro questions
    const requiredMicro = microQuestions.filter(q => q.required);
    for (const question of requiredMicro) {
      if (!microAnswers[question.id]) return false;
    }

    return true;
  };

  return (
    <div className="space-y-8">
      {/* General Questions */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">General Information</h2>
          <p className="text-muted-foreground">
            Tell us about your project requirements
          </p>
        </div>
        
        <div className="space-y-6">
          {generalQuestions
            .filter(question => !question.showIf || question.showIf(generalAnswers))
            .map((question) => (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={`general-${question.id}`} className="text-sm font-medium">
                {question.label}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderQuestion(question, generalAnswers[question.id], onGeneralChange, 'general')}
            </div>
          ))}
        </div>
      </Card>

      {/* Micro Questions */}
      {microQuestions.length > 0 && (
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Service-Specific Details</h2>
            <p className="text-muted-foreground">
              Additional information for this specific service
            </p>
          </div>
          
          <div className="space-y-6">
            {microQuestions
              .filter(question => !question.showIf || question.showIf(microAnswers))
              .map((question) => (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={`micro-${question.id}`} className="text-sm font-medium">
                  {question.label}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderQuestion(question, microAnswers[question.id], onMicroChange, 'micro')}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!isFormValid()}
          className="min-w-[120px]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default TwoSectionQuestionsStep;