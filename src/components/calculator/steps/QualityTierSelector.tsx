import { CalculatorCard } from '../ui/CalculatorCard';
import type { QualityTier } from '@/lib/calculator/data-model';
import { Check } from 'lucide-react';
import { TierImageCarousel } from '../ui/TierImageCarousel';

interface QualityTierSelectorProps {
  tiers: QualityTier[];
  selected?: QualityTier;
  onSelect: (tier: QualityTier) => void;
}

export function QualityTierSelector({ tiers, selected, onSelect }: QualityTierSelectorProps) {

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
              {tier.imageUrls && tier.imageUrls.length > 0 && (
                <TierImageCarousel 
                  images={tier.imageUrls} 
                  tierName={tier.name}
                />
              )}

              <div>
                <h3 className="font-semibold text-xl mb-1">{tier.name}</h3>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <div className="space-y-2">
                {tier.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </CalculatorCard>
        ))}
      </div>
    </div>
  );
}
