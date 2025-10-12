import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, MapPin, Star, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfessionalMatcherProps {
  microId: string;
  location?: string;
}

interface MatchPreview {
  count: number;
  topProfessionals: Array<{
    id: string;
    name: string;
    rating: number;
    distance?: string;
  }>;
}

export const ProfessionalMatcher: React.FC<ProfessionalMatcherProps> = ({
  microId,
  location
}) => {
  const [matches, setMatches] = useState<MatchPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, [microId, location]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      
      // Call the AI professional matcher function
      const { data, error } = await supabase.functions.invoke('ai-professional-matcher', {
        body: {
          microId,
          location,
          limit: 5
        }
      });

      if (error) {
        console.error('Error calling matcher:', error);
        throw error;
      }

      const matches = data?.matches || [];
      const topProfessionals = matches.slice(0, 3).map((match: any) => {
        const user = Array.isArray(match.user) ? match.user[0] : match.user;
        const stats = Array.isArray(match.stats) ? match.stats[0] : match.stats;
        
        return {
          id: match.user_id,
          name: match.business_name || user?.full_name || user?.display_name || 'Professional',
          rating: stats?.average_rating || 0,
          distance: location && user?.location ? calculateDistance(location, user.location) : undefined,
          matchScore: match.matchScore,
          matchReasons: match.matchReasons
        };
      });

      setMatches({
        count: data?.matchedCount || 0,
        topProfessionals
      });
    } catch (error) {
      console.error('Error loading matches:', error);
      setMatches({ count: 0, topProfessionals: [] });
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (loc1: any, loc2: any): string | undefined => {
    const city1 = typeof loc1 === 'string' ? loc1 : loc1?.city;
    const city2 = typeof loc2 === 'string' ? loc2 : loc2?.city;
    
    if (city1 && city2 && city1.toLowerCase() === city2.toLowerCase()) {
      return 'Same city';
    }
    return undefined;
  };

  if (loading) {
    return (
      <Card className="p-6 border-2 border-accent/20 bg-accent/5">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
          <span className="text-sm text-muted-foreground">
            Finding qualified professionals...
          </span>
        </div>
      </Card>
    );
  }

  if (!matches || matches.count === 0) {
    return (
      <Card className="p-6 border-2 border-muted bg-muted/5">
        <div className="text-center space-y-2">
          <Users className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            We'll match you with qualified professionals once you post
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Professionals Ready</h3>
          </div>
          <Badge className="bg-accent text-accent-foreground">
            {matches.count} qualified
          </Badge>
        </div>

        <div className="space-y-3">
          {matches.topProfessionals.slice(0, 3).map((pro, index) => (
            <div
              key={pro.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
            >
              <Avatar className="h-10 w-10 border-2 border-accent/20">
                <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                  {pro.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{pro.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {pro.rating.toFixed(1)}
                  </span>
                  {pro.distance && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {pro.distance}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          These professionals will be notified when you post your job
        </p>
        
        {microId && (
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={() => window.location.href = `/jobs/${microId}/matches`}
          >
            View All Matches
          </Button>
        )}
      </div>
    </Card>
  );
};
