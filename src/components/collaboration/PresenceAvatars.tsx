/**
 * Presence Avatars Component
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * Display avatars of online users
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PresenceUser } from '@/lib/collaboration';
import { cn } from '@/lib/utils';

interface PresenceAvatarsProps {
  users: PresenceUser[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
};

export function PresenceAvatars({
  users,
  maxDisplay = 5,
  size = 'md',
  className,
}: PresenceAvatarsProps) {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  if (users.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn('flex -space-x-2', className)}>
        {displayUsers.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <Avatar
                className={cn(
                  sizeClasses[size],
                  'ring-2 ring-background',
                  user.status === 'online' && 'ring-green-500'
                )}
                style={{ borderColor: user.color }}
              >
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback style={{ backgroundColor: user.color }}>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  sizeClasses[size],
                  'flex items-center justify-center rounded-full bg-muted ring-2 ring-background'
                )}
              >
                <span className="text-muted-foreground font-medium">+{remainingCount}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{remainingCount} more user{remainingCount > 1 ? 's' : ''} online</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
