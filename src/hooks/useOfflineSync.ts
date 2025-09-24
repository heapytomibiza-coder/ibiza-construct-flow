import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QueuedAction {
  id: string;
  type: 'photo_upload' | 'message_send' | 'job_update' | 'variation_create';
  payload: any;
  timestamp: number;
  attempts: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [syncing, setSyncing] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online - syncing data...');
      syncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('Offline mode - changes will sync when reconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('offline_queue');
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Error loading offline queue:', error);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('offline_queue', JSON.stringify(queue));
  }, [queue]);

  const addToQueue = useCallback((type: QueuedAction['type'], payload: any) => {
    const action: QueuedAction = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      payload,
      timestamp: Date.now(),
      attempts: 0
    };

    setQueue(prev => [...prev, action]);

    if (isOnline) {
      syncQueue();
    }
  }, [isOnline]);

  const syncQueue = useCallback(async () => {
    if (syncing || queue.length === 0) return;

    setSyncing(true);

    const updatedQueue = [...queue];
    const toRemove: string[] = [];

    for (const action of updatedQueue) {
      try {
        await processAction(action);
        toRemove.push(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        
        // Increment attempt count
        const actionIndex = updatedQueue.findIndex(a => a.id === action.id);
        if (actionIndex !== -1) {
          updatedQueue[actionIndex].attempts++;
          
          // Remove after 5 failed attempts
          if (updatedQueue[actionIndex].attempts >= 5) {
            toRemove.push(action.id);
            toast.error(`Failed to sync ${action.type} after 5 attempts`);
          }
        }
      }
    }

    // Remove successfully synced or failed items
    setQueue(prev => prev.filter(action => !toRemove.includes(action.id)));
    setSyncing(false);

    if (toRemove.length > 0) {
      toast.success(`Synced ${toRemove.length} pending changes`);
    }
  }, [queue, syncing]);

  const processAction = async (action: QueuedAction) => {
    switch (action.type) {
      case 'photo_upload':
        // For now, store in localStorage until database migration is complete
        const photoKey = `photo_${Date.now()}`;
        localStorage.setItem(photoKey, JSON.stringify(action.payload));
        break;

      case 'job_update':
        const { id, updates } = action.payload;
        const { error: updateError } = await supabase
          .from('bookings')
          .update(updates)
          .eq('id', id);
        if (updateError) throw updateError;
        break;

      case 'variation_create':
        // Store in localStorage until database migration is complete
        const variationKey = `variation_${Date.now()}`;
        localStorage.setItem(variationKey, JSON.stringify(action.payload));
        break;

      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  };

  return {
    isOnline,
    queue,
    syncing,
    addToQueue,
    syncQueue,
    queueLength: queue.length
  };
};