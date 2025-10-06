import { useState, useRef, useEffect, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  className?: string;
}

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className
}: SwipeableCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (dragOffset < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setDragOffset(0);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        handleTouchEnd();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, dragOffset]);

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons revealed on swipe */}
      {leftAction && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 flex items-center px-4 transition-opacity',
            dragOffset > 50 ? 'opacity-100' : 'opacity-0'
          )}
        >
          {leftAction}
        </div>
      )}
      {rightAction && (
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 flex items-center px-4 transition-opacity',
            dragOffset < -50 ? 'opacity-100' : 'opacity-0'
          )}
        >
          {rightAction}
        </div>
      )}

      {/* Main card */}
      <Card
        ref={cardRef}
        className={cn(
          'transition-transform touch-pan-y',
          className
        )}
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </Card>
    </div>
  );
};
