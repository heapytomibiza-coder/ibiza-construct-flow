/**
 * Step 2: AI Questions
 * Auto-generate job title + AI asks 5-7 targeted questions
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useServicesRegistry } from '@/contexts/ServicesRegistry';
import { cn } from '@/lib/utils';

interface AIQuestionsStepProps {
  microId: string;
  microName: string;
  jobTitle: string;
  answers: Record<string, any>;
  onTitleChange: (title: string) => void;
  onAnswersChange: (answers: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
}

const AIQuestionsStep: React.FC<AIQuestionsStepProps> = ({
  microId,
  microName,
  jobTitle,
  answers,
  onTitleChange,
  onAnswersChange,
  onNext,
  onBack
}) => {
  const { t } = useTranslation();
  const { getQuestions } = useServicesRegistry();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    loadQuestions();
  }, [microId]);

  useEffect(() => {
    // Count answered required questions
    const requiredQuestions = questions.filter(q => q.required);
    const answered = requiredQuestions.filter(q => {
      const answer = answers[q.id];
      return answer !== undefined && answer !== '' && answer !== null;
    });
    setAnsweredCount(answered.length);
  }, [answers, questions]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const questionSet = await getQuestions(microId);
      setQuestions(questionSet.questions || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    onAnswersChange({ ...answers, [questionId]: value });
  };

  const renderQuestion = (question: any) => {
    const value = answers[question.id];

    switch (question.type) {
      case 'text':
      case 'string':
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer..."
            className="text-base"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Provide details..."
            className="min-h-[100px] text-base"
          />
        );

      case 'select':
      case 'radio':
        return (
          <RadioGroup value={value || ''} onValueChange={(val) => handleAnswerChange(question.id, val)}>
            <div className="space-y-3">
              {question.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-3">
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                  <Label 
                    htmlFor={`${question.id}-${option}`} 
                    className="text-base font-normal cursor-pointer flex-1 py-2"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'multi':
      case 'checkbox':
        const checkboxValue = value || [];
        return (
          <div className="space-y-3">
            {question.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-3">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={checkboxValue.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswerChange(question.id, [...checkboxValue, option]);
                    } else {
                      handleAnswerChange(question.id, checkboxValue.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label 
                  htmlFor={`${question.id}-${option}`} 
                  className="text-base font-normal cursor-pointer flex-1 py-2"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, parseFloat(e.target.value))}
            placeholder="Enter a number..."
            className="text-base"
          />
        );

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer..."
            className="text-base"
          />
        );
    }
  };

  const requiredQuestions = questions.filter(q => q.required);
  const isComplete = answeredCount === requiredQuestions.length && jobTitle.trim() !== '';
  const progress = requiredQuestions.length > 0 
    ? Math.round((answeredCount / requiredQuestions.length) * 100) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI-Powered Questions</span>
        </div>
        <h1 className="text-4xl font-bold">{microName}</h1>
        <p className="text-muted-foreground text-lg">
          Answer a few questions to help professionals understand your needs
        </p>
        
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="text-sm font-medium">
            {answeredCount} / {requiredQuestions.length} answered
          </div>
          <Badge variant={isComplete ? "default" : "secondary"}>
            {progress}% complete
          </Badge>
        </div>
      </div>

      {loading ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading AI questions...</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Job Title */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="space-y-3">
              <Label htmlFor="job-title" className="text-lg font-semibold flex items-center gap-2">
                Job Title
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="job-title"
                value={jobTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder={`e.g., "${microName} needed for..."`}
                className="text-lg h-12"
              />
              <p className="text-sm text-muted-foreground">
                Give your job a clear, descriptive title
              </p>
            </div>
          </Card>

          {/* Questions */}
          {questions.map((question, index) => (
            <Card 
              key={question.id} 
              className={cn(
                "p-6 transition-all duration-200",
                answers[question.id] && "border-primary/50 bg-primary/5"
              )}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {index + 1}
                    </span>
                    {question.label}
                    {question.required && <span className="text-destructive">*</span>}
                  </Label>
                  {answers[question.id] && (
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                  )}
                </div>
                {renderQuestion(question)}
              </div>
            </Card>
          ))}

          {questions.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No specific questions for this service. Continue to the next step!
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          ← Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isComplete}
          size="lg"
          className="min-w-[200px]"
        >
          {isComplete ? (
            <>Continue to Location </>
          ) : (
            <>Complete {requiredQuestions.length - answeredCount} more fields</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AIQuestionsStep;
