import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, TrendingUp, MapPin, Euro, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobMatchScoreProps {
  score: number;
  breakdown?: {
    skillMatch?: number;
    locationMatch?: number;
    budgetMatch?: number;
    availabilityMatch?: number;
  };
  className?: string;
}

export const JobMatchScore: React.FC<JobMatchScoreProps> = ({ 
  score, 
  breakdown,
  className 
}) => {
  const getMatchLabel = (score: number) => {
    if (score >= 85) return { label: 'Perfect Match', color: 'from-green-500 to-emerald-500', icon: Sparkles };
    if (score >= 70) return { label: 'Great Match', color: 'from-blue-500 to-cyan-500', icon: TrendingUp };
    if (score >= 50) return { label: 'Good Match', color: 'from-amber-500 to-orange-500', icon: Zap };
    return { label: 'Possible Match', color: 'from-gray-400 to-gray-500', icon: TrendingUp };
  };

  const match = getMatchLabel(score);
  const Icon = match.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={cn(
              "bg-gradient-to-r text-white font-semibold cursor-help",
              match.color,
              className
            )}
          >
            <Icon className="w-3 h-3 mr-1" />
            {score}% Match
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold text-sm">{match.label}</p>
            {breakdown && (
              <div className="space-y-1 text-xs">
                {breakdown.skillMatch !== undefined && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Skills:</span>
                    <span className="font-medium">{breakdown.skillMatch}%</span>
                  </div>
                )}
                {breakdown.locationMatch !== undefined && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{breakdown.locationMatch}%</span>
                  </div>
                )}
                {breakdown.budgetMatch !== undefined && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">{breakdown.budgetMatch}%</span>
                  </div>
                )}
                {breakdown.availabilityMatch !== undefined && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Availability:</span>
                    <span className="font-medium">{breakdown.availabilityMatch}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
