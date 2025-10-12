/**
 * Shared Hook Library
 * Reusable hooks that can be used across the application
 * Phase 10: Enhanced with performance utilities
 */

export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export { useMediaQuery } from './useMediaQuery';

// Convenience hooks for common breakpoints
import { useMediaQuery } from './useMediaQuery';

export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
