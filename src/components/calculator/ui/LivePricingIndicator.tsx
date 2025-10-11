import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LivePricingIndicatorProps {
  isCalculating: boolean;
}

export function LivePricingIndicator({ isCalculating }: LivePricingIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (isCalculating) {
      setShowIndicator(true);
    } else {
      // Keep showing for a brief moment after calculation completes
      const timeout = setTimeout(() => setShowIndicator(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isCalculating]);

  if (!showIndicator) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={cn(
        "bg-card border shadow-lg rounded-lg px-4 py-3",
        "flex items-center gap-3",
        "transition-all duration-200",
        isCalculating ? "opacity-100" : "opacity-50"
      )}>
        <div className={cn(
          "h-2 w-2 rounded-full",
          isCalculating ? "bg-primary animate-pulse" : "bg-green-500"
        )} />
        <span className="text-sm font-medium">
          {isCalculating ? 'Recalculating...' : 'Updated'}
        </span>
      </div>
    </div>
  );
}

