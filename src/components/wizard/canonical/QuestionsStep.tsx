/**
 * Step 4: Micro-Specific Questions
 * Clean one-question-at-a-time layout with 2-column tile selection
 * All questions are selection-based (tap-to-select) - no typing required
 */
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AIQuestion } from '@/hooks/useAIQuestions';
import { AISmartFill } from '@/components/wizard/AISmartFill';
import { useJobPresets } from '@/hooks/useJobPresets';
import { useIsMobile } from '@/hooks/use-mobile';
import constructionServicesData from '@/data/construction-services.json';
import { transformServiceToQuestions } from '@/lib/transformers/blockToQuestion';
import { mapMicroIdToServiceId } from '@/lib/mappers/serviceIdMapper';
import { useQuestionValidation } from '@/hooks/useQuestionValidation';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
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

  // Helper function to check if a question should be shown based on conditional logic
  const shouldShowQuestion = (question: AIQuestion): boolean => {
    if (!question.meta?.show_if) return true;
    
    return question.meta.show_if.some((condition: any) => {
      const relatedAnswer = answers[condition.question];
      if (!relatedAnswer) return false;
      
      return condition.equals_any.includes(String(relatedAnswer));
    });
  };

  // Filter questions to only show selection-based ones that meet visibility conditions
  // Text/textarea questions are filtered out - users should only tap, not type
  const visibleQuestions = React.useMemo(() => {
    const selectionTypes = ['radio', 'select', 'checkbox', 'yesno'];
    return questions
      .filter(q => selectionTypes.includes(q.type)) // Only selection-based
      .filter(shouldShowQuestion);
  }, [questions, answers]);

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;
  const progressPercentage = visibleQuestions.length > 0 
    ? ((currentQuestionIndex + 1) / visibleQuestions.length) * 100 
    : 0;

  // Load questions when microSlugs or microNames change
  useEffect(() => {
    loadQuestions();
  }, [microSlugs.join(','), microNames.join(',')]);

  // Reset question index when questions array changes
  useEffect(() => {
    if (visibleQuestions.length > 0 && currentQuestionIndex >= visibleQuestions.length) {
      setCurrentQuestionIndex(visibleQuestions.length - 1);
    }
  }, [visibleQuestions.length, currentQuestionIndex]);

  const getFallbackQuestions = (): AIQuestion[] => {
    return [
      {
        id: 'scope',
        type: 'radio',
        label: 'What is the scope of work?',
        required: true,
        options: [
          { label: 'Small job - Quick fix or minor repair', value: 'small' },
          { label: 'Medium project - A few days of work', value: 'medium' },
          { label: 'Large project - Extensive work over weeks', value: 'large' }
        ]
      },
      {
        id: 'urgency',
        type: 'radio',
        label: 'How urgent is this?',
        required: true,
        options: [
          { label: 'Emergency - Needs immediate attention', value: 'emergency' },
          { label: 'Urgent - Within this week', value: 'urgent' },
          { label: 'Normal - Within a few weeks', value: 'normal' },
          { label: 'Flexible - No rush, whenever available', value: 'flexible' }
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
              case 'date':
              case 'time':
              case 'datetime':
              case 'moving_from_location':
              case 'moving_to_location':
              case 'text':
              default: return 'text';
            }
          };
          
          const transformedQuestions: AIQuestion[] = constructionQuestions.map(q => ({
            id: q.id,
            type: mapToAIQuestionType(q.type),
            label: q.question,
            required: q.required,
            options: q.options?.map(opt => ({ label: opt, value: opt })),
            placeholder: q.placeholder,
            helpText: q.placeholder || q.validation?.message,
            meta: {
              hint: q.placeholder || q.validation?.message
            }
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
        .maybeSingle();

      if (!packError && pack?.content) {
        console.log('✅ Loaded questions from database pack');
        let transformedQuestions = transformPackToAIQuestions(pack.content);
        
        // Filter out logistics questions that are covered in Step 5
        const logisticsIds = ['job_location', 'location', 'start_time', 'start_date', 
                              'preferred_date', 'project_assets', 'budget', 'budget_range',
                              'timeline', 'completion_date', 'access', 'access_details', 
                              'consultation', 'consultation_type', 'urgency', 'q8', 'q9',
                              'description', 'additional_notes', 'notes', 'when_needed',
                              'occupied', 'property_access', 'start_date_preference'];
        transformedQuestions = transformedQuestions.filter(q => !logisticsIds.includes(q.id));
        
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

  const humanizeKey = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const transformPackToAIQuestions = (packContent: any): AIQuestion[] => {
    const microDef = packContent;
    if (!microDef?.questions || !Array.isArray(microDef.questions)) {
      return [];
    }
    
    return microDef.questions.map((q: any, index: number) => {
      // Try i18n translation first if i18nKey exists
      let questionText = q.label || q.question || q.title;
      if (!questionText && q.i18nKey) {
        const translated = t(`questions:${q.i18nKey}`, { defaultValue: '' });
        if (translated && translated !== q.i18nKey) {
          questionText = translated;
        }
      }
      if (!questionText) {
        questionText = (q.key ? `${humanizeKey(q.key)}?` : null) ||
          q.aiHint || 
          `Question ${index + 1}`;
      }
      const questionId = q.key || q.id || `q${index}`;
      
      return {
        id: questionId,
        type: mapPackTypeToAIType(q.type),
        label: questionText,
        required: q.required ?? false,
        options: q.options?.map((opt: any) => {
          // Try i18n for option labels
          let optLabel = opt.label;
          if (!optLabel && opt.i18nKey) {
            const translatedOpt = t(`questions:${opt.i18nKey}`, { defaultValue: '' });
            if (translatedOpt && translatedOpt !== opt.i18nKey) {
              optLabel = translatedOpt;
            }
          }
          if (!optLabel) {
            optLabel = (opt.value ? humanizeKey(opt.value) : null) || String(opt);
          }
          return {
            label: optLabel,
            value: opt.value || opt.i18nKey || optLabel,
            description: opt.description || opt.hint
          };
        }),
        min: q.min,
        max: q.max,
        step: q.step,
        meta: {
          priority: 'core',
          hint: q.aiHint || q.hint || q.description,
          show_if: q.visibility?.allOf?.map((cond: any) => ({
            question: cond.questionKey,
            equals_any: [String(cond.equals)]
          }))
        }
      };
    });
  };

  const mapPackTypeToAIType = (packType: string): AIQuestion['type'] => {
    const typeMap: Record<string, AIQuestion['type']> = {
      'single': 'radio',
      'multi': 'checkbox',
      'multiple-choice': 'checkbox',
      'scale': 'scale',
      'text': 'text',
      'textarea': 'textarea',
      'select': 'select',
      'radio': 'radio',
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
        if (typeof opt === 'string') {
          return { label: opt, value: opt };
        }
        return {
          label: opt.label ?? opt.value ?? String(opt),
          value: opt.value ?? opt.label ?? String(opt),
          description: opt.description
        };
      }),
      min: q.min,
      max: q.max,
      step: q.step,
    }));
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    markAsTouched(questionId);
    onAnswersChange({ ...answers, [questionId]: answer });
  };

  const handleTileSelect = (questionId: string, value: string) => {
    handleAnswerChange(questionId, value);
    // Auto-advance after selection with small delay
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 400);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      onNext();
    } else {
      setCurrentQuestionIndex(prev => Math.min(prev + 1, visibleQuestions.length - 1));
    }
  };

  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const handleSkip = () => {
    handleNextQuestion();
  };

  // Get display text for question
  const getQuestionText = (question: AIQuestion, index: number): string => {
    const q = question as any;
    const questionText = question.label || q?.question || `Question ${index + 1}`;
    return questionText.startsWith('microservices.') || questionText.startsWith('questions.')
      ? t(questionText)
      : questionText;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 h-full flex flex-col">
      {/* Header */}
      <div className="space-y-4 flex-shrink-0 pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {microNames[0] || 'Service Details'}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Enhanced by AI – your job details will be optimized automatically
            </p>
          </div>
          {visibleQuestions.length > 0 && (
            <span className="text-sm text-muted-foreground font-medium">
              {currentQuestionIndex + 1} of {visibleQuestions.length}
            </span>
          )}
        </div>
        
        {/* Progress Bar */}
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      ) : visibleQuestions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No questions needed for this service.</p>
            <Button onClick={onNext}>Continue to Logistics</Button>
          </div>
        </div>
      ) : (
        <>
          {/* Question Content */}
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                {currentQuestion && (
                  <div className="space-y-6">
                    {/* Question Title */}
                    <h2 className="text-xl font-semibold text-foreground">
                      {getQuestionText(currentQuestion, currentQuestionIndex)}
                    </h2>

                    {/* Options Grid - 2 columns */}
                    {(currentQuestion.type === 'radio' || currentQuestion.type === 'select') && currentQuestion.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option) => {
                          const optValue = typeof option === 'string' ? option : option.value;
                          const optLabel = typeof option === 'string' ? option : option.label;
                          const optDescription = typeof option === 'object' ? (option as any).description : undefined;
                          const isSelected = answers[currentQuestion.id] === optValue;
                          
                          return (
                            <button
                              key={optValue}
                              type="button"
                              onClick={() => handleTileSelect(currentQuestion.id, optValue)}
                              className={`text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50 ${
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border bg-background hover:bg-muted/30'
                              }`}
                            >
                              <div className="font-semibold text-foreground">{optLabel}</div>
                              {optDescription && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {optDescription}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Checkbox Options */}
                    {currentQuestion.type === 'checkbox' && currentQuestion.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option) => {
                          const optValue = typeof option === 'string' ? option : option.value;
                          const optLabel = typeof option === 'string' ? option : option.label;
                          const optDescription = typeof option === 'object' ? (option as any).description : undefined;
                          const currentValue = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] : [];
                          const isSelected = currentValue.includes(optValue);
                          
                          return (
                            <button
                              key={optValue}
                              type="button"
                              onClick={() => {
                                const newValue = isSelected
                                  ? currentValue.filter((v: string) => v !== optValue)
                                  : [...currentValue, optValue];
                                handleAnswerChange(currentQuestion.id, newValue);
                              }}
                              className={`text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50 ${
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border bg-background hover:bg-muted/30'
                              }`}
                            >
                              <div className="font-semibold text-foreground">{optLabel}</div>
                              {optDescription && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {optDescription}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Yes/No Options */}
                    {currentQuestion.type === 'yesno' && (
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Yes', value: 'yes' },
                          { label: 'No', value: 'no' }
                        ].map((opt) => {
                          const isSelected = answers[currentQuestion.id] === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleTileSelect(currentQuestion.id, opt.value)}
                              className={`text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50 ${
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border bg-background hover:bg-muted/30'
                              }`}
                            >
                              <div className="font-semibold text-foreground text-lg">{opt.label}</div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  </div>
                )}

                {/* Final "Anything else?" on last question only */}
                {isLastQuestion && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Anything else we should know? (optional)
                    </label>
                    <textarea
                      value={answers['additional_notes'] || ''}
                      onChange={(e) => handleAnswerChange('additional_notes', e.target.value)}
                      placeholder="Add any special requirements, preferences, or details..."
                      className="w-full min-h-[80px] px-3 py-2 text-sm bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex-shrink-0 pt-6">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={handlePreviousQuestion}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  className="gap-2"
                >
                  {isLastQuestion ? 'Continue' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

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
  );
};
