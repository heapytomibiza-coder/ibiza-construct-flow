import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface SizePreset {
  id: string;
  preset_name: string;
  size_min_sqm: number;
  size_max_sqm: number;
  description: string;
  typical_duration_days: number;
}

export interface QualityTier {
  id: string;
  tier_key: string;
  display_name: string;
  description: string;
  multiplier: number;
  features: string[];
  brand_examples: string[];
  image_urls: string[];
  education_content?: {
    title: string;
    content: string;
    tips?: string[];
  };
}

export interface ScopeBundle {
  id: string;
  bundle_key: string;
  display_name: string;
  included_items: string[];
  excluded_items: string[];
  base_uplift_percentage: number;
  is_default: boolean;
  education_blurbs?: any[];
}

export interface Adder {
  id: string;
  adder_key: string;
  display_name: string;
  category: string;
  description: string;
  tooltip: string;
  price_type: 'fixed' | 'percentage' | 'per_sqm';
  price_value: number;
  education_tip?: string;
}

export interface LocationFactor {
  id: string;
  location_key: string;
  display_name: string;
  uplift_percentage: number;
  logistics_notes: string;
}

export interface CalculatorSelections {
  projectType?: string;
  sizePreset?: SizePreset;
  qualityTier?: QualityTier;
  scopeBundles: ScopeBundle[];
  locationFactor?: LocationFactor;
  adders: Adder[];
  dismissedTips?: string[];
}

const STORAGE_KEY = 'calculator_session';
const TOTAL_STEPS = 6;

export function useCalculatorState() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionToken] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.sessionToken;
      } catch {
        return uuidv4();
      }
    }
    return uuidv4();
  });

  const [selections, setSelections] = useState<CalculatorSelections>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.selections || { scopeBundles: [], adders: [], dismissedTips: [] };
      } catch {
        return { scopeBundles: [], adders: [], dismissedTips: [] };
      }
    }
    return { scopeBundles: [], adders: [], dismissedTips: [] };
  });

  // Auto-save to localStorage
  useEffect(() => {
    const data = {
      sessionToken,
      selections,
      currentStep,
      lastAccessed: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [selections, currentStep, sessionToken]);

  const updateSelection = useCallback(<K extends keyof CalculatorSelections>(
    key: K,
    value: CalculatorSelections[K]
  ) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, TOTAL_STEPS)));
  }, []);

  const resetCalculator = useCallback(() => {
    setSelections({ scopeBundles: [], adders: [], dismissedTips: [] });
    setCurrentStep(1);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const dismissTip = useCallback((tipId: string) => {
    setSelections(prev => ({
      ...prev,
      dismissedTips: [...(prev.dismissedTips || []), tipId]
    }));
  }, []);

  const isStepComplete = useCallback((step: number): boolean => {
    switch (step) {
      case 1: return !!selections.projectType;
      case 2: return !!selections.sizePreset;
      case 3: return !!selections.qualityTier;
      case 4: return selections.scopeBundles.length > 0;
      case 5: return !!selections.locationFactor;
      case 6: return true; // Adders are optional
      default: return false;
    }
  }, [selections]);

  const canProceed = isStepComplete(currentStep);

  return {
    currentStep,
    selections,
    sessionToken,
    totalSteps: TOTAL_STEPS,
    updateSelection,
    goToNext,
    goBack,
    goToStep,
    resetCalculator,
    dismissTip,
    isStepComplete,
    canProceed
  };
}
