/**
 * Secure Storage Utilities
 * Security: Provides secure alternatives to localStorage for sensitive data
 * 
 * NEVER store sensitive data like session tokens, API keys, or personal
 * information in localStorage as it's vulnerable to XSS attacks.
 */

/**
 * Check if data should never be stored in localStorage
 */
export function isSensitiveData(key: string): boolean {
  const sensitivePatterns = [
    'session',
    'token',
    'api_key',
    'password',
    'secret',
    'impersonation',
    'auth',
    'jwt',
  ];
  
  const lowerKey = key.toLowerCase();
  return sensitivePatterns.some(pattern => lowerKey.includes(pattern));
}

/**
 * Safe storage wrapper that prevents storing sensitive data in localStorage
 */
export const secureStorage = {
  /**
   * Set item - prevents storing sensitive data
   */
  setItem(key: string, value: string): void {
    if (isSensitiveData(key)) {
      console.error(`[Security] Attempted to store sensitive data in localStorage: ${key}`);
      throw new Error('Cannot store sensitive data in localStorage. Use server-side session management.');
    }
    localStorage.setItem(key, value);
  },

  /**
   * Get item
   */
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  },

  /**
   * Remove item
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  /**
   * Clear all items
   */
  clear(): void {
    localStorage.clear();
  },
};

/**
 * Migration helper: Check for existing sensitive data in localStorage
 */
export function auditLocalStorage(): string[] {
  const violations: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isSensitiveData(key)) {
      violations.push(key);
    }
  }
  
  return violations;
}

/**
 * Clean up sensitive data from localStorage
 */
export function cleanupSensitiveData(): void {
  const violations = auditLocalStorage();
  
  violations.forEach(key => {
    console.warn(`[Security] Removing sensitive data from localStorage: ${key}`);
    localStorage.removeItem(key);
  });
  
  if (violations.length > 0) {
    console.log(`[Security] Cleaned ${violations.length} sensitive items from localStorage`);
  }
}
