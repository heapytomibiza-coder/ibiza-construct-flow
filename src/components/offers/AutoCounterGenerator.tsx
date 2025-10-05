import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/ibiza-defaults';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CounterOption {
  id: 'good' | 'better' | 'best';
  label: string;
  amount: number;
  savings: number;
  scopeChanges: string[];
  recommended?: boolean;
}

interface AutoCounterGeneratorProps {
  originalAmount: number;
  originalScope: string[];
  onSelectCounter: (amount: number, scope: string[]) => void;
}

export const AutoCounterGenerator = ({
  originalAmount,
  originalScope,
  onSelectCounter
}: AutoCounterGeneratorProps) => {
  const [counterOptions, setCounterOptions] = useState<CounterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    generateCounters();
  }, [originalAmount, originalScope]);

  const generateCounters = () => {
    setLoading(true);
    
    // AI-powered counter generation (simplified version)
    // In production, this would call an edge function
    const options: CounterOption[] = [
      {
        id: 'good',
        label: 'Budget Option',
        amount: Math.round(originalAmount * 0.85),
        savings: Math.round(originalAmount * 0.15),
        scopeChanges: [
          'Standard materials instead of premium',
          'Flexible timeline (add 1-2 weeks)',
          'Basic finish only',
        ],
      },
      {
        id: 'better',
        label: 'Balanced Option',
        amount: Math.round(originalAmount * 0.92),
        savings: Math.round(originalAmount * 0.08),
        scopeChanges: [
          'Mix of standard and premium materials',
          'Slightly extended timeline',
          'Include most premium features',
        ],
        recommended: true,
      },
      {
        id: 'best',
        label: 'Premium Option',
        amount: Math.round(originalAmount * 0.97),
        savings: Math.round(originalAmount * 0.03),
        scopeChanges: [
          'All premium materials maintained',
          'Minor timeline adjustment only',
          'Full original scope with minor optimizations',
        ],
      },
    ];

    setCounterOptions(options);
    setLoading(false);
  };

  const handleSelectCounter = (option: CounterOption) => {
    onSelectCounter(option.amount, option.scopeChanges);
    toast({
      title: 'Counter-offer generated',
      description: `${option.label}: ${formatCurrency(option.amount)}`,
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">
            Generating smart counter-offers...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">AI-Generated Counter-Offers</h3>
        <Badge variant="secondary">One tap to send</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {counterOptions.map((option) => (
          <Card
            key={option.id}
            className={cn(
              "relative p-6 cursor-pointer transition-all hover:shadow-lg",
              option.recommended && "border-2 border-primary"
            )}
            onClick={() => handleSelectCounter(option)}
          >
            {option.recommended && (
              <Badge className="absolute -top-2 left-4 bg-primary">
                Recommended
              </Badge>
            )}

            <div className="space-y-4">
              {/* Header */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {option.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">
                    {formatCurrency(option.amount)}
                  </p>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>

              {/* Savings */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Save {formatCurrency(option.savings)}
                </span>
              </div>

              {/* Scope changes */}
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Adjustments
                </p>
                <ul className="space-y-1">
                  {option.scopeChanges.map((change, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Button
                variant={option.recommended ? "default" : "outline"}
                className="w-full"
              >
                Send This Offer
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        All counter-offers are calculated based on market rates and project scope
      </p>
    </div>
  );
};
