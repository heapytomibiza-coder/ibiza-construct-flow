import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SearchFilters {
  category?: string;
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  minRating?: number;
  verifiedOnly?: boolean;
}

interface SearchResult {
  id: string;
  title?: string;
  full_name?: string;
  description?: string;
  business_name?: string;
  relevance: number;
  [key: string]: any;
}

export function useEnhancedSearch(searchType: 'jobs' | 'professionals') {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const search = useCallback(async (
    query: string,
    filters: SearchFilters = {},
    page: number = 0,
    limit: number = 20
  ) => {
    setLoading(true);
    const client: any = supabase;

    try {
      const offset = page * limit;
      const functionName = searchType === 'jobs' ? 'search_jobs' : 'search_professionals';
      
      const params = searchType === 'jobs' ? {
        p_query: query || null,
        p_category: filters.category || null,
        p_location: filters.location || null,
        p_min_budget: filters.minBudget || null,
        p_max_budget: filters.maxBudget || null,
        p_min_rating: filters.minRating || null,
        p_limit: limit,
        p_offset: offset
      } : {
        p_query: query || null,
        p_service_category: filters.category || null,
        p_location: filters.location || null,
        p_min_rating: filters.minRating || null,
        p_verified_only: filters.verifiedOnly || false,
        p_limit: limit,
        p_offset: offset
      };

      const { data, error } = await client.rpc(functionName, params);

      if (error) throw error;

      setResults(data || []);
      setTotalResults(data?.length || 0);

      // Track search analytics
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        await client.from('search_analytics').insert({
          user_id: user.id,
          search_query: query,
          search_type: searchType,
          filters_used: filters,
          results_count: data?.length || 0,
          session_id: sessionStorage.getItem('session_id') || crypto.randomUUID()
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchType]);

  const trackClick = useCallback(async (resultId: string, position: number) => {
    const client: any = supabase;
    const { data: { user } } = await client.auth.getUser();
    
    if (user) {
      await client.from('search_analytics').insert({
        user_id: user.id,
        search_type: searchType,
        clicked_result_id: resultId,
        clicked_result_position: position,
        session_id: sessionStorage.getItem('session_id') || crypto.randomUUID()
      });
    }
  }, [searchType]);

  return {
    results,
    loading,
    totalResults,
    search,
    trackClick
  };
}
