/**
 * Alert Manager
 * Phase 31: Advanced Monitoring & Observability System
 * 
 * Manages alerts and notifications
 */

import { Alert, AlertCondition, AlertAction } from './types';
import { metricsCollector } from './MetricsCollector';
import { logger } from './LogAggregator';

export class AlertManager {
  private static instance: AlertManager;
  private alerts: Map<string, Alert> = new Map();
  private checkInterval: number = 60000; // 1 minute
  private intervalId?: NodeJS.Timeout;

  private constructor() {}

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  // Create alert
  create(
    name: string,
    condition: AlertCondition,
    actions: AlertAction[],
    options?: {
      description?: string;
      severity?: Alert['severity'];
      enabled?: boolean;
    }
  ): Alert {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random()}`,
      name,
      description: options?.description,
      severity: options?.severity || 'medium',
      condition,
      actions,
      enabled: options?.enabled !== false,
      status: 'active',
      createdAt: new Date(),
    };

    this.alerts.set(alert.id, alert);
    return alert;
  }

  // Update alert
  update(alertId: string, updates: Partial<Alert>): Alert | undefined {
    const alert = this.alerts.get(alertId);
    if (!alert) return undefined;

    Object.assign(alert, updates);
    return alert;
  }

  // Delete alert
  delete(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  // Get alert
  get(alertId: string): Alert | undefined {
    return this.alerts.get(alertId);
  }

  // Get all alerts
  getAll(filter?: { severity?: Alert['severity']; enabled?: boolean }): Alert[] {
    let alerts = Array.from(this.alerts.values());

    if (filter?.severity) {
      alerts = alerts.filter(a => a.severity === filter.severity);
    }

    if (filter?.enabled !== undefined) {
      alerts = alerts.filter(a => a.enabled === filter.enabled);
    }

    return alerts;
  }

  // Start monitoring
  startMonitoring(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.checkAlerts();
    }, this.checkInterval);
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  // Check all alerts
  private async checkAlerts(): Promise<void> {
    const alerts = this.getAll({ enabled: true });

    for (const alert of alerts) {
      const shouldTrigger = await this.evaluateCondition(alert.condition);
      
      if (shouldTrigger && alert.status === 'active') {
        await this.triggerAlert(alert);
      } else if (!shouldTrigger && alert.triggeredAt) {
        await this.resolveAlert(alert);
      }
    }
  }

  // Evaluate alert condition
  private async evaluateCondition(condition: AlertCondition): Promise<boolean> {
    try {
      const metric = metricsCollector.getLatest(condition.metric);
      if (!metric) return false;

      // Check if duration requirement is met
      if (condition.duration) {
        const timeRange = {
          start: new Date(Date.now() - condition.duration * 1000),
          end: new Date(),
        };

        const value = metricsCollector.aggregate(
          condition.metric,
          condition.aggregation || 'avg',
          timeRange
        );

        return this.compare(value, condition.operator, condition.threshold);
      }

      return this.compare(metric.value, condition.operator, condition.threshold);
    } catch (error) {
      logger.error('Failed to evaluate alert condition', error as Error, { condition });
      return false;
    }
  }

  // Compare values
  private compare(value: number, operator: AlertCondition['operator'], threshold: number): boolean {
    switch (operator) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'eq':
        return value === threshold;
      case 'gte':
        return value >= threshold;
      case 'lte':
        return value <= threshold;
      case 'ne':
        return value !== threshold;
      default:
        return false;
    }
  }

  // Trigger alert
  private async triggerAlert(alert: Alert): Promise<void> {
    alert.triggeredAt = new Date();
    
    logger.warn(`Alert triggered: ${alert.name}`, {
      alertId: alert.id,
      severity: alert.severity,
      condition: alert.condition,
    });

    // Execute actions
    for (const action of alert.actions) {
      if (!action.enabled) continue;

      try {
        await this.executeAction(alert, action);
      } catch (error) {
        logger.error('Failed to execute alert action', error as Error, {
          alertId: alert.id,
          action: action.type,
        });
      }
    }

    // Record metric
    metricsCollector.increment('alerts.triggered', 1, {
      severity: alert.severity,
      name: alert.name,
    });
  }

  // Resolve alert
  private async resolveAlert(alert: Alert): Promise<void> {
    alert.resolvedAt = new Date();
    
    logger.info(`Alert resolved: ${alert.name}`, {
      alertId: alert.id,
      duration: alert.resolvedAt.getTime() - (alert.triggeredAt?.getTime() || 0),
    });

    // Record metric
    metricsCollector.increment('alerts.resolved', 1, {
      severity: alert.severity,
      name: alert.name,
    });
  }

  // Execute action
  private async executeAction(alert: Alert, action: AlertAction): Promise<void> {
    switch (action.type) {
      case 'log':
        logger.warn(`Alert: ${alert.name}`, { alert, action });
        break;

      case 'notification':
        // Implement notification logic
        console.log('Notification:', alert.name);
        break;

      case 'webhook':
        // Implement webhook logic
        if (action.config.url) {
          await fetch(action.config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alert }),
          });
        }
        break;

      case 'email':
        // Implement email logic
        console.log('Email alert:', alert.name);
        break;
    }
  }
}

export const alertManager = AlertManager.getInstance();
