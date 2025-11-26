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
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      setCurrentQuestionIndex(questions.length - 1);
    }
  }, [questions.length, currentQuestionIndex]);

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
              helpText: q.validation?.message
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
      // Safety check: don't go beyond bounds
      setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1));
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
      <div className="max-w-3xl mx-auto px-4 md:px-6 h-full flex flex-col">
        <div className="space-y-2 flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-lg md:text-xl font-bold">
                {microNames[0] || t('wizard.steps.aiQuestions.title')}
              </h1>
              <p className="text-xs text-muted-foreground">
                Tell us about your project
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-medium">
                {currentQuestionIndex + 1} of {questions.length}
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
          <ProgressIndicator
            currentStep={currentQuestionIndex + 1}
            totalSteps={questions.length}
          />
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
          <div className="flex-1 overflow-auto">
            {/* Recent Presets */}
            {presets.length > 0 && currentQuestionIndex === 0 && (
              <PresetChips
                presetType={primaryMicroSlug}
                onSelectPreset={async (presetData) => {
                  onAnswersChange(presetData);
                }}
              />
            )}

            {/* Conversational Question Flow */}
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 pb-4"
                >
                  {/* Question Card */}
                  <div className="bg-card rounded-2xl border border-border/50 p-4 md:p-6 shadow-sm">
                    <div className="space-y-4">
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
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg md:text-xl font-bold text-foreground leading-tight">
                            {(() => {
                              const q = currentQuestion as any;
                              console.log('🔍 Full question object:', JSON.stringify(currentQuestion, null, 2));
                              
                              const possibleTextFields = [
                                q?.question,
                                currentQuestion?.label,
                                q?.title,
                                q?.text,
                              ];
                              
                              let questionText = possibleTextFields.find(text => 
                                text && typeof text === 'string' && text.trim() !== ''
                              ) || '';
                              
                              if (!questionText && currentQuestion?.options && currentQuestion.options.length > 0) {
                                const firstOpt = currentQuestion.options[0];
                                const optValue = typeof firstOpt === 'string' ? firstOpt : (firstOpt as any)?.value || '';
                                
                                if (optValue.includes('bed')) {
                                  questionText = 'How many bedrooms?';
                                } else if (optValue.includes('room')) {
                                  questionText = 'How many rooms?';
                                } else if (optValue.includes('floor')) {
                                  questionText = 'How many floors?';
                                } else if (optValue.includes('bathroom')) {
                                  questionText = 'How many bathrooms?';
                                }
                              }
                              
                              if (!questionText && currentQuestion?.id) {
                                const id = currentQuestion.id;
                                questionText = id
                                  .replace(/_/g, ' ')
                                  .replace(/([a-z])([A-Z])/g, '$1 $2')
                                  .split(' ')
                                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' ') + '?';
                              }
                              
                              if (!questionText) {
                                questionText = `Question ${currentQuestionIndex + 1}`;
                              }
                              
                              const isSelectionType = currentQuestion.type === 'radio' || 
                                                      currentQuestion.type === 'select' ||
                                                      currentQuestion.type === 'checkbox' ||
                                                      currentQuestion.type === 'multiple-choice';
                              
                              if (isSelectionType && questionText.toLowerCase().includes('describe')) {
                                questionText = questionText.replace(/describe/gi, 'select').replace(/Describe/g, 'Select');
                              }
                              
                              console.log('✅ Final question text:', questionText);
                              
                              if (questionText.startsWith('microservices.') || questionText.startsWith('questions.')) {
                                return t(questionText);
                              }
                              
                              return questionText;
                            })()}
                          </h2>
                          {!currentQuestion.required && (
                            <Badge variant="outline" className="text-xs">optional</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            if (currentQuestion.type === 'checkbox' || currentQuestion.type === 'multiple-choice') {
                              return 'Select all that apply';
                            } else if (currentQuestion.type === 'radio' || currentQuestion.type === 'select') {
                              return 'Select one option';
                            } else if (currentQuestion.type === 'yesno') {
                              return 'Choose yes or no';
                            } else {
                              return 'Please provide your answer';
                            }
                          })()}
                        </p>
                      </div>

                      {/* Question Input */}
                      <div className="pt-2">
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons - Sticky at bottom */}
          <div className="flex-shrink-0 pt-3 border-t border-border/50">
            {!canProceed && isLastQuestion && (
              <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  Please answer all required questions to continue
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {isFirstQuestion ? 'Back' : 'Previous'}
              </Button>

              <div className="flex items-center gap-3">
                {/* Skip button for optional questions */}
                {currentQuestion && !currentQuestion.required && (
                  <Button
                    variant="ghost"
                    onClick={handleNextQuestion}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Skip
                  </Button>
                )}

                <Button
                  onClick={handleNextQuestion}
                  disabled={!canProceed}
                  className="gap-2 bg-gradient-hero text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isLastQuestion ? 'Continue to Logistics' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
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

      {/* Mobile Sticky CTA - Hidden, navigation is in the card */}
    </>
  );
};
