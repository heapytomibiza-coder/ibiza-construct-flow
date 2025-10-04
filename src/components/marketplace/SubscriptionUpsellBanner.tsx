import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptionTiers';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface SubscriptionUpsellBannerProps {
  className?: string;
}

export const SubscriptionUpsellBanner: React.FC<SubscriptionUpsellBannerProps> = ({ className }) => {
  const { tier, createCheckout, loading } = useSubscription();

  // Don't show banner for premium users
  if (tier === 'premium') return null;

  const handleUpgrade = async (priceId: string) => {
    try {
      await createCheckout(priceId);
      toast.success('Redirecting to checkout...');
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  return (
    <Card className="border-copper bg-gradient-to-r from-copper/5 to-primary/5">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {tier === 'basic' ? (
                <Crown className="w-5 h-5 text-copper" />
              ) : (
                <Sparkles className="w-5 h-5 text-copper" />
              )}
              <h3 className="font-semibold text-lg">
                {tier === 'basic' 
                  ? 'Upgrade to See Jobs First' 
                  : 'Upgrade to Premium for Maximum Visibility'
                }
              </h3>
              <Badge variant="secondary" className="bg-copper/20 text-copper">
                Limited Time
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {tier === 'basic'
                ? 'Get instant notifications and see jobs 24 hours before basic users. Never miss an opportunity!'
                : 'Get verified badge, premium placement, and advanced analytics. Stand out from the competition!'
              }
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-copper" />
                <span>Instant notifications</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-copper" />
                <span>24hr early access</span>
              </div>
              {tier === 'pro' && (
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="w-4 h-4 text-copper" />
                  <span>Verified badge</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[200px]">
            {tier === 'basic' && (
              <>
                <Button 
                  onClick={() => handleUpgrade(SUBSCRIPTION_TIERS.pro.priceId!)}
                  className="bg-gradient-to-r from-copper to-copper-dark hover:opacity-90 text-white"
                  disabled={loading}
                >
                  Upgrade to Pro - ${SUBSCRIPTION_TIERS.pro.price}/mo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  onClick={() => handleUpgrade(SUBSCRIPTION_TIERS.premium.priceId!)}
                  variant="outline"
                  className="border-copper text-copper hover:bg-copper/10"
                  disabled={loading}
                >
                  Upgrade to Premium - ${SUBSCRIPTION_TIERS.premium.price}/mo
                </Button>
              </>
            )}
            {tier === 'pro' && (
              <Button 
                onClick={() => handleUpgrade(SUBSCRIPTION_TIERS.premium.priceId!)}
                className="bg-gradient-to-r from-copper to-copper-dark hover:opacity-90 text-white"
                disabled={loading}
              >
                Upgrade to Premium - ${SUBSCRIPTION_TIERS.premium.price}/mo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
