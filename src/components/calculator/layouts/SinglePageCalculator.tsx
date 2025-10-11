import { useCalculatorState } from '../hooks/useCalculatorState';
import { ProjectTypeSelector } from '../steps/ProjectTypeSelector';
import { SizePresetSelector } from '../steps/SizePresetSelector';
import { QualityTierSelector } from '../steps/QualityTierSelector';
import { ScopeBundleSelector } from '../steps/ScopeBundleSelector';
import { LocationSelector } from '../steps/LocationSelector';
import { AdderSelector } from '../steps/AdderSelector';
import { CalculatorResults } from '../results/CalculatorResults';
import { SessionIndicator } from '../ui/SessionIndicator';
import { Separator } from '@/components/ui/separator';
import { CalculatorCard } from '../ui/CalculatorCard';
import { CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SinglePageCalculator() {
  const {
    selections,
    updateSelection,
    resetCalculator,
    dismissTip,
    isStepComplete,
    hasRestoredSession
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

  const SectionHeader = ({ step, title, subtitle }: { step: number; title: string; subtitle: string }) => {
    const isComplete = isStepComplete(step);
    return (
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">{title}</h2>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>
        {isComplete && (
          <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        )}
      </div>
    );
  };

  return (
    <>
      {/* Session Indicator */}
      {hasRestoredSession && (
        <SessionIndicator 
          onStartOver={resetCalculator}
          lastAccessed={lastAccessed}
        />
      )}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column - All Selections */}
        <CalculatorCard className="p-6">
          <div className="space-y-8">
            {/* Step 1: Project Type */}
            <div id="project-type">
              <SectionHeader 
                step={1}
                title="What type of project?"
                subtitle="Choose the renovation you're planning"
              />
              <ProjectTypeSelector
                selected={selections.projectType}
                onSelect={(type) => updateSelection('projectType', type)}
              />
            </div>

            <Separator />

            {/* Step 2: Size */}
            <div id="size-preset">
              <SectionHeader 
                step={2}
                title="What's the size?"
                subtitle="Select the approximate size of your space"
              />
              {selections.projectType ? (
                <SizePresetSelector
                  projectType={selections.projectType}
                  selected={selections.sizePreset}
                  onSelect={(preset) => updateSelection('sizePreset', preset)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Select a project type first</p>
              )}
            </div>

            <Separator />

            {/* Step 3: Quality */}
            <div id="quality-tier">
              <SectionHeader 
                step={3}
                title="What quality level?"
                subtitle="Choose your preferred finish quality"
              />
              <QualityTierSelector
                selected={selections.qualityTier}
                onSelect={(tier) => updateSelection('qualityTier', tier)}
              />
            </div>

            <Separator />

            {/* Step 4: Scope */}
            <div id="scope-bundle">
              <SectionHeader 
                step={4}
                title="What's included?"
                subtitle="Select the scope of work"
              />
              {selections.projectType ? (
                <ScopeBundleSelector
                  projectType={selections.projectType}
                  selected={selections.scopeBundles}
                  onSelect={(bundles) => updateSelection('scopeBundles', bundles)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Select a project type first</p>
              )}
            </div>

            <Separator />

            {/* Step 5: Location */}
            <div id="location">
              <SectionHeader 
                step={5}
                title="Where's the project?"
                subtitle="Select your location"
              />
              <LocationSelector
                selected={selections.locationFactor}
                onSelect={(location) => updateSelection('locationFactor', location)}
              />
            </div>

            <Separator />

            {/* Step 6: Adders */}
            <div id="adders">
              <SectionHeader 
                step={6}
                title="Any extras?"
                subtitle="Optional add-ons (skip if not needed)"
              />
              {selections.projectType ? (
                <AdderSelector
                  projectType={selections.projectType}
                  selected={selections.adders}
                  onSelect={(adders) => updateSelection('adders', adders)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Select a project type first</p>
              )}
            </div>
          </div>
        </CalculatorCard>

        {/* Right Column - Results (Sticky) */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <CalculatorResults 
            selections={selections} 
            onReset={resetCalculator}
            onDismissTip={dismissTip}
          />
        </div>
      </div>
    </>
  );
}
