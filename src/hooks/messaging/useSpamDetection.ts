import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SpamKeyword } from '@/types/messaging';

export const useSpamDetection = () => {
  const { data: keywords = [] } = useQuery({
    queryKey: ['spam-keywords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spam_keywords')
        .select('*');
      
      if (error) throw error;
      return data as SpamKeyword[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const checkSpamContent = (content: string): { 
    hasSpam: boolean; 
    matches: SpamKeyword[];
    severity: 'warning' | 'block' | null;
  } => {
    const lowerContent = content.toLowerCase();
    const matches: SpamKeyword[] = [];

    for (const keyword of keywords) {
      if (lowerContent.includes(keyword.keyword.toLowerCase())) {
        matches.push(keyword);
      }
    }

    if (matches.length === 0) {
      return { hasSpam: false, matches: [], severity: null };
    }

    const hasBlock = matches.some(m => m.severity === 'block');
    const severity = hasBlock ? 'block' : 'warning';

    return { hasSpam: true, matches, severity };
  };

  return { checkSpamContent, keywords };
};
