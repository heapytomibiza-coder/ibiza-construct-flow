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
    preferredDate?: Date;
    datePreset?: string;
    timeWindow?: string;
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
      budgetRange: ''
    },
    extras: {
      photos: []
    }
  });

  const progress = (currentStep / 8) * 100;

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 8));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to post a job');
      navigate('/signin');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          client_id: user.id,
          service_id: wizardState.microId,
          title: wizardState.microName,
          description: wizardState.extras.notes || 'Job description',
          micro_q_answers: wizardState.answers,
          general_answers: {
            location: wizardState.logistics.location,
            customLocation: wizardState.logistics.customLocation,
            preferredDate: wizardState.logistics.preferredDate?.toISOString(),
            datePreset: wizardState.logistics.datePreset,
            timeWindow: wizardState.logistics.timeWindow,
            accessDetails: wizardState.logistics.accessDetails,
            budgetRange: wizardState.logistics.budgetRange,
            photos: wizardState.extras.photos,
            permitsConcern: wizardState.extras.permitsConcern
          },
          location_details: wizardState.logistics.location,
          budget_range: wizardState.logistics.budgetRange,
          status: 'posted',
          micro_slug: `${wizardState.mainCategory}-${wizardState.subcategory}-${wizardState.microName}`
            .toLowerCase()
            .replace(/\s+/g, '-'),
          catalogue_version_used: 1,
          locale: 'en',
          origin: 'web'
        }])
        .select()
        .single();

      if (error) throw error;

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
            onLogisticsChange={(logistics) => setWizardState(prev => ({ ...prev, logistics }))}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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
    </div>
  );
};
