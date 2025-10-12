/**
 * ============================================
 * DEFINITIVE JOB POSTING WIZARD
 * ============================================
 * 
 * CRITICAL: This is the CORE component for job posting.
 * DO NOT modify this flow without comprehensive testing.
 * 
 * Flow:
 * Step 1: Visual Category Selection (category → subcategory → micro)
 * Step 2: AI Questions (auto-generate title + 5-7 targeted questions)
 * Step 3: Location & Timing (where, when, urgency)
 * Step 4: Professional Review (AI-generated job card)
 * 
 * Version: 1.0.0 - Definitive Implementation
 * Last Updated: 2025
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Circle, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWizardAutosave } from '@/hooks/useWizardAutosave';

import VisualCategoryStep from './steps/VisualCategoryStep';
import AIQuestionsStep from './steps/AIQuestionsStep';
import LocationTimingStep from './steps/LocationTimingStep';
import ProfessionalReviewStep from './steps/ProfessionalReviewStep';

interface JobWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

interface WizardState {
  // Step 1: Category Selection
  selectedCategory: string;
  selectedSubcategory: string;
  selectedMicro: string;
  selectedMicroId: string;
  categoryName: string;
  microName: string;
  
  // Step 2: AI Questions
  jobTitle: string;
  aiAnswers: Record<string, any>;
  photos: string[];
  
  // Step 3: Location & Timing
  location: string;
  coordinates?: { lat: number; lng: number };
  preferredDate?: string;
  urgency: 'flexible' | 'within_week' | 'urgent' | 'asap';
  
  // Step 4: Review (AI-generated)
  professionalDescription?: string;
}

export const DefinitiveJobWizard: React.FC<JobWizardProps> = ({ onComplete, onCancel }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>({
    selectedCategory: '',
    selectedSubcategory: '',
    selectedMicro: '',
    selectedMicroId: '',
    categoryName: '',
    microName: '',
    jobTitle: '',
    aiAnswers: {},
    photos: [],
    location: '',
    urgency: 'flexible'
  });

  // Autosave integration
  const { loadDraft, clearDraft, hasDraft } = useWizardAutosave(wizardState, {
    key: 'job-wizard-draft',
    debounceMs: 2000,
    showToast: false
  });

  // Check for saved draft on mount
  useEffect(() => {
    if (hasDraft()) {
      setShowDraftPrompt(true);
    }
  }, []);

  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setWizardState(prev => ({ ...prev, ...draft }));
      toast.success('Draft restored');
    }
    setShowDraftPrompt(false);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftPrompt(false);
    toast.info('Draft discarded');
  };

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, label: t('wizard.steps.category.title') },
    { number: 2, label: t('wizard.steps.aiQuestions.title') },
    { number: 3, label: t('wizard.steps.location.title') },
    { number: 4, label: t('wizard.steps.review.title') }
  ];

  const updateState = (updates: Partial<WizardState>) => {
    setWizardState(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to post a job');
      navigate('/signin');
      return;
    }

    setLoading(true);
    try {
      // Create job posting with 20% AI hints in JSON
      const jobCardJson = {
        // Core data
        title: wizardState.jobTitle,
        category: wizardState.selectedCategory,
        subcategory: wizardState.selectedSubcategory,
        microService: wizardState.selectedMicro,
        
        // Answers (80%)
        answers: wizardState.aiAnswers,
        location: wizardState.location,
        urgency: wizardState.urgency,
        preferredDate: wizardState.preferredDate,
        
        // AI Hints (20%) - Help matching algorithm
        aiHints: {
          hasNotSureAnswers: Object.values(wizardState.aiAnswers).includes('not_sure'),
          completionRate: calculateCompletionRate(wizardState.aiAnswers),
          urgencyScore: urgencyToScore(wizardState.urgency),
          photoCount: wizardState.photos.length,
          confidence: calculateConfidenceScore(wizardState.aiAnswers)
        }
      };

      const { data: job, error } = await supabase
        .from('bookings')
        .insert([{
          client_id: user.id,
          service_id: wizardState.selectedMicroId,
          title: wizardState.jobTitle,
          description: wizardState.professionalDescription || 'Job description',
          micro_q_answers: wizardState.aiAnswers,
          general_answers: {
            urgency: wizardState.urgency,
            preferred_date: wizardState.preferredDate,
            location: wizardState.location,
            job_card_json: jobCardJson // Store complete job card with AI hints
          },
          status: 'posted',
          micro_slug: `${wizardState.selectedCategory}-${wizardState.selectedSubcategory}-${wizardState.selectedMicro}`
            .toLowerCase()
            .replace(/\s+/g, '-'),
          catalogue_version_used: 1,
          locale: 'en',
          origin: 'web'
        }])
        .select()
        .single();

      if (error) throw error;

      // Notify matching professionals
      try {
        console.log('🔔 Notifying matching professionals...');
        const micro_slug = `${wizardState.selectedCategory}-${wizardState.selectedSubcategory}-${wizardState.selectedMicro}`
          .toLowerCase()
          .replace(/\s+/g, '-');
        
        const { data: notifyData, error: notifyError } = await supabase.functions.invoke(
          'notify-matching-pros',
          {
            body: {
              job_id: job.id,
              micro_slug,
              title: wizardState.jobTitle,
              description: wizardState.professionalDescription || 'Job description',
              location: wizardState.location,
            },
          }
        );

        if (notifyError) {
          console.error('⚠️ Notification error (non-blocking):', notifyError);
        } else {
          console.log('✅ Notified professionals:', notifyData);
        }
      } catch (notifyErr) {
        console.error('⚠️ Failed to notify professionals (non-blocking):', notifyErr);
      }

      // Clear draft after successful submission
      clearDraft();
      toast.success(t('wizard.messages.jobPostedSuccess'));
      
      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error(t('wizard.messages.jobPostFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for AI hints
  const calculateCompletionRate = (answers: Record<string, any>): number => {
    const totalAnswers = Object.keys(answers).length;
    const notSureCount = Object.values(answers).filter(v => v === 'not_sure').length;
    if (totalAnswers === 0) return 0;
    return Math.round(((totalAnswers - notSureCount) / totalAnswers) * 100);
  };

  const urgencyToScore = (urgency: string): number => {
    const scores = { flexible: 1, within_week: 2, urgent: 3, asap: 4 };
    return scores[urgency as keyof typeof scores] || 1;
  };

  const calculateConfidenceScore = (answers: Record<string, any>): number => {
    const totalAnswers = Object.keys(answers).length;
    const notSureCount = Object.values(answers).filter(v => v === 'not_sure').length;
    const completedCount = totalAnswers - notSureCount;
    
    if (totalAnswers === 0) return 0;
    return Math.round((completedCount / totalAnswers) * 100);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <VisualCategoryStep
            selectedCategory={wizardState.selectedCategory}
            selectedSubcategory={wizardState.selectedSubcategory}
            selectedMicro={wizardState.selectedMicro}
            onSelect={(category, subcategory, micro, microId) => {
              updateState({
                selectedCategory: category,
                selectedSubcategory: subcategory,
                selectedMicro: micro,
                selectedMicroId: microId,
                categoryName: category,
                microName: micro,
                jobTitle: micro // Auto-set title from micro
              });
            }}
            onNext={handleNext}
          />
        );
      
      case 2:
        return (
          <AIQuestionsStep
            microId={wizardState.selectedMicroId}
            microName={wizardState.selectedMicro}
            category={wizardState.selectedCategory}
            subcategory={wizardState.selectedSubcategory}
            jobTitle={wizardState.jobTitle}
            answers={wizardState.aiAnswers}
            photos={wizardState.photos}
            location={wizardState.location}
            onTitleChange={(title) => updateState({ jobTitle: title })}
            onAnswersChange={(answers) => updateState({ aiAnswers: answers })}
            onPhotosChange={(photos) => updateState({ photos })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      
      case 3:
        return (
          <LocationTimingStep
            location={wizardState.location}
            urgency={wizardState.urgency}
            preferredDate={wizardState.preferredDate}
            onLocationChange={(location, coords) => 
              updateState({ location, coordinates: coords })
            }
            onUrgencyChange={(urgency) => updateState({ urgency })}
            onDateChange={(date) => updateState({ preferredDate: date })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      
      case 4:
        return (
          <ProfessionalReviewStep
            wizardState={wizardState}
            onDescriptionGenerated={(description) => 
              updateState({ professionalDescription: description })
            }
            onSubmit={handleSubmit}
            onBack={handleBack}
            loading={loading}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Draft Restore Prompt */}
      {showDraftPrompt && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Alert className="max-w-md border-primary shadow-lg">
            <Save className="h-5 w-5 text-primary" />
            <AlertDescription className="mt-2">
              <h3 className="font-semibold text-lg mb-2">Draft Found</h3>
              <p className="text-muted-foreground mb-4">
                You have an unfinished job post. Would you like to continue where you left off?
              </p>
              <div className="flex gap-3">
                <Button onClick={handleRestoreDraft} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore Draft
                </Button>
                <Button onClick={handleDiscardDraft} variant="outline" className="flex-1">
                  Start Fresh
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header with Progress */}
      <div className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  {currentStep > step.number ? (
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : currentStep === step.number ? (
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pulse">
                      {step.number}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                      <Circle className="w-6 h-6" />
                    </div>
                  )}
                  <span className={`text-xs mt-2 font-medium ${
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {step.number < totalSteps && (
                  <div className={`hidden md:block w-16 h-0.5 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-8">
        {renderStep()}
      </div>
    </div>
  );
};

export default DefinitiveJobWizard;
