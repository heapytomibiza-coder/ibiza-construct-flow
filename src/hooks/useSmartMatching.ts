import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SmartMatch {
  job_id: string;
  professional_id: string;
  match_score: number;
  match_reasons: string[];
  analyzed_at: string;
}

interface UseSmartMatchingReturn {
  findMatches: (jobId: string, filters?: any) => Promise<SmartMatch[]>;
  loading: boolean;
  error: string | null;
}

export function useSmartMatching(): UseSmartMatchingReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const findMatches = async (jobId: string, filters?: any): Promise<SmartMatch[]> => {
    setLoading(true);
    setError(null);

    try {
      // Call the smart matcher edge function
      const { data, error: functionError } = await supabase.functions.invoke('ai-smart-matcher', {
        body: {
          job_id: jobId,
          max_matches: filters?.maxMatches || 10,
          filters: filters || {}
        }
      });

      if (functionError) throw functionError;

      if (data?.matches && data.matches.length > 0) {
        toast({
          title: "Matches Found!",
          description: `Found ${data.matches.length} professionals that match your requirements.`,
        });
        return data.matches;
      } else {
        toast({
          title: "No Matches Found",
          description: "We couldn't find professionals matching your criteria. Try broadening your requirements.",
          variant: "destructive",
        });
        return [];
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to find matches';
      setError(errorMessage);
      toast({
        title: "Matching Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    findMatches,
    loading,
    error,
  };
}
