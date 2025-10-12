import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchedProfessionalCardProps {
  professional: {
    user_id: string;
    business_name?: string;
    hourly_rate?: number;
    matchScore: number;
    matchReasons?: string[];
    user?: {
      full_name?: string;
      display_name?: string;
      avatar_url?: string;
      location?: any;
    };
    stats?: {
      average_rating?: number;
      total_reviews?: number;
      response_time_hours?: number;
    };
  };
}

export function MatchedProfessionalCard({ professional }: MatchedProfessionalCardProps) {
  const navigate = useNavigate();
  const user = Array.isArray(professional.user) ? professional.user[0] : professional.user;
  const stats = Array.isArray(professional.stats) ? professional.stats[0] : professional.stats;
  
  const displayName = professional.business_name || user?.full_name || user?.display_name || 'Professional';
  const location = user?.location ? (typeof user.location === 'string' ? user.location : user.location.city) : null;

  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
            {displayName[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg truncate">{displayName}</h3>
              {stats && (
                <div className="flex items-center gap-3 text-sm mt-1">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {((stats as any).average_rating || 0).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    {(stats as any).total_reviews || 0} reviews
                  </span>
                </div>
              )}
            </div>
            
            <Badge className="bg-primary/10 text-primary whitespace-nowrap">
              {professional.matchScore}% match
            </Badge>
          </div>

          {location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
          )}

          {stats && (stats as any).response_time_hours && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <Clock className="w-4 h-4" />
              Responds in ~{(stats as any).response_time_hours}h
            </div>
          )}

          {professional.matchReasons && professional.matchReasons.length > 0 && (
            <div className="space-y-1 mb-4">
              {professional.matchReasons.slice(0, 2).map((reason, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {reason}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(`/professional/${professional.user_id}`)}
              className="flex-1"
            >
              View Profile
            </Button>
            {professional.hourly_rate && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Starting at</div>
                <div className="font-semibold">€{professional.hourly_rate}/hr</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
