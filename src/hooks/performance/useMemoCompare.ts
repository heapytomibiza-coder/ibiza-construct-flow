/**
 * Memo Compare Hook
 * Phase 15: Performance Optimization
 * 
 * Memoize value with custom comparison
 */

import { useEffect, useRef } from 'react';

export function useMemoCompare<T>(
  value: T,
  compare: (prev: T | undefined, next: T) => boolean
): T {
  const previousRef = useRef<T>();
  const previous = previousRef.current;

  const isEqual = compare(previous, value);

  useEffect(() => {
    if (!isEqual) {
      previousRef.current = value;
    }
  });

  return isEqual && previous !== undefined ? previous : value;
}
