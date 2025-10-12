/**
 * Alerts Hook
 * Phase 31: Advanced Monitoring & Observability System
 * 
 * Hook for managing alerts
 */

import { useState, useCallback, useEffect } from 'react';
import { alertManager, Alert, AlertCondition, AlertAction } from '@/lib/monitoring';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Load alerts
  const loadAlerts = useCallback((filter?: {
    severity?: Alert['severity'];
    enabled?: boolean;
  }) => {
    const allAlerts = alertManager.getAll(filter);
    setAlerts(allAlerts);
  }, []);

  // Create alert
  const createAlert = useCallback((
    name: string,
    condition: AlertCondition,
    actions: AlertAction[],
    options?: {
      description?: string;
      severity?: Alert['severity'];
      enabled?: boolean;
    }
  ): Alert => {
    const alert = alertManager.create(name, condition, actions, options);
    loadAlerts();
    return alert;
  }, [loadAlerts]);

  // Update alert
  const updateAlert = useCallback((
    alertId: string,
    updates: Partial<Alert>
  ): Alert | undefined => {
    const updated = alertManager.update(alertId, updates);
    if (updated) {
      loadAlerts();
    }
    return updated;
  }, [loadAlerts]);

  // Delete alert
  const deleteAlert = useCallback((alertId: string): boolean => {
    const deleted = alertManager.delete(alertId);
    if (deleted) {
      loadAlerts();
    }
    return deleted;
  }, [loadAlerts]);

  // Get alert
  const getAlert = useCallback((alertId: string): Alert | undefined => {
    return alertManager.get(alertId);
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    alertManager.startMonitoring();
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    alertManager.stopMonitoring();
  }, []);

  // Load alerts on mount
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  return {
    alerts,
    loadAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    getAlert,
    startMonitoring,
    stopMonitoring,
  };
}
