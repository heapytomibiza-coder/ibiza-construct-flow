import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
  response_rate: number;
  avg_response_time_hours: number;
}

export interface ReviewInsight {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  total_reviews: number;
  average_rating: number;
  sentiment_score: number | null;
  common_themes: string[];
  response_rate: number;
  response_time_hours: number | null;
  created_at: string;
}

export interface ResponseTemplate {
  id: string;
  professional_id: string;
  name: string;
  template_text: string;
  category: 'positive' | 'negative' | 'neutral' | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useReviewInsights = (userId?: string) => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [insights, setInsights] = useState<ReviewInsight[]>([]);
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc('get_review_statistics', {
        p_user_id: userId
      });

      if (error) throw error;
      if (data && Array.isArray(data) && data.length > 0) {
        setStats(data[0] as any);
      }
    } catch (error: any) {
      console.error('Error fetching review stats:', error);
      toast({
        title: 'Failed to load statistics',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('review_insights' as any)
        .select('*')
        .eq('user_id', userId)
        .order('period_start', { ascending: false })
        .limit(12);

      if (error) throw error;
      setInsights((data || []) as any);
    } catch (error: any) {
      console.error('Error fetching insights:', error);
      toast({
        title: 'Failed to load insights',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('review_response_templates' as any)
        .select('*')
        .eq('professional_id', user.id)
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as any);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Failed to load templates',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchInsights();
    fetchTemplates();
  }, [userId]);

  const createTemplate = async (
    name: string,
    templateText: string,
    category: 'positive' | 'negative' | 'neutral'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('review_response_templates' as any).insert({
        name,
        template_text: templateText,
        category
      } as any);

      if (error) throw error;

      toast({
        title: 'Template created',
        description: 'Response template has been saved'
      });

      await fetchTemplates();
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast({
        title: 'Failed to create template',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('review_response_templates' as any)
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: 'Template deleted',
        description: 'Response template has been removed'
      });

      await fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Failed to delete template',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const useTemplate = async (templateId: string) => {
    try {
      // Increment usage count
      const { data: currentData } = await supabase
        .from('review_response_templates' as any)
        .select('usage_count')
        .eq('id', templateId)
        .single();
      
      if (currentData && 'usage_count' in currentData) {
        await supabase
          .from('review_response_templates' as any)
          .update({ usage_count: ((currentData as any).usage_count || 0) + 1 })
          .eq('id', templateId);
      }
    } catch (error: any) {
      console.error('Error updating template usage:', error);
    }
  };

  return {
    stats,
    insights,
    templates,
    loading,
    createTemplate,
    deleteTemplate,
    useTemplate,
    refreshData: () => {
      fetchStats();
      fetchInsights();
      fetchTemplates();
    }
  };
};
