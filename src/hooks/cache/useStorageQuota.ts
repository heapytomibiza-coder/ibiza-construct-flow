/**
 * Storage Quota Hook
 * Phase 21: Advanced Caching & Offline Support
 * 
 * React hook for storage quota monitoring
 */

import { useState, useEffect } from 'react';
import { storageManager, StorageQuota } from '@/lib/cache';

export function useStorageQuota() {
  const [quota, setQuota] = useState<StorageQuota>({
    usage: 0,
    quota: 0,
    percentage: 0,
  });
  const [isPersisted, setIsPersisted] = useState(false);

  useEffect(() => {
    const fetchQuota = async () => {
      const newQuota = await storageManager.getQuota();
      setQuota(newQuota);

      const persisted = await storageManager.isPersisted();
      setIsPersisted(persisted);
    };

    fetchQuota();

    // Refresh every 30 seconds
    const interval = setInterval(fetchQuota, 30000);
    return () => clearInterval(interval);
  }, []);

  const requestPersistence = async () => {
    const result = await storageManager.requestPersistent();
    setIsPersisted(result);
    return result;
  };

  return {
    quota,
    isPersisted,
    requestPersistence,
    formattedUsage: storageManager.formatBytes(quota.usage),
    formattedQuota: storageManager.formatBytes(quota.quota),
  };
}
