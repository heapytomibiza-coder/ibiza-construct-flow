import { WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const OfflineIndicator = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          You are offline. Some features may be limited.
        </AlertDescription>
      </Alert>
    </div>
  );
};
