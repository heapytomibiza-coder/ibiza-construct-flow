import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalculatorCard } from '../ui/CalculatorCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { QualityTier } from '../hooks/useCalculatorState';
import { Check } from 'lucide-react';
import { TierImageCarousel } from '../ui/TierImageCarousel';

interface QualityTierSelectorProps {
  selected?: QualityTier;
  onSelect: (tier: QualityTier) => void;
}

export function QualityTierSelector({ selected, onSelect }: QualityTierSelectorProps) {
  const [tiers, setTiers] = useState<QualityTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTiers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('calculator_quality_tiers' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (!error && data) {
        setTiers(data as any);
      }
      setLoading(false);
    };

    fetchTiers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">What quality level?</h2>
        <p className="text-muted-foreground">Choose the finish quality that matches your vision</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {tiers.map(tier => (
          <CalculatorCard
            key={tier.id}
            selected={selected?.id === tier.id}
            onClick={() => onSelect(tier)}
          >
            <div className="space-y-4">
              {/* Tier Image Carousel */}
              {tier.image_urls && tier.image_urls.length > 0 && (
                <TierImageCarousel 
                  images={tier.image_urls} 
                  tierName={tier.display_name}
                />
              )}

              <div>
                <h3 className="font-semibold text-xl mb-1">{tier.display_name}</h3>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <div className="space-y-2">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {tier.brand_examples && tier.brand_examples.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Brands: {tier.brand_examples.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </CalculatorCard>
        ))}
      </div>
    </div>
  );
}
