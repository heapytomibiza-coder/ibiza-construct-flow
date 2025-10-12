/**
 * Offline Indicator Component
 * Phase 21: Advanced Caching & Offline Support
 * 
 * Visual indicator for offline status
 */

import { useOnlineStatus } from '@/hooks/cache';
import { Badge } from '@/components/ui-enhanced';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  showWhenOnline?: boolean;
  className?: string;
}

export function OfflineIndicator({
  showWhenOnline = false,
  className,
}: OfflineIndicatorProps) {
  const { isOnline, isOffline } = useOnlineStatus();

  if (isOnline && !showWhenOnline) {
    return null;
  }

  return (
    <Badge
      variant={isOffline ? 'destructive' : 'success'}
      size="sm"
      className={cn('gap-1.5', className)}
    >
      {isOffline ? (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      ) : (
        <>
          <Wifi className="h-3 w-3" />
          Online
        </>
      )}
    </Badge>
  );
}
