/**
 * CANONICAL JOB WIZARD (v1.0 - LOCKED SPEC)
 * 7-screen tap-first wizard per locked specification
 * DO NOT modify flow without governance approval
 */
import React, { useState, useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

import { StickyMobileCTA } from '@/components/mobile/StickyMobileCTA';
import { useIsMobile } from '@/hooks/use-mobile';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

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
  'Review'
];

const TOTAL_STEPS = STEP_LABELS.length; // 7

export const CanonicalJobWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isClient } = useAuth();
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


  // Restore draft on mount (server + sessionStorage fallback)
  useEffect(() => {
    const restoreDraft = async () => {
      if (!user) return;
      
      try {
        // Try server first
        const { data } = await supabase
          .from('form_sessions')
          .select('payload')
          .eq('user_id', user.id)
          .eq('form_type', 'job_post')
          .maybeSingle();
        
        if (data?.payload) {
          setWizardState(data.payload as unknown as WizardState);
          return;
        }
      } catch (err) {
        console.error('Failed to restore server draft:', err);
      }

      // Fallback to sessionStorage
      try {
        const saved = sessionStorage.getItem('wizardState');
        if (saved) {
          const parsed = JSON.parse(saved);
          setWizardState(prev => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.error('Failed to restore session draft:', err);
      }
    };
    
    restoreDraft();
  }, [user]);

  // Autosave draft (debounced)
  useEffect(() => {
    if (!user) return;
    
    const timer = setTimeout(async () => {
      // Save to server
      try {
        await supabase
          .from('form_sessions')
          .upsert({
            user_id: user.id,
            form_type: 'job_post',
            payload: wizardState as any
          });
      } catch (err) {
        console.error('Failed to autosave draft:', err);
      }
      
      // Backup to sessionStorage
      try {
        sessionStorage.setItem('wizardState', JSON.stringify(wizardState));
      } catch (err) {
        console.error('Failed to save session draft:', err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [wizardState, user]);

  // Auto-correct illegal states
  useEffect(() => {
    if (currentStep >= 2 && !wizardState.mainCategory) {
      setCurrentStep(1);
    }
    if (currentStep >= 3 && !wizardState.subcategory) {
      setCurrentStep(2);
    }
    if (currentStep >= 4 && !wizardState.microId) {
      setCurrentStep(3);
    }
  }, [currentStep, wizardState.mainCategory, wizardState.subcategory, wizardState.microId]);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  // Stable navigation callbacks
  const handleNext = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS));
  }, []);
  
  const handleBack = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(s => Math.max(s - 1, 1));
  }, []);

  // Stable updaters for wizardState (all defined at top level)
  const handleCategorySelect = useCallback((category: string) => {
    console.log('🎯 MainCategoryStep onSelect called:', category);
    flushSync(() => {
      setWizardState(prev => ({ 
        ...prev, 
        mainCategory: category, 
        subcategory: '', 
        microName: '', 
        microId: '' 
      }));
    });
    setCurrentStep(2); // Auto-advance to subcategory
  }, []);

  const handleSubcategorySelect = useCallback((sub: string) => {
    flushSync(() => {
      setWizardState(prev => ({ 
        ...prev, 
        subcategory: sub, 
        microName: '', 
        microId: '' 
      }));
    });
    setCurrentStep(3); // Auto-advance to micro
  }, []);

  const handleMicroSelect = useCallback((micro: string, microId: string) => {
    setWizardState(prev => ({ 
      ...prev, 
      microName: micro, 
      microId 
    }));
  }, []);

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

    if (!wizardState.microId) {
      toast.error('Please select a service before submitting');
      return;
    }

    setLoading(true);
    try {
      const budgetValue = parseBudgetValue(wizardState.logistics.budgetRange);
      // Use 'fixed' for ranges (actual range stored in answers.logistics.budgetRange)
      const budgetType = wizardState.logistics.budgetRange ? 'fixed' : 'hourly';

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
          <MainCategoryStep
            selectedCategory={wizardState.mainCategory}
            onSelect={handleCategorySelect}
            onNext={handleNext}
          />
        );

      case 2:
        if (!wizardState.mainCategory) {
          return <div className="text-center text-red-500">Error: No category selected. Please go back.</div>;
        }
        return (
          <SubcategoryStep
            key={`sub:${wizardState.mainCategory || 'none'}`}
            mainCategory={wizardState.mainCategory}
            selectedSubcategory={wizardState.subcategory}
            onSelect={handleSubcategorySelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 3:
        return (
          <MicroStep
            key={`micro:${wizardState.mainCategory}|${wizardState.subcategory || 'none'}`}
            mainCategory={wizardState.mainCategory}
            subcategory={wizardState.subcategory}
            selectedMicro={wizardState.microName}
            selectedMicroId={wizardState.microId}
            onSelect={handleMicroSelect}
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
            onAnswersChange={handleAnswersChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 5:
        return (
          <LogisticsStep
            microName={wizardState.microName}
            logistics={wizardState.logistics}
            onLogisticsChange={handleLogisticsChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 6:
        return (
          <ExtrasStep
            microName={wizardState.microName}
            extras={wizardState.extras}
            onExtrasChange={handleExtrasChange}
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
        return { can: !!wizardState.microId, reason: 'Please select a specific service' };
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24 md:pb-0">
      {/* Header with Progress */}
      <div className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs 
            items={[
              { label: 'Dashboard', href: '/dashboard/client' },
              { label: 'Post Job' }
            ]}
            className="mb-4"
          />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-charcoal">Post a Job</h2>
            <Badge variant="outline">
              Step {currentStep} of {TOTAL_STEPS}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-3" aria-live="polite">
            {STEP_LABELS[currentStep - 1]}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-8">
        {renderStep()}
      </div>

      {/* Mobile Sticky CTA */}
      {isMobile && currentStep < TOTAL_STEPS && (
        <div>
          <StickyMobileCTA
            primaryAction={{
              label: currentStep === 7 ? 'Post Job' : 'Continue',
              onClick: currentStep === 7 ? handleSubmit : handleNext,
              disabled: !canProceed().can,
              loading: loading
            }}
            secondaryAction={currentStep > 1 ? {
              label: 'Back',
              onClick: handleBack
            } : undefined}
          />
          {!canProceed().can && canProceed().reason && (
            <div className="fixed bottom-20 left-0 right-0 text-center">
              <p className="text-sm text-muted-foreground bg-card/90 backdrop-blur-sm px-4 py-2 mx-4 rounded-lg border">
                {canProceed().reason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
