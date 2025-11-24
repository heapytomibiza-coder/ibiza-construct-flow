import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ServiceMaterial } from '@/types/services';

export const useServiceMaterials = (serviceId: string) => {
  return useQuery({
    queryKey: ['service-materials', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_materials')
        .select('*')
        .eq('service_id', serviceId)
        .order('material_category')
        .order('display_order');

      if (error) throw error;
      return (data || []) as ServiceMaterial[];
    },
    enabled: !!serviceId,
  });
};
