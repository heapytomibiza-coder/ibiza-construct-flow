import { OfflineIndicator as BaseOfflineIndicator } from '@/components/common/OfflineIndicator';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export const OfflineIndicator = () => {
  const { isOnline, pendingCount, syncInProgress, syncPendingActions } = useOfflineSync();

  return (
    <BaseOfflineIndicator 
      variant="professional" 
      useOfflineSync={{ 
        isOnline, 
        pendingCount, 
        syncInProgress, 
        syncPendingActions 
      }} 
    />
  );
};