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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
      // Create job posting
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
            location: wizardState.location
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
