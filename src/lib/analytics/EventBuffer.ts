/**
 * Event Buffer
 * Phase 22: Advanced Analytics & Monitoring System
 * 
 * Buffers and batches analytics events for efficient transmission
 */

import { AnalyticsEvent } from './types';

export class EventBuffer {
  private buffer: AnalyticsEvent[] = [];
  private maxSize: number;
  private flushInterval: number;
  private flushTimer?: number;
  private flushCallback: (events: AnalyticsEvent[]) => Promise<void>;

  constructor(
    maxSize: number = 50,
    flushInterval: number = 5000,
    flushCallback: (events: AnalyticsEvent[]) => Promise<void>
  ) {
    this.maxSize = maxSize;
    this.flushInterval = flushInterval;
    this.flushCallback = flushCallback;
    this.startFlushTimer();
  }

  add(event: AnalyticsEvent): void {
    this.buffer.push(event);

    // Auto-flush if buffer is full or event is critical
    if (this.buffer.length >= this.maxSize || event.priority === 'critical') {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const events = [...this.buffer];
    this.buffer = [];

    try {
      await this.flushCallback(events);
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-add events to buffer if flush failed
      this.buffer.unshift(...events);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  clear(): void {
    this.buffer = [];
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }

  getSize(): number {
    return this.buffer.length;
  }
}
