import { useCalculatorState } from './hooks/useCalculatorState';
import { useCalculatorPricing } from './hooks/useCalculatorPricing';
import { ProjectTypeSelector } from './steps/ProjectTypeSelector';
import { SizePresetSelector } from './steps/SizePresetSelector';
import { QualityTierSelector } from './steps/QualityTierSelector';
import { ScopeBundleSelector } from './steps/ScopeBundleSelector';
import { LocationSelector } from './steps/LocationSelector';
import { AdderSelector } from './steps/AdderSelector';
import { LivePriceDisplay } from './results/LivePriceDisplay';
import { CalculatorResults } from './results/CalculatorResults';
import { ProgressIndicator } from './ui/ProgressIndicator';
import { LivePricingIndicator } from './ui/LivePricingIndicator';
import { SessionIndicator } from './ui/SessionIndicator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ProjectCalculator() {
  const {
    currentStep,
    selections,
    totalSteps,
    hasRestoredSession,
    updateSelection,
    goToNext,
    goBack,
    canProceed,
    resetCalculator,
    dismissTip
  } = useCalculatorState();

  const [lastAccessed, setLastAccessed] = useState<string | undefined>();

  useEffect(() => {
    const stored = localStorage.getItem('calculator_session');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setLastAccessed(data.lastAccessed);
      } catch {}
    }
  }, []);

  // Track live pricing status
  const { loading: pricingLoading } = useCalculatorPricing(selections);

  return (
    <div className="min-h-screen bg-[#13111F] py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Session Indicator */}
        {hasRestoredSession && currentStep === 1 && (
          <SessionIndicator 
            onStartOver={resetCalculator}
            lastAccessed={lastAccessed}
          />
        )}

        {/* Progress */}
        {currentStep < totalSteps && (
          <ProgressIndicator current={currentStep} total={totalSteps - 1} />
        )}

        {/* Step Content */}
        <div className="mt-8 mb-32">
          {currentStep === 1 && (
            <ProjectTypeSelector
              selected={selections.projectType}
              onSelect={(type) => updateSelection('projectType', type)}
            />
          )}

          {currentStep === 2 && selections.projectType && (
            <SizePresetSelector
              projectType={selections.projectType}
              selected={selections.sizePreset}
              onSelect={(preset) => updateSelection('sizePreset', preset)}
            />
          )}

          {currentStep === 3 && (
            <QualityTierSelector
              selected={selections.qualityTier}
              onSelect={(tier) => updateSelection('qualityTier', tier)}
            />
          )}

          {currentStep === 4 && selections.projectType && (
            <ScopeBundleSelector
              projectType={selections.projectType}
              selected={selections.scopeBundles}
              onSelect={(bundles) => updateSelection('scopeBundles', bundles)}
            />
          )}

          {currentStep === 5 && (
            <LocationSelector
              selected={selections.locationFactor}
              onSelect={(location) => updateSelection('locationFactor', location)}
            />
          )}

          {currentStep === 6 && selections.projectType && (
            <AdderSelector
              projectType={selections.projectType}
              selected={selections.adders}
              onSelect={(adders) => updateSelection('adders', adders)}
            />
          )}

        {currentStep === 7 && (
          <CalculatorResults 
            selections={selections} 
            onReset={resetCalculator}
            onDismissTip={dismissTip}
          />
        )}
        </div>

        {/* Navigation */}
        {currentStep < totalSteps && (
          <div className="fixed bottom-24 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-4">
            <div className="container max-w-4xl mx-auto flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={goBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={goToNext}
                disabled={!canProceed}
                className="gap-2"
              >
                {currentStep === 6 ? 'View Results' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Live Price (visible from step 2 onwards) */}
        {currentStep >= 2 && currentStep < totalSteps && (
          <LivePriceDisplay selections={selections} />
        )}

        {/* Live Pricing Indicator */}
        {currentStep >= 3 && currentStep < totalSteps && (
          <LivePricingIndicator isCalculating={pricingLoading} />
        )}
      </div>
    </div>
  );
}
