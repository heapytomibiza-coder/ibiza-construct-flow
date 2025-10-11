import {
  type CalculatorState,
  sizePresets,
  qualityTiers,
  scopeBundles,
  calculatorAdders,
  locationFactors,
  costTemplates,
  type ProjectType,
  type CostTemplate,
} from './data-model';

export interface PricingBreakdown {
  labour: number;
  materials: number;
  permits: number;
  contingency: number;
  disposal: number;
}

export interface PricingResult {
  subtotal: number;
  min: number;
  max: number;
  breakdown: PricingBreakdown;
  timeline: number;
  recommendations: string[];
}

export function calculatePricing(state: CalculatorState): PricingResult {
  // Find selected items
  const selectedSizePreset = Object.values(sizePresets)
    .flat()
    .find((preset) => preset.id === state.sizePresetId);
  
  const selectedQualityTier = qualityTiers.find((tier) => tier.id === state.qualityTierId);
  
  const selectedScopeBundles = scopeBundles.filter((bundle) =>
    state.scopeBundleIds.includes(bundle.id)
  );
  
  const selectedAdders = calculatorAdders.filter((adder) =>
    state.adderIds.includes(adder.id)
  );
  
  const selectedLocation = locationFactors.find((loc) => loc.id === state.locationId);

  if (!selectedSizePreset || !selectedQualityTier || !selectedLocation) {
    throw new Error('Invalid calculator state');
  }

  // Calculate base cost from scope bundles
  let baseSubtotal = 0;
  for (const bundle of selectedScopeBundles) {
    baseSubtotal += bundle.basePricePerSqm * state.size;
  }

  // Apply quality tier multiplier
  baseSubtotal *= selectedQualityTier.multiplier;

  // Apply adders
  let adderTotal = 0;
  for (const adder of selectedAdders) {
    if (adder.priceType === 'fixed') {
      adderTotal += adder.priceValue;
    } else if (adder.priceType === 'per_sqm') {
      adderTotal += adder.priceValue * state.size;
    } else if (adder.priceType === 'percentage') {
      adderTotal += baseSubtotal * adder.priceValue;
    }
  }

  let subtotalBeforeLocation = baseSubtotal + adderTotal;

  // Apply location uplift
  const locationUplift = subtotalBeforeLocation * selectedLocation.upliftPercentage;
  const subtotal = subtotalBeforeLocation + locationUplift;

  // Get cost template for breakdown
  const costTemplate: CostTemplate = costTemplates[state.projectType][selectedQualityTier.id];
  
  const breakdown: PricingBreakdown = {
    labour: Math.round(subtotal * costTemplate.labourPercentage),
    materials: Math.round(subtotal * costTemplate.materialsPercentage),
    permits: Math.round(subtotal * costTemplate.permitsPercentage),
    contingency: Math.round(subtotal * costTemplate.contingencyPercentage),
    disposal: Math.round(subtotal * costTemplate.disposalPercentage),
  };

  // Calculate min/max range (±10%)
  const min = Math.round(subtotal * 0.9);
  const max = Math.round(subtotal * 1.1);

  // Calculate timeline (average of selected size preset range)
  const timeline = Math.round(
    (selectedSizePreset.typicalDurationDays.min + selectedSizePreset.typicalDurationDays.max) / 2
  );

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (selectedQualityTier.tier === 'premium') {
    recommendations.push('Consider a site visit for accurate templating of premium finishes');
  }
  
  if (selectedAdders.some((a) => a.category === 'structural')) {
    recommendations.push('Structural work requires building control approval—allow 2-3 weeks');
  }
  
  if (state.size > 20) {
    recommendations.push('Larger projects benefit from phased delivery to manage logistics');
  }

  if (selectedLocation.id === 'location-formentera') {
    recommendations.push('Formentera deliveries require advance barge scheduling—plan 2+ weeks ahead');
  }

  return {
    subtotal: Math.round(subtotal),
    min,
    max,
    breakdown,
    timeline,
    recommendations,
  };
}
