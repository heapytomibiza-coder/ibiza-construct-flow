import { useState, useRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

export const PullToRefresh = ({
  onRefresh,
  children,
  threshold = 80
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only trigger if at top of scroll
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply resistance
      const resistance = 0.5;
      setPullDistance(diff * resistance);
    }
  };

  const handleTouchEnd = async () => {
    setIsDragging(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 flex items-center justify-center transition-all',
          pullDistance > 0 ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: Math.min(pullDistance, threshold),
          transform: `translateY(-${threshold - Math.min(pullDistance, threshold)}px)`
        }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2
            className={cn(
              'h-6 w-6',
              isRefreshing || pullDistance >= threshold ? 'animate-spin' : ''
            )}
          />
          <span className="text-xs">
            {isRefreshing
              ? 'Refreshing...'
              : pullDistance >= threshold
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};
