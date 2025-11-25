import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type BookingTemplate = Database['public']['Tables']['booking_templates']['Row'];
type BookingTemplateInsert = Database['public']['Tables']['booking_templates']['Insert'];

export const useBookingTemplates = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['booking-templates', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_templates')
        .select('*, services(*)')
        .eq('user_id', userId!)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const createTemplate = useMutation({
    mutationFn: async (template: BookingTemplateInsert) => {
      const { data, error } = await supabase
        .from('booking_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-templates'] });
      toast({
        title: 'Template created',
        description: 'Booking template created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create booking template',
        variant: 'destructive',
      });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BookingTemplate> }) => {
      const { data, error } = await supabase
        .from('booking_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-templates'] });
      toast({
        title: 'Template updated',
        description: 'Booking template updated successfully',
      });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('booking_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-templates'] });
      toast({
        title: 'Template deleted',
        description: 'Booking template deleted successfully',
      });
    },
  });

  return {
    templates,
    isLoading,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
  };
};
