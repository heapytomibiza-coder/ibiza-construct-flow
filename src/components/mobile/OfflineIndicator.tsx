import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator = ({ className }: OfflineIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(!navigator.onLine);
  const [hasOfflineCapability, setHasOfflineCapability] = useState(false);

  useEffect(() => {
    // Check if service worker is registered for offline capability
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        setHasOfflineCapability(!!registration);
      });
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(false);
      toast.success('Connection restored', {
        icon: <Wifi className="w-4 h-4" />,
        duration: 3000
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      toast.error('You are offline', {
        icon: <WifiOff className="w-4 h-4" />,
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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