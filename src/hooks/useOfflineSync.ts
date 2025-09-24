import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface PendingAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

interface OfflineSyncState {
  isOnline: boolean;
  pendingActions: PendingAction[];
  syncInProgress: boolean;
}

export const useOfflineSync = () => {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    pendingActions: [],
    syncInProgress: false
  });

  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  // Load pending actions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('offlinePendingActions');
    if (stored) {
      try {
        const pendingActions = JSON.parse(stored);
        setState(prev => ({ ...prev, pendingActions }));
      } catch (error) {
        console.error('Failed to parse stored pending actions:', error);
        localStorage.removeItem('offlinePendingActions');
      }
    }
  }, []);

  // Save pending actions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('offlinePendingActions', JSON.stringify(state.pendingActions));
  }, [state.pendingActions]);

  // Handle online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      syncPendingActions();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addPendingAction = useCallback((type: string, data: any) => {
    const action: PendingAction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    setState(prev => ({
      ...prev,
      pendingActions: [...prev.pendingActions, action]
    }));

    toast.info('Action saved for when you\'re back online', {
      duration: 3000
    });

    return action.id;
  }, []);

  const removePendingAction = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      pendingActions: prev.pendingActions.filter(action => action.id !== id)
    }));
  }, []);

  const syncPendingActions = useCallback(async () => {
    if (!state.isOnline || state.pendingActions.length === 0 || state.syncInProgress) {
      return;
    }

    setState(prev => ({ ...prev, syncInProgress: true }));

    const actionsToSync = [...state.pendingActions];
    let successCount = 0;
    let failedActions: PendingAction[] = [];

    for (const action of actionsToSync) {
      try {
        // This is where you'd implement the actual sync logic
        // For now, we'll simulate the sync
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate some failures for testing
        if (Math.random() > 0.8) {
          throw new Error('Simulated sync failure');
        }

        successCount++;
        removePendingAction(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        
        if (action.retryCount < maxRetries) {
          failedActions.push({
            ...action,
            retryCount: action.retryCount + 1
          });
        } else {
          // Max retries reached, remove the action
          removePendingAction(action.id);
          toast.error(`Failed to sync ${action.type} after ${maxRetries} attempts`);
        }
      }
    }

    // Update failed actions with incremented retry count
    if (failedActions.length > 0) {
      setState(prev => ({
        ...prev,
        pendingActions: failedActions,
        syncInProgress: false
      }));

      // Schedule retry for failed actions
      setTimeout(() => {
        if (navigator.onLine) {
          syncPendingActions();
        }
      }, retryDelay);
    } else {
      setState(prev => ({ ...prev, syncInProgress: false }));
    }

    if (successCount > 0) {
      toast.success(`Successfully synced ${successCount} action${successCount > 1 ? 's' : ''}`);
    }
  }, [state.isOnline, state.pendingActions, state.syncInProgress, removePendingAction]);

  const clearAllPendingActions = useCallback(() => {
    setState(prev => ({ ...prev, pendingActions: [] }));
    localStorage.removeItem('offlinePendingActions');
    toast.success('All pending actions cleared');
  }, []);

  const executeAction = useCallback(async (type: string, data: any, syncFunction?: (data: any) => Promise<any>) => {
    if (state.isOnline && syncFunction) {
      try {
        return await syncFunction(data);
      } catch (error) {
        // If online action fails, add to pending actions
        addPendingAction(type, data);
        throw error;
      }
    } else {
      // Offline, add to pending actions
      return addPendingAction(type, data);
    }
  }, [state.isOnline, addPendingAction]);

  return {
    isOnline: state.isOnline,
    pendingActions: state.pendingActions,
    syncInProgress: state.syncInProgress,
    addPendingAction,
    removePendingAction,
    syncPendingActions,
    clearAllPendingActions,
    executeAction,
    pendingCount: state.pendingActions.length
  };
};