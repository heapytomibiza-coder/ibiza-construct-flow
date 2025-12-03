/**
 * CANONICAL JOB WIZARD (v1.0 - LOCKED SPEC)
 * 7-screen tap-first wizard per locked specification
 * DO NOT modify flow without governance approval
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import constructionServicesData from '@/data/construction-services.json';
import { mapMicroIdToServiceId } from '@/lib/mappers/serviceIdMapper';
import { AnimatePresence, motion } from 'framer-motion';

import { StickyMobileCTA } from '@/components/mobile/StickyMobileCTA';
import { useIsMobile } from '@/hooks/use-mobile';
import { WizardHeader } from './WizardHeader';

import { CategorySelector } from '@/components/wizard/db-powered/CategorySelector';
import { SubcategorySelector } from '@/components/wizard/db-powered/SubcategorySelector';
import { MicroStep } from './MicroStep';
import { QuestionsStep } from './QuestionsStep';
import { LogisticsStep } from './LogisticsStep';
import { ExtrasStep } from './ExtrasStep';
import { ReviewStep } from './ReviewStep';
import { DraftRecoveryModal } from './DraftRecoveryModal';

interface WizardState {
  mainCategory: string;
  mainCategoryId: string;
  subcategory: string;
  subcategoryId: string;
  microNames: string[];
  microIds: string[];
  microUuids: string[];
  microSlugs: string[];
  answers: Record<string, any>;
  logistics: {
    location: string;
    customLocation?: string;
    startDate?: Date;
    startDatePreset?: string;
    completionDate?: Date;
    consultationType?: 'site_visit' | 'phone_call' | 'video_call';
    consultationDate?: Date;
    consultationTime?: string;
    accessDetails?: string[];
    budgetRange?: string;
  };
  extras: {
    photos: string[];
    notes?: string;
    permitsConcern?: boolean;
  };
}

const STEP_LABELS = [
  'Main Category',
  'Subcategory',
  'Micro Service',
  'Questions',
  'Logistics',
  'Extras',
  'Review'
];

const TOTAL_STEPS = STEP_LABELS.length; // 7

export const CanonicalJobWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isClient } = useAuth();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skipQuestions, setSkipQuestions] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftAge, setDraftAge] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const initialStateRef = useRef<string>('');
  
  const [wizardState, setWizardState] = useState<WizardState>({
    mainCategory: '',
    mainCategoryId: '',
    subcategory: '',
    subcategoryId: '',
    microNames: [],
    microIds: [],
    microUuids: [],
    microSlugs: [],
    answers: {},
    logistics: {
      location: '',
      budgetRange: '',
      consultationType: undefined,
    },
    extras: {
      photos: []
    }
  });


  // Restore draft on mount with modal prompt (only at start)
  useEffect(() => {
    const restoreDraft = async () => {
      if (!user) return;
      
      // Only show draft recovery if wizard is empty (at the very start)
      const isWizardEmpty = !wizardState.mainCategory && 
                           !wizardState.subcategory && 
                           wizardState.microIds.length === 0;
      
      if (!isWizardEmpty) return; // Don't interrupt mid-flow
      
      // Check if we've already shown the modal this session
      const hasSeenModal = sessionStorage.getItem('draftModalShown');
      if (hasSeenModal) return;
      
      try {
        // Try server first
        const { data } = await supabase
          .from('form_sessions')
          .select('payload, updated_at')
          .eq('user_id', user.id)
          .eq('form_type', 'job_post')
          .maybeSingle();
        
        if (data?.payload) {
          // Show modal to ask user
          setDraftAge(data.updated_at ? new Date(data.updated_at) : new Date());
          setShowDraftModal(true);
          sessionStorage.setItem('draftModalShown', 'true');
          
          // Store draft for potential resume
          sessionStorage.setItem('pendingDraft', JSON.stringify(data.payload));
          return;
        }
      } catch (err) {
        console.error('Failed to restore server draft:', err);
      }

      // Fallback to sessionStorage
      try {
        const saved = sessionStorage.getItem('wizardState');
        if (saved) {
          setDraftAge(new Date());
          setShowDraftModal(true);
          sessionStorage.setItem('draftModalShown', 'true');
          sessionStorage.setItem('pendingDraft', saved);
        }
      } catch (err) {
        console.error('Failed to restore session draft:', err);
      }
    };
    
    restoreDraft();
  }, [user, wizardState.mainCategory, wizardState.subcategory, wizardState.microIds]);

  // Track initial state for dirty detection
  useEffect(() => {
    if (initialStateRef.current === '') {
      initialStateRef.current = JSON.stringify(wizardState);
    } else {
      const currentState = JSON.stringify(wizardState);
      setIsDirty(currentState !== initialStateRef.current);
    }
  }, [wizardState]);

  // Autosave draft (debounced) with save indicator
  useEffect(() => {
    if (!user || !isDirty) return;
    
    const timer = setTimeout(async () => {
      try {
        await supabase
          .from('form_sessions')
          .upsert({
            user_id: user.id,
            form_type: 'job_post',
            payload: wizardState as any,
            updated_at: new Date().toISOString()
          });
        
        sessionStorage.setItem('wizardState', JSON.stringify(wizardState));
      } catch (err) {
        console.error('Failed to autosave:', err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [wizardState, user, isDirty]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Auto-correct illegal states
  useEffect(() => {
    if (currentStep >= 2 && !wizardState.mainCategory) {
      setCurrentStep(1);
    }
    if (currentStep >= 3 && !wizardState.subcategory) {
      setCurrentStep(2);
    }
    if (currentStep >= 4 && wizardState.microIds.length === 0) {
      setCurrentStep(3);
    }
  }, [currentStep, wizardState.mainCategory, wizardState.subcategory, wizardState.microIds]);

  const handleResumeDraft = () => {
    try {
      const draft = sessionStorage.getItem('pendingDraft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setWizardState(prev => ({
          ...prev,
          ...parsed,
          microSlugs: parsed.microSlugs || [],
          microUuids: parsed.microUuids || []
        }));
        initialStateRef.current = draft;
        setIsDirty(false);
      }
      sessionStorage.removeItem('pendingDraft');
    } catch (err) {
      console.error('Failed to resume draft:', err);
    }
    setShowDraftModal(false);
  };

  const handleStartFresh = async () => {
    try {
      if (user) {
        await supabase
          .from('form_sessions')
          .delete()
          .eq('user_id', user.id)
          .eq('form_type', 'job_post');
      }
      sessionStorage.removeItem('pendingDraft');
      sessionStorage.removeItem('wizardState');
    } catch (err) {
      console.error('Failed to clear draft:', err);
    }
    setShowDraftModal(false);
  };

  // Stable navigation callbacks
  const handleNext = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(s => {
      const nextStep = s + 1;
      // Skip step 4 if only fallback questions available
      if (nextStep === 4 && skipQuestions) {
        return 5;
      }
      return Math.min(nextStep, TOTAL_STEPS);
    });
  }, [skipQuestions]);
  
  const handleBack = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(s => {
      const prevStep = s - 1;
      // Skip step 4 when going back from step 5 if questions were skipped
      if (prevStep === 4 && skipQuestions) {
        return 3;
      }
      return Math.max(prevStep, 1);
    });
  }, [skipQuestions]);

  const handleCategorySelect = useCallback((categoryName: string, categoryId: string) => {
    console.log('🎯 CategorySelector onSelect called:', { categoryName, categoryId });
    flushSync(() => {
      setWizardState(prev => ({ 
        ...prev, 
        mainCategory: categoryName,
        mainCategoryId: categoryId,
        subcategory: '',
        subcategoryId: '',
        microNames: [], 
        microIds: [] 
      }));
    });
    setCurrentStep(2); // Auto-advance to subcategory
  }, []);

  const handleSubcategorySelect = useCallback((subcategoryName: string, subcategoryId: string) => {
    console.log('🎯 SubcategorySelector onSelect called:', { subcategoryName, subcategoryId });
    flushSync(() => {
      setWizardState(prev => ({ 
        ...prev, 
        subcategory: subcategoryName,
        subcategoryId: subcategoryId,
        microNames: [], 
        microIds: [] 
      }));
    });
    setCurrentStep(3); // Auto-advance to micro
  }, []);

  const handleMicroSelect = useCallback(async (micros: string[], microIds: string[], microSlugs: string[]) => {
    // Look up UUIDs for selected micros
    const microUuids: string[] = []
    try {
      const { buildConstructionWizardQuestions } = await import('@/lib/data/constructionQuestionBlocks')
      const { microUuid } = await buildConstructionWizardQuestions(micros)
      if (microUuid) {
        microUuids.push(microUuid)
      }
    } catch (err) {
      console.warn('Could not resolve micro UUIDs:', err)
    }

    setWizardState(prev => ({ 
      ...prev, 
      microNames: micros, 
      microIds,
      microUuids,
      microSlugs
    }));
    // Check if we should skip questions step (only fallback available)
    checkShouldSkipQuestions(microSlugs, micros);
  }, []);

  const checkShouldSkipQuestions = async (microSlugs: string[], microNames: string[]) => {
    if (microSlugs.length === 0 || microNames.length === 0) {
      setSkipQuestions(true);
      return;
    }

    try {
      const primaryMicroSlug = microSlugs[0];
      
      // Check 1: Question pack in database
      const { data: pack, error: packError } = await supabase
        .from('question_packs')
        .select('pack_id')
        .eq('micro_slug', primaryMicroSlug)
        .eq('status', 'approved')
        .eq('is_active', true)
        .maybeSingle();

      if (packError) {
        console.error('❌ Error checking question packs:', packError);
      }

      if (pack) {
        console.log('✅ Found question pack in database:', pack.pack_id, 'for micro:', primaryMicroSlug);
        setSkipQuestions(false);
        return;
      }

      console.log('ℹ️ No question pack found in database for:', primaryMicroSlug);

      // Check 2: Static JSON service definition
      const serviceId = mapMicroIdToServiceId(primaryMicroSlug);
      if (serviceId) {
        const staticService = constructionServicesData.services.find(
          s => s.id === serviceId
        );
        
        if (staticService && staticService.blocks && staticService.blocks.length > 0) {
          console.log('✅ Found questions in static JSON');
          setSkipQuestions(false);
          return;
        }
      }

      // No questions found - use generic fallback
      console.log('ℹ️ No specific questions found, will use generic fallback');
      setSkipQuestions(false); // Don't skip - fallback questions will be shown
      
    } catch (error) {
      console.error('Error checking questions:', error);
      setSkipQuestions(false); // On error, show step with fallback
    }
  };

  const handleAnswersChange = useCallback((answers: Record<string, any>) => {
    setWizardState(prev => ({ ...prev, answers }));
  }, []);

  const handleLogisticsChange = useCallback((newLogistics: WizardState['logistics']) => {
    setWizardState(prev => ({ 
      ...prev, 
      logistics: { ...prev.logistics, ...newLogistics }
    }));
  }, []);

  const handleExtrasChange = useCallback((extras: WizardState['extras']) => {
    setWizardState(prev => ({ ...prev, extras }));
  }, []);

  // Budget parsing helper
  const parseBudgetValue = (input?: string) => {
    if (!input) return null;
    const cleaned = input.replace(/[^0-9.,]/g, '').replace(',', '.');
    const match = cleaned.match(/^\d+(\.\d+)?$/);
    return match ? Number(match[0]) : null;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to post a job');
      navigate('/auth');
      return;
    }

    if (wizardState.microIds.length === 0) {
      toast.error('Please select at least one service before submitting');
      return;
    }

    setLoading(true);
    try {
      const budgetValue = parseBudgetValue(wizardState.logistics.budgetRange);
      // Use 'fixed' for ranges (actual range stored in answers.logistics.budgetRange)
      const budgetType = wizardState.logistics.budgetRange ? 'fixed' : 'hourly';
      
      // Combine micro names for title
      const combinedTitle = wizardState.microNames.join(' + ');
      // Use first micro ID and UUID
      const primaryMicroId = wizardState.microIds[0];
      const primaryMicroUuid = wizardState.microUuids[0] || null;

      const { data: newJob, error } = await supabase
        .from('jobs')
        .insert([{
          client_id: user.id,
          micro_id: primaryMicroId,
          title: combinedTitle,
          description: wizardState.extras.notes || `${combinedTitle} - ${wizardState.mainCategory} / ${wizardState.subcategory}`,
          answers: {
            microAnswers: wizardState.answers,
            selectedMicros: wizardState.microNames,
            selectedMicroIds: wizardState.microIds,
            logistics: {
              ...wizardState.logistics,
              startDate: wizardState.logistics.startDate?.toISOString(),
              completionDate: wizardState.logistics.completionDate?.toISOString(),
              consultationDate: wizardState.logistics.consultationDate?.toISOString()
            },
            extras: {
              photos: wizardState.extras.photos,
              permitsConcern: wizardState.extras.permitsConcern
            }
          },
          budget_type: budgetType,
          budget_value: budgetValue,
          location: {
            address: wizardState.logistics.location,
            customLocation: wizardState.logistics.customLocation,
            startDate: wizardState.logistics.startDate?.toISOString(),
            completionDate: wizardState.logistics.completionDate?.toISOString()
          },
          status: 'open'
        }])
        .select()
        .single();

      if (error) throw error;

      // Clear draft after successful post
      try {
        await supabase
          .from('form_sessions')
          .delete()
          .eq('user_id', user.id)
          .eq('form_type', 'job_post');
      } catch {}
      
      try {
        sessionStorage.removeItem('wizardState');
      } catch {}

      // Trigger professional notifications (non-blocking)
      supabase.functions.invoke('notify-job-broadcast', {
        body: { jobId: newJob.id }
      }).catch(err => console.warn('Notification dispatch failed:', err));

      toast.success('Job Posted Successfully!', {
        description: 'Your job is now live. Pro & Premium professionals have been notified.',
        duration: 5000
      });
      
      // Navigate to job board with highlight
      navigate(`/job-board?highlight=${newJob.id}`);
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    try {
      switch (currentStep) {
      case 1:
        return (
          <div id="wizard-step-category" className="max-w-6xl mx-auto space-y-4">
            <div className="text-center space-y-2 py-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                What type of work do you need?
              </h1>
              <p className="text-sm text-muted-foreground">
                Choose your category
              </p>
            </div>
            <CategorySelector
              selectedCategory={wizardState.mainCategory}
              onSelect={handleCategorySelect}
              onNext={handleNext}
            />
          </div>
        );

      case 2:
        if (!wizardState.mainCategory || !wizardState.mainCategoryId) {
          return <div className="text-center text-red-500">Error: No category selected. Please go back.</div>;
        }
        return (
          <div id="wizard-step-subcategory">
            <SubcategorySelector
              key={`sub:${wizardState.mainCategoryId || 'none'}`}
              categoryId={wizardState.mainCategoryId}
              categoryName={wizardState.mainCategory}
              selectedSubcategoryId={wizardState.subcategoryId}
              onSelect={handleSubcategorySelect}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        );

      case 3:
        return (
          <div id="wizard-step-micro">
            <MicroStep
              key={`micro:${wizardState.mainCategory}|${wizardState.subcategory || 'none'}`}
              mainCategory={wizardState.mainCategory}
              subcategory={wizardState.subcategory}
              selectedMicros={wizardState.microNames}
              selectedMicroIds={wizardState.microIds}
              selectedMicroSlugs={wizardState.microSlugs}
              onSelect={handleMicroSelect}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        );

      case 4:
        return (
          <div id="wizard-step-questions">
            <QuestionsStep
              microIds={wizardState.microIds}
              microSlugs={wizardState.microSlugs}
              microNames={wizardState.microNames}
              category={wizardState.mainCategory}
              subcategory={wizardState.subcategory}
              answers={wizardState.answers}
              onAnswersChange={handleAnswersChange}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        );

      case 5:
        return (
          <div id="wizard-step-logistics">
            <LogisticsStep
              microName={wizardState.microNames.join(' + ')}
              logistics={wizardState.logistics}
              onLogisticsChange={handleLogisticsChange}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        );

      case 6:
        return (
          <div id="wizard-step-extras">
            <ExtrasStep
              microName={wizardState.microNames.join(' + ')}
              extras={wizardState.extras}
              onExtrasChange={handleExtrasChange}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        );

      case 7:
        // Build questionsWithAnswers with full question context
        const questionsWithAnswers = Object.entries(wizardState.answers || {}).map(([key, answer]) => {
          const humanizedKey = key
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
          
          return {
            key,
            question: humanizedKey,
            answer,
            type: 'text',
            category: 'project-details'
          };
        });

        return (
          <div id="wizard-step-review">
            <ReviewStep
              jobData={{
                microName: wizardState.microNames.join(' + '),
                category: wizardState.mainCategory,
                subcategory: wizardState.subcategory,
                answers: wizardState.answers,
                questionsWithAnswers,
                logistics: wizardState.logistics,
                extras: wizardState.extras
              }}
              onBack={handleBack}
              onSubmit={handleSubmit}
              loading={loading}
              onEditSection={(sectionId) => {
                console.log('Edit section:', sectionId);
                // Navigate back to relevant step based on sectionId
                if (sectionId === 'logistics') setCurrentStep(5);
                else if (sectionId === 'questions') setCurrentStep(4);
                else if (sectionId === 'basics') setCurrentStep(3);
              }}
            />
          </div>
        );

      default:
        return (
          <div role="alert" className="text-center py-12">
            <p className="text-destructive">Wizard error: unknown step "{currentStep}"</p>
            <Button onClick={() => setCurrentStep(1)} className="mt-4">
              Restart Wizard
            </Button>
          </div>
        );
    }
    } catch (error) {
      console.error('Wizard render error:', error);
      return (
        <div role="alert" className="text-center py-12">
          <p className="text-destructive">Something went wrong loading the wizard.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
          </Button>
        </div>
      );
    }
  };

  const canProceed = (): { can: boolean; reason?: string } => {
    switch (currentStep) {
      case 1: 
        return { can: !!wizardState.mainCategory, reason: 'Please select a category' };
      case 2: 
        return { can: !!wizardState.subcategory, reason: 'Please select a subcategory' };
      case 3: 
        return { can: wizardState.microIds.length > 0, reason: 'Please select at least one service' };
      case 4: 
        return { can: true }; // Questions are optional
      case 5: 
        return { 
          can: !!wizardState.logistics.location?.trim(), 
          reason: 'Please provide a location for the job' 
        };
      case 6: 
        return { can: true }; // Extras are optional
      case 7: 
        return { can: true };
      default: 
        return { can: false };
    }
  };

  // Helper to check if user can navigate to a step
  const canNavigateToStep = useCallback((step: number): boolean => {
    if (step >= currentStep) return false; // Can't jump forward
    if (step < 1) return false;
    
    // Can always go back to completed steps
    return step < currentStep;
  }, [currentStep]);

  // Handler for clicking on step pills
  const handleStepNavigation = useCallback((step: number) => {
    if (canNavigateToStep(step)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep(step);
    }
  }, [canNavigateToStep]);

  return (
    <>
      {/* Draft Recovery Modal */}
      <DraftRecoveryModal
        open={showDraftModal}
        draftAge={draftAge}
        onResume={handleResumeDraft}
        onStartFresh={handleStartFresh}
      />

      <div id="job-wizard-root" className="h-screen bg-gradient-to-b from-sage-muted-light via-background to-sage-muted/30 overflow-hidden flex flex-col">
        {/* Enhanced Header with Navigation */}
        <div className="flex-shrink-0">
          <WizardHeader
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            stepLabels={STEP_LABELS}
            onStepClick={handleStepNavigation}
            canNavigateToStep={canNavigateToStep}
            wizardState={{
              mainCategory: wizardState.mainCategory,
              subcategory: wizardState.subcategory,
              microNames: wizardState.microNames
            }}
          />
        </div>

        {/* Step Content with Animations */}
        <div className="container mx-auto px-4 py-4 flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Sticky CTA */}
        {isMobile && (
          <div>
            {!canProceed().can && canProceed().reason && (
              <div className="bg-white/95 backdrop-blur-sm border-t border-sage-muted/40 px-4 py-2 text-center">
                <p className="text-sm text-muted-foreground">
                  {canProceed().reason}
                </p>
              </div>
            )}
            <StickyMobileCTA
              primaryAction={{
                label: currentStep === 7 ? 'Post Job' : 'Continue',
                onClick: currentStep === 7 ? handleSubmit : handleNext,
                disabled: !canProceed().can || (currentStep === 7 && loading),
                loading: currentStep === 7 && loading
              }}
              secondaryAction={currentStep > 1 ? {
                label: 'Back',
                onClick: handleBack
              } : undefined}
            />
          </div>
        )}
      </div>
    </>
  );
};
