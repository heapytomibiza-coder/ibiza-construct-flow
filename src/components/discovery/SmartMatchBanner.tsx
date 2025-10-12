import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SmartMatchBannerProps {
  jobId?: string;
  matchCount?: number;
  topMatchScore?: number;
  onFindMatches?: () => void;
}

export const SmartMatchBanner: React.FC<SmartMatchBannerProps> = ({
  jobId,
  matchCount = 0,
  topMatchScore = 0,
  onFindMatches
}) => {
  const navigate = useNavigate();

  if (!jobId && !onFindMatches) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-purple-500/5 to-copper/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">Get AI-Powered Matches</h3>
              <p className="text-sm text-muted-foreground">
                Post a job and let our smart matching algorithm find the best professionals for your needs.
                We analyze skills, availability, location, and past performance to recommend top matches.
              </p>
              <Button 
                onClick={() => navigate('/post-job')}
                className="mt-3"
              >
                Post a Job
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matchCount === 0) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-purple-500/5 to-copper/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">Find Your Perfect Match</h3>
              <p className="text-sm text-muted-foreground">
                Our AI will analyze your requirements and match you with the most suitable professionals
                based on skills, experience, availability, and ratings.
              </p>
              {onFindMatches && (
                <Button 
                  onClick={onFindMatches}
                  className="mt-3"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find Matches
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-purple-500/5 to-copper/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">Smart Matches Found</h3>
              <Badge variant="default" className="gap-1">
                <Sparkles className="w-3 h-3" />
                {matchCount} Matches
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              We found {matchCount} professionals that are a great fit for your job.
              {topMatchScore > 0.8 && " Top match has an excellent compatibility score!"}
            </p>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate(`/jobs/${jobId}/matches`)}
                size="sm"
              >
                View All Matches
              </Button>
              <span className="text-xs text-muted-foreground">
                Best match: {Math.round(topMatchScore * 100)}% compatible
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
