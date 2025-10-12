/**
 * Log Aggregator
 * Phase 31: Advanced Monitoring & Observability System
 * 
 * Aggregates and manages application logs
 */

import { LogEntry, LogLevel } from './types';

export class LogAggregator {
  private static instance: LogAggregator;
  private logs: LogEntry[] = [];
  private maxLogs: number = 10000;
  private retention: number = 7; // days

  private constructor() {}

  static getInstance(): LogAggregator {
    if (!LogAggregator.instance) {
      LogAggregator.instance = new LogAggregator();
    }
    return LogAggregator.instance;
  }

  // Log methods
  debug(message: string, context?: Record<string, any>): LogEntry {
    return this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): LogEntry {
    return this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): LogEntry {
    return this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): LogEntry {
    return this.log('error', message, { ...context, error });
  }

  fatal(message: string, error?: Error, context?: Record<string, any>): LogEntry {
    return this.log('fatal', message, { ...context, error });
  }

  // Generic log method
  log(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      level,
      message,
      timestamp: new Date(),
      context,
      source: this.getSource(),
      traceId: this.getTraceId(),
    };

    this.logs.push(entry);
    this.applyRetention();

    // Also log to console in development
    if (import.meta.env.DEV) {
      this.consoleLog(entry);
    }

    return entry;
  }

  // Get logs with filters
  getLogs(filters?: {
    level?: LogLevel | LogLevel[];
    source?: string;
    startTime?: Date;
    endTime?: Date;
    search?: string;
    limit?: number;
  }): LogEntry[] {
    let filtered = [...this.logs];

    if (filters?.level) {
      const levels = Array.isArray(filters.level) ? filters.level : [filters.level];
      filtered = filtered.filter(log => levels.includes(log.level));
    }

    if (filters?.source) {
      filtered = filtered.filter(log => log.source === filters.source);
    }

    if (filters?.startTime) {
      filtered = filtered.filter(log => log.timestamp >= filters.startTime!);
    }

    if (filters?.endTime) {
      filtered = filtered.filter(log => log.timestamp <= filters.endTime!);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(search) ||
        JSON.stringify(log.context).toLowerCase().includes(search)
      );
    }

    if (filters?.limit) {
      filtered = filtered.slice(-filters.limit);
    }

    return filtered;
  }

  // Get error logs
  getErrors(limit?: number): LogEntry[] {
    return this.getLogs({ level: ['error', 'fatal'], limit });
  }

  // Count logs by level
  countByLevel(): Record<LogLevel, number> {
    return this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<LogLevel, number>);
  }

  // Clear logs
  clear(): void {
    this.logs = [];
  }

  // Apply retention policy
  private applyRetention(): void {
    // Remove old logs
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.retention);
    this.logs = this.logs.filter(log => log.timestamp >= cutoff);

    // Limit total logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  // Get source from stack trace
  private getSource(): string {
    try {
      const stack = new Error().stack;
      if (!stack) return 'unknown';
      
      const lines = stack.split('\n');
      const callerLine = lines[4]; // Skip Error, getSource, log, and actual log method
      const match = callerLine?.match(/at\s+(.+?)\s+\(/);
      return match ? match[1] : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // Get trace ID from context or generate
  private getTraceId(): string {
    // In a real implementation, this would come from a tracing context
    return `trace-${Date.now()}`;
  }

  // Console logging helper
  private consoleLog(entry: LogEntry): void {
    const style = this.getConsoleStyle(entry.level);
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp.toISOString()}`;
    
    console[entry.level === 'fatal' ? 'error' : entry.level](
      `%c${prefix}`,
      style,
      entry.message,
      entry.context || ''
    );
  }

  // Get console style for log level
  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      debug: 'color: #888',
      info: 'color: #0066cc',
      warn: 'color: #ff9900; font-weight: bold',
      error: 'color: #cc0000; font-weight: bold',
      fatal: 'color: #cc0000; font-weight: bold; background: #ffcccc',
    };
    return styles[level];
  }

  // Export logs
  export(): Record<string, any> {
    return {
      logs: this.logs,
      count: this.logs.length,
      byLevel: this.countByLevel(),
    };
  }
}

export const logger = LogAggregator.getInstance();
