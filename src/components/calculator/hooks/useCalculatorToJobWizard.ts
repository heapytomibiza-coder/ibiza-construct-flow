import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { CalculatorSelections } from './useCalculatorState';
import type { PricingResult } from './useCalculatorPricing';

/**
 * Hook to map calculator selections to job wizard format
 * Handles the transition from calculator to job posting
 */
export function useCalculatorToJobWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const startJobWizard = (selections: CalculatorSelections, pricing?: PricingResult | null) => {
    if (!selections.projectType || !selections.sizePreset || !selections.qualityTier) {
      toast({
        title: "Incomplete Configuration",
        description: "Please complete all calculator steps before posting a job.",
        variant: "destructive"
      });
      return;
    }

    // Build structured job data from calculator selections
    const jobData = {
      title: buildJobTitle(selections),
      description: buildJobDescription(selections, pricing),
      budgetRange: pricing ? `€${pricing.min.toLocaleString()} - €${pricing.max.toLocaleString()}` : undefined,
      projectType: selections.projectType,
      
      // Structured details for wizard prefill
      details: {
        size: selections.sizePreset.preset_name,
        quality: selections.qualityTier.display_name,
        scope: selections.scopeBundles.map(b => b.display_name).join(', '),
        location: selections.locationFactor?.display_name || 'Not specified',
        adders: selections.adders.map(a => a.display_name).join(', ') || 'None',
        timeline: pricing ? `${pricing.timeline} working days` : 'To be determined',
        estimatedCost: pricing ? `€${pricing.min.toLocaleString()} - €${pricing.max.toLocaleString()}` : undefined
      },
      
      // Calculator context for reference
      calculatorData: {
        selections,
        pricing
      }
    };

    // Navigate to job wizard with prefilled data
    navigate('/post-job', { 
      state: { 
        fromCalculator: true,
        calculatorData: jobData 
      } 
    });

    toast({
      title: "Redirecting to Job Wizard",
      description: "Your calculator selections will be prefilled."
    });
  };

  return { startJobWizard };
}

function buildJobTitle(selections: CalculatorSelections): string {
  const type = selections.projectType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const size = selections.sizePreset?.preset_name;
  const quality = selections.qualityTier?.display_name;
  
  return `${type} Project - ${size} - ${quality} Quality`;
}

function buildJobDescription(selections: CalculatorSelections, pricing?: PricingResult | null): string {
  const parts: string[] = [];
  
  parts.push(`I'm planning a ${selections.projectType?.replace('_', ' ')} project with the following specifications:\n`);
  
  if (selections.sizePreset) {
    parts.push(`\n**Size:** ${selections.sizePreset.preset_name}`);
    if (selections.sizePreset.size_min_sqm && selections.sizePreset.size_max_sqm) {
      parts.push(` (${selections.sizePreset.size_min_sqm}-${selections.sizePreset.size_max_sqm} sqm)`);
    }
  }
  
  if (selections.qualityTier) {
    parts.push(`\n**Quality Level:** ${selections.qualityTier.display_name}`);
  }
  
  if (selections.scopeBundles.length > 0) {
    parts.push(`\n\n**Scope of Work:**`);
    selections.scopeBundles.forEach(bundle => {
      parts.push(`\n- ${bundle.display_name}`);
      if (bundle.included_items && bundle.included_items.length > 0) {
        parts.push(` (includes: ${bundle.included_items.slice(0, 3).join(', ')}${bundle.included_items.length > 3 ? '...' : ''})`);
      }
    });
  }
  
  if (selections.locationFactor) {
    parts.push(`\n\n**Location:** ${selections.locationFactor.display_name}`);
  }
  
  if (selections.adders && selections.adders.length > 0) {
    parts.push(`\n\n**Additional Requirements:**`);
    selections.adders.forEach(adder => {
      parts.push(`\n- ${adder.display_name}`);
    });
  }
  
  if (pricing) {
    parts.push(`\n\n**Budget Range:** €${pricing.min.toLocaleString()} - €${pricing.max.toLocaleString()}`);
    parts.push(`\n**Estimated Timeline:** ${pricing.timeline} working days`);
  }
  
  parts.push(`\n\nI'm looking for qualified professionals to provide quotes for this project. Please review the details and submit your proposal.`);
  
  return parts.join('');
}
