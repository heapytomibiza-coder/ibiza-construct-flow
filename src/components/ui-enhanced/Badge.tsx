/**
 * Enhanced Badge Component
 * Phase 14: Component Library Enhancement & Design System Refinement
 * 
 * Standardized badge with semantic variants and consistent styling
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
        warning: 'border-transparent bg-amber-500 text-white hover:bg-amber-600',
        info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600',
        outline: 'border-border text-foreground hover:bg-accent hover:text-accent-foreground',
        ghost: 'border-transparent hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5',
        default: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
      status: {
        online: 'border-transparent bg-green-500 text-white',
        offline: 'border-transparent bg-gray-500 text-white',
        away: 'border-transparent bg-amber-500 text-white',
        busy: 'border-transparent bg-red-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, status, dot, icon, removable, onRemove, children, ...props }, ref) => {
    // Use status variant if provided, otherwise use variant
    const computedVariant = status ? undefined : variant;
    const computedStatus = status;
    
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant: computedVariant, status: computedStatus, size }), className)}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
        {removable && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-white/20"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Remove</span>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
