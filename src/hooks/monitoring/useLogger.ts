/**
 * Logger Hook
 * Phase 31: Advanced Monitoring & Observability System
 * 
 * Hook for application logging
 */

import { useCallback } from 'react';
import { logger, LogEntry, LogLevel } from '@/lib/monitoring';

export function useLogger() {
  // Log methods
  const debug = useCallback((message: string, context?: Record<string, any>): LogEntry => {
    return logger.debug(message, context);
  }, []);

  const info = useCallback((message: string, context?: Record<string, any>): LogEntry => {
    return logger.info(message, context);
  }, []);

  const warn = useCallback((message: string, context?: Record<string, any>): LogEntry => {
    return logger.warn(message, context);
  }, []);

  const error = useCallback((
    message: string,
    errorObj?: Error,
    context?: Record<string, any>
  ): LogEntry => {
    return logger.error(message, errorObj, context);
  }, []);

  const fatal = useCallback((
    message: string,
    errorObj?: Error,
    context?: Record<string, any>
  ): LogEntry => {
    return logger.fatal(message, errorObj, context);
  }, []);

  // Get logs
  const getLogs = useCallback((filters?: {
    level?: LogLevel | LogLevel[];
    source?: string;
    startTime?: Date;
    endTime?: Date;
    search?: string;
    limit?: number;
  }): LogEntry[] => {
    return logger.getLogs(filters);
  }, []);

  // Get errors
  const getErrors = useCallback((limit?: number): LogEntry[] => {
    return logger.getErrors(limit);
  }, []);

  // Count by level
  const countByLevel = useCallback((): Record<LogLevel, number> => {
    return logger.countByLevel();
  }, []);

  // Clear logs
  const clear = useCallback(() => {
    logger.clear();
  }, []);

  return {
    debug,
    info,
    warn,
    error,
    fatal,
    getLogs,
    getErrors,
    countByLevel,
    clear,
  };
}
