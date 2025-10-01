/**
 * Step 4: Micro-Specific Questions
 * Dynamic, tap-based questions (no long typing)
 */
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface QuestionsStepProps {
  microId: string;
  microName: string;
  answers: Record<string, any>;
  onAnswersChange: (answers: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const QuestionsStep: React.FC<QuestionsStepProps> = ({
  microId,
  microName,
  answers,
  onAnswersChange,
  onNext,
  onBack
}) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [microId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_questions')
        .select('questions')
        .eq('service_id', microId)
        .maybeSingle();

      if (error) throw error;

      // questions is nested: data.questions.questions is the array
      const serviceData = data as any;
      const allQuestions = serviceData?.questions?.questions || [];
      setQuestions(allQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, value: any) => {
    onAnswersChange({ ...answers, [questionId]: value });
  };

  const renderQuestion = (q: any) => {
    const answer = answers[q.id];

    switch (q.type) {
      case 'single':
      case 'multi':
        return (
          <div className="space-y-2">
            <Label className="text-base font-medium text-charcoal">{q.label}</Label>
            {q.helper_text && (
              <p className="text-sm text-muted-foreground">{q.helper_text}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {q.options?.map((opt: string) => (
                <Badge
                  key={opt}
                  variant={answer === opt || answer?.includes?.(opt) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105",
                    answer === opt || answer?.includes?.(opt) 
                      ? "bg-copper text-white" 
                      : "hover:border-copper"
                  )}
                  onClick={() => {
                    if (q.type === 'multi') {
                      const current = answer || [];
                      handleAnswer(
                        q.id,
                        current.includes(opt)
                          ? current.filter((v: string) => v !== opt)
                          : [...current, opt]
                      );
                    } else {
                      handleAnswer(q.id, opt);
                    }
                  }}
                >
                  {opt}
                </Badge>
              ))}
            </div>
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <Label className="text-base font-medium text-charcoal">{q.label}</Label>
            {q.helper_text && (
              <p className="text-sm text-muted-foreground">{q.helper_text}</p>
            )}
            <div className="space-y-4 mt-4">
              <Slider
                value={[answer || q.min || 0]}
                onValueChange={([value]) => handleAnswer(q.id, value)}
                min={q.min || 0}
                max={q.max || 100}
                step={q.step || 1}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{q.min || 0}</span>
                <span className="font-medium text-copper">
                  {answer || q.min || 0} {q.unit || ''}
                </span>
                <span>{q.max || 100}</span>
              </div>
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label className="text-base font-medium text-charcoal">{q.label}</Label>
            {q.helper_text && (
              <p className="text-sm text-muted-foreground">{q.helper_text}</p>
            )}
            <Input
              type="number"
              value={answer || ''}
              onChange={(e) => handleAnswer(q.id, e.target.value)}
              placeholder="Enter value..."
              min={q.min}
              max={q.max}
              className="mt-2"
            />
          </div>
        );

      case 'boolean':
        return (
          <div className="space-y-2">
            <Label className="text-base font-medium text-charcoal">{q.label}</Label>
            {q.helper_text && (
              <p className="text-sm text-muted-foreground">{q.helper_text}</p>
            )}
            <div className="flex gap-3 mt-3">
              <Badge
                variant={answer === true ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-6 py-2 transition-all hover:scale-105",
                  answer === true ? "bg-copper text-white" : "hover:border-copper"
                )}
                onClick={() => handleAnswer(q.id, true)}
              >
                Yes
              </Badge>
              <Badge
                variant={answer === false ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-6 py-2 transition-all hover:scale-105",
                  answer === false ? "bg-copper text-white" : "hover:border-copper"
                )}
                onClick={() => handleAnswer(q.id, false)}
              >
                No
              </Badge>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const requiredAnswered = questions
    .filter(q => q.required)
    .every(q => answers[q.id] !== undefined && answers[q.id] !== '');

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div>
          <Badge variant="outline" className="mb-4">{microName}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
            Tell us about your project
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Answer a few quick questions to help professionals understand your needs
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <Card key={q.id || idx} className="p-6">
              {renderQuestion(q)}
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-6">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!requiredAnswered || loading}
          className="bg-gradient-hero text-white px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
