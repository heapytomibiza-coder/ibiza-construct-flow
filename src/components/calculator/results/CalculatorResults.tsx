import { useCalculatorPricing } from '../hooks/useCalculatorPricing';
import type { CalculatorSelections } from '../hooks/useCalculatorState';
import { PriceBreakdownChart } from './PriceBreakdownChart';
import { InclusionExclusionList } from './InclusionExclusionList';
import { ContextualEducationPanel } from './ContextualEducationPanel';
import { Button } from '@/components/ui/button';
import { Share2, Download, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CalculatorResultsProps {
  selections: CalculatorSelections;
  onReset: () => void;
  onDismissTip: (tipId: string) => void;
}

export function CalculatorResults({ selections, onReset, onDismissTip }: CalculatorResultsProps) {
  const { pricing, loading } = useCalculatorPricing(selections);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleShare = async () => {
    const params = new URLSearchParams({
      project: selections.projectType || '',
      size: selections.sizePreset?.preset_name || '',
      tier: selections.qualityTier?.tier_key || ''
    });
    const url = `${window.location.origin}/calculator?${params.toString()}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Share this calculator result with others"
      });
    } catch {
      toast({
        title: "Couldn't copy link",
        variant: "destructive"
      });
    }
  };

  const handlePostJob = () => {
    // TODO: Prefill job wizard with calculator data
    navigate('/post-job');
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-24">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Calculating your project estimate...</p>
        </div>
      </div>
    );
  }

  if (!pricing) {
    return null;
  }

  const allIncluded = selections.scopeBundles.flatMap(b => b.included_items);
  const allExcluded = selections.scopeBundles.flatMap(b => b.excluded_items);

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="text-3xl font-bold mb-2">Your Project Estimate</h2>
        <p className="text-muted-foreground">
          Based on your selections, here's what you can expect
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Price Summary */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Range</span>
              <span className="font-semibold">
                €{pricing.min.toLocaleString()} - €{pricing.max.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Timeline</span>
              <span className="font-semibold">{pricing.timeline} working days</span>
            </div>
          </div>
          <PriceBreakdownChart breakdown={pricing.breakdown} />
        </div>

        {/* What's Included - Enhanced */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Scope of Work</h3>
          <InclusionExclusionList
            included={allIncluded}
            excluded={allExcluded}
            compact
          />
        </div>
      </div>

      {/* Contextual Education Panel */}
      {selections.dismissedTips && (
        <ContextualEducationPanel
          selections={selections}
          dismissedTips={selections.dismissedTips}
          onDismissTip={onDismissTip}
        />
      )}

      {/* AI Recommendations */}
      {pricing.recommendations && pricing.recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-200/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Smart Recommendations
          </h3>
          <div className="space-y-2">
            {pricing.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="text-foreground/90">
                  {rec === 'structural_assessment' && 'Consider adding a structural assessment for your extension project'}
                  {rec === 'premium_upgrades' && 'Premium tier projects often benefit from underfloor heating and premium fixtures'}
                  {rec === 'extended_scope_benefits' && 'Extended scope packages reduce coordination hassles and ensure cohesive finishes'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-gradient-to-r from-teal-500/10 to-purple-500/10 border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={handlePostJob} className="gap-2">
            <Briefcase className="h-4 w-4" />
            Post This Job
          </Button>
          <Button size="lg" variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share Results
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button size="lg" variant="ghost" onClick={onReset}>
            Start Over
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          This is a planning estimate (±10%). Final quotes may vary based on site conditions, 
          access, and specific material choices.
        </p>
      </div>
    </div>
  );
}
