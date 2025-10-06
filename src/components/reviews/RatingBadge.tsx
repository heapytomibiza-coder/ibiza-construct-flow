import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingBadgeProps {
  average: number;
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export default function RatingBadge({ 
  average, 
  count, 
  size = 'sm',
  showCount = true,
  className 
}: RatingBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const starSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const formattedAverage = average ? average.toFixed(1) : '—';

  return (
    <div className={cn('inline-flex items-center gap-1', sizeClasses[size], className)}>
      <Star className={cn('fill-yellow-400 text-yellow-400', starSizes[size])} />
      <span className="font-semibold">{formattedAverage}</span>
      {showCount && (
        <span className="text-muted-foreground">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
