import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SearchFilters {
  location?: string;
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  availability?: 'available' | 'busy' | 'all';
  verified?: boolean;
  category?: string;
  subcategory?: string;
  micro?: string;
  sortBy?: 'relevance' | 'rating' | 'price_low' | 'price_high' | 'recent';
}

export interface SearchResult {
  id: string;
  type: 'professional' | 'job' | 'service';
  title: string;
  description?: string;
  rating?: number;
  price?: number;
  location?: string;
  avatar?: string;
  verified?: boolean;
  availability?: string;
  [key: string]: any;
}

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'professional' | 'job' | 'service'>('professional');
  const { toast } = useToast();

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let searchResults: SearchResult[] = [];

      if (searchType === 'professional') {
        const { data, error } = await supabase
          .from('professional_profiles')
          .select(`
            *,
            profiles!inner(id, full_name, avatar_url),
            professional_stats(average_rating, total_reviews)
          `)
          .ilike('profiles.full_name', `%${query}%`)
          .eq('is_active', true);

        if (error) throw error;

        searchResults = (data || []).map((prof: any) => ({
          id: prof.id,
          type: 'professional' as const,
          title: prof.profiles?.full_name || 'Professional',
          description: prof.bio,
          rating: prof.professional_stats?.[0]?.average_rating,
          location: prof.location,
          avatar: prof.profiles?.avatar_url,
          verified: prof.verification_status === 'verified',
          availability: prof.availability_status,
          ...prof
        }));
      } else if (searchType === 'job') {
        // Use public_jobs_preview for anonymous/non-pro privacy
        const { data, error } = await supabase
          .from('public_jobs_preview')
          .select('*')
          .ilike('title', `%${query}%`)
          .eq('status', 'open');

        if (error) throw error;

        searchResults = (data || []).map((job: any) => ({
          id: job.id,
          type: 'job' as const,
          title: job.title,
          description: job.teaser || '',
          location: job.area || job.town || 'Ibiza',
          price: job.budget_value,
          ...job
        }));
      }

      // Apply filters
      let filtered = searchResults;

      if (filters.minRating) {
        filtered = filtered.filter(r => (r.rating || 0) >= filters.minRating!);
      }

      if (filters.verified !== undefined) {
        filtered = filtered.filter(r => r.verified === filters.verified);
      }

      if (filters.availability && filters.availability !== 'all') {
        filtered = filtered.filter(r => r.availability === filters.availability);
      }

      if (filters.minPrice !== undefined) {
        filtered = filtered.filter(r => (r.price || 0) >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        filtered = filtered.filter(r => (r.price || Infinity) <= filters.maxPrice!);
      }

      // Apply sorting
      if (filters.sortBy === 'rating') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (filters.sortBy === 'price_low') {
        filtered.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
      } else if (filters.sortBy === 'price_high') {
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      }

      setResults(filtered);

      // Track search history
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('search_history').insert({
          search_query: query,
          search_type: searchType,
          filters: filters as any,
          results_count: filtered.length
        } as any);

        // Track analytics
        await supabase.rpc('track_search_analytics', {
          p_search_term: query,
          p_search_type: searchType,
          p_results_count: filtered.length
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [query, filters, searchType, toast]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query) {
        performSearch();
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [query, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setFilters({});
  };

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    loading,
    searchType,
    setSearchType,
    performSearch,
    clearSearch
  };
};
