/**
 * Debounced Search Hook
 * Phase 17: Advanced Search & Filtering System
 * 
 * React hook for debounced search input
 */

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/shared';

export function useDebounceSearch(initialValue = '', delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    isDebouncing: searchTerm !== debouncedSearchTerm,
  };
}
