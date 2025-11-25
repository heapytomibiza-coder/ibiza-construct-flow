import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming' | 'blocked';
  type: 'milestone' | 'payment' | 'status_change' | 'communication';
}

export function useProjectTimeline(projectId: string) {
  return useQuery({
    queryKey: ['project-timeline', projectId],
    queryFn: async () => {
      const events: TimelineEvent[] = [];

      // Fetch job/booking data
      const { data: job } = await supabase
        .from('jobs')
        .select('*, bookings(*)')
        .eq('id', projectId)
        .single();

      if (!job) return [];

      // Job creation event
      events.push({
        id: `job-created-${job.id}`,
        title: 'Project Posted',
        description: 'Client posted the project and is awaiting quotes',
        date: job.created_at,
        status: 'completed',
        type: 'status_change'
      });

      // Fetch quotes
      const { data: quotes } = await supabase
        .from('quotes')
        .select('*')
        .eq('quote_request_id', projectId)
        .order('created_at', { ascending: true });

      // Add quote events
      quotes?.forEach((quote) => {
        events.push({
          id: `quote-${quote.id}`,
          title: `Quote Received`,
          description: `Quote for €${quote.amount} from professional`,
          date: quote.created_at,
          status: 'completed',
          type: 'communication'
        });
      });

      // Fetch contracts
      const { data: contracts } = await supabase
        .from('contracts')
        .select('*')
        .eq('job_id', projectId)
        .order('created_at', { ascending: true });

      // Add contract events
      contracts?.forEach((contract) => {
        events.push({
          id: `contract-${contract.id}`,
          title: 'Contract Created',
          description: 'Project agreement signed by both parties',
          date: contract.created_at,
          status: 'completed',
          type: 'milestone'
        });

        events.push({
          id: `escrow-status-${contract.id}`,
          title: 'Payment Status',
          description: `€${contract.agreed_amount} - ${contract.escrow_status}`,
          date: contract.updated_at,
          status: contract.escrow_status === 'funded' ? 'completed' : 'current',
          type: 'payment'
        });

        // Add current or upcoming milestone
        const now = new Date().toISOString();
        const isActive = contract.start_at <= now && contract.end_at >= now;
        
        events.push({
          id: `project-timeline-${contract.id}`,
          title: 'Project Duration',
          description: `${new Date(contract.start_at).toLocaleDateString()} - ${new Date(contract.end_at).toLocaleDateString()}`,
          date: contract.start_at,
          status: isActive ? 'current' : contract.start_at > now ? 'upcoming' : 'completed',
          type: 'milestone'
        });
      });

      // Fetch reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('job_id', projectId)
        .order('created_at', { ascending: true });

      // Add review events
      reviews?.forEach((review) => {
        const commentPreview = review.comment?.substring(0, 50) || 'No comment';
        events.push({
          id: `review-${review.id}`,
          title: 'Review Posted',
          description: `${review.overall_rating}/5 stars - "${commentPreview}..."`,
          date: review.created_at,
          status: 'completed',
          type: 'communication'
        });
      });

      // Sort events by date
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return events;
    },
    enabled: !!projectId
  });
}
