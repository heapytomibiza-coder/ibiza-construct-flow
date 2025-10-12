/**
 * Webhook Hook
 * Phase 29: Advanced Integration & API Management System
 * 
 * Hook for managing webhooks
 */

import { useState, useCallback, useEffect } from 'react';
import {
  WebhookEvent,
  WebhookSubscription,
} from '@/lib/integration/types';
import { webhookHandler, WebhookEventHandler } from '@/lib/integration';

export function useWebhook() {
  const [subscriptions, setSubscriptions] = useState<WebhookSubscription[]>([]);
  const [events, setEvents] = useState<WebhookEvent[]>([]);

  // Load subscriptions
  const loadSubscriptions = useCallback(() => {
    const allSubscriptions = webhookHandler.getAllSubscriptions();
    setSubscriptions(allSubscriptions);
  }, []);

  // Load events
  const loadEvents = useCallback((limit?: number) => {
    const allEvents = webhookHandler.getEvents(limit);
    setEvents(allEvents);
  }, []);

  // Create subscription
  const createSubscription = useCallback((
    subscription: Omit<WebhookSubscription, 'id' | 'createdAt'>
  ) => {
    const newSubscription = webhookHandler.createSubscription(subscription);
    loadSubscriptions();
    return newSubscription;
  }, [loadSubscriptions]);

  // Update subscription
  const updateSubscription = useCallback((
    subscriptionId: string,
    updates: Partial<WebhookSubscription>
  ) => {
    const updated = webhookHandler.updateSubscription(subscriptionId, updates);
    if (updated) {
      loadSubscriptions();
    }
    return updated;
  }, [loadSubscriptions]);

  // Delete subscription
  const deleteSubscription = useCallback((subscriptionId: string) => {
    const deleted = webhookHandler.deleteSubscription(subscriptionId);
    if (deleted) {
      loadSubscriptions();
    }
    return deleted;
  }, [loadSubscriptions]);

  // Handle webhook
  const handleWebhook = useCallback(async (
    integrationId: string,
    event: string,
    payload: any,
    headers: Record<string, string>
  ) => {
    const webhookEvent = await webhookHandler.handleWebhook(
      integrationId,
      event,
      payload,
      headers
    );
    loadEvents();
    return webhookEvent;
  }, [loadEvents]);

  // Subscribe to event
  const subscribe = useCallback((
    event: string,
    handler: WebhookEventHandler
  ) => {
    return webhookHandler.on(event, handler);
  }, []);

  // Subscribe to all events
  const subscribeAll = useCallback((handler: WebhookEventHandler) => {
    return webhookHandler.onAll(handler);
  }, []);

  // Retry event
  const retryEvent = useCallback(async (eventId: string) => {
    const result = await webhookHandler.retryEvent(eventId);
    loadEvents();
    return result;
  }, [loadEvents]);

  // Get events by integration
  const getEventsByIntegration = useCallback((
    integrationId: string,
    limit?: number
  ): WebhookEvent[] => {
    return webhookHandler.getEventsByIntegration(integrationId, limit);
  }, []);

  // Get unprocessed events
  const getUnprocessedEvents = useCallback((): WebhookEvent[] => {
    return webhookHandler.getUnprocessedEvents();
  }, []);

  return {
    subscriptions,
    events,
    loadSubscriptions,
    loadEvents,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    handleWebhook,
    subscribe,
    subscribeAll,
    retryEvent,
    getEventsByIntegration,
    getUnprocessedEvents,
  };
}
