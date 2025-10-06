import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, DollarSign, Heart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileJobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    budget: string;
    location: string;
    postedAt: string;
    status: string;
  };
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
}

export const MobileJobCard = ({
  job,
  onSwipeLeft,
  onSwipeRight,
  onTap
}: MobileJobCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const offset = currentX - startX;
    setDragOffset(offset);
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

  return (
    <div className="relative">
      {/* Swipe actions background */}
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-lg">
        <div
          className={cn(
            'flex items-center gap-2 text-primary transition-opacity',
            dragOffset > 50 ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Heart className="h-5 w-5" />
          <span className="font-medium">Save</span>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 text-blue-500 transition-opacity',
            dragOffset < -50 ? 'opacity-100' : 'opacity-0'
          )}
        >
          <span className="font-medium">Share</span>
          <Share2 className="h-5 w-5" />
        </div>
      </div>

      {/* Card */}
      <Card
        className={cn(
          'relative p-4 touch-none transition-transform',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => !isDragging && onTap?.()}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-base line-clamp-1">{job.title}</h3>
          <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
            {job.status}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {job.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{job.budget}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{job.postedAt}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
