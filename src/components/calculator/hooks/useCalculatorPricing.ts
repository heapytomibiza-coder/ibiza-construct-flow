import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CalculatorSelections } from './useCalculatorState';
import { useToast } from '@/hooks/use-toast';

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
  recommendations?: string[];
}

export function useCalculatorPricing(selections: CalculatorSelections) {
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const calculatePrice = async () => {
      if (!selections.projectType || !selections.qualityTier || !selections.sizePreset) {
        setPricing(null);
        return;
      }

      setLoading(true);
      try {
        // Call edge function for dynamic pricing
        const { data, error } = await supabase.functions.invoke('calculate-project-cost', {
          body: {
            projectType: selections.projectType,
            sizePreset: selections.sizePreset,
            qualityTier: selections.qualityTier,
            scopeBundles: selections.scopeBundles,
            locationFactor: selections.locationFactor,
            adders: selections.adders
          }
        });

        if (error) {
          console.error('Pricing calculation error:', error);
          toast({
            title: "Calculation Error",
            description: "Unable to calculate pricing. Please try again.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        setPricing(data as PricingResult);
      } catch (error) {
        console.error('Pricing calculation error:', error);
        toast({
          title: "Calculation Error",
          description: "Unable to calculate pricing. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    calculatePrice();
  }, [selections, toast]);

  return { pricing, loading };
}
