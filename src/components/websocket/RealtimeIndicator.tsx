/**
 * Realtime Indicator Component
 * Phase 20: WebSocket & Real-time Communication
 * 
 * Shows live data sync indicator
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui-enhanced';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeIndicatorProps {
  active?: boolean;
  label?: string;
  className?: string;
}

export function RealtimeIndicator({
  active = true,
  label = 'Live',
  className,
}: RealtimeIndicatorProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (active) {
      const interval = setInterval(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 200);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [active]);

  if (!active) return null;

  return (
    <Badge
      variant="success"
      size="sm"
      className={cn(
        'gap-1.5',
        pulse && 'scale-105 transition-transform',
        className
      )}
    >
      <Activity className="h-3 w-3" />
      {label}
    </Badge>
  );
}
