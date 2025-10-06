import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';

export interface SearchFilters {
  location?: string;
  radius?: number;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  availability?: string;
  verified?: boolean;
  category?: string;
  [key: string]: any;
}

export interface SearchResult {
  id: string;
  type: 'professional' | 'job' | 'service';
  title: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  metadata?: any;
}

export const useAdvancedSearch = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [sessionId] = useState(uuidv4());

  const search = useCallback(async (
    searchTerm: string,
    searchType: 'professional' | 'job' | 'service',
    filters: SearchFilters = {}
  ) => {
    setLoading(true);
    try {
      let searchResults: SearchResult[] = [];

      if (searchType === 'professional') {
        const query = supabase
          .from('professional_profiles')
          .select(`
            id,
            user_id,
            business_name,
            bio,
            hourly_rate,
            verification_status,
            profiles!inner(full_name, avatar_url),
            professional_services(micro_services(name)),
            reviews(rating)
          `)
          .eq('is_active', true);

        // Full-text search on business_name and bio
        if (searchTerm) {
          query.or(`business_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
        }

        // Apply filters
        if (filters.verified) {
          query.eq('verification_status', 'verified');
        }
        if (filters.priceMin !== undefined) {
          query.gte('hourly_rate', filters.priceMin);
        }
        if (filters.priceMax !== undefined) {
          query.lte('hourly_rate', filters.priceMax);
        }

        const { data, error } = await query;

        if (error) throw error;

        searchResults = (data || []).map((prof: any) => {
          const avgRating = prof.reviews?.length > 0
            ? prof.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / prof.reviews.length
            : 0;

          return {
            id: prof.user_id,
            type: 'professional' as const,
            title: prof.business_name || prof.profiles?.full_name || 'Professional',
            description: prof.bio,
            imageUrl: prof.profiles?.avatar_url,
            rating: avgRating,
            reviewCount: prof.reviews?.length || 0,
            metadata: {
              hourlyRate: prof.hourly_rate,
              verified: prof.verification_status === 'verified',
              services: prof.professional_services?.map((s: any) => s.micro_services?.name).filter(Boolean)
            }
          };
        });
      } else if (searchType === 'job') {
        const query = supabase
          .from('jobs')
          .select(`
            id,
            title,
            description,
            budget_min,
            budget_max,
            status,
            created_at,
            micro_services(name)
          `)
          .eq('status', 'open');

        if (searchTerm) {
          query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        if (filters.priceMin !== undefined) {
          query.gte('budget_min', filters.priceMin);
        }
        if (filters.priceMax !== undefined) {
          query.lte('budget_max', filters.priceMax);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        searchResults = (data || []).map((job: any) => ({
          id: job.id,
          type: 'job' as const,
          title: job.title,
          description: job.description,
          metadata: {
            budgetMin: job.budget_min,
            budgetMax: job.budget_max,
            status: job.status,
            service: job.micro_services?.name
          }
        }));
      }

      setResults(searchResults);

      // Log search query
      await (supabase as any).from('search_queries').insert({
        user_id: user?.id,
        search_term: searchTerm,
        search_type: searchType,
        filters,
        results_count: searchResults.length,
        session_id: sessionId
      });

      // Track analytics
      await (supabase as any).rpc('track_search_analytics', {
        p_search_term: searchTerm,
        p_search_type: searchType,
        p_results_count: searchResults.length
      });

      return searchResults;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, sessionId]);

  const trackResultClick = useCallback(async (resultId: string) => {
    try {
      await (supabase as any)
        .from('search_queries')
        .update({ clicked_result_id: resultId })
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }, [sessionId]);

  return {
    search,
    trackResultClick,
    results,
    loading
  };
};
