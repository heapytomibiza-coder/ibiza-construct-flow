/**
 * Webhook Handler
 * Phase 29: Advanced Integration & API Management System
 * 
 * Handles incoming webhooks and event processing
 */

import {
  WebhookEvent,
  WebhookSubscription,
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class WebhookHandler {
  private subscriptions: Map<string, WebhookSubscription> = new Map();
  private events: WebhookEvent[] = [];
  private eventHandlers: Map<string, Set<WebhookEventHandler>> = new Map();
  private maxEventsStored: number = 1000;

  /**
   * Create subscription
   */
  createSubscription(
    subscription: Omit<WebhookSubscription, 'id' | 'createdAt'>
  ): WebhookSubscription {
    const newSubscription: WebhookSubscription = {
      ...subscription,
      id: uuidv4(),
      createdAt: new Date(),
    };

    this.subscriptions.set(newSubscription.id, newSubscription);
    return newSubscription;
  }

  /**
   * Get subscription
   */
  getSubscription(subscriptionId: string): WebhookSubscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * Get all subscriptions
   */
  getAllSubscriptions(): WebhookSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get subscriptions by integration
   */
  getSubscriptionsByIntegration(integrationId: string): WebhookSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      s => s.integrationId === integrationId
    );
  }

  /**
   * Update subscription
   */
  updateSubscription(
    subscriptionId: string,
    updates: Partial<WebhookSubscription>
  ): WebhookSubscription | null {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;

    const updated = {
      ...subscription,
      ...updates,
      id: subscription.id,
      createdAt: subscription.createdAt,
    };

    this.subscriptions.set(subscriptionId, updated);
    return updated;
  }

  /**
   * Delete subscription
   */
  deleteSubscription(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(
    integrationId: string,
    event: string,
    payload: any,
    headers: Record<string, string>
  ): Promise<WebhookEvent> {
    const webhookEvent: WebhookEvent = {
      id: uuidv4(),
      integrationId,
      event,
      payload,
      headers,
      timestamp: new Date(),
      processed: false,
    };

    // Store event
    this.events.unshift(webhookEvent);
    if (this.events.length > this.maxEventsStored) {
      this.events.pop();
    }

    // Process event
    try {
      await this.processEvent(webhookEvent);
      webhookEvent.processed = true;
      webhookEvent.processedAt = new Date();
    } catch (error) {
      webhookEvent.error = error instanceof Error ? error.message : String(error);
    }

    return webhookEvent;
  }

  /**
   * Process webhook event
   */
  private async processEvent(event: WebhookEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.event) || new Set();
    const allHandlers = this.eventHandlers.get('*') || new Set();

    const combinedHandlers = new Set([...handlers, ...allHandlers]);

    for (const handler of combinedHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in webhook handler for ${event.event}:`, error);
      }
    }
  }

  /**
   * Register event handler
   */
  on(event: string, handler: WebhookEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Register handler for all events
   */
  onAll(handler: WebhookEventHandler): () => void {
    return this.on('*', handler);
  }

  /**
   * Get events
   */
  getEvents(limit?: number): WebhookEvent[] {
    return limit ? this.events.slice(0, limit) : [...this.events];
  }

  /**
   * Get events by integration
   */
  getEventsByIntegration(integrationId: string, limit?: number): WebhookEvent[] {
    const filtered = this.events.filter(e => e.integrationId === integrationId);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  /**
   * Get events by type
   */
  getEventsByType(event: string, limit?: number): WebhookEvent[] {
    const filtered = this.events.filter(e => e.event === event);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  /**
   * Get unprocessed events
   */
  getUnprocessedEvents(): WebhookEvent[] {
    return this.events.filter(e => !e.processed);
  }

  /**
   * Retry event
   */
  async retryEvent(eventId: string): Promise<boolean> {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return false;

    event.processed = false;
    event.processedAt = undefined;
    event.error = undefined;

    try {
      await this.processEvent(event);
      event.processed = true;
      event.processedAt = new Date();
      return true;
    } catch (error) {
      event.error = error instanceof Error ? error.message : String(error);
      return false;
    }
  }

  /**
   * Verify webhook signature
   */
  verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Simple HMAC verification (in production, use crypto library)
    // This is a placeholder implementation
    return signature === this.generateSignature(payload, secret);
  }

  /**
   * Generate webhook signature
   */
  generateSignature(payload: string, secret: string): string {
    // Placeholder - in production, use proper HMAC
    return `hmac-${secret}-${payload.length}`;
  }

  /**
   * Clear events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Clear all
   */
  clear(): void {
    this.subscriptions.clear();
    this.events = [];
    this.eventHandlers.clear();
  }
}

export type WebhookEventHandler = (event: WebhookEvent) => Promise<void> | void;

// Global webhook handler instance
export const webhookHandler = new WebhookHandler();
