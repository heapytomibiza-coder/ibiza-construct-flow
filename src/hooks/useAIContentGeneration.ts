import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ContentType = 'job_description' | 'profile_bio' | 'review_response' | 'message';

interface GenerateContentParams {
  contentType: ContentType;
  input: Record<string, any>;
  entityId?: string;
}

export function useAIContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const { toast } = useToast();

  const generateContent = async ({
    contentType,
    input,
    entityId,
  }: GenerateContentParams) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { contentType, input, entityId },
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      
      toast({
        title: 'Content generated',
        description: 'AI has generated content for you',
      });

      return data;
    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: 'Generation failed',
        description: 'Unable to generate content. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const markContentAsUsed = async (contentId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('ai_generated_content')
        .update({ was_used: true })
        .eq('id', contentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking content as used:', error);
    }
  };

  const getGeneratedHistory = async (contentType?: ContentType) => {
    try {
      let query = (supabase as any)
        .from('ai_generated_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching content history:', error);
      return [];
    }
  };

  return {
    isGenerating,
    generatedContent,
    generateContent,
    markContentAsUsed,
    getGeneratedHistory,
  };
}