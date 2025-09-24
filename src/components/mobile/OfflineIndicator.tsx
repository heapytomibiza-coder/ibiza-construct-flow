import React from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export const OfflineIndicator = () => {
  const { isOnline, updateAvailable, refreshApp } = useServiceWorker();

  if (isOnline && !updateAvailable) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-2">
      {!isOnline && (
        <Alert className="bg-warning/10 border-warning">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You're offline. Some features may be limited.</span>
            <Wifi className="h-4 w-4 opacity-50" />
          </AlertDescription>
        </Alert>
      )}
      
      {updateAvailable && (
        <Alert className="bg-primary/10 border-primary mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>App update available!</span>
            <button 
              onClick={refreshApp}
              className="text-primary hover:underline font-medium"
            >
              Refresh
            </button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};