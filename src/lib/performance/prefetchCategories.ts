/**
 * Category Prefetch Utilities
 * Sprint 3: Performance Optimization
 * 
 * Prefetches taxonomy data for wizard to reduce perceived latency
 */

import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Prefetch all active categories
 * Call on wizard hover/focus or route preload
 */
export const prefetchCategories = async (queryClient: QueryClient) => {
  await queryClient.prefetchQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Prefetch subcategories for a category
 */
export const prefetchSubcategories = async (
  queryClient: QueryClient, 
  categoryId: string
) => {
  await queryClient.prefetchQuery({
    queryKey: ['service-subcategories', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Prefetch micro-categories for a subcategory
 */
export const prefetchMicroCategories = async (
  queryClient: QueryClient,
  subcategoryId: string
) => {
  await queryClient.prefetchQuery({
    queryKey: ['service-micro-categories', subcategoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_micro_categories')
        .select('*')
        .eq('subcategory_id', subcategoryId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Prefetch all taxonomy levels (for aggressive preloading)
 * Use on /post route mount
 */
export const prefetchAllTaxonomy = async (queryClient: QueryClient) => {
  // Prefetch categories first
  await prefetchCategories(queryClient);
  
  // Categories are now cached, fetch them to prefetch subcategories
  const categories = queryClient.getQueryData<Array<{ id: string }>>(['service-categories']);
  
  if (categories && categories.length > 0) {
    // Prefetch subcategories for top 3 categories (most likely selections)
    const topCategories = categories.slice(0, 3);
    await Promise.all(
      topCategories.map(cat => prefetchSubcategories(queryClient, cat.id))
    );
  }
};
