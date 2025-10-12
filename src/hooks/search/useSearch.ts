/**
 * Search Hook
 * Phase 26: Advanced Search & Filtering System
 */

import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '@/hooks/shared';
import { SearchQuery, SearchResult, SearchableItem } from '@/lib/search/types';
import { searchEngine } from '@/lib/search';

export function useSearch(initialQuery?: SearchQuery) {
  const [query, setQuery] = useState<SearchQuery>(initialQuery || { query: '' });
  const [results, setResults] = useState<SearchResult<SearchableItem>>({
    items: [],
    total: 0,
    took: 0,
  });
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query.query, 300);

  const executeSearch = useCallback((searchQuery: SearchQuery) => {
    setLoading(true);
    try {
      const searchResults = searchEngine.search(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ items: [], total: 0, took: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuery = useCallback((updates: Partial<SearchQuery>) => {
    setQuery(prev => ({ ...prev, ...updates }));
  }, []);

  const clear = useCallback(() => {
    setQuery({ query: '' });
    setResults({ items: [], total: 0, took: 0 });
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      executeSearch({ ...query, query: debouncedQuery });
    } else {
      setResults({ items: [], total: 0, took: 0 });
    }
  }, [debouncedQuery, query.type, query.filters, query.sort, executeSearch]);

  return {
    query,
    results,
    loading,
    updateQuery,
    executeSearch,
    clear,
  };
}
