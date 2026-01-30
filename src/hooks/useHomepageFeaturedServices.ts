import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FeaturedService {
  id: string;
  name: string;
  slug: string;
  icon_emoji: string | null;
  category_group: string | null;
  sort_order: number;
}

/**
 * Fetch featured services for the homepage from the dedicated table
 * Falls back to top categories if no featured services exist
 */
export const useHomepageFeaturedServices = () => {
  return useQuery({
    queryKey: ['homepage-featured-services'],
    queryFn: async (): Promise<FeaturedService[]> => {
      // First try to get from homepage_featured_services table
      const { data: featured, error: featuredError } = await supabase
        .from('homepage_featured_services')
        .select(`
          sort_order,
          service_categories!inner (
            id,
            name,
            slug,
            icon_emoji,
            category_group
          )
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (featuredError) {
        console.error('Error fetching featured services:', featuredError);
      }

      // Transform and return if we have featured services
      if (featured && featured.length > 0) {
        return featured.map((item: any) => ({
          id: item.service_categories.id,
          name: item.service_categories.name,
          slug: item.service_categories.slug,
          icon_emoji: item.service_categories.icon_emoji,
          category_group: item.service_categories.category_group,
          sort_order: item.sort_order,
        }));
      }

      // Fallback: get first 8 active categories
      const { data: categories, error: categoriesError } = await supabase
        .from('service_categories')
        .select('id, name, slug, icon_emoji, category_group, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(8);

      if (categoriesError) {
        console.error('Error fetching fallback categories:', categoriesError);
        return [];
      }

      return (categories || []).map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon_emoji: cat.icon_emoji,
        category_group: cat.category_group,
        sort_order: index + 1,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};
