/**
 * CANONICAL JOB WIZARD (v1.0 - LOCKED SPEC)
 * 8-screen tap-first wizard per locked specification
 * DO NOT modify flow without governance approval
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

import { StickyMobileCTA } from '@/components/mobile/StickyMobileCTA';
import { useIsMobile } from '@/hooks/use-mobile';

import { MainCategoryStep } from './MainCategoryStep';
import { SubcategoryStep } from './SubcategoryStep';
import { MicroStep } from './MicroStep';
import { QuestionsStep } from './QuestionsStep';
import { LogisticsStep } from './LogisticsStep';
import { ExtrasStep } from './ExtrasStep';
import { ReviewStep } from './ReviewStep';

interface WizardState {
  mainCategory: string;
  subcategory: string;
  microName: string;
  microId: string;
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
  'Review',
  'Done'
];

export const CanonicalJobWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [wizardState, setWizardState] = useState<WizardState>({
    mainCategory: '',
    subcategory: '',
    microName: '',
    microId: '',
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

  const progress = (currentStep / 8) * 100;

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.min(prev + 1, 8));
  };
  
  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to post a job');
      navigate('/signin');
      return;
    }

    if (!wizardState.microId) {
      toast.error('Please select a service before submitting');
      return;
    }

    setLoading(true);
    try {
      const { data: newJob, error } = await supabase
        .from('jobs')
        .insert([{
          client_id: user.id,
          micro_id: wizardState.microId,
          title: wizardState.microName,
          description: wizardState.extras.notes || `${wizardState.microName} - ${wizardState.mainCategory} / ${wizardState.subcategory}`,
          answers: {
            microAnswers: wizardState.answers,
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
          budget_type: wizardState.logistics.budgetRange ? 'fixed' : 'hourly',
          budget_value: null,
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

      // Trigger professional notifications (non-blocking)
      supabase.functions.invoke('notify-job-broadcast', {
        body: { jobId: newJob.id }
      }).catch(err => console.warn('Notification dispatch failed:', err));

      toast.success('Job posted successfully! Professionals will start submitting quotes soon.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MainCategoryStep
            selectedCategory={wizardState.mainCategory}
            onSelect={(category) => setWizardState(prev => ({ ...prev, mainCategory: category }))}
            onNext={handleNext}
          />
        );

      case 2:
        return (
          <SubcategoryStep
            mainCategory={wizardState.mainCategory}
            selectedSubcategory={wizardState.subcategory}
            onSelect={(sub) => setWizardState(prev => ({ ...prev, subcategory: sub }))}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 3:
        return (
          <MicroStep
            mainCategory={wizardState.mainCategory}
            subcategory={wizardState.subcategory}
            selectedMicro={wizardState.microName}
            selectedMicroId={wizardState.microId}
            onSelect={(micro, microId) => 
              setWizardState(prev => ({ ...prev, microName: micro, microId }))
            }
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 4:
        return (
          <QuestionsStep
            microId={wizardState.microId}
            microName={wizardState.microName}
            answers={wizardState.answers}
            onAnswersChange={(answers) => setWizardState(prev => ({ ...prev, answers }))}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 5:
        return (
          <LogisticsStep
            microName={wizardState.microName}
            logistics={wizardState.logistics}
            onLogisticsChange={(newLogistics) => {
              setWizardState(prev => ({ 
                ...prev, 
                logistics: { ...prev.logistics, ...newLogistics }
              }));
            }}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 6:
        return (
          <ExtrasStep
            microName={wizardState.microName}
            extras={wizardState.extras}
            onExtrasChange={(extras) => setWizardState(prev => ({ ...prev, extras }))}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 7:
        return (
          <ReviewStep
            jobData={{
              microName: wizardState.microName,
              category: wizardState.mainCategory,
              subcategory: wizardState.subcategory,
              answers: wizardState.answers,
              logistics: wizardState.logistics,
              extras: wizardState.extras
            }}
            onBack={handleBack}
            onSubmit={handleSubmit}
            loading={loading}
          />
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!wizardState.mainCategory;
      case 2: return !!wizardState.subcategory;
      case 3: return !!wizardState.microId;
      case 4: return true; // Questions are optional
      case 5: return !!wizardState.logistics.location;
      case 6: return true; // Extras are optional
      case 7: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24 md:pb-0">
      {/* Header with Progress */}
      <div className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-charcoal">Post a Job</h2>
            <Badge variant="outline">
              Step {currentStep} of 8
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-3">
            {STEP_LABELS[currentStep - 1]}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-8">
        {renderStep()}
      </div>

      {/* Mobile Sticky CTA */}
      {isMobile && currentStep < 8 && (
        <StickyMobileCTA
          primaryAction={{
            label: currentStep === 7 ? 'Post Job' : 'Continue',
            onClick: currentStep === 7 ? handleSubmit : handleNext,
            disabled: !canProceed(),
            loading: loading
          }}
          secondaryAction={currentStep > 1 ? {
            label: 'Back',
            onClick: handleBack
          } : undefined}
        />
      )}
    </div>
  );
};
