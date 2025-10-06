import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MatchResult {
  professional_id: string;
  match_score: number;
  match_reasons: Array<{
    reason: string;
    weight: number;
    score: number;
  }>;
  skill_match_score?: number;
  experience_match_score?: number;
  price_match_score?: number;
  location_match_score?: number;
}

export function useAIMatching() {
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const { toast } = useToast();

  const findMatches = async (jobId: string, maxResults = 10) => {
    setIsMatching(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-match-professionals', {
        body: { jobId, maxResults },
      });

      if (error) throw error;

      setMatches(data.matches);
      
      toast({
        title: 'Matches found',
        description: `Found ${data.matches.length} professionals matching this job`,
      });

      return data.matches;
    } catch (error) {
      console.error('Matching error:', error);
      toast({
        title: 'Matching failed',
        description: 'Unable to find matches. Please try again.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsMatching(false);
    }
  };

  const getStoredMatches = async (jobId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('ai_matching_results')
        .select('*')
        .eq('job_id', jobId)
        .eq('is_active', true)
        .order('match_score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stored matches:', error);
      return [];
    }
  };

  return {
    isMatching,
    matches,
    findMatches,
    getStoredMatches,
  };
}