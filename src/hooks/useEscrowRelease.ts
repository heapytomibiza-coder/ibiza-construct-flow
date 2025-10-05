import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReleaseMilestoneParams {
  milestoneId: string;
  notes?: string;
}

export const useEscrowRelease = () => {
  const { toast } = useToast();
  const [isReleasing, setIsReleasing] = useState(false);

  const releaseMilestone = async ({ milestoneId, notes }: ReleaseMilestoneParams) => {
    setIsReleasing(true);
    
    try {
      // Call the edge function to release escrow
      const { data, error } = await supabase.functions.invoke('release-escrow', {
        body: { milestoneId, notes }
      });

      if (error) throw error;

      toast({
        title: "Escrow funds released",
        description: "The funds have been released to the professional."
      });

      return data;
    } catch (error: any) {
      console.error('Error releasing escrow:', error);
      toast({
        variant: "destructive",
        title: "Failed to release escrow",
        description: error.message || "An error occurred while releasing the funds."
      });
      throw error;
    } finally {
      setIsReleasing(false);
    }
  };

  return {
    releaseMilestone,
    isReleasing
  };
};
