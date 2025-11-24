/**
 * Error State Component
 * Phase 14: Component Library Enhancement & Design System Refinement
 * 
 * Consistent error states with retry actions
 */

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  fullScreen?: boolean;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      title = 'Something went wrong',
      message,
      onRetry,
      retryLabel = 'Try again',
      fullScreen,
      ...props
    },
    ref
  ) => {
    const content = (
      <Alert variant="destructive" className="max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              {retryLabel}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );

    if (fullScreen) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-center min-h-[400px] p-8',
            className
          )}
          {...props}
        >
          {content}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('p-4', className)} {...props}>
        {content}
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';
