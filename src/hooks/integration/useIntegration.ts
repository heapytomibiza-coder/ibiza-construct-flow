/**
 * Integration Hook
 * Phase 29: Advanced Integration & API Management System
 * 
 * Hook for managing integrations
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Integration,
  IntegrationMetrics,
  IntegrationLog,
  LogLevel,
} from '@/lib/integration/types';
import { integrationManager } from '@/lib/integration';

export function useIntegration() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);

  // Load integrations
  const loadIntegrations = useCallback(() => {
    const allIntegrations = integrationManager.getAll();
    setIntegrations(allIntegrations);
  }, []);

  // Create integration
  const createIntegration = useCallback((
    integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncAt'>
  ) => {
    const newIntegration = integrationManager.create(integration);
    loadIntegrations();
    return newIntegration;
  }, [loadIntegrations]);

  // Update integration
  const updateIntegration = useCallback((
    integrationId: string,
    updates: Partial<Integration>
  ) => {
    const updated = integrationManager.update(integrationId, updates);
    if (updated) {
      loadIntegrations();
    }
    return updated;
  }, [loadIntegrations]);

  // Delete integration
  const deleteIntegration = useCallback((integrationId: string) => {
    const deleted = integrationManager.delete(integrationId);
    if (deleted) {
      loadIntegrations();
    }
    return deleted;
  }, [loadIntegrations]);

  // Enable/disable integration
  const toggleIntegration = useCallback((
    integrationId: string,
    enabled: boolean
  ) => {
    const result = enabled
      ? integrationManager.enable(integrationId)
      : integrationManager.disable(integrationId);
    
    if (result) {
      loadIntegrations();
    }
    return result;
  }, [loadIntegrations]);

  // Test integration
  const testIntegration = useCallback(async (integrationId: string) => {
    setLoading(true);
    try {
      const result = await integrationManager.test(integrationId);
      loadIntegrations();
      return result;
    } finally {
      setLoading(false);
    }
  }, [loadIntegrations]);

  // Get metrics
  const getMetrics = useCallback((
    integrationId: string
  ): IntegrationMetrics | undefined => {
    return integrationManager.getMetrics(integrationId);
  }, []);

  // Get logs
  const getLogs = useCallback((
    integrationId: string,
    limit?: number
  ): IntegrationLog[] => {
    return integrationManager.getLogs(integrationId, limit);
  }, []);

  // Get logs by level
  const getLogsByLevel = useCallback((
    integrationId: string,
    level: LogLevel
  ): IntegrationLog[] => {
    return integrationManager.getLogsByLevel(integrationId, level);
  }, []);

  // Clear logs
  const clearLogs = useCallback((integrationId: string) => {
    integrationManager.clearLogs(integrationId);
  }, []);

  // Record request
  const recordRequest = useCallback((
    integrationId: string,
    success: boolean,
    duration: number
  ) => {
    integrationManager.recordRequest(integrationId, success, duration);
    loadIntegrations();
  }, [loadIntegrations]);

  return {
    integrations,
    loading,
    loadIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    toggleIntegration,
    testIntegration,
    getMetrics,
    getLogs,
    getLogsByLevel,
    clearLogs,
    recordRequest,
  };
}
