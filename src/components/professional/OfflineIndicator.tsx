import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const OfflineIndicator = () => {
  const { isOnline, queueLength, syncing, syncQueue } = useOfflineSync();

  if (isOnline && queueLength === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge 
        variant={isOnline ? "secondary" : "destructive"}
        className="flex items-center gap-2 px-3 py-2"
      >
        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        
        {!isOnline && "Offline Mode"}
        
        {isOnline && queueLength > 0 && (
          <div className="flex items-center gap-2">
            <span>Syncing {queueLength} changes</span>
            {syncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={syncQueue}
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
};