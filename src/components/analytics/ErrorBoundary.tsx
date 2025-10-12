/**
 * Error Boundary Component
 * Phase 22: Advanced Analytics & Monitoring System
 * 
 * Catches React errors and reports them to analytics
 */

import React, { Component, ReactNode } from 'react';
import { analyticsManager } from '@/lib/analytics';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report to analytics
    analyticsManager.captureError(error, {
      componentStack: errorInfo.componentStack,
      component: 'ErrorBoundary',
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>
                An unexpected error occurred. The error has been logged and we'll look into it.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <pre className="text-xs overflow-auto p-2 bg-secondary rounded">
                  {this.state.error.message}
                </pre>
              )}
              <Button onClick={this.handleReset} variant="outline">
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
