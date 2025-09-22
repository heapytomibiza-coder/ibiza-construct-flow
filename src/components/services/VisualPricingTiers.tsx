import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Star, Clock, Shield } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  savings?: string;
}

interface VisualPricingTiersProps {
  tiers: PricingTier[];
  selectedTier?: string;
  onTierSelect: (tierId: string) => void;
}

export const VisualPricingTiers = ({ tiers, selectedTier, onTierSelect }: VisualPricingTiersProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-display text-2xl font-bold text-charcoal mb-3">
          Choose Your Service Package
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          All packages include professional service, quality guarantee, and transparent pricing.
          Select the one that best fits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier, index) => {
          const isSelected = selectedTier === tier.id;
          const isPopular = tier.popular;
          const isRecommended = tier.recommended;
          
          return (
            <Card 
              key={tier.id}
              className={`
                relative cursor-pointer transition-all duration-300 hover:scale-105
                ${isSelected 
                  ? 'ring-2 ring-copper shadow-luxury bg-gradient-card' 
                  : 'card-luxury hover:shadow-card'
                }
                ${isPopular ? 'border-copper/50' : ''}
              `}
              onClick={() => onTierSelect(tier.id)}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-hero text-white px-4 py-1 rounded-full shadow-luxury">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Recommended Badge */}
              {isRecommended && !isPopular && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-600 text-white px-3 py-1 rounded-full">
                    Recommended
                  </Badge>
                </div>
              )}

              {/* Savings Badge */}
              {tier.savings && (
                <div className="absolute -top-3 left-4">
                  <Badge className="bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">
                    Save {tier.savings}
                  </Badge>
                </div>
              )}

              <CardContent className="p-6 pt-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <h4 className="text-display text-xl font-bold text-charcoal mb-2">
                    {tier.name}
                  </h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    {tier.description}
                  </p>
                  
                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2">
                      {tier.originalPrice && (
                        <span className="text-muted-foreground text-lg line-through">
                          €{tier.originalPrice}
                        </span>
                      )}
                      <span className="text-copper font-bold text-3xl">
                        €{tier.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{tier.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-6">
                  <h5 className="font-semibold text-charcoal text-sm uppercase tracking-wide">
                    What's Included:
                  </h5>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quality Indicators */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-sand-light/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">
                      Insured
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">
                      4.9★ Rated
                    </span>
                  </div>
                </div>

                {/* Select Button */}
                <Button 
                  className={`w-full ${
                    isSelected 
                      ? 'btn-hero' 
                      : isPopular 
                        ? 'btn-hero' 
                        : 'btn-secondary'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTierSelect(tier.id);
                  }}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    'Select Package'
                  )}
                </Button>

                {/* Additional Info */}
                {isPopular && (
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    ⭐ Chosen by 78% of our customers
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trust Indicators */}
      <div className="bg-gradient-card rounded-xl p-6 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-charcoal text-sm">100% Insured</div>
              <div className="text-xs text-muted-foreground">All work covered</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-charcoal text-sm">4.9/5 Rating</div>
              <div className="text-xs text-muted-foreground">500+ reviews</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-copper/20 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-copper" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-charcoal text-sm">Satisfaction Guarantee</div>
              <div className="text-xs text-muted-foreground">30-day warranty</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};