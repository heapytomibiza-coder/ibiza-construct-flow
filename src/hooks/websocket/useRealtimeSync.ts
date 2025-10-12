/**
 * Realtime Sync Hook
 * Phase 20: WebSocket & Real-time Communication
 * 
 * React hook for real-time data synchronization
 */

import { useState, useEffect, useCallback } from 'react';
import { useRealtimeChannel } from './useRealtimeChannel';

interface UseRealtimeSyncOptions<T> {
  channel: string;
  resource: string;
  initialData?: T[];
  onInsert?: (item: T) => void;
  onUpdate?: (item: T) => void;
  onDelete?: (id: string) => void;
}

export function useRealtimeSync<T extends { id: string }>({
  channel,
  resource,
  initialData = [],
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeSyncOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);

  const handleInsert = useCallback((item: T) => {
    setData(prev => [...prev, item]);
    onInsert?.(item);
  }, [onInsert]);

  const handleUpdate = useCallback((item: T) => {
    setData(prev => prev.map(i => i.id === item.id ? item : i));
    onUpdate?.(item);
  }, [onUpdate]);

  const handleDelete = useCallback((payload: { id: string }) => {
    setData(prev => prev.filter(i => i.id !== payload.id));
    onDelete?.(payload.id);
  }, [onDelete]);

  const { send } = useRealtimeChannel({
    channel,
    events: {
      [`${resource}:insert`]: handleInsert,
      [`${resource}:update`]: handleUpdate,
      [`${resource}:delete`]: handleDelete,
    },
  });

  const insert = useCallback((item: Omit<T, 'id'>) => {
    const newItem = {
      ...item,
      id: `temp_${Date.now()}`,
    } as T;
    send(`${resource}:insert`, newItem);
    return newItem;
  }, [resource, send]);

  const update = useCallback((id: string, updates: Partial<T>) => {
    send(`${resource}:update`, { id, ...updates });
  }, [resource, send]);

  const remove = useCallback((id: string) => {
    send(`${resource}:delete`, { id });
  }, [resource, send]);

  return {
    data,
    insert,
    update,
    remove,
    setData,
  };
}
