/**
 * Saved Searches Hook
 * Phase 26: Advanced Search & Filtering System
 * 
 * React hook for managing saved searches
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SavedSearch, SearchQuery, SearchHistory } from '@/lib/search/types';
import { savedSearchManager } from '@/lib/search';

export function useSavedSearches() {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load saved searches
  const loadSavedSearches = useCallback(() => {
    if (!user?.id) {
      setSavedSearches([]);
      return;
    }
    const searches = savedSearchManager.getUserSavedSearches(user.id);
    setSavedSearches(searches);
  }, [user?.id]);

  // Load history
  const loadHistory = useCallback(() => {
    if (!user?.id) {
      setHistory([]);
      setRecentSearches([]);
      return;
    }
    const historyData = savedSearchManager.getHistory(user.id, 20);
    const recent = savedSearchManager.getRecentSearches(user.id, 5);
    setHistory(historyData);
    setRecentSearches(recent);
  }, [user?.id]);

  // Load data on mount
  useEffect(() => {
    loadSavedSearches();
    loadHistory();
  }, [loadSavedSearches, loadHistory]);

  // Save search
  const saveSearch = useCallback((name: string, query: SearchQuery) => {
    if (!user?.id) return null;
    const saved = savedSearchManager.saveSearch(user.id, name, query);
    loadSavedSearches();
    return saved;
  }, [user?.id, loadSavedSearches]);

  // Delete saved search
  const deleteSavedSearch = useCallback((id: string) => {
    savedSearchManager.deleteSavedSearch(id);
    loadSavedSearches();
  }, [loadSavedSearches]);

  // Execute saved search
  const executeSavedSearch = useCallback((id: string) => {
    const query = savedSearchManager.executeSavedSearch(id);
    loadSavedSearches();
    return query;
  }, [loadSavedSearches]);

  // Add to history
  const addToHistory = useCallback((query: string, resultsCount: number) => {
    if (!user?.id) return;
    savedSearchManager.addToHistory(user.id, query, resultsCount);
    loadHistory();
  }, [user?.id, loadHistory]);

  // Clear history
  const clearHistory = useCallback(() => {
    if (!user?.id) return;
    savedSearchManager.clearHistory(user.id);
    loadHistory();
  }, [user?.id, loadHistory]);

  return {
    savedSearches,
    history,
    recentSearches,
    saveSearch,
    deleteSavedSearch,
    executeSavedSearch,
    addToHistory,
    clearHistory,
    refresh: () => {
      loadSavedSearches();
      loadHistory();
    },
  };
}
