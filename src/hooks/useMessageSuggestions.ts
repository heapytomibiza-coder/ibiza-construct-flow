import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Suggestion {
  text: string;
  tone: 'professional' | 'friendly' | 'formal';
  reasoning: string;
}

export function useMessageSuggestions() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { toast } = useToast();

  const getSuggestions = async (conversationId: string, messageCount = 5) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-message-reply', {
        body: { conversationId, messageCount },
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
      return data.suggestions || [];
    } catch (error) {
      console.error('Suggestion error:', error);
      toast({
        title: 'Unable to get suggestions',
        description: 'Failed to generate message suggestions',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const markSuggestionUsed = async (suggestionId: string, selectedIndex: number) => {
    try {
      const { error } = await (supabase as any)
        .from('ai_message_suggestions')
        .update({
          was_used: true,
          selected_suggestion_index: selectedIndex,
          used_at: new Date().toISOString(),
        })
        .eq('id', suggestionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking suggestion as used:', error);
    }
  };

  return {
    isLoading,
    suggestions,
    getSuggestions,
    markSuggestionUsed,
  };
}