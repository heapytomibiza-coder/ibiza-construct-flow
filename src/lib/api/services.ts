import { supabase } from '@/integrations/supabase/client';
import type { ServiceMicro, Question, ApiResponse } from './types';

export const services = {
  async getServiceMicros(): Promise<ApiResponse<ServiceMicro[]>> {
    try {
      const { data, error } = await supabase
        .from('services_micro')
        .select('*')
        .order('category, subcategory, micro');

      if (error) return { error: error.message };

      const serviceMicros: ServiceMicro[] = data.map(item => ({
        id: item.id,
        category: item.category,
        subcategory: item.subcategory,
        micro: item.micro,
        questions_micro: item.questions_micro as Question[],
        questions_logistics: item.questions_logistics as Question[]
      }));

      return { data: serviceMicros };
    } catch (error) {
      return { error: 'Failed to fetch service micros' };
    }
  },

  async getServiceMicroById(id: string): Promise<ApiResponse<ServiceMicro>> {
    try {
      const { data, error } = await supabase
        .from('services_micro')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return { error: error.message };

      const serviceMicro: ServiceMicro = {
        id: data.id,
        category: data.category,
        subcategory: data.subcategory,
        micro: data.micro,
        questions_micro: data.questions_micro as Question[],
        questions_logistics: data.questions_logistics as Question[]
      };

      return { data: serviceMicro };
    } catch (error) {
      return { error: 'Failed to fetch service micro' };
    }
  },

  async getServicesByCategory(category: string): Promise<ApiResponse<ServiceMicro[]>> {
    try {
      const { data, error } = await supabase
        .from('services_micro')
        .select('*')
        .eq('category', category)
        .order('subcategory, micro');

      if (error) return { error: error.message };

      const serviceMicros: ServiceMicro[] = data.map(item => ({
        id: item.id,
        category: item.category,
        subcategory: item.subcategory,
        micro: item.micro,
        questions_micro: item.questions_micro as Question[],
        questions_logistics: item.questions_logistics as Question[]
      }));

      return { data: serviceMicros };
    } catch (error) {
      return { error: 'Failed to fetch services by category' };
    }
  },

  async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('services_micro')
        .select('category')
        .order('category');

      if (error) return { error: error.message };

      const categories = [...new Set(data.map(item => item.category))];
      return { data: categories };
    } catch (error) {
      return { error: 'Failed to fetch categories' };
    }
  },

  async getSubcategories(category: string): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('services_micro')
        .select('subcategory')
        .eq('category', category)
        .order('subcategory');

      if (error) return { error: error.message };

      const subcategories = [...new Set(data.map(item => item.subcategory))];
      return { data: subcategories };
    } catch (error) {
      return { error: 'Failed to fetch subcategories' };
    }
  }
};