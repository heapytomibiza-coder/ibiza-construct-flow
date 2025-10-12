/**
 * Offline Queue Hook
 * Phase 21: Advanced Caching & Offline Support
 * 
 * React hook for offline queue management
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineQueue, OfflineQueueItem } from '@/lib/cache';

export function useOfflineQueue() {
  const [items, setItems] = useState<OfflineQueueItem[]>([]);

  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe(setItems);
    return unsubscribe;
  }, []);

  const addToQueue = useCallback((type: string, data: any, maxRetries?: number) => {
    return offlineQueue.add(type, data, maxRetries);
  }, []);

  const processQueue = useCallback(
    async (handlers: Record<string, (data: any) => Promise<void>>) => {
      await offlineQueue.process(handlers);
    },
    []
  );

  const removeFromQueue = useCallback((id: string) => {
    offlineQueue.remove(id);
  }, []);

  const clearQueue = useCallback(() => {
    offlineQueue.clear();
  }, []);

  return {
    items,
    pendingItems: items.filter(i => i.status === 'pending'),
    failedItems: items.filter(i => i.status === 'failed'),
    queueSize: items.length,
    addToQueue,
    processQueue,
    removeFromQueue,
    clearQueue,
  };
}
