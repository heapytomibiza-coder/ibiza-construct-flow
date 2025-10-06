import { cn } from '@/lib/utils';
import { usePresence } from '@/hooks/usePresence';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

interface PresenceIndicatorProps {
  userId: string;
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PresenceIndicator = ({
  userId,
  showStatus = false,
  size = 'md',
  className
}: PresenceIndicatorProps) => {
  const { getUserPresence, isUserOnline } = usePresence([userId]);
  const presence = getUserPresence(userId);
  const online = isUserOnline(userId);

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400'
  };

  const status = online ? presence?.status || 'offline' : 'offline';

  const indicator = (
    <div
      className={cn(
        'rounded-full border-2 border-background',
        sizeClasses[size],
        statusColors[status],
        className
      )}
    />
  );

  if (!showStatus || !presence) {
    return indicator;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={cn('h-2 w-2 rounded-full', statusColors[status])} />
              <span className="font-medium capitalize">{status}</span>
            </div>
            {presence.custom_status && (
              <div className="text-sm">
                {presence.status_emoji} {presence.custom_status}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Last seen {formatDistanceToNow(new Date(presence.last_seen))} ago
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
