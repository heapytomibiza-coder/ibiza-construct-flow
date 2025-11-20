/**
 * UUID Lookup Error Classes
 * Phase 6: Production Readiness & Error Handling
 */

export class UUIDLookupError extends Error {
  constructor(
    message: string,
    public readonly microSlug: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'UUIDLookupError';
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UUIDLookupError);
    }
  }
}

export class MicroServiceNotFoundError extends UUIDLookupError {
  constructor(microSlug: string) {
    super(
      `Micro service not found: ${microSlug}`,
      microSlug
    );
    this.name = 'MicroServiceNotFoundError';
  }
}

export class DatabaseConnectionError extends UUIDLookupError {
  constructor(microSlug: string, originalError: unknown) {
    super(
      `Database connection failed while looking up UUID for: ${microSlug}`,
      microSlug,
      originalError
    );
    this.name = 'DatabaseConnectionError';
  }
}

export class InvalidSlugError extends UUIDLookupError {
  constructor(microSlug: string) {
    super(
      `Invalid micro service slug format: ${microSlug}`,
      microSlug
    );
    this.name = 'InvalidSlugError';
  }
}

/**
 * Error recovery utilities
 */
export class UUIDErrorRecovery {
  /**
   * Determine if error is recoverable
   */
  static isRecoverable(error: unknown): boolean {
    if (error instanceof MicroServiceNotFoundError) {
      return true; // Can fallback to slug-only
    }
    
    if (error instanceof DatabaseConnectionError) {
      return true; // Can retry or use fallback
    }
    
    if (error instanceof InvalidSlugError) {
      return false; // Invalid input, not recoverable
    }
    
    return true; // Unknown errors assumed recoverable
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: unknown): string {
    if (error instanceof MicroServiceNotFoundError) {
      return 'Service details are being processed. You can continue with your request.';
    }
    
    if (error instanceof DatabaseConnectionError) {
      return 'Connection issue detected. Your request will be processed shortly.';
    }
    
    if (error instanceof InvalidSlugError) {
      return 'Invalid service selected. Please try selecting the service again.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Get suggested recovery action
   */
  static getRecoveryAction(error: unknown): 'retry' | 'fallback' | 'abort' {
    if (error instanceof MicroServiceNotFoundError) {
      return 'fallback';
    }
    
    if (error instanceof DatabaseConnectionError) {
      return 'retry';
    }
    
    if (error instanceof InvalidSlugError) {
      return 'abort';
    }
    
    return 'fallback';
  }
}
