import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudOff, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OfflineIndicatorProps {
  className?: string;
  variant?: 'mobile' | 'professional';
  useOfflineSync?: {
    isOnline: boolean;
    pendingCount: number;
    syncInProgress: boolean;
    syncPendingActions: () => Promise<void>;
  };
}

export const OfflineIndicator = ({ 
  className, 
  variant = 'mobile',
  useOfflineSync 
}: OfflineIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(!navigator.onLine);
  const [hasOfflineCapability, setHasOfflineCapability] = useState(false);

  // Use external offline sync hook if provided (professional variant)
  const syncData = useOfflineSync || {
    isOnline,
    pendingCount: 0,
    syncInProgress: false,
    syncPendingActions: () => Promise.resolve()
  };

  useEffect(() => {
    // Check if service worker is registered for offline capability
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        setHasOfflineCapability(!!registration);
      });
    }

    const handleOnline = () => {
      setIsOnline(true);
      if (variant === 'mobile') {
        setShowIndicator(false);
        toast.success('Connection restored', {
          icon: <Wifi className="w-4 h-4" />,
          duration: 3000
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (variant === 'mobile') {
        setShowIndicator(true);
        toast.error('You are offline', {
          icon: <WifiOff className="w-4 h-4" />,
          duration: 5000
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [variant]);

  // Professional variant logic
  if (variant === 'professional') {
    if (syncData.isOnline && syncData.pendingCount === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50">
        <Badge 
          variant={syncData.isOnline ? "secondary" : "destructive"}
          className="flex items-center gap-2 px-3 py-2"
        >
          {syncData.isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          
          {!syncData.isOnline && "Offline Mode"}
          
          {syncData.isOnline && syncData.pendingCount > 0 && (
            <div className="flex items-center gap-2">
              <span>Syncing {syncData.pendingCount} changes</span>
              {syncData.syncInProgress ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={syncData.syncPendingActions}
                  className="h-6 px-2"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </Badge>
      </div>
    );
  }

  // Mobile variant logic
  if (!showIndicator) return null;

  return (
    <div 
      className={cn(
        "fixed top-16 left-4 right-4 z-50 animate-in slide-in-from-top-2",
        className
      )}
    >
      <div className="bg-destructive/90 backdrop-blur text-destructive-foreground px-4 py-3 rounded-lg shadow-lg border border-destructive/20">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {hasOfflineCapability ? (
              <CloudOff className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {hasOfflineCapability ? 'Working offline' : 'No internet connection'}
            </p>
            <p className="text-xs text-destructive-foreground/80 mt-0.5">
              {hasOfflineCapability 
                ? 'Some features may be limited' 
                : 'Check your connection and try again'
              }
            </p>
          </div>

          <div className="flex-shrink-0">
            <div className="flex space-x-1">
              <div className={cn(
                "w-1 h-4 bg-current rounded-full animate-pulse",
                "opacity-30"
              )} />
              <div className={cn(
                "w-1 h-4 bg-current rounded-full animate-pulse",
                "opacity-60 animation-delay-150"
              )} />
              <div className={cn(
                "w-1 h-4 bg-current rounded-full animate-pulse", 
                "opacity-90 animation-delay-300"
              )} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};