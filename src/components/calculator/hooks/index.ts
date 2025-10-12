/**
 * Unified Calculator Hooks Module
 * Consolidates all calculator-related state management and business logic
 */

export { useCalculatorState } from './useCalculatorState';
export { useCalculatorPricing } from './useCalculatorPricing';
export { useCalculatorToJobWizard } from './useCalculatorToJobWizard';

export type { 
  CalculatorSelections,
  SizePreset,
  QualityTier,
  ScopeBundle,
  Adder,
  LocationFactor
} from './useCalculatorState';

export type {
  PricingResult,
  PricingBreakdown
} from './useCalculatorPricing';
