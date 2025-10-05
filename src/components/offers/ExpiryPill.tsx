import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExpiryPillProps {
  expiresAt: Date;
  onExtend?: () => void;
  canExtend?: boolean;
  className?: string;
}

export const ExpiryPill = ({
  expiresAt,
  onExtend,
  canExtend = true,
  className
}: ExpiryPillProps) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const expired = now > expiresAt;
      setIsExpired(expired);

      if (expired) {
        setTimeLeft('Expired');
        return;
      }

      const distance = formatDistanceToNow(expiresAt, { addSuffix: true });
      setTimeLeft(`Expires ${distance}`);

      // Mark as urgent if less than 24 hours
      const hoursLeft = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      setIsUrgent(hoursLeft < 24);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        variant={isExpired ? "destructive" : isUrgent ? "default" : "secondary"}
        className={cn(
          "flex items-center gap-1.5",
          isUrgent && !isExpired && "animate-pulse"
        )}
      >
        <Clock className="w-3 h-3" />
        {timeLeft}
      </Badge>

      {canExtend && !isExpired && onExtend && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onExtend}
          className="h-7 px-2 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Extend
        </Button>
      )}
    </div>
  );
};
