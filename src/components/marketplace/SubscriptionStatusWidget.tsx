import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptionTiers';
import { Crown, Zap, Shield, Calendar, ArrowUpCircle } from 'lucide-react';
import { format } from 'date-fns';

export const SubscriptionStatusWidget: React.FC = () => {
  const { tier, subscribed, subscription_end, loading, createCheckout, openCustomerPortal } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTier = tier || 'basic';
  const tierInfo = SUBSCRIPTION_TIERS[currentTier];
  
  const getTierIcon = () => {
    switch (currentTier) {
      case 'premium':
        return <Crown className="w-5 h-5 text-amber-500" />;
      case 'pro':
        return <Zap className="w-5 h-5 text-primary" />;
      default:
        return <Shield className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTierBadgeVariant = () => {
    switch (currentTier) {
      case 'premium':
        return 'default';
      case 'pro':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleUpgrade = async (targetTier: 'pro' | 'premium') => {
    const priceId = SUBSCRIPTION_TIERS[targetTier].priceId;
    await createCheckout(priceId);
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {getTierIcon()}
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Current Tier</div>
            <Badge variant={getTierBadgeVariant()} className="text-base px-3 py-1">
              {tierInfo.name}
            </Badge>
          </div>
          {subscribed && subscription_end && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1 justify-end">
                <Calendar className="w-3 h-3" />
                Renews
              </div>
              <div className="text-sm font-medium">
                {format(new Date(subscription_end), 'MMM d, yyyy')}
              </div>
            </div>
          )}
        </div>

        {currentTier === 'basic' && (
          <div className="pt-3 border-t space-y-2">
            <p className="text-sm text-muted-foreground">
              Upgrade to see jobs immediately and get priority support
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleUpgrade('pro')} 
                className="flex-1"
                size="sm"
              >
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Upgrade to Pro ($29/mo)
              </Button>
              <Button 
                onClick={() => handleUpgrade('premium')} 
                variant="secondary"
                className="flex-1"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                Go Premium ($99/mo)
              </Button>
            </div>
          </div>
        )}

        {currentTier === 'pro' && (
          <div className="pt-3 border-t space-y-2">
            <p className="text-sm text-muted-foreground">
              Upgrade to Premium for exclusive features and top priority
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleUpgrade('premium')} 
                className="flex-1"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium ($99/mo)
              </Button>
              <Button 
                onClick={openCustomerPortal} 
                variant="outline"
                size="sm"
              >
                Manage
              </Button>
            </div>
          </div>
        )}

        {currentTier === 'premium' && (
          <div className="pt-3 border-t">
            <Button 
              onClick={openCustomerPortal} 
              variant="outline"
              className="w-full"
              size="sm"
            >
              Manage Subscription
            </Button>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span>Job Notifications</span>
              <Badge variant="outline" className="text-xs">
                {currentTier === 'premium' ? 'Instant' : currentTier === 'pro' ? 'Fast' : '24hr Delay'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Priority Support</span>
              <Badge variant="outline" className="text-xs">
                {currentTier === 'premium' || currentTier === 'pro' ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
