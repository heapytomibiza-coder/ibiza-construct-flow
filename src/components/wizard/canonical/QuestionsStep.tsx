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
import { ArrowLeft, Loader2 } from 'lucide-react';
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
      
      // First try to get questions from database
      const { data: dbData, error: dbError } = await supabase
        .from('service_questions')
        .select('questions')
        .eq('service_id', microId)
        .maybeSingle();

      if (!dbError && dbData) {
        const questionsData = dbData.questions as any;
        if (questionsData?.questions) {
          setQuestions(questionsData.questions);
          setLoading(false);
          return;
        }
      }

      // If no database questions, generate with AI
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-questions', {
        body: { 
          microServiceId: microId,
          microServiceName: microName,
          locale: 'en'
        }
      });

      if (aiError) throw aiError;

      const generatedQuestions = aiData?.questions || [];
      setQuestions(generatedQuestions);
      
    } catch (error) {
      console.error('Error loading questions:', error);
      // Provide basic fallback questions
      setQuestions([
        {
          id: 'scope',
          type: 'single',
          label: 'What is the scope of work?',
          required: true,
          options: ['Small job', 'Medium project', 'Large project']
        },
        {
          id: 'urgency',
          type: 'single',
          label: 'How urgent is this?',
          required: true,
          options: ['Emergency', 'Urgent (this week)', 'Normal', 'Flexible timing']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, value: any) => {
    onAnswersChange({ ...answers, [questionId]: value });
  };

  const renderQuestion = (q: any) => {
    const answer = answers[q.id];
    const questionType = q.type === 'multiple_choice' ? 'single' : q.type;

    switch (questionType) {
      case 'single':
      case 'multi':
        return (
          <div className="space-y-2">
            <Label className="text-base font-medium text-charcoal">{q.question || q.label}</Label>
            {q.helper_text && (
              <p className="text-sm text-muted-foreground">{q.helper_text}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {(q.options || []).map((opt: any) => {
                const optionValue = typeof opt === 'string' ? opt : opt.value;
                const optionLabel = typeof opt === 'string' ? opt : opt.label;
                const isSelected = answer === optionValue || answer?.includes?.(optionValue);
                
                return (
                  <Badge
                    key={optionValue}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105",
                      isSelected 
                        ? "bg-copper text-white" 
                        : "hover:border-copper"
                    )}
                    onClick={() => {
                      if (questionType === 'multi') {
                        const current = answer || [];
                        handleAnswer(
                          q.id,
                          current.includes(optionValue)
                            ? current.filter((v: string) => v !== optionValue)
                            : [...current, optionValue]
                        );
                      } else {
                        handleAnswer(q.id, optionValue);
                      }
                    }}
                  >
                    {optionLabel}
                  </Badge>
                );
              })}
            </div>
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <Label className="text-base font-medium text-charcoal">{q.question || q.label}</Label>
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
            <Label className="text-base font-medium text-charcoal">{q.question || q.label}</Label>
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
            <Label className="text-base font-medium text-charcoal">{q.question || q.label}</Label>
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
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-copper mb-4" />
            <p className="text-muted-foreground">Generating personalized questions...</p>
          </div>
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
