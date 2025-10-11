import type { CalculatorAdder, LocationFactor, QualityTier, ScopeBundle } from '../data-model';

export interface PricingBreakdown {
  labour: number;
  materials: number;
  permits: number;
  contingency: number;
  disposal: number;
}

export interface Timeline {
  minDays: number;
  maxDays: number;
}

export interface PricingResult {
  base: number;
  total: number;
  lowEstimate: number;
  highEstimate: number;
  breakdown: PricingBreakdown;
  timeline: Timeline;
  bundles: ScopeBundle[];
  adders: CalculatorAdder[];
  location: LocationFactor;
  qualityTier: QualityTier;
  notes: string[];
}

export interface PricingResultProps {
  pricing: PricingResult;
}
