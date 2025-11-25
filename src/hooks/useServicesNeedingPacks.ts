import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ServiceNeedingPack {
  id: string;
  name: string;
  slug: string;
  subcategory_id: string;
  subcategory_name: string;
  category_id: string;
  category_name: string;
}

interface GroupedBySubcategory {
  [categoryName: string]: {
    categoryId: string;
    subcategories: {
      [subcategoryName: string]: {
        subcategoryId: string;
        services: ServiceNeedingPack[];
      };
    };
  };
}

export const useServicesNeedingPacks = () => {
  return useQuery({
    queryKey: ['services-needing-packs'],
    queryFn: async () => {
      // Fetch all active micro-categories with their parent relationships
      const { data: microCategories, error: microError } = await supabase
        .from('service_micro_categories')
        .select(`
          id,
          name,
          slug,
          subcategory_id,
          service_subcategories!inner (
            id,
            name,
            category_id,
            service_categories!inner (
              id,
              name
            )
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (microError) throw microError;

      // Fetch all existing question packs
      const { data: existingPacks, error: packsError } = await supabase
        .from('question_packs')
        .select('micro_slug');

      if (packsError) throw packsError;

      const existingSlugs = new Set(existingPacks?.map(p => p.micro_slug) || []);

      // Filter out services that already have packs
      const servicesNeedingPacks = microCategories
        ?.filter(micro => !existingSlugs.has(micro.slug))
        .map(micro => ({
          id: micro.id,
          name: micro.name,
          slug: micro.slug,
          subcategory_id: micro.service_subcategories.id,
          subcategory_name: micro.service_subcategories.name,
          category_id: micro.service_subcategories.service_categories.id,
          category_name: micro.service_subcategories.service_categories.name,
        })) || [];

      // Group by category → subcategory
      const grouped = servicesNeedingPacks.reduce<GroupedBySubcategory>((acc, service) => {
        if (!acc[service.category_name]) {
          acc[service.category_name] = {
            categoryId: service.category_id,
            subcategories: {},
          };
        }
        
        if (!acc[service.category_name].subcategories[service.subcategory_name]) {
          acc[service.category_name].subcategories[service.subcategory_name] = {
            subcategoryId: service.subcategory_id,
            services: [],
          };
        }
        
        acc[service.category_name].subcategories[service.subcategory_name].services.push(service);
        return acc;
      }, {});

      return {
        services: servicesNeedingPacks,
        grouped,
        totalCount: servicesNeedingPacks.length,
      };
    },
    staleTime: 1000 * 60, // 1 minute
  });
};
