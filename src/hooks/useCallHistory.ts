import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CallHistoryItem {
  id: string;
  room_id: string;
  initiator_id: string;
  participants: string[];
  call_type: 'audio' | 'video' | 'screen_share';
  status: 'waiting' | 'active' | 'ended';
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  quality_score?: number;
  recording_url?: string;
  transcription_url?: string;
  provider?: string;
  provider_session_id?: string;
  metadata?: Record<string, any>;
}

export const useCallHistory = () => {
  const { data: callHistory, isLoading } = useQuery({
    queryKey: ['call-history'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('call_sessions')
        .select('*')
        .eq('status', 'ended')
        .order('ended_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CallHistoryItem[];
    },
  });

  const getCallById = (id: string) => {
    return callHistory?.find((call) => call.id === id);
  };

  const recentCalls = callHistory?.slice(0, 10);

  return {
    callHistory,
    recentCalls,
    isLoading,
    getCallById,
  };
};