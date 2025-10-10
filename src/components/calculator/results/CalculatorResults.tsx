import { useCalculatorPricing } from '../hooks/useCalculatorPricing';
import type { CalculatorSelections } from '../hooks/useCalculatorState';
import { PriceBreakdownChart } from './PriceBreakdownChart';
import { Button } from '@/components/ui/button';
import { Share2, Download, Briefcase, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CalculatorResultsProps {
  selections: CalculatorSelections;
  onReset: () => void;
}

export function CalculatorResults({ selections, onReset }: CalculatorResultsProps) {
  const { pricing } = useCalculatorPricing(selections);
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

        {/* What's Included */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Scope of Work</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <Check className="h-4 w-4" /> Included
              </p>
              <ul className="space-y-1">
                {allIncluded.slice(0, 6).map((item, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground pl-6">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                <X className="h-4 w-4" /> Not Included
              </p>
              <ul className="space-y-1">
                {allExcluded.slice(0, 4).map((item, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground pl-6">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

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
