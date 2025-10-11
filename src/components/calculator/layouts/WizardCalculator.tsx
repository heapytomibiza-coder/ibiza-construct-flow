import { useCalculator } from '@/lib/calculator/use-calculator';
import { ProjectTypeSelector } from '../steps/ProjectTypeSelector';
import { SizePresetSelector } from '../steps/SizePresetSelector';
import { QualityTierSelector } from '../steps/QualityTierSelector';
import { ScopeBundleSelector } from '../steps/ScopeBundleSelector';
import { LocationSelector } from '../steps/LocationSelector';
import { AdderSelector } from '../steps/AdderSelector';
import { LivePriceDisplay } from '../results/LivePriceDisplay';
import { CalculatorResults } from '../results/CalculatorResults';
import { ProgressIndicator } from '../ui/ProgressIndicator';
import { LivePricingIndicator } from '../ui/LivePricingIndicator';
import { SessionIndicator } from '../ui/SessionIndicator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export function WizardCalculator() {
  // Wizard mode temporarily disabled - will be implemented after single-page is stable
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Wizard mode coming soon. Using single-page view for now.</p>
    </div>
  );
}
