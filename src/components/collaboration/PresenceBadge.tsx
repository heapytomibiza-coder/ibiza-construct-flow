import { usePresence } from '@/hooks/usePresence';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

interface PresenceBadgeProps {
  userId: string;
  showStatus?: boolean;
  className?: string;
}

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-gray-400'
};

const statusLabels = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline'
};

export const PresenceBadge = ({ userId, showStatus = false, className = '' }: PresenceBadgeProps) => {
  const { getUserPresence, isUserOnline } = usePresence([userId]);
  const presence = getUserPresence(userId);
  const isOnline = isUserOnline(userId);

  if (!presence) return null;

  const indicator = (
    <span
      className={`inline-block w-2 h-2 rounded-full ${statusColors[presence.status]} ${className}`}
      aria-label={statusLabels[presence.status]}
    />
  );

  if (!showStatus) return indicator;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {indicator}
            <Badge variant={isOnline ? 'default' : 'secondary'} className="text-xs">
              {statusLabels[presence.status]}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{statusLabels[presence.status]}</p>
            {presence.custom_status && (
              <p className="text-sm text-muted-foreground">{presence.custom_status}</p>
            )}
            {!isOnline && presence.last_seen && (
              <p className="text-xs text-muted-foreground">
                Last seen {formatDistanceToNow(new Date(presence.last_seen), { addSuffix: true })}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
