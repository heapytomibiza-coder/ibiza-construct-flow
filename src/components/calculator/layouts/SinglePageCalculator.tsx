import { useCalculator } from '@/lib/calculator/use-calculator';
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
  const calculator = useCalculator();
  const [lastAccessed, setLastAccessed] = useState<string | undefined>();

  useEffect(() => {
    const stored = localStorage.getItem('calculator_state');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setLastAccessed(data.lastAccessed);
      } catch {}
    }
  }, []);

  const hasRestoredSession = !!lastAccessed;

  const SectionHeader = ({ complete, title, subtitle }: { complete: boolean; title: string; subtitle: string }) => {
    return (
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">{title}</h2>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>
        {complete && (
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
          onStartOver={calculator.resetCalculator}
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
                complete={!!calculator.state.projectType}
                title="What type of project?"
                subtitle="Choose the renovation you're planning"
              />
              <ProjectTypeSelector
                selected={calculator.state.projectType}
                onSelect={calculator.setProjectType}
              />
            </div>

            <Separator />

            {/* Step 2: Size */}
            <div id="size-preset">
              <SectionHeader 
                complete={!!calculator.state.sizePresetId}
                title="What's the size?"
                subtitle="Select the approximate size of your space"
              />
              {calculator.state.projectType ? (
              <SizePresetSelector
                presets={calculator.sizePresetOptions}
                selected={calculator.selectedSizePreset}
                onSelect={(preset) => calculator.selectSizePreset(preset.id)}
              />
              ) : (
                <p className="text-sm text-muted-foreground">Select a project type first</p>
              )}
            </div>

            <Separator />

            {/* Step 3: Quality */}
            <div id="quality-tier">
              <SectionHeader 
                complete={!!calculator.state.qualityTierId}
                title="What quality level?"
                subtitle="Choose your preferred finish quality"
              />
              <QualityTierSelector
                tiers={calculator.qualityTierOptions}
                selected={calculator.selectedQualityTier}
                onSelect={(tier) => calculator.selectQualityTier(tier.id)}
              />
            </div>

            <Separator />

            {/* Step 4: Scope */}
            <div id="scope-bundle">
              <SectionHeader 
                complete={calculator.state.scopeBundleIds.length > 0}
                title="What's included?"
                subtitle="Select the scope of work"
              />
              {calculator.state.projectType ? (
                <ScopeBundleSelector
                  bundles={calculator.scopeBundleOptions}
                  selected={calculator.state.scopeBundleIds}
                  onToggle={calculator.toggleScopeBundle}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Select a project type first</p>
              )}
            </div>

            <Separator />

            {/* Step 5: Location */}
            <div id="location">
              <SectionHeader 
                complete={!!calculator.state.locationId}
                title="Where's the project?"
                subtitle="Select your location"
              />
              <LocationSelector
                locations={calculator.locationOptions}
                selected={calculator.selectedLocation}
                onSelect={(location) => calculator.selectLocation(location.id)}
              />
            </div>

            <Separator />

            {/* Step 6: Adders */}
            <div id="adders">
              <SectionHeader 
                complete={true}
                title="Any extras?"
                subtitle="Optional add-ons (skip if not needed)"
              />
              {calculator.state.projectType ? (
                <AdderSelector
                  adders={calculator.adderOptions}
                  selected={calculator.state.adderIds}
                  onToggle={calculator.toggleAdder}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Select a project type first</p>
              )}
            </div>
          </div>
        </CalculatorCard>

        {/* Right Column - Results (Sticky) */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <CalculatorResults pricing={calculator.pricing} />
        </div>
      </div>
    </>
  );
}
