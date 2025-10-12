/**
 * Integration Manager
 * Phase 29: Advanced Integration & API Management System
 * 
 * Manages integrations and their lifecycle
 */

import {
  Integration,
  IntegrationStatus,
  IntegrationMetrics,
  IntegrationLog,
  LogLevel,
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class IntegrationManager {
  private integrations: Map<string, Integration> = new Map();
  private metrics: Map<string, IntegrationMetrics> = new Map();
  private logs: Map<string, IntegrationLog[]> = new Map();
  private maxLogsPerIntegration: number = 1000;

  /**
   * Create integration
   */
  create(
    integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncAt'>
  ): Integration {
    const newIntegration: Integration = {
      ...integration,
      id: uuidv4(),
      createdAt: new Date(),
    };

    this.integrations.set(newIntegration.id, newIntegration);
    this.initializeMetrics(newIntegration.id);
    this.log(newIntegration.id, 'info', 'Integration created');

    return newIntegration;
  }

  /**
   * Get integration
   */
  get(integrationId: string): Integration | undefined {
    return this.integrations.get(integrationId);
  }

  /**
   * Get all integrations
   */
  getAll(): Integration[] {
    return Array.from(this.integrations.values());
  }

  /**
   * Get integrations by type
   */
  getByType(type: string): Integration[] {
    return Array.from(this.integrations.values()).filter(i => i.type === type);
  }

  /**
   * Get integrations by provider
   */
  getByProvider(provider: string): Integration[] {
    return Array.from(this.integrations.values()).filter(i => i.provider === provider);
  }

  /**
   * Get enabled integrations
   */
  getEnabled(): Integration[] {
    return Array.from(this.integrations.values()).filter(i => i.enabled);
  }

  /**
   * Update integration
   */
  update(integrationId: string, updates: Partial<Integration>): Integration | null {
    const integration = this.integrations.get(integrationId);
    if (!integration) return null;

    const updated = {
      ...integration,
      ...updates,
      id: integration.id,
      createdAt: integration.createdAt,
      updatedAt: new Date(),
    };

    this.integrations.set(integrationId, updated);
    this.log(integrationId, 'info', 'Integration updated');

    return updated;
  }

  /**
   * Delete integration
   */
  delete(integrationId: string): boolean {
    const deleted = this.integrations.delete(integrationId);
    if (deleted) {
      this.metrics.delete(integrationId);
      this.logs.delete(integrationId);
      this.log(integrationId, 'info', 'Integration deleted');
    }
    return deleted;
  }

  /**
   * Enable integration
   */
  enable(integrationId: string): boolean {
    const integration = this.integrations.get(integrationId);
    if (!integration) return false;

    integration.enabled = true;
    integration.updatedAt = new Date();
    this.log(integrationId, 'info', 'Integration enabled');

    return true;
  }

  /**
   * Disable integration
   */
  disable(integrationId: string): boolean {
    const integration = this.integrations.get(integrationId);
    if (!integration) return false;

    integration.enabled = false;
    integration.updatedAt = new Date();
    this.log(integrationId, 'info', 'Integration disabled');

    return true;
  }

  /**
   * Update status
   */
  updateStatus(integrationId: string, status: IntegrationStatus): boolean {
    const integration = this.integrations.get(integrationId);
    if (!integration) return false;

    integration.status = status;
    integration.updatedAt = new Date();
    this.log(integrationId, 'info', `Status changed to ${status}`);

    return true;
  }

  /**
   * Test integration
   */
  async test(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) return false;

    try {
      this.updateStatus(integrationId, 'testing');
      this.log(integrationId, 'info', 'Testing integration');

      // Simulate test
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.updateStatus(integrationId, 'active');
      this.log(integrationId, 'info', 'Integration test successful');

      return true;
    } catch (error) {
      this.updateStatus(integrationId, 'error');
      this.log(integrationId, 'error', 'Integration test failed', { error });
      return false;
    }
  }

  /**
   * Record request
   */
  recordRequest(integrationId: string, success: boolean, duration: number): void {
    const metrics = this.metrics.get(integrationId);
    if (!metrics) return;

    metrics.totalRequests++;
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }

    // Update average response time
    const totalTime = metrics.averageResponseTime * (metrics.totalRequests - 1) + duration;
    metrics.averageResponseTime = totalTime / metrics.totalRequests;

    // Update rates
    metrics.successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
    metrics.errorRate = (metrics.failedRequests / metrics.totalRequests) * 100;
    metrics.lastRequestAt = new Date();
  }

  /**
   * Get metrics
   */
  getMetrics(integrationId: string): IntegrationMetrics | undefined {
    return this.metrics.get(integrationId);
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(integrationId: string): void {
    this.metrics.set(integrationId, {
      integrationId,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      successRate: 0,
      errorRate: 0,
    });
  }

  /**
   * Log message
   */
  log(
    integrationId: string,
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): void {
    const log: IntegrationLog = {
      id: uuidv4(),
      integrationId,
      level,
      message,
      metadata,
      timestamp: new Date(),
    };

    if (!this.logs.has(integrationId)) {
      this.logs.set(integrationId, []);
    }

    const logs = this.logs.get(integrationId)!;
    logs.unshift(log);

    // Limit log size
    if (logs.length > this.maxLogsPerIntegration) {
      logs.splice(this.maxLogsPerIntegration);
    }
  }

  /**
   * Get logs
   */
  getLogs(integrationId: string, limit?: number): IntegrationLog[] {
    const logs = this.logs.get(integrationId) || [];
    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(integrationId: string, level: LogLevel): IntegrationLog[] {
    const logs = this.logs.get(integrationId) || [];
    return logs.filter(log => log.level === level);
  }

  /**
   * Clear logs
   */
  clearLogs(integrationId: string): void {
    this.logs.delete(integrationId);
  }

  /**
   * Update last sync
   */
  updateLastSync(integrationId: string): void {
    const integration = this.integrations.get(integrationId);
    if (integration) {
      integration.lastSyncAt = new Date();
    }
  }

  /**
   * Export integration
   */
  export(integrationId: string): string | null {
    const integration = this.integrations.get(integrationId);
    if (!integration) return null;

    const exported = {
      ...integration,
      credentials: undefined, // Don't export credentials
    };

    return JSON.stringify(exported, null, 2);
  }

  /**
   * Import integration
   */
  import(integrationJson: string): Integration | null {
    try {
      const integration = JSON.parse(integrationJson);
      return this.create({
        ...integration,
        status: 'configuring',
        enabled: false,
      });
    } catch (error) {
      console.error('Failed to import integration:', error);
      return null;
    }
  }

  /**
   * Search integrations
   */
  search(query: string): Integration[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.integrations.values()).filter(
      i =>
        i.name.toLowerCase().includes(lowerQuery) ||
        i.description?.toLowerCase().includes(lowerQuery) ||
        i.provider.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear all
   */
  clear(): void {
    this.integrations.clear();
    this.metrics.clear();
    this.logs.clear();
  }
}

// Global integration manager instance
export const integrationManager = new IntegrationManager();
