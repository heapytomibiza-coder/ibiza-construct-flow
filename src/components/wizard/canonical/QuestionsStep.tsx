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

  // Helper function to check if a question should be shown based on conditional logic
  const shouldShowQuestion = (question: AIQuestion): boolean => {
    if (!question.meta?.show_if) return true;
    
    return question.meta.show_if.some((condition: any) => {
      const relatedAnswer = answers[condition.question];
      if (!relatedAnswer) return false;
      
      return condition.equals_any.includes(String(relatedAnswer));
    });
  };

  // Filter questions to only show those that meet visibility conditions
  const visibleQuestions = React.useMemo(() => {
    return questions.filter(shouldShowQuestion);
  }, [questions, answers]);

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;

  // Debug: Log the current question to console
  useEffect(() => {
    if (currentQuestion) {
      console.log('📋 Current Question Data:', {
        id: currentQuestion.id,
        type: currentQuestion.type,
        label: currentQuestion.label,
        question: (currentQuestion as any).question,
        options: currentQuestion.options,
        fullObject: currentQuestion
      });
    }
  }, [currentQuestion]);

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
          const transformedQuestions: AIQuestion[] = constructionQuestions.map(q => {
            console.log('🔄 Transforming question:', {
              id: q.id,
              question: q.question,
              type: q.type,
              hasQuestion: !!q.question,
              questionType: typeof q.question
            });
            
            return {
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
            };
          });

          console.log('✅ Transformed questions:', transformedQuestions.map(q => ({ 
            id: q.id, 
            label: q.label, 
            hasLabel: !!q.label 
          })));

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
        .maybeSingle();

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

  // Utility to convert snake_case/kebab-case keys to human-readable text
  const humanizeKey = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const transformPackToAIQuestions = (packContent: any): AIQuestion[] => {
    console.log('🔍 Transform pack content:', JSON.stringify(packContent, null, 2));
    const microDef = packContent;
    if (!microDef?.questions || !Array.isArray(microDef.questions)) {
      console.warn('❌ No questions array in pack content');
      return [];
    }

    console.log('📦 Pack has', microDef.questions.length, 'questions');
    
    return microDef.questions.map((q: any, index: number) => {
      console.log(`🔍 Question ${index}:`, JSON.stringify(q, null, 2));
      
      // Extract question text - prioritize human-readable sources over i18n keys
      const questionText = q.label || q.question || q.title || 
        (q.key ? `${humanizeKey(q.key)}?` : null) ||
        q.aiHint || 
        `Question ${index + 1}`;
      const questionId = q.key || q.id || `q${index}`;
      
      console.log(`✅ Extracted: id="${questionId}", text="${questionText}"`);
      
      const result = {
        id: questionId,
        type: mapPackTypeToAIType(q.type),
        label: questionText,
        required: q.required ?? false,
        options: q.options?.map((opt: any) => {
          // Prioritize label, then humanized value, then fallback
          const optLabel = opt.label || 
            (opt.value ? humanizeKey(opt.value) : null) ||
            String(opt);
          return {
            label: optLabel,
            value: opt.value || opt.i18nKey || optLabel
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
      
      console.log(`✅ Transformed question:`, result);
      return result;
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
    const mappedType = typeMap[packType] || 'radio';
    console.log(`📝 Mapped question type: "${packType}" → "${mappedType}"`);
    return mappedType;
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
    const question = visibleQuestions.find(q => q.id === questionId);
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
      // Always allow progression to next step - questions are optional
      onNext();
    } else {
      // Navigate between questions freely
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

  // Count answered questions for progress feedback only
  const answeredCount = visibleQuestions.filter(q => 
    answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null
  ).length;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 md:px-6 h-full flex flex-col">
        <div className="space-y-2 flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-lg md:text-xl font-bold">
                {microNames[0] || t('wizard.steps.aiQuestions.title')}
              </h1>
              <p className="text-xs text-muted-foreground">
                Tap to select your preferences
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-medium">
                {answeredCount} of {visibleQuestions.length} answered
              </span>
              <Button
                variant="outline"
                onClick={() => setShowAISmartFill(true)}
                size="sm"
                className="gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Smart-Fill</span>
              </Button>
            </div>
          </div>
        </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-copper mb-4" />
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-auto pb-4">
            {/* All Questions as Compact Tiles */}
            <div className="space-y-4">
              {visibleQuestions.map((question, index) => {
                const q = question as any;
                const questionText = question.label || q?.question || `Question ${index + 1}`;
                const displayText = questionText.startsWith('microservices.') || questionText.startsWith('questions.')
                  ? t(questionText)
                  : questionText;
                
                return (
                  <div 
                    key={question.id}
                    className="bg-card rounded-xl border border-border/50 p-4 shadow-sm"
                  >
                    <div className="space-y-3">
                      {/* Question Header */}
                      <div className="flex items-start gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground leading-tight">
                            {displayText}
                          </h3>
                        </div>
                        {!question.required && (
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">optional</Badge>
                        )}
                      </div>

                      {/* Compact Options Grid */}
                      <div className="pl-8">
                        {(question.type === 'radio' || question.type === 'select') && question.options && (
                          <div className="flex flex-wrap gap-2">
                            {question.options.map((option) => {
                              const optValue = typeof option === 'string' ? option : option.value;
                              const optLabel = typeof option === 'string' ? option : option.label;
                              return (
                                <button
                                  key={optValue}
                                  type="button"
                                  onClick={() => handleAnswerChange(question.id, optValue)}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                                    answers[question.id] === optValue
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-background border-border hover:border-primary/50 hover:bg-primary/5'
                                  }`}
                                >
                                  {optLabel}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {question.type === 'checkbox' && question.options && (
                          <div className="flex flex-wrap gap-2">
                            {question.options.map((option) => {
                              const optValue = typeof option === 'string' ? option : option.value;
                              const optLabel = typeof option === 'string' ? option : option.label;
                              const currentValue = Array.isArray(answers[question.id]) ? answers[question.id] : [];
                              const isSelected = currentValue.includes(optValue);
                              return (
                                <button
                                  key={optValue}
                                  type="button"
                                  onClick={() => {
                                    const newValue = isSelected
                                      ? currentValue.filter((v: string) => v !== optValue)
                                      : [...currentValue, optValue];
                                    handleAnswerChange(question.id, newValue);
                                  }}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                                    isSelected
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-background border-border hover:border-primary/50 hover:bg-primary/5'
                                  }`}
                                >
                                  {optLabel}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {question.type === 'yesno' && (
                          <div className="flex gap-2">
                            {['Yes', 'No'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleAnswerChange(question.id, opt.toLowerCase())}
                                className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all ${
                                  answers[question.id] === opt.toLowerCase()
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background border-border hover:border-primary/50 hover:bg-primary/5'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}

                        {(question.type === 'text' || question.type === 'textarea' || question.type === 'number' || question.type === 'scale') && (
                          <ConversationalQuestionInput
                            question={question}
                            value={answers[question.id]}
                            onChange={(value) => handleAnswerChange(question.id, value)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Anything Else Field */}
              <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground font-semibold text-xs flex-shrink-0">
                      +
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-tight">
                      Anything else we should know?
                    </h3>
                    <Badge variant="outline" className="text-[10px] flex-shrink-0">optional</Badge>
                  </div>
                  <div className="pl-8">
                    <textarea
                      value={answers['additional_notes'] || ''}
                      onChange={(e) => handleAnswerChange('additional_notes', e.target.value)}
                      placeholder="Add any special requirements, preferences, or details..."
                      className="w-full min-h-[80px] px-3 py-2 text-sm bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex-shrink-0 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={onNext}
                className="gap-2 bg-gradient-hero text-white"
                size="lg"
              >
                Continue to Logistics
                <ChevronRight className="w-4 h-4" />
              </Button>
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
    </>
  );
};
