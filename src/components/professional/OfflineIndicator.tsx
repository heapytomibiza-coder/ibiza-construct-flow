import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const OfflineIndicator = () => {
  const { isOnline, pendingCount, syncInProgress, syncPendingActions } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge 
        variant={isOnline ? "secondary" : "destructive"}
        className="flex items-center gap-2 px-3 py-2"
      >
        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        
        {!isOnline && "Offline Mode"}
        
        {isOnline && pendingCount > 0 && (
          <div className="flex items-center gap-2">
            <span>Syncing {pendingCount} changes</span>
            {syncInProgress ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={syncPendingActions}
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