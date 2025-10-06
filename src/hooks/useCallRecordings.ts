import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CallRecording {
  id: string;
  call_session_id: string;
  recording_url: string;
  file_size?: number;
  duration_seconds?: number;
  format?: string;
  storage_path?: string;
  processed_at?: string;
  created_at: string;
}

export interface CallTranscription {
  id: string;
  call_session_id: string;
  transcription_text: string;
  language?: string;
  confidence_score?: number;
  speaker_labels?: any[];
  timestamps?: any[];
  created_at: string;
}

export const useCallRecordings = (sessionId?: string) => {
  const { data: recordings, isLoading: recordingsLoading } = useQuery({
    queryKey: ['call-recordings', sessionId],
    queryFn: async () => {
      let query = (supabase as any).from('call_recordings').select('*');

      if (sessionId) {
        query = query.eq('call_session_id', sessionId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as CallRecording[];
    },
    enabled: !!sessionId,
  });

  const { data: transcriptions, isLoading: transcriptionsLoading } = useQuery({
    queryKey: ['call-transcriptions', sessionId],
    queryFn: async () => {
      let query = (supabase as any).from('call_transcriptions').select('*');

      if (sessionId) {
        query = query.eq('call_session_id', sessionId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as CallTranscription[];
    },
    enabled: !!sessionId,
  });

  return {
    recordings,
    transcriptions,
    isLoading: recordingsLoading || transcriptionsLoading,
  };
};