/**
 * Error Tracker
 * Phase 22: Advanced Analytics & Monitoring System
 * 
 * Captures and reports errors with context
 */

import { ErrorReport } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ErrorTracker {
  private sessionId: string;
  private userId?: string;
  private onError: (report: ErrorReport) => void;

  constructor(sessionId: string, onError: (report: ErrorReport) => void) {
    this.sessionId = sessionId;
    this.onError = onError;
    this.initializeGlobalHandlers();
  }

  private initializeGlobalHandlers(): void {
    // Unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        type: event.error?.name || 'Error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, 'error', false);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        type: 'UnhandledRejection',
      }, 'error', false);
    });
  }

  captureError(
    error: {
      message: string;
      stack?: string;
      type: string;
      filename?: string;
      lineno?: number;
      colno?: number;
    },
    severity: ErrorReport['severity'] = 'error',
    handled: boolean = true,
    context?: ErrorReport['context']
  ): void {
    const report: ErrorReport = {
      id: uuidv4(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      error,
      severity,
      handled,
      context,
    };

    this.onError(report);
  }

  captureException(
    error: Error,
    severity: ErrorReport['severity'] = 'error',
    context?: ErrorReport['context']
  ): void {
    this.captureError({
      message: error.message,
      stack: error.stack,
      type: error.name,
    }, severity, true, context);
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  setContext(context: ErrorReport['context']): void {
    // Store default context for subsequent errors
    (this as any).defaultContext = context;
  }
}
