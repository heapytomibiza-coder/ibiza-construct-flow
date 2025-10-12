/**
 * Search History Hook
 * Phase 17: Advanced Search & Filtering System
 * 
 * React hook for managing search history
 */

import { useState, useEffect, useCallback } from 'react';
import { searchHistory, SearchHistoryItem } from '@/lib/search';

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    setHistory(searchHistory.getHistory());
  }, []);

  const addSearch = useCallback((query: string) => {
    searchHistory.addSearch(query);
    setHistory(searchHistory.getHistory());
  }, []);

  const removeSearch = useCallback((id: string) => {
    searchHistory.removeSearch(id);
    setHistory(searchHistory.getHistory());
  }, []);

  const clearHistory = useCallback(() => {
    searchHistory.clearHistory();
    setHistory([]);
  }, []);

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
  };
}
