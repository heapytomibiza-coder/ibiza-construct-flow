/**
 * Connection Status Component
 * Phase 20: WebSocket & Real-time Communication
 * 
 * Visual indicator for WebSocket connection status
 */

import { WebSocketStatus } from '@/lib/websocket';
import { StatusIndicator } from '@/components/ui-enhanced';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  status: WebSocketStatus;
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  connected: {
    label: 'Connected',
    status: 'online' as const,
    icon: Wifi,
  },
  connecting: {
    label: 'Connecting...',
    status: 'pending' as const,
    icon: Loader2,
  },
  reconnecting: {
    label: 'Reconnecting...',
    status: 'pending' as const,
    icon: Loader2,
  },
  disconnected: {
    label: 'Disconnected',
    status: 'offline' as const,
    icon: WifiOff,
  },
  error: {
    label: 'Connection Error',
    status: 'busy' as const,
    icon: WifiOff,
  },
};

export function ConnectionStatus({
  status,
  showLabel = true,
  className,
}: ConnectionStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StatusIndicator
        status={config.status}
        pulse={status === 'connecting' || status === 'reconnecting'}
      />
      <Icon className={cn(
        'h-4 w-4',
        (status === 'connecting' || status === 'reconnecting') && 'animate-spin'
      )} />
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {config.label}
        </span>
      )}
    </div>
  );
}
