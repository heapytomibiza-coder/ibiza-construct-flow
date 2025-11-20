import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  icon_emoji: string | null;
  display_order: number | null;
  category_group: string | null;
  examples: string[] | null;
  is_active: boolean | null;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

export interface MicroCategory {
  id: string;
  subcategory_id: string;
  name: string;
  slug: string;
  display_order: number | null;
  is_active: boolean | null;
}

/**
 * Fetch all active categories from the database
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

/**
 * Fetch subcategories for a specific category
 */
export const useSubcategories = (categoryId: string | undefined) => {
  return useQuery({
    queryKey: ['service-subcategories', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('service_subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Subcategory[];
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Fetch micro-categories for a specific subcategory
 */
export const useMicroCategories = (subcategoryId: string | undefined) => {
  return useQuery({
    queryKey: ['service-micro-categories', subcategoryId],
    queryFn: async () => {
      if (!subcategoryId) return [];
      
      const { data, error } = await supabase
        .from('service_micro_categories')
        .select('*')
        .eq('subcategory_id', subcategoryId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as MicroCategory[];
    },
    enabled: !!subcategoryId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Fetch a single category by slug
 */
export const useCategoryBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['service-category', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as Category;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};
