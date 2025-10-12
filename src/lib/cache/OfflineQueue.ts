/**
 * Offline Queue
 * Phase 21: Advanced Caching & Offline Support
 * 
 * Queue for offline operations with retry logic
 */

import { OfflineQueueItem } from './types';

const STORAGE_KEY = 'offline_queue';

export class OfflineQueue {
  private queue: OfflineQueueItem[] = [];
  private processing = false;
  private listeners = new Set<(items: OfflineQueueItem[]) => void>();

  constructor() {
    this.loadQueue();
  }

  add(type: string, data: any, maxRetries = 3): string {
    const item: OfflineQueueItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries,
      status: 'pending',
    };

    this.queue.push(item);
    this.saveQueue();
    this.notifyListeners();

    return item.id;
  }

  async process(
    handlers: Record<string, (data: any) => Promise<void>>
  ): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    const pendingItems = this.queue.filter(item => item.status === 'pending');

    for (const item of pendingItems) {
      const handler = handlers[item.type];

      if (!handler) {
        console.warn(`No handler for offline queue item type: ${item.type}`);
        continue;
      }

      item.status = 'processing';
      this.notifyListeners();

      try {
        await handler(item.data);
        this.remove(item.id);
      } catch (error) {
        console.error(`Failed to process offline queue item:`, error);
        
        item.retries++;
        
        if (item.retries >= (item.maxRetries || 3)) {
          item.status = 'failed';
        } else {
          item.status = 'pending';
        }

        this.saveQueue();
        this.notifyListeners();
      }
    }

    this.processing = false;
  }

  remove(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id);
    this.saveQueue();
    this.notifyListeners();
  }

  clear(): void {
    this.queue = [];
    this.saveQueue();
    this.notifyListeners();
  }

  getAll(): OfflineQueueItem[] {
    return [...this.queue];
  }

  getPending(): OfflineQueueItem[] {
    return this.queue.filter(item => item.status === 'pending');
  }

  getFailed(): OfflineQueueItem[] {
    return this.queue.filter(item => item.status === 'failed');
  }

  size(): number {
    return this.queue.length;
  }

  subscribe(listener: (items: OfflineQueueItem[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getAll());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const items = this.getAll();
    this.listeners.forEach(listener => listener(items));
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }
}

export const offlineQueue = new OfflineQueue();
