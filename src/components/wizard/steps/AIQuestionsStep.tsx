/**
 * Step 2: AI Questions
 * Enhanced question interface with semantic design
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useServicesRegistry } from '@/contexts/ServicesRegistry';
import { cn } from '@/lib/utils';
import { PhotoUpload } from '../PhotoUpload';
import { PriceEstimator } from '../PriceEstimator';
import { JobTemplates } from '../JobTemplates';

interface AIQuestionsStepProps {
  microId: string;
  microName: string;
  category: string;
  subcategory: string;
  jobTitle: string;
  answers: Record<string, any>;
  photos: string[];
  location?: string;
  onTitleChange: (title: string) => void;
  onAnswersChange: (answers: Record<string, any>) => void;
  onPhotosChange: (photos: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const AIQuestionsStep: React.FC<AIQuestionsStepProps> = ({
  microId,
  microName,
  category,
  subcategory,
  jobTitle,
  answers,
  photos,
  location,
  onTitleChange,
  onAnswersChange,
  onPhotosChange,
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
      
      if (!jobTitle && microName) {
        onTitleChange(`${microName} Service Needed`);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    onAnswersChange({ ...answers, [questionId]: value });
  };

  const handleUseTemplate = (templateData: any) => {
    if (templateData.jobTitle) onTitleChange(templateData.jobTitle);
    if (templateData.answers) onAnswersChange(templateData.answers);
    if (templateData.photos) onPhotosChange(templateData.photos);
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
            className="text-base h-12 border-2 focus:border-accent transition-colors"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Provide details..."
            className="min-h-[120px] text-base border-2 focus:border-accent transition-colors"
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
                    className="text-base font-normal cursor-pointer flex-1 py-3 hover:text-foreground transition-colors"
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
                  className="text-base font-normal cursor-pointer flex-1 py-3 hover:text-foreground transition-colors"
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
            className="text-base h-12 border-2 focus:border-accent transition-colors"
          />
        );

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer..."
            className="text-base h-12 border-2 focus:border-accent transition-colors"
          />
        );
    }
  };

  const requiredQuestions = questions.filter(q => q.required);
  const isComplete = answeredCount === requiredQuestions.length && jobTitle.trim() !== '';
  const progress = requiredQuestions.length > 0 
    ? Math.round((answeredCount / requiredQuestions.length) * 100) 
    : 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Smart Questions</span>
        </div>
        <h1 className="text-4xl font-bold">{microName}</h1>
        <p className="text-muted-foreground text-lg">
          Help us understand your needs - this takes less than 2 minutes
        </p>
        
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="text-sm font-medium text-muted-foreground">
            {answeredCount} / {requiredQuestions.length} answered
          </div>
          <Badge variant={isComplete ? "default" : "secondary"} className="px-3 py-1">
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
          {/* Job Templates */}
          <JobTemplates
            category={category}
            subcategory={subcategory}
            microService={microName}
            onUseTemplate={handleUseTemplate}
          />

          {/* Job Title */}
          <Card className="p-6 border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="jobTitle" className="text-lg font-semibold">
                  Job Title <span className="text-destructive">*</span>
                </Label>
                {jobTitle && (
                  <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder={`e.g., ${microName} for my property`}
                className="text-lg h-14 border-2 focus:border-primary"
              />
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                A clear title helps professionals understand your needs instantly
              </p>
            </div>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((question, index) => {
              const isAnswered = answers[question.id] !== undefined && answers[question.id] !== '';
              
              return (
                <Card 
                  key={question.id} 
                  className={cn(
                    "p-6 border-2 transition-all duration-200",
                    isAnswered ? "border-accent/20 bg-accent/5" : "border-border"
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        {question.label}
                        {question.required && <span className="text-destructive">*</span>}
                      </Label>
                      {isAnswered && (
                        <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Answered
                        </Badge>
                      )}
                    </div>
                    {renderQuestion(question)}
                  </div>
                </Card>
              );
            })}
          </div>

          {questions.length === 0 && (
            <Card className="p-12 text-center border-2 border-accent/20 bg-accent/5">
              <div className="space-y-3">
                <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
                <p className="text-lg font-medium">No additional questions needed!</p>
                <p className="text-muted-foreground">
                  Continue to the next step to complete your job posting.
                </p>
              </div>
            </Card>
          )}

          {/* Photo Upload */}
          <PhotoUpload
            photos={photos}
            onPhotosChange={onPhotosChange}
            maxPhotos={5}
          />

          {/* Real-time Price Estimation */}
          {Object.keys(answers).length >= 2 && (
            <PriceEstimator
              microId={microId}
              category={category}
              subcategory={subcategory}
              answers={answers}
              location={location}
            />
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
            <>Continue to Location →</>
          ) : (
            <>Complete {requiredQuestions.length - answeredCount} more</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AIQuestionsStep;
