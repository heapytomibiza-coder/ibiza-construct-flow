import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ProfessionalService = Database['public']['Tables']['professional_services']['Row'];

export const useProfessionalServices = (professionalId?: string) => {
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = async () => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('professional_services')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices((data || []) as ProfessionalService[]);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addService = async (serviceData: Database['public']['Tables']['professional_services']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('professional_services')
        .insert({
          professional_id: professionalId,
          ...serviceData
        })
        .select()
        .single();

      if (error) throw error;

      setServices(prev => [data as ProfessionalService, ...prev]);
      toast({
        title: 'Success',
        description: 'Service added successfully'
      });
      return data;
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: 'Error',
        description: 'Failed to add service',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateService = async (serviceId: string, updates: Database['public']['Tables']['professional_services']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('professional_services')
        .update(updates)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;

      setServices(prev => prev.map(s => s.id === serviceId ? data as ProfessionalService : s));
      toast({
        title: 'Success',
        description: 'Service updated successfully'
      });
      return data;
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('professional_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast({
        title: 'Success',
        description: 'Service deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const toggleActive = async (serviceId: string, isActive: boolean) => {
    return updateService(serviceId, { is_active: isActive });
  };

  useEffect(() => {
    fetchServices();
  }, [professionalId]);

  return {
    services,
    loading,
    addService,
    updateService,
    deleteService,
    toggleActive,
    refetch: fetchServices
  };
};
