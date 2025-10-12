/**
 * Audit Logger
 * Phase 24: Advanced Security & Authorization System
 * 
 * Log security events and user actions
 */

import { AuditLog } from './types';
import { v4 as uuidv4 } from 'uuid';

export class AuditLogger {
  private logs: AuditLog[] = [];
  private maxLogs: number = 1000;
  private onLog?: (log: AuditLog) => Promise<void>;

  constructor(maxLogs: number = 1000, onLog?: (log: AuditLog) => Promise<void>) {
    this.maxLogs = maxLogs;
    this.onLog = onLog;
  }

  /**
   * Log a security event
   */
  async log(
    userId: string,
    action: string,
    resource: string,
    status: AuditLog['status'],
    metadata?: {
      resourceId?: string;
      reason?: string;
      ipAddress?: string;
      userAgent?: string;
      [key: string]: any;
    }
  ): Promise<void> {
    const log: AuditLog = {
      id: uuidv4(),
      timestamp: Date.now(),
      userId,
      action,
      resource,
      resourceId: metadata?.resourceId,
      metadata,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      status,
      reason: metadata?.reason,
    };

    this.logs.push(log);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Call external logger if provided
    if (this.onLog) {
      try {
        await this.onLog(log);
      } catch (error) {
        console.error('Failed to log audit event:', error);
      }
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Audit]', log);
    }
  }

  /**
   * Log successful action
   */
  async logSuccess(
    userId: string,
    action: string,
    resource: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log(userId, action, resource, 'success', metadata);
  }

  /**
   * Log failed action
   */
  async logFailure(
    userId: string,
    action: string,
    resource: string,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log(userId, action, resource, 'failure', { ...metadata, reason });
  }

  /**
   * Log denied action
   */
  async logDenied(
    userId: string,
    action: string,
    resource: string,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log(userId, action, resource, 'denied', { ...metadata, reason });
  }

  /**
   * Get logs for a specific user
   */
  getLogsByUser(userId: string, limit?: number): AuditLog[] {
    const userLogs = this.logs.filter(log => log.userId === userId);
    return limit ? userLogs.slice(-limit) : userLogs;
  }

  /**
   * Get logs for a specific resource
   */
  getLogsByResource(resource: string, resourceId?: string, limit?: number): AuditLog[] {
    let filtered = this.logs.filter(log => log.resource === resource);
    
    if (resourceId) {
      filtered = filtered.filter(log => log.resourceId === resourceId);
    }
    
    return limit ? filtered.slice(-limit) : filtered;
  }

  /**
   * Get logs by status
   */
  getLogsByStatus(status: AuditLog['status'], limit?: number): AuditLog[] {
    const filtered = this.logs.filter(log => log.status === status);
    return limit ? filtered.slice(-limit) : filtered;
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 100): AuditLog[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get logs within time range
   */
  getLogsByTimeRange(startTime: number, endTime: number): AuditLog[] {
    return this.logs.filter(
      log => log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs
   */
  exportLogs(): AuditLog[] {
    return [...this.logs];
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    total: number;
    success: number;
    failure: number;
    denied: number;
    byUser: Record<string, number>;
    byResource: Record<string, number>;
  } {
    const stats = {
      total: this.logs.length,
      success: 0,
      failure: 0,
      denied: 0,
      byUser: {} as Record<string, number>,
      byResource: {} as Record<string, number>,
    };

    this.logs.forEach(log => {
      // Count by status
      stats[log.status]++;
      
      // Count by user
      stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;
      
      // Count by resource
      stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;
    });

    return stats;
  }
}

// Global audit logger instance
export const auditLogger = new AuditLogger(10000);
