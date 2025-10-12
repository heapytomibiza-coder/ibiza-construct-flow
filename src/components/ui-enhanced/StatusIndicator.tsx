/**
 * Status Indicator Component
 * Phase 14: Component Library Enhancement & Design System Refinement
 * 
 * Visual status indicator with pulse animation and semantic colors
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusVariants = cva(
  'rounded-full inline-block',
  {
    variants: {
      status: {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        away: 'bg-amber-500',
        busy: 'bg-red-500',
        pending: 'bg-blue-500',
      },
      size: {
        sm: 'w-2 h-2',
        default: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
      },
      pulse: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      status: 'offline',
      size: 'default',
      pulse: false,
    },
  }
);

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusVariants> {
  label?: string;
  showLabel?: boolean;
}

export const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  ({ className, status, size, pulse, label, showLabel = false, ...props }, ref) => {
    const statusLabels = {
      online: 'Online',
      offline: 'Offline',
      away: 'Away',
      busy: 'Busy',
      pending: 'Pending',
    };

    return (
      <span className="inline-flex items-center gap-1.5" ref={ref} {...props}>
        <span className={cn(statusVariants({ status, size, pulse }), className)} />
        {showLabel && (
          <span className="text-xs text-muted-foreground">
            {label || (status && statusLabels[status])}
          </span>
        )}
      </span>
    );
  }
);

StatusIndicator.displayName = 'StatusIndicator';
