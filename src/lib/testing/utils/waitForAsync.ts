/**
 * Wait for Async Utilities
 * Phase 23: Testing & Quality Assurance System
 * 
 * Utilities for waiting on async operations in tests
 */

// waitFor is available from vitest globals

export interface WaitOptions {
  timeout?: number;
  interval?: number;
}

/**
 * Wait for a condition to be true
 * Note: Use waitFor from @testing-library/react in your tests
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  options?: WaitOptions
): Promise<void> {
  const timeout = options?.timeout || 3000;
  const interval = options?.interval || 50;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) return;
    await delay(interval);
  }

  throw new Error('Condition not met within timeout');
}

/**
 * Wait for a value to be defined
 */
export async function waitForValue<T>(
  getValue: () => T | undefined | null,
  options?: WaitOptions
): Promise<T> {
  const timeout = options?.timeout || 3000;
  const interval = options?.interval || 50;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const value = getValue();
    if (value !== undefined && value !== null) {
      return value;
    }
    await delay(interval);
  }

  throw new Error('Value not defined within timeout');
}

/**
 * Wait for element to be removed
 */
export async function waitForElementToBeRemoved(
  getElement: () => HTMLElement | null,
  options?: WaitOptions
): Promise<void> {
  const timeout = options?.timeout || 3000;
  const interval = options?.interval || 50;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (getElement() === null) return;
    await delay(interval);
  }

  throw new Error('Element still present after timeout');
}

/**
 * Wait for network idle (no pending requests)
 */
export async function waitForNetworkIdle(
  options?: WaitOptions
): Promise<void> {
  // This is a simplified version - in real implementation,
  // you'd want to track actual network requests
  await new Promise(resolve => setTimeout(resolve, options?.timeout || 100));
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
