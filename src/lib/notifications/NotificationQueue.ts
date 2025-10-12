/**
 * Notification Queue
 * Phase 25: Advanced Notification & Communication System
 * 
 * Queue and batch notifications for efficient delivery
 */

import { Notification, NotificationBatch } from './types';
import { v4 as uuidv4 } from 'uuid';

export class NotificationQueue {
  private queue: Notification[] = [];
  private batches: Map<string, NotificationBatch> = new Map();
  private processing: boolean = false;
  private batchInterval: number = 5 * 60 * 1000; // 5 minutes
  private processingInterval?: number;

  constructor(batchInterval?: number) {
    if (batchInterval) {
      this.batchInterval = batchInterval;
    }
    this.startProcessing();
  }

  /**
   * Add notification to queue
   */
  enqueue(notification: Notification): void {
    this.queue.push(notification);
  }

  /**
   * Add multiple notifications to queue
   */
  enqueueBatch(notifications: Notification[]): void {
    this.queue.push(...notifications);
  }

  /**
   * Get pending notifications for a user
   */
  getPending(userId: string): Notification[] {
    return this.queue.filter(n => n.userId === userId);
  }

  /**
   * Create a batch for a user
   */
  createBatch(userId: string, scheduledFor: Date): NotificationBatch {
    const userNotifications = this.getPending(userId);
    
    if (userNotifications.length === 0) {
      throw new Error('No pending notifications for user');
    }

    const batch: NotificationBatch = {
      id: uuidv4(),
      userId,
      notifications: userNotifications,
      scheduledFor,
      sent: false,
    };

    this.batches.set(batch.id, batch);

    // Remove batched notifications from queue
    this.queue = this.queue.filter(n => n.userId !== userId);

    return batch;
  }

  /**
   * Get due batches
   */
  getDueBatches(): NotificationBatch[] {
    const now = new Date();
    return Array.from(this.batches.values()).filter(
      batch => !batch.sent && batch.scheduledFor <= now
    );
  }

  /**
   * Mark batch as sent
   */
  markBatchAsSent(batchId: string): void {
    const batch = this.batches.get(batchId);
    if (batch) {
      batch.sent = true;
    }
  }

  /**
   * Process queue - send immediate notifications and create batches
   */
  async process(
    sendCallback: (notifications: Notification[]) => Promise<void>
  ): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      // Send immediate notifications (high priority or urgent)
      const immediate = this.queue.filter(
        n => n.priority === 'high' || n.priority === 'urgent'
      );

      if (immediate.length > 0) {
        await sendCallback(immediate);
        this.queue = this.queue.filter(
          n => n.priority !== 'high' && n.priority !== 'urgent'
        );
      }

      // Process due batches
      const dueBatches = this.getDueBatches();
      for (const batch of dueBatches) {
        await sendCallback(batch.notifications);
        this.markBatchAsSent(batch.id);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get batch count
   */
  getBatchCount(): number {
    return this.batches.size;
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Clear batches
   */
  clearBatches(): void {
    this.batches.clear();
  }

  /**
   * Start automatic processing
   */
  private startProcessing(): void {
    this.processingInterval = window.setInterval(() => {
      // Auto-process would happen here in a real implementation
      // For now, this is a placeholder
    }, this.batchInterval);
  }

  /**
   * Stop automatic processing
   */
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
  }
}

// Global notification queue instance
export const notificationQueue = new NotificationQueue();
