import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CalculatorSelections } from './useCalculatorState';

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
}

export function useCalculatorPricing(selections: CalculatorSelections) {
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const calculatePrice = async () => {
      if (!selections.projectType || !selections.qualityTier || !selections.sizePreset) {
        setPricing(null);
        return;
      }

      setLoading(true);
      try {
        // 1. Fetch cost template
      const { data: template, error } = await supabase
        .from('calculator_cost_templates' as any)
        .select('*')
        .eq('project_type', selections.projectType)
        .eq('quality_tier', selections.qualityTier.tier_key)
        .maybeSingle();

      if (error || !template) {
        console.error('Template fetch error:', error);
        setLoading(false);
        return;
      }

      // 2. Calculate base price
      const sizeAvg = (selections.sizePreset.size_min_sqm + selections.sizePreset.size_max_sqm) / 2;
      let subtotal = (template as any).base_rate_per_sqm * sizeAvg;

      // 3. Apply tier multiplier
      subtotal *= selections.qualityTier.multiplier;

      // 4. Apply bundle uplifts
      selections.scopeBundles.forEach(bundle => {
        subtotal *= (1 + bundle.base_uplift_percentage / 100);
      });

      // 5. Apply adders
      selections.adders.forEach(adder => {
        if (adder.price_type === 'fixed') {
          subtotal += adder.price_value;
        } else if (adder.price_type === 'percentage') {
          subtotal *= (1 + adder.price_value / 100);
        } else if (adder.price_type === 'per_sqm') {
          subtotal += adder.price_value * sizeAvg;
        }
      });

      // 6. Apply location factor
      if (selections.locationFactor) {
        subtotal *= (1 + selections.locationFactor.uplift_percentage / 100);
      }

      // 7. Calculate breakdown
      const breakdown: PricingBreakdown = {
        labour: subtotal * ((template as any).labour_percentage / 100),
        materials: subtotal * ((template as any).materials_percentage / 100),
        permits: subtotal * ((template as any).permits_percentage / 100),
        contingency: subtotal * ((template as any).contingency_percentage / 100),
        disposal: subtotal * ((template as any).disposal_percentage / 100)
      };

        const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

        setPricing({
          subtotal: total,
          min: total * 0.9,
          max: total * 1.1,
          breakdown,
          timeline: selections.sizePreset.typical_duration_days
        });
      } catch (error) {
        console.error('Pricing calculation error:', error);
      } finally {
        setLoading(false);
      }
    };

    calculatePrice();
  }, [selections]);

  return { pricing, loading };
}
