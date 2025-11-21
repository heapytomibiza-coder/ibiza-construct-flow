/**
 * Step 4: Micro-Specific Questions
 * Now powered by enhanced AIQuestionRenderer with pack support
 */
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ConversationalQuestionInput } from '@/components/wizard/ConversationalQuestionInput';
import { AIQuestion } from '@/hooks/useAIQuestions';
import { PresetChips } from '@/components/wizard/PresetChips';
import { AISmartFill } from '@/components/wizard/AISmartFill';
import { useJobPresets } from '@/hooks/useJobPresets';
import { StickyMobileCTA } from '@/components/mobile/StickyMobileCTA';
import { useIsMobile } from '@/hooks/use-mobile';
import constructionServicesData from '@/data/construction-services.json';
import { transformServiceToQuestions } from '@/lib/transformers/blockToQuestion';
import { mapMicroIdToServiceId } from '@/lib/mappers/serviceIdMapper';
import { extractReadableText } from '@/lib/questionUtils';
import { useQuestionValidation } from '@/hooks/useQuestionValidation';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressIndicator } from '@/components/calculator/ui/ProgressIndicator';
import { useTranslation } from '@/hooks/i18n/useTranslation';

interface QuestionsStepProps {
  microIds: string[];
  microSlugs: string[];
  microNames: string[];
  category?: string;
  subcategory?: string;
  answers: Record<string, any>;
  onAnswersChange: (answers: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const QuestionsStep: React.FC<QuestionsStepProps> = ({
  microIds,
  microSlugs,
  microNames,
  category,
  subcategory,
  answers,
  onAnswersChange,
  onNext,
  onBack
}) => {
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invalidRequired, setInvalidRequired] = useState<string[]>([]);
  const [packSource, setPackSource] = useState<'pack' | 'ai' | 'ai_contextual' | 'fallback' | 'static_json'>('fallback');
  const [showAISmartFill, setShowAISmartFill] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const primaryMicroSlug = (microSlugs && microSlugs[0]) || '';
  const { presets, usePreset } = useJobPresets(primaryMicroSlug);
  const isMobile = useIsMobile();
  const { markAsTouched, getValidationMessage, isQuestionComplete } = useQuestionValidation();
  const { t } = useTranslation();

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    loadQuestions();
  }, [microSlugs.join(','), microNames.join(',')]);

  const getFallbackQuestions = (): AIQuestion[] => {
    return [
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
    ];
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (microIds.length === 0 || microNames.length === 0) {
        console.warn('No micro services selected, using fallback questions');
        setQuestions(getFallbackQuestions());
        setPackSource('fallback');
        setLoading(false);
        return;
      }

      // TIER -1: Try construction question blocks (local-first with UUID)
      try {
        const { buildConstructionWizardQuestions } = await import('@/lib/data/constructionQuestionBlocks');
        const { questions: constructionQuestions, microId, microUuid } = await buildConstructionWizardQuestions(microNames);
        
        if (constructionQuestions.length > 0) {
          console.log('✅ Loaded construction question blocks:', { microId, microUuid, count: constructionQuestions.length });
          
          // Helper to map types safely
          const mapToAIQuestionType = (qType: string): AIQuestion['type'] => {
            switch (qType) {
              case 'multiselect': return 'checkbox';
              case 'select': return 'radio';
              case 'range': return 'scale';
              case 'checkbox': return 'checkbox';
              case 'file': return 'file';
              case 'number': return 'number';
              case 'textarea': return 'textarea';
              case 'radio': return 'radio';
              // Map unsupported types to text
              case 'date':
              case 'time':
              case 'datetime':
              case 'moving_from_location':
              case 'moving_to_location':
              case 'text':
              default: return 'text';
            }
          };
          
          // Transform to AIQuestion format
          const transformedQuestions: AIQuestion[] = constructionQuestions.map(q => ({
            id: q.id,
            type: mapToAIQuestionType(q.type),
            label: q.question,
            required: q.required,
            options: q.options?.map(opt => ({ label: opt, value: opt })),
            placeholder: q.placeholder,
            helpText: q.validation?.message
          }));

          setQuestions(transformedQuestions);
          setPackSource('static_json');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Construction questions not available:', err);
      }

      // TIER 0: Check static JSON for matching service
      const serviceId = mapMicroIdToServiceId(primaryMicroSlug);
      
      if (serviceId) {
        const staticService = constructionServicesData.services.find(
          s => s.id === serviceId
        );
        
      if (staticService) {
          console.log('✅ Loaded questions from static JSON:', serviceId);
          let questions = transformServiceToQuestions(staticService);
          
          // Defensive filter: ensure no logistics questions slip through
          const logisticsIds = ['job_location', 'location', 'start_time', 'start_date', 
                                'preferred_date', 'project_assets', 'budget', 'budget_range',
                                'timeline', 'completion_date', 'access', 'access_details', 
                                'consultation', 'consultation_type'];
          questions = questions.filter(q => !logisticsIds.includes(q.id));
          
          setQuestions(questions);
          setPackSource('static_json');
          setLoading(false);
          return;
        }
      }

      // TIER 1: Try loading from question_packs table
      console.log('Checking database for questions:', primaryMicroSlug);

      const { data: pack, error: packError } = await supabase
        .from('question_packs')
        .select('content')
        .eq('micro_slug', primaryMicroSlug)
        .eq('status', 'approved')
        .eq('is_active', true)
        .single();

      if (!packError && pack?.content) {
        console.log('✅ Loaded questions from database pack');
        const transformedQuestions = transformPackToAIQuestions(pack.content);
        if (transformedQuestions.length > 0) {
          setQuestions(transformedQuestions);
          setPackSource('pack');
          setLoading(false);
          return;
        }
      }

      // TIER 2: Use AI to generate contextual questions
      console.log('No database pack found, generating contextual questions for:', microNames);
      
      const { data, error: functionError } = await supabase.functions.invoke(
        'generate-contextual-questions',
        {
          body: {
            microNames,
            category,
            subcategory
          }
        }
      );

      if (functionError) {
        console.error('Error calling contextual questions function:', functionError);
        throw functionError;
      }

      if (data?.questions && Array.isArray(data.questions)) {
        const contextualQuestions = transformDatabaseToAIQuestions(data.questions);
        if (contextualQuestions.length > 0) {
          setQuestions(contextualQuestions);
          setPackSource(data.source === 'ai_contextual' ? 'ai_contextual' : 'fallback');
          setLoading(false);
          return;
        }
      }

      // If AI generation failed, use fallback
      console.warn('No questions generated, using fallback questions');
      setQuestions(getFallbackQuestions());
      setPackSource('fallback');
      
    } catch (error: any) {
      console.warn('Error loading questions, using fallback:', error.message);
      setQuestions(getFallbackQuestions());
      setPackSource('fallback');
      setError(error.message);
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

  const transformDatabaseToAIQuestions = (dbQuestions: any[]): AIQuestion[] => {
    return dbQuestions.map((q: any) => ({
      id: q.id,
      type: q.type as AIQuestion['type'],
      label: q.label,
      required: q.required ?? false,
      options: q.options?.map((opt: any) => {
        // Handle both string arrays and object arrays
        if (typeof opt === 'string') {
          return { label: opt, value: opt };
        }
        return {
          label: opt.label ?? opt.value ?? String(opt),
          value: opt.value ?? opt.label ?? String(opt)
        };
      }),
      min: q.min,
      max: q.max,
      step: q.step,
    }));
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
    markAsTouched(questionId);
    onAnswersChange({ ...answers, [questionId]: answer });
    
    // Auto-advance for single-choice questions
    const question = questions.find(q => q.id === questionId);
    if (question && (question.type === 'radio' || question.type === 'select') && answer) {
      setTimeout(() => {
        handleNextQuestion();
      }, 600); // Small delay for visual feedback
    }
  };

  const handleValidationChange = (missing: string[]) => {
    setInvalidRequired(missing);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Check if all required questions are answered
      const allAnswered = questions.every(q => 
        !q.required || isQuestionComplete(q, answers[q.id])
      );
      if (allAnswered) {
        onNext();
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const canProceed = questions.every(q => 
    !q.required || isQuestionComplete(q, answers[q.id])
  ) && !loading;

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-6 md:space-y-8 pb-24 md:pb-8">
        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-sm md:text-base -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
              Back
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowAISmartFill(true)}
              className="gap-1 md:gap-2 text-sm md:text-base"
            >
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              AI Smart-Fill
            </Button>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible">
              {microNames.map((name, idx) => (
                <Badge key={idx} variant="outline" className="flex-shrink-0">
                  {name}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-charcoal">
              Tell us about your project
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              {microNames.length > 1 
                ? 'Answer questions to help professionals understand your complete project scope'
                : 'Answer a few quick questions to help professionals understand your needs'
              }
            </p>
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
          {presets.length > 0 && currentQuestionIndex === 0 && (
            <PresetChips
              presetType={primaryMicroSlug}
              onSelectPreset={async (presetData) => {
                onAnswersChange(presetData);
              }}
            />
          )}
          
          {/* Progress Indicator */}
          <ProgressIndicator 
            currentStep={currentQuestionIndex + 1}
            totalSteps={questions.length}
          />

          {/* Conversational Question Flow */}
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Question Card */}
                <div className="bg-card rounded-2xl border border-border/50 p-8 md:p-10 shadow-sm">
                  <div className="space-y-8">
                    {/* Question Number Badge */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-base">
                        {currentQuestionIndex + 1}
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        of {questions.length}
                      </span>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-3">
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                        {(() => {
                          // Use question property first (from WizardQuestion), then label (from AIQuestion)
                          const questionText = (currentQuestion as any).question || currentQuestion?.label || '';
                          
                          // Check if it's an i18n key and translate it
                          if (questionText.startsWith('microservices.') || questionText.startsWith('questions.')) {
                            return t(questionText);
                          }
                          
                          // If it looks like a key (has dots), extract readable text
                          if (questionText.includes('.')) {
                            return extractReadableText(questionText);
                          }
                          
                          // Return as-is if it's already readable text
                          return questionText || 'Please provide your answer';
                        })()}
                        {currentQuestion.required && (
                          <span className="text-destructive ml-2">*</span>
                        )}
                      </h2>
                      <p className="text-base text-muted-foreground">
                        Select the option that best describes your needs
                      </p>
                    </div>

                    {/* Question Input */}
                    <div className="pt-4">
                      <ConversationalQuestionInput
                        question={currentQuestion}
                        value={answers[currentQuestion.id]}
                        onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                      />
                    </div>

                    {/* Validation Feedback */}
                    {isQuestionComplete(currentQuestion, answers[currentQuestion.id]) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 dark:bg-green-950/30 px-4 py-3 rounded-lg"
                      >
                        <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Got it! Ready to continue</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {isFirstQuestion ? 'Back' : 'Previous'}
                  </Button>

                  <Button
                    onClick={handleNextQuestion}
                    disabled={currentQuestion.required && !isQuestionComplete(currentQuestion, answers[currentQuestion.id])}
                    className="gap-2 bg-gradient-hero text-white"
                    size="lg"
                  >
                    {isLastQuestion ? 'Continue' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* AI Smart-Fill Dialog */}
          {showAISmartFill && (
            <AISmartFill
              selections={answers}
              serviceType={microNames.join(' + ')}
              onGenerated={(data) => {
                onAnswersChange({ ...answers, ...data });
                setShowAISmartFill(false);
              }}
            />
          )}
        </>
      )}

      </div>

      {/* Mobile Sticky CTA - Hidden, navigation is in the card */}
    </>
  );
};
