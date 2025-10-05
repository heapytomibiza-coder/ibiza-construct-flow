/**
 * Reusable error fallback components
 * For different error states and contexts
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  WifiOff, 
  Lock, 
  FileQuestion,
  Server
} from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  message?: string;
}

export const GenericErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.'
}) => (
  <div className="min-h-[400px] flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">{message}</p>
        
        {resetErrorBoundary && (
          <div className="flex gap-2">
            <Button onClick={resetErrorBoundary} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline" className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

export const NetworkErrorFallback: React.FC<ErrorFallbackProps> = ({
  resetErrorBoundary
}) => (
  <div className="min-h-[400px] flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
          <WifiOff className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <CardTitle>Connection Lost</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          We're having trouble connecting. Please check your internet connection and try again.
        </p>
        
        {resetErrorBoundary && (
          <Button onClick={resetErrorBoundary} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        )}
      </CardContent>
    </Card>
  </div>
);

export const AuthErrorFallback: React.FC = () => (
  <div className="min-h-[400px] flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
          <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle>Session Expired</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          Your session has expired. Please sign in again to continue.
        </p>
        
        <Button onClick={() => window.location.href = '/auth/sign-in'} className="w-full">
          <Lock className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </CardContent>
    </Card>
  </div>
);

export const NotFoundErrorFallback: React.FC<{ message?: string }> = ({
  message = 'The resource you\'re looking for could not be found.'
}) => (
  <div className="min-h-[400px] flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle>Not Found</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">{message}</p>
        
        <Button onClick={() => window.location.href = '/'} className="w-full">
          <Home className="w-4 h-4 mr-2" />
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  </div>
);

export const ServerErrorFallback: React.FC<ErrorFallbackProps> = ({
  resetErrorBoundary
}) => (
  <div className="min-h-[400px] flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <Server className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <CardTitle>Server Error</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          Something went wrong on our end. We've been notified and are working to fix it.
        </p>
        
        {resetErrorBoundary && (
          <div className="flex gap-2">
            <Button onClick={resetErrorBoundary} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline" className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        )}
        
        <p className="text-xs text-center text-muted-foreground">
          If this problem persists, please contact support.
        </p>
      </CardContent>
    </Card>
  </div>
);

/**
 * Inline error display for form fields and smaller components
 */
export const InlineError: React.FC<{ message: string; retry?: () => void }> = ({
  message,
  retry
}) => (
  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
    <p className="text-sm text-destructive flex-1">{message}</p>
    {retry && (
      <Button onClick={retry} size="sm" variant="ghost" className="flex-shrink-0">
        <RefreshCw className="w-3 h-3" />
      </Button>
    )}
  </div>
);

/**
 * Loading state with error fallback
 */
export const LoadingWithError: React.FC<{
  loading: boolean;
  error?: Error | null;
  retry?: () => void;
  children: React.ReactNode;
}> = ({ loading, error, retry, children }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return <InlineError message={error.message} retry={retry} />;
  }
  
  return <>{children}</>;
};
