/**
 * Rating Display Component
 * Shows aggregated rating with star visualization
 */

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingDisplayProps {
  rating?: number | null;
  count?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function RatingDisplay({ 
  rating, 
  count, 
  size = 'sm',
  showCount = true,
  className 
}: RatingDisplayProps) {
  if (!rating || rating === 0) return null;

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

  const formattedRating = rating.toFixed(1);

  return (
    <div className={cn('inline-flex items-center gap-1', sizeClasses[size], className)}>
      <Star className={cn('fill-yellow-400 text-yellow-400', starSizes[size])} />
      <span className="font-semibold">{formattedRating}</span>
      {showCount && count && (
        <span className="text-muted-foreground">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
