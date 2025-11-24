/**
 * Loading State Component
 * Phase 14: Component Library Enhancement & Design System Refinement
 * 
 * Consistent loading states with variants
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const loadingVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      variant: {
        spinner: 'animate-spin',
        pulse: 'animate-pulse',
        dots: '',
      },
      size: {
        sm: 'h-4 w-4',
        default: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
      },
    },
    defaultVariants: {
      variant: 'spinner',
      size: 'default',
    },
  }
);

export interface LoadingStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string;
  fullScreen?: boolean;
}

export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, variant = 'spinner', size, text, fullScreen, ...props }, ref) => {
    const content = (
      <div className="flex flex-col items-center gap-3">
        {variant === 'spinner' && (
          <Loader2 className={cn(loadingVariants({ size }), 'text-primary')} />
        )}
        {variant === 'pulse' && (
          <div className={cn(loadingVariants({ size }), 'bg-primary rounded-full')} />
        )}
        {variant === 'dots' && (
          <div className="flex gap-1.5">
            <div className={cn(loadingVariants({ size }), 'bg-primary rounded-full animate-bounce')} style={{ animationDelay: '0ms' }} />
            <div className={cn(loadingVariants({ size }), 'bg-primary rounded-full animate-bounce')} style={{ animationDelay: '150ms' }} />
            <div className={cn(loadingVariants({ size }), 'bg-primary rounded-full animate-bounce')} style={{ animationDelay: '300ms' }} />
          </div>
        )}
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    );

    if (fullScreen) {
      return (
        <div
          ref={ref}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
            className
          )}
          {...props}
        >
          {content}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center p-8', className)}
        {...props}
      >
        {content}
      </div>
    );
  }
);

LoadingState.displayName = 'LoadingState';
