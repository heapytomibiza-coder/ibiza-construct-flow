import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Zap, Shield, Star, MapPin, Clock, CheckCircle2, ArrowUpCircle } from 'lucide-react';

interface EnhancedProfileCardProps {
  profile: {
    user_id: string;
    business_name?: string;
    bio?: string;
    service_categories?: string[];
    verification_status?: string;
    is_active?: boolean;
  };
  stats?: {
    completed_jobs?: number;
    average_rating?: number;
    response_time_hours?: number;
  };
  onUpgrade?: () => void;
  onManageServices?: () => void;
}

export const EnhancedProfileCard: React.FC<EnhancedProfileCardProps> = ({
  profile,
  stats,
  onUpgrade,
  onManageServices
}) => {
  const { tier, subscribed } = useSubscription();

  const getTierIcon = () => {
    switch (tier) {
      case 'premium':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'pro':
        return <Zap className="w-4 h-4 text-primary" />;
      default:
        return <Shield className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTierBadgeVariant = () => {
    switch (tier) {
      case 'premium':
        return 'default';
      case 'pro':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const isVerified = profile.verification_status === 'verified';

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {profile.business_name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold">{profile.business_name || 'Professional'}</h3>
                {isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getTierBadgeVariant()} className="text-xs">
                  {getTierIcon()}
                  <span className="ml-1">{tier?.toUpperCase()}</span>
                </Badge>
                {!isVerified && (
                  <Badge variant="outline" className="text-xs">
                    Pending Verification
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 py-3 border-y">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {stats?.completed_jobs || 0}
            </div>
            <div className="text-xs text-muted-foreground">Jobs Done</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-2xl font-bold text-foreground">
                {stats?.average_rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-2xl font-bold text-foreground">
                {stats?.response_time_hours || '24'}h
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Response</div>
          </div>
        </div>

        {/* Service Categories */}
        {profile.service_categories && profile.service_categories.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Services</div>
            <div className="flex flex-wrap gap-2">
              {profile.service_categories.map((category, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {tier === 'basic' && !subscribed && onUpgrade && (
            <Button onClick={onUpgrade} className="flex-1" size="sm">
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          )}
          {onManageServices && (
            <Button onClick={onManageServices} variant="outline" className="flex-1" size="sm">
              Manage Services
            </Button>
          )}
        </div>

        {/* Upgrade Prompt for Basic Users */}
        {tier === 'basic' && (
          <div className="p-3 bg-muted/50 rounded-lg border">
            <div className="text-sm font-medium mb-1">Limited to 3 services</div>
            <p className="text-xs text-muted-foreground mb-2">
              Upgrade to Pro for 10 services or Premium for unlimited
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
