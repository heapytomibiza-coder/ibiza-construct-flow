import { useState, useMemo, useCallback } from 'react';
import {
  type CalculatorState,
  type ProjectType,
  type SizePreset,
  type QualityTier,
  type ScopeBundle,
  type CalculatorAdder,
  type LocationFactor,
  defaultState,
  sizePresets,
  qualityTiers,
  scopeBundles,
  calculatorAdders,
  locationFactors,
  projectTypes,
} from './data-model';
import { useCalculatorPricing } from './hooks/useCalculatorPricing';
import type { PricingResult } from './results/types';

const STORAGE_KEY = 'calculator_state';

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  // Auto-save to localStorage
  const saveState = useCallback((newState: CalculatorState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  // Project type options
  const projectTypeOptions = useMemo(() => projectTypes.map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  })), []);

  // Size preset options (filtered by current project type)
  const sizePresetOptions = useMemo<SizePreset[]>(
    () => sizePresets[state.projectType] || [],
    [state.projectType]
  );

  // Quality tier options
  const qualityTierOptions = useMemo<QualityTier[]>(() => qualityTiers, []);

  // Scope bundle options (filtered by current project type)
  const scopeBundleOptions = useMemo<ScopeBundle[]>(
    () => scopeBundles.filter((bundle) => bundle.projectType === state.projectType),
    [state.projectType]
  );

  // Adder options (filtered by current project type)
  const adderOptions = useMemo<CalculatorAdder[]>(
    () => calculatorAdders.filter((adder) => adder.appliesTo.includes(state.projectType)),
    [state.projectType]
  );

  // Location options
  const locationOptions = useMemo<LocationFactor[]>(() => locationFactors, []);

  // Calculate pricing using hook
  const pricing = useCalculatorPricing({ state });

  // Update functions
  const setProjectType = useCallback((projectType: ProjectType) => {
    const newState: CalculatorState = {
      ...state,
      projectType,
      sizePresetId: sizePresets[projectType][0].id,
      size: Math.round((sizePresets[projectType][0].min + sizePresets[projectType][0].max) / 2),
      scopeBundleIds: scopeBundles
        .filter((bundle) => bundle.projectType === projectType && bundle.defaultSelected)
        .map((bundle) => bundle.id),
      adderIds: [],
    };
    saveState(newState);
  }, [state, saveState]);

  const selectSizePreset = useCallback((preset: SizePreset) => {
    const newState: CalculatorState = {
      ...state,
      sizePresetId: preset.id,
      size: Math.round((preset.min + preset.max) / 2),
    };
    saveState(newState);
  }, [state, saveState]);

  const selectQualityTier = useCallback((tier: QualityTier) => {
    const newState: CalculatorState = {
      ...state,
      qualityTierId: tier.id,
    };
    saveState(newState);
  }, [state, saveState]);

  const toggleScopeBundle = useCallback((bundleId: string) => {
    const newState: CalculatorState = {
      ...state,
      scopeBundleIds: state.scopeBundleIds.includes(bundleId)
        ? state.scopeBundleIds.filter((id) => id !== bundleId)
        : [...state.scopeBundleIds, bundleId],
    };
    saveState(newState);
  }, [state, saveState]);

  const toggleAdder = useCallback((adderId: string) => {
    const newState: CalculatorState = {
      ...state,
      adderIds: state.adderIds.includes(adderId)
        ? state.adderIds.filter((id) => id !== adderId)
        : [...state.adderIds, adderId],
    };
    saveState(newState);
  }, [state, saveState]);

  const selectLocation = useCallback((location: LocationFactor) => {
    const newState: CalculatorState = {
      ...state,
      locationId: location.id,
    };
    saveState(newState);
  }, [state, saveState]);

  const resetCalculator = useCallback(() => {
    saveState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  }, [saveState]);

  return {
    state,
    pricing,
    projectTypeOptions,
    sizePresetOptions,
    qualityTierOptions,
    scopeBundleOptions,
    adderOptions,
    locationOptions,
    setProjectType,
    selectSizePreset,
    selectQualityTier,
    toggleScopeBundle,
    toggleAdder,
    selectLocation,
    resetCalculator,
  };
}
