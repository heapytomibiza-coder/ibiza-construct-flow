import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateDisputeParams {
  jobId: string;
  contractId?: string;
  invoiceId?: string;
  disputedAgainst: string;
  type: string;
  title: string;
  description: string;
  amountDisputed?: number;
  priority?: string;
}

interface SendMessageParams {
  disputeId: string;
  message: string;
  attachments?: any[];
}

interface UploadEvidenceParams {
  disputeId: string;
  evidenceType: string;
  description: string;
  file: File;
}

interface ProposeResolutionParams {
  disputeId: string;
  resolutionType: string;
  awardedTo?: string;
  amount?: number;
  details: string;
}

export const useDisputes = (userId?: string, disputeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch disputes for user
  const { data: disputes, isLoading: disputesLoading } = useQuery({
    queryKey: ['disputes', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          created_by_profile:profiles!disputes_created_by_fkey(full_name, avatar_url),
          disputed_against_profile:profiles!disputes_disputed_against_fkey(full_name, avatar_url),
          job:jobs(title)
        `)
        .or(`created_by.eq.${userId},disputed_against.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch single dispute details
  const { data: dispute, isLoading: disputeLoading } = useQuery({
    queryKey: ['dispute', disputeId],
    queryFn: async () => {
      if (!disputeId) return null;

      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .eq('id', disputeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!disputeId,
  });

  // Fetch dispute evidence separately
  const { data: evidence } = useQuery({
    queryKey: ['dispute-evidence', disputeId],
    queryFn: async () => {
      if (!disputeId) return [];

      const { data, error } = await supabase
        .from('dispute_evidence')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!disputeId,
  });

  // Fetch dispute timeline separately
  const { data: timeline } = useQuery({
    queryKey: ['dispute-timeline', disputeId],
    queryFn: async () => {
      if (!disputeId) return [];

      const { data, error } = await supabase
        .from('dispute_timeline')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!disputeId,
  });

  // Fetch dispute resolution separately
  const { data: resolution } = useQuery({
    queryKey: ['dispute-resolution', disputeId],
    queryFn: async () => {
      if (!disputeId) return null;

      const { data, error } = await supabase
        .from('dispute_resolutions')
        .select('*')
        .eq('dispute_id', disputeId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!disputeId,
  });

  // Fetch dispute messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['dispute-messages', disputeId],
    queryFn: async () => {
      if (!disputeId) return [];

      const { data, error } = await supabase
        .from('dispute_messages')
        .select(`
          *,
          sender:profiles(full_name, avatar_url)
        `)
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!disputeId,
  });

  // Create dispute
  const createDispute = useMutation({
    mutationFn: async (params: CreateDisputeParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate dispute number
      const disputeNumber = `DSP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const { data, error } = await supabase
        .from('disputes')
        .insert({
          dispute_number: disputeNumber,
          job_id: params.jobId,
          contract_id: params.contractId,
          invoice_id: params.invoiceId,
          created_by: user.id,
          disputed_against: params.disputedAgainst,
          type: params.type,
          title: params.title,
          description: params.description,
          amount_disputed: params.amountDisputed || 0,
          priority: params.priority || 'medium',
          status: 'open',
          response_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      toast({
        title: 'Dispute Created',
        description: 'Your dispute has been submitted and will be reviewed.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to Create Dispute',
        description: error.message,
      });
    },
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: async ({ disputeId, message, attachments }: SendMessageParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('dispute_messages')
        .insert({
          dispute_id: disputeId,
          sender_id: user.id,
          message,
          attachments: attachments || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute-messages'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to Send Message',
        description: error.message,
      });
    },
  });

  // Upload evidence
  const uploadEvidence = useMutation({
    mutationFn: async ({ disputeId, evidenceType, description, file }: UploadEvidenceParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload file
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('professional-documents')
        .upload(`dispute-evidence/${disputeId}/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('professional-documents')
        .getPublicUrl(uploadData.path);

      // Insert evidence record
      const { data, error } = await supabase
        .from('dispute_evidence')
        .insert({
          dispute_id: disputeId,
          evidence_type: evidenceType,
          description,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute'] });
      toast({
        title: 'Evidence Uploaded',
        description: 'Your evidence has been added to the dispute.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to Upload Evidence',
        description: error.message,
      });
    },
  });

  // Propose resolution
  const proposeResolution = useMutation({
    mutationFn: async (params: ProposeResolutionParams) => {
      const { data, error } = await supabase
        .from('dispute_resolutions')
        .insert({
          dispute_id: params.disputeId,
          resolution_type: params.resolutionType,
          awarded_to: params.awardedTo,
          amount: params.amount || 0,
          details: params.details,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute'] });
      toast({
        title: 'Resolution Proposed',
        description: 'Your resolution proposal has been submitted.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to Propose Resolution',
        description: error.message,
      });
    },
  });

  // Update dispute status
  const updateDisputeStatus = useMutation({
    mutationFn: async ({ disputeId, status, notes }: { disputeId: string; status: string; notes?: string }) => {
      const updates: any = { status };
      
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.auto_close_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      }

      if (notes) {
        updates.resolution_notes = notes;
      }

      const { data, error } = await supabase
        .from('disputes')
        .update(updates)
        .eq('id', disputeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      queryClient.invalidateQueries({ queryKey: ['dispute'] });
      toast({
        title: 'Status Updated',
        description: 'The dispute status has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to Update Status',
        description: error.message,
      });
    },
  });

  return {
    disputes,
    dispute,
    evidence,
    timeline,
    resolution,
    messages,
    disputesLoading,
    disputeLoading,
    messagesLoading,
    createDispute,
    sendMessage,
    uploadEvidence,
    proposeResolution,
    updateDisputeStatus,
  };
};
