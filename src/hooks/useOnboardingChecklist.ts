import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type OnboardingStep = 
  | 'profile_basic' 
  | 'verification' 
  | 'services' 
  | 'availability' 
  | 'portfolio' 
  | 'payment_setup';

export interface ChecklistItem {
  id: string;
  professional_id: string;
  step: OnboardingStep;
  completed_at: string | null;
  skipped: boolean;
  started_at: string | null;
  created_at: string;
}

export const useOnboardingChecklist = () => {
  const { user } = useAuth();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Fetch checklist data
  const fetchChecklist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_checklist')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Initialize checklist if it doesn't exist
        await initializeChecklist();
      } else {
        setChecklist(data);
        calculateProgress(data);
      }
    } catch (error: any) {
      console.error('Error fetching checklist:', error);
      toast.error('Failed to load onboarding progress');
    } finally {
      setLoading(false);
    }
  };

  // Initialize checklist with all steps
  const initializeChecklist = async () => {
    if (!user) return;

    const steps: OnboardingStep[] = [
      'profile_basic',
      'verification',
      'services',
      'availability',
      'portfolio',
      'payment_setup'
    ];

    try {
      const records = steps.map(step => ({
        professional_id: user.id,
        step,
        skipped: false
      }));

      const { data, error } = await supabase
        .from('onboarding_checklist')
        .insert(records)
        .select();

      if (error) throw error;

      setChecklist(data || []);
      calculateProgress(data || []);
      
      // Log initialization event
      await logEvent('checklist_initialized', null);
    } catch (error: any) {
      console.error('Error initializing checklist:', error);
      toast.error('Failed to initialize onboarding checklist');
    }
  };

  // Mark step as complete
  const markStepComplete = async (step: OnboardingStep) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('onboarding_checklist')
        .update({ 
          completed_at: new Date().toISOString(),
          started_at: new Date().toISOString() // Ensure started_at is set
        })
        .eq('professional_id', user.id)
        .eq('step', step);

      if (error) throw error;

      await logEvent('step_completed', step);
      await fetchChecklist(); // Refresh data
      
      toast.success(`${getStepTitle(step)} completed!`);
    } catch (error: any) {
      console.error('Error marking step complete:', error);
      toast.error('Failed to update progress');
    }
  };

  // Mark step as started
  const markStepStarted = async (step: OnboardingStep) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('onboarding_checklist')
        .update({ started_at: new Date().toISOString() })
        .eq('professional_id', user.id)
        .eq('step', step)
        .is('started_at', null);

      if (error) throw error;

      await logEvent('step_started', step);
      await fetchChecklist();
    } catch (error: any) {
      console.error('Error marking step started:', error);
    }
  };

  // Skip step
  const skipStep = async (step: OnboardingStep) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('onboarding_checklist')
        .update({ skipped: true })
        .eq('professional_id', user.id)
        .eq('step', step);

      if (error) throw error;

      await logEvent('step_skipped', step);
      await fetchChecklist();
      
      toast.info(`${getStepTitle(step)} skipped`);
    } catch (error: any) {
      console.error('Error skipping step:', error);
      toast.error('Failed to skip step');
    }
  };

  // Log event to onboarding_events table
  const logEvent = async (eventType: string, step: OnboardingStep | null) => {
    if (!user) return;

    try {
      await supabase
        .from('onboarding_events')
        .insert({
          professional_id: user.id,
          event_type: eventType,
          step,
          metadata: {}
        });
    } catch (error) {
      console.error('Error logging event:', error);
    }
  };

  // Calculate completion percentage
  const calculateProgress = (items: ChecklistItem[]) => {
    const completedCount = items.filter(item => 
      item.completed_at || item.skipped
    ).length;
    const percentage = Math.round((completedCount / items.length) * 100);
    setCompletionPercentage(percentage);
  };

  // Get next incomplete step
  const getNextIncompleteStep = (): OnboardingStep | null => {
    const incomplete = checklist.find(item => 
      !item.completed_at && !item.skipped
    );
    return incomplete?.step || null;
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    fetchChecklist();

    const channel = supabase
      .channel('onboarding-checklist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'onboarding_checklist',
          filter: `professional_id=eq.${user.id}`
        },
        () => {
          fetchChecklist();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    checklist,
    loading,
    completionPercentage,
    markStepComplete,
    markStepStarted,
    skipStep,
    getNextIncompleteStep,
    refreshChecklist: fetchChecklist
  };
};

// Helper function to get step titles
const getStepTitle = (step: OnboardingStep): string => {
  const titles: Record<OnboardingStep, string> = {
    profile_basic: 'Basic Profile',
    verification: 'Identity Verification',
    services: 'Services Setup',
    availability: 'Availability',
    portfolio: 'Portfolio',
    payment_setup: 'Payment Setup'
  };
  return titles[step];
};
