import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfessionalServiceItem {
  id: string;
  professional_id: string;
  service_id: string;
  name: string;
  description: string | null;
  base_price: number;
  pricing_type: string;
  unit_type: string;
  min_quantity: number;
  max_quantity: number | null;
  bulk_discount_threshold: number | null;
  bulk_discount_price: number | null;
  category: string;
  estimated_duration_minutes: number | null;
  difficulty_level: string;
  is_active: boolean;
  display_order: number;
}

interface ServiceAddon {
  id: string;
  service_id: string;
  name: string;
  description: string | null;
  price: number;
  is_popular: boolean;
}

export const useServiceOptions = (serviceId: string, professionalId?: string) => {
  const [serviceItems, setServiceItems] = useState<ProfessionalServiceItem[]>([]);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    
    const loadServiceOptions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load professional service items (prioritize specific professional if provided)
        let query = supabase
          .from('professional_service_items')
          .select('*')
          .eq('service_id', serviceId)
          .eq('is_active', true)
          .order('category')
          .order('display_order');

        if (professionalId) {
          query = query.eq('professional_id', professionalId);
        }

        const { data: itemsData, error: itemsError } = await query;

        if (itemsError) throw itemsError;

        // Load service addons (keep existing addon system)
        const { data: addonsData, error: addonsError } = await supabase
          .from('service_addons')
          .select('*')
          .eq('service_id', serviceId)
          .order('is_popular', { ascending: false });

        if (addonsError) throw addonsError;

        setServiceItems(itemsData || []);
        setAddons(addonsData || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error loading service options:', err);
      } finally {
        setLoading(false);
      }
    };

    loadServiceOptions();
  }, [serviceId, professionalId]);

  return {
    serviceItems,
    addons,
    loading,
    error,
  };
};