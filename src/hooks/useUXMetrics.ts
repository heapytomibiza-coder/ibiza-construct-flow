import { useCallback, useEffect, useRef } from 'react';
import { useAnalyticsDashboard } from './useAnalyticsDashboard';

export interface WizardStepMetrics {
  step: number;
  stepName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  abandoned?: boolean;
  validationErrors?: string[];
}

export interface UXMetrics {
  wizardFunnel: {
    stepViews: Record<number, number>;
    stepCompletions: Record<number, number>;
    dropoffRate: Record<number, number>;
  };
  formInteractions: {
    fieldFocuses: Record<string, number>;
    validationErrors: Record<string, number>;
  };
  trustSignals: {
    badgeHovers: number;
    escrowViews: number;
    reviewExpansions: number;
  };
  performance: {
    averageTimePerStep: Record<number, number>;
    totalWizardTime: number;
  };
}

export const useUXMetrics = () => {
  const { trackEvent } = useAnalyticsDashboard();
  const currentStep = useRef<WizardStepMetrics | null>(null);

  // Track wizard step view
  const trackWizardStepView = useCallback((step: number, stepName: string) => {
    // Complete previous step if exists
    if (currentStep.current && !currentStep.current.endTime) {
      currentStep.current.endTime = Date.now();
      currentStep.current.duration = currentStep.current.endTime - currentStep.current.startTime;
      
      trackEvent({
        event_type: 'wizard_step_completed',
        event_category: 'ux_flow',
        event_data: {
          step: currentStep.current.step,
          stepName: currentStep.current.stepName,
          duration: currentStep.current.duration,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Start new step
    currentStep.current = {
      step,
      stepName,
      startTime: Date.now()
    };

    trackEvent({
      event_type: 'wizard_step_viewed',
      event_category: 'ux_flow',
      event_data: {
        step,
        stepName,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent]);

  // Track wizard abandonment
  const trackWizardAbandonment = useCallback((step: number, stepName: string, reason?: string) => {
    if (currentStep.current) {
      currentStep.current.abandoned = true;
      currentStep.current.endTime = Date.now();
      currentStep.current.duration = currentStep.current.endTime - currentStep.current.startTime;
    }

    trackEvent({
      event_type: 'wizard_abandoned',
      event_category: 'ux_flow',
      event_data: {
        step,
        stepName,
        reason,
        duration: currentStep.current?.duration,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent]);

  // Track form field interactions
  const trackFormFieldFocus = useCallback((fieldName: string, fieldType: string) => {
    trackEvent({
      event_type: 'form_field_focused',
      event_category: 'ux_interaction',
      event_data: {
        fieldName,
        fieldType,
        step: currentStep.current?.step,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent]);

  // Track validation errors
  const trackValidationError = useCallback((fieldName: string, errorType: string, errorMessage: string) => {
    if (currentStep.current) {
      if (!currentStep.current.validationErrors) {
        currentStep.current.validationErrors = [];
      }
      currentStep.current.validationErrors.push(`${fieldName}: ${errorType}`);
    }

    trackEvent({
      event_type: 'form_validation_error',
      event_category: 'ux_friction',
      event_data: {
        fieldName,
        errorType,
        errorMessage,
        step: currentStep.current?.step,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent]);

  // Track CTA clicks
  const trackCTAClick = useCallback((ctaName: string, ctaType: string, location: string) => {
    trackEvent({
      event_type: 'cta_clicked',
      event_category: 'ux_interaction',
      event_data: {
        ctaName,
        ctaType,
        location,
        step: currentStep.current?.step,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent]);

  // Track trust signal interactions
  const trackTrustSignal = useCallback((signalType: 'badge_hover' | 'escrow_view' | 'review_expansion', metadata?: any) => {
    trackEvent({
      event_type: 'trust_signal_viewed',
      event_category: 'ux_trust',
      event_data: {
        signalType,
        metadata,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent]);

  // Track back button usage (indicates confusion)
  const trackBackNavigation = useCallback((fromStep: number, toStep: number) => {
    trackEvent({
      event_type: 'wizard_back_navigation',
      event_category: 'ux_friction',
      event_data: {
        fromStep,
        toStep,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent]);

  // Track mobile vs desktop
  const trackDeviceType = useCallback(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
    
    return {
      deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };
  }, []);

  // Track page visibility (for abandonment detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentStep.current && !currentStep.current.endTime) {
        trackWizardAbandonment(
          currentStep.current.step,
          currentStep.current.stepName,
          'page_hidden'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [trackWizardAbandonment]);

  return {
    trackWizardStepView,
    trackWizardAbandonment,
    trackFormFieldFocus,
    trackValidationError,
    trackCTAClick,
    trackTrustSignal,
    trackBackNavigation,
    trackDeviceType
  };
};
