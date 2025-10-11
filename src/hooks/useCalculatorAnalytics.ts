import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CalculatorSelections } from '@/components/calculator/hooks/useCalculatorState';

export function useCalculatorAnalytics(sessionId: string) {
  const trackEvent = useCallback(async (
    eventType: string,
    selections: CalculatorSelections,
    stepNumber?: number,
    additionalData?: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Get view mode from localStorage
      const viewMode = localStorage.getItem('calculator_view_mode') || 'wizard';

      await (supabase as any).from('calculator_analytics').insert({
        session_id: sessionId,
        user_id: user?.id || null,
        event_type: eventType,
        event_data: {
          selections,
          view_mode: viewMode,
          ...additionalData
        },
        step_number: stepNumber,
        project_type: selections.projectType
      });
    } catch (error) {
      // Silent fail - don't interrupt user experience
      console.error('Analytics tracking error:', error);
    }
  }, [sessionId]);

  return { trackEvent };
}
