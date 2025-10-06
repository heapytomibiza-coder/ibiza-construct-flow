import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MatchResult {
  professional_id: string;
  match_score: number;
  match_reasons: Array<{
    reason: string;
    weight: number;
    score: number;
  }>;
  skill_match_score?: number;
  experience_match_score?: number;
  price_match_score?: number;
  location_match_score?: number;
}

interface AIMatchingResultsProps {
  matches: MatchResult[];
  isLoading: boolean;
  onContactProfessional?: (professionalId: string) => void;
}

export function AIMatchingResults({
  matches,
  isLoading,
  onContactProfessional,
}: AIMatchingResultsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            Finding Best Matches...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Matches Found</CardTitle>
          <CardDescription>
            No professionals matched your requirements at this time
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Brain className="h-4 w-4" />
        <span className="text-sm">
          AI-powered matching found {matches.length} professional{matches.length !== 1 ? 's' : ''}
        </span>
      </div>

      {matches.map((match) => (
        <Card key={match.professional_id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  Professional Match
                  <Badge
                    variant={match.match_score >= 80 ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {Math.round(match.match_score)}% Match
                  </Badge>
                </CardTitle>
              </div>
              {onContactProfessional && (
                <Button
                  size="sm"
                  onClick={() => onContactProfessional(match.professional_id)}
                >
                  Contact
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Match Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {match.skill_match_score !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Skills</span>
                    <span className={getScoreColor(match.skill_match_score)}>
                      {Math.round(match.skill_match_score)}%
                    </span>
                  </div>
                  <Progress value={match.skill_match_score} />
                </div>
              )}
              {match.experience_match_score !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Experience</span>
                    <span className={getScoreColor(match.experience_match_score)}>
                      {Math.round(match.experience_match_score)}%
                    </span>
                  </div>
                  <Progress value={match.experience_match_score} />
                </div>
              )}
              {match.price_match_score !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className={getScoreColor(match.price_match_score)}>
                      {Math.round(match.price_match_score)}%
                    </span>
                  </div>
                  <Progress value={match.price_match_score} />
                </div>
              )}
              {match.location_match_score !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location</span>
                    <span className={getScoreColor(match.location_match_score)}>
                      {Math.round(match.location_match_score)}%
                    </span>
                  </div>
                  <Progress value={match.location_match_score} />
                </div>
              )}
            </div>

            {/* Match Reasons */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Why this is a good match:</h4>
              <ul className="space-y-1">
                {match.match_reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="mt-0.5">
                      {Math.round(reason.score)}%
                    </Badge>
                    <span className="text-muted-foreground">{reason.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}