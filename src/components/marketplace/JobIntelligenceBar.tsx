import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobIntelligenceBarProps {
  viewCount?: number;
  quoteCount?: number;
  averageQuote?: number;
  timeRemaining?: string;
  clientActivity?: 'active' | 'recent' | 'inactive';
  successProbability?: number;
  className?: string;
}

export const JobIntelligenceBar: React.FC<JobIntelligenceBarProps> = ({
  viewCount,
  quoteCount,
  averageQuote,
  timeRemaining,
  clientActivity,
  successProbability,
  className
}) => {
  const getActivityColor = (activity?: string) => {
    if (activity === 'active') return 'bg-green-500';
    if (activity === 'recent') return 'bg-amber-500';
    return 'bg-gray-500';
  };

  const getActivityText = (activity?: string) => {
    if (activity === 'active') return 'Active now';
    if (activity === 'recent') return 'Active 5m ago';
    return 'Offline';
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-xs", className)}>
      {/* Competition Level */}
      {(viewCount !== undefined || quoteCount !== undefined) && (
        <Badge variant="outline" className="gap-1">
          <Users className="w-3 h-3" />
          {viewCount ? `${viewCount} viewing` : `${quoteCount} quotes`}
        </Badge>
      )}

      {/* Client Activity */}
      {clientActivity && (
        <Badge variant="outline" className="gap-1">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", getActivityColor(clientActivity))} />
          {getActivityText(clientActivity)}
        </Badge>
      )}

      {/* Time Sensitivity */}
      {timeRemaining && (
        <Badge variant="outline" className="gap-1 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
          <Clock className="w-3 h-3" />
          {timeRemaining}
        </Badge>
      )}

      {/* Average Quote Range */}
      {averageQuote && (
        <Badge variant="outline" className="gap-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
          <DollarSign className="w-3 h-3" />
          Similar: €{averageQuote - 50}-€{averageQuote + 50}
        </Badge>
      )}

      {/* Success Probability */}
      {successProbability && successProbability >= 60 && (
        <Badge className="gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <TrendingUp className="w-3 h-3" />
          {successProbability}% win rate
        </Badge>
      )}
    </div>
  );
};
