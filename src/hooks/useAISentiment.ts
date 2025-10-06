import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SentimentResult {
  sentiment_score: number;
  sentiment_label: 'positive' | 'negative' | 'neutral';
  emotions: {
    joy?: number;
    anger?: number;
    sadness?: number;
    fear?: number;
    surprise?: number;
    trust?: number;
  };
  key_phrases: string[];
}

export function useAISentiment() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const { toast } = useToast();

  const analyzeSentiment = async (
    text: string,
    entityType: string,
    entityId: string
  ) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: { text, entityType, entityId },
      });

      if (error) throw error;

      setSentiment(data);
      return data;
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: 'Unable to analyze sentiment. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentHistory = async (entityType: string, entityId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('ai_sentiment_analysis')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('analyzed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sentiment history:', error);
      return [];
    }
  };

  return {
    isAnalyzing,
    sentiment,
    analyzeSentiment,
    getSentimentHistory,
  };
}