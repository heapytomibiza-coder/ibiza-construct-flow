/**
 * Step 4: Micro-Specific Questions
 * Now powered by enhanced AIQuestionRenderer with pack support
 */
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AIQuestionRenderer } from '@/components/ai/AIQuestionRenderer';
import { AIQuestion } from '@/hooks/useAIQuestions';
import { PresetChips } from '@/components/wizard/PresetChips';
import { AISmartFill } from '@/components/wizard/AISmartFill';
import { useJobPresets } from '@/hooks/useJobPresets';

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
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invalidRequired, setInvalidRequired] = useState<string[]>([]);
  const [packSource, setPackSource] = useState<'pack' | 'ai' | 'fallback'>('fallback');
  const [showAISmartFill, setShowAISmartFill] = useState(false);
  
  const { presets, usePreset } = useJobPresets(microId);

  useEffect(() => {
    loadQuestions();
  }, [microId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to get questions from question_packs (new system)
      const { data: packData, error: packError } = await supabase
        .from('question_packs')
        .select('content, pack_id, version')
        .eq('is_active', true)
        .ilike('micro_slug', `%${microName.toLowerCase().replace(/\s+/g, '-')}%`)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!packError && packData?.content) {
        const packQuestions = transformPackToAIQuestions(packData.content);
        if (packQuestions.length > 0) {
          setQuestions(packQuestions);
          setPackSource('pack');
          setLoading(false);
          return;
        }
      }

      // Fallback to legacy service_questions table
      const { data: dbData, error: dbError } = await supabase
        .from('service_questions')
        .select('questions')
        .eq('service_id', microId)
        .maybeSingle();

      if (!dbError && dbData) {
        const questionsData = dbData.questions as any;
        if (questionsData?.questions) {
          const legacyQuestions = transformLegacyToAIQuestions(questionsData.questions);
          setQuestions(legacyQuestions);
          setPackSource('ai');
          setLoading(false);
          return;
        }
      }

      // Generate with AI if no stored questions
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-questions', {
        body: { 
          microServiceId: microId,
          microServiceName: microName,
          locale: 'en'
        }
      });

      if (!aiError && aiData?.questions) {
        const generatedQuestions = transformLegacyToAIQuestions(aiData.questions);
        setQuestions(generatedQuestions);
        setPackSource('ai');
        setLoading(false);
        return;
      }

      // If AI generation fails, use fallback questions without throwing error
      console.warn('AI question generation unavailable, using fallback questions');
      
    } catch (error: any) {
      console.warn('Error loading questions, using fallback:', error.message);
      // Don't set error state, just use fallback questions
      
      // Provide basic fallback questions
      setQuestions([
        {
          id: 'scope',
          type: 'radio',
          label: 'What is the scope of work?',
          required: true,
          options: [
            { label: 'Small job', value: 'small' },
            { label: 'Medium project', value: 'medium' },
            { label: 'Large project', value: 'large' }
          ]
        },
        {
          id: 'urgency',
          type: 'radio',
          label: 'How urgent is this?',
          required: true,
          options: [
            { label: 'Emergency', value: 'emergency' },
            { label: 'Urgent (this week)', value: 'urgent' },
            { label: 'Normal', value: 'normal' },
            { label: 'Flexible timing', value: 'flexible' }
          ]
        }
      ]);
      setPackSource('fallback');
    } finally {
      setLoading(false);
    }
  };

  const transformPackToAIQuestions = (packContent: any): AIQuestion[] => {
    const microDef = packContent;
    if (!microDef?.questions || !Array.isArray(microDef.questions)) return [];

    return microDef.questions.map((q: any) => ({
      id: q.key,
      type: mapPackTypeToAIType(q.type),
      label: q.i18nKey, // i18n keys used directly (i18n resolver in future phase)
      required: q.required ?? false,
      options: q.options?.map((opt: any) => ({
        label: opt.i18nKey, // i18n keys used directly (i18n resolver in future phase)
        value: opt.value
      })),
      min: q.min,
      max: q.max,
      step: q.step,
      meta: {
        priority: 'core',
        hint: q.aiHint,
        show_if: q.visibility?.allOf?.map((cond: any) => ({
          question: cond.questionKey,
          equals_any: [String(cond.equals)]
        }))
      }
    }));
  };

  const mapPackTypeToAIType = (packType: string): AIQuestion['type'] => {
    const typeMap: Record<string, AIQuestion['type']> = {
      'single': 'radio',
      'multi': 'checkbox',
      'scale': 'scale',
      'text': 'text',
      'number': 'number',
      'yesno': 'yesno',
      'file': 'file'
    };
    return typeMap[packType] || 'radio';
  };

  const transformLegacyToAIQuestions = (legacyQuestions: any[]): AIQuestion[] => {
    return legacyQuestions.map((q: any) => ({
      id: q.id || q.key,
      type: mapLegacyTypeToAIType(q.type),
      label: q.question || q.label,
      required: q.required ?? false,
      options: q.options?.map((opt: any) => 
        typeof opt === 'string' 
          ? { label: opt, value: opt }
          : { label: opt.label || opt.value, value: opt.value }
      ),
      min: q.min,
      max: q.max,
      step: q.step,
    }));
  };

  const mapLegacyTypeToAIType = (legacyType: string): AIQuestion['type'] => {
    const typeMap: Record<string, AIQuestion['type']> = {
      'single': 'radio',
      'multiple_choice': 'radio',
      'multi': 'checkbox',
      'range': 'scale',
      'number': 'number',
      'boolean': 'yesno',
      'text': 'text'
    };
    return typeMap[legacyType] || 'radio';
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    onAnswersChange({ ...answers, [questionId]: answer });
  };

  const handleAutoAdvance = () => {
    if (canProceed) {
      onNext();
    }
  };

  const handleValidationChange = (missing: string[]) => {
    setInvalidRequired(missing);
  };

  const canProceed = invalidRequired.length === 0 && !loading;

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

        <div className="space-y-4">
          <Badge variant="outline" className="mb-4">{microName}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
            Tell us about your project
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Answer a few quick questions to help professionals understand your needs
          </p>
          
          {/* AI Smart-Fill Button */}
          <Button
            variant="outline"
            onClick={() => setShowAISmartFill(true)}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Smart-Fill
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-copper mb-4" />
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Recent Presets */}
          {presets.length > 0 && (
            <PresetChips
              presetType={microId}
              onSelectPreset={async (presetData) => {
                onAnswersChange(presetData);
              }}
            />
          )}
          
          {packSource === 'pack' && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Using optimized question pack for {microName}
              </AlertDescription>
            </Alert>
          )}
          
          <AIQuestionRenderer
            questions={questions}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onValidationChange={handleValidationChange}
            onAutoAdvance={handleAutoAdvance}
          />
          
          {/* AI Smart-Fill Dialog */}
          {showAISmartFill && (
            <AISmartFill
              selections={answers}
              serviceType={microName}
              onGenerated={(data) => {
                onAnswersChange({ ...answers, ...data });
                setShowAISmartFill(false);
              }}
            />
          )}
        </>
      )}

      <div className="flex justify-end pt-6">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canProceed}
          className="bg-gradient-hero text-white px-8"
        >
          Continue {invalidRequired.length > 0 && `(${invalidRequired.length} required)`}
        </Button>
      </div>
    </div>
  );
};
