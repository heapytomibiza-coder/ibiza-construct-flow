import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SupportTicket {
  id: string;
  ticket_number: number;
  user_id: string;
  assigned_to: string | null;
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'billing' | 'technical' | 'account' | 'dispute' | 'verification' | 'other';
  subject: string;
  description: string | null;
  sla_deadline: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal_note: boolean;
  created_at: string;
}

export function useHelpdesk() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    }
  });

  const createTicket = useMutation({
    mutationFn: async (ticket: {
      subject: string;
      description: string;
      category: string;
      priority?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: ticket.subject,
          description: ticket.description,
          category: ticket.category,
          priority: (ticket.priority || 'medium') as any
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({
        title: "Ticket Created",
        description: "Your support ticket has been submitted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateTicket = useMutation({
    mutationFn: async ({ 
      ticketId, 
      updates 
    }: { 
      ticketId: string; 
      updates: Partial<SupportTicket> 
    }) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({
        title: "Ticket Updated",
        description: "The ticket has been updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const assignTicket = useMutation({
    mutationFn: async ({
      ticketId,
      adminId
    }: {
      ticketId: string;
      adminId: string;
    }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          assigned_to: adminId,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({
        title: "Ticket Assigned",
        description: "The ticket has been assigned successfully"
      });
    }
  });

  const getSLAStatus = (ticket: SupportTicket) => {
    if (!ticket.sla_deadline || ticket.status === 'resolved' || ticket.status === 'closed') {
      return { status: 'ok', minutesRemaining: null };
    }

    const deadline = new Date(ticket.sla_deadline);
    const now = new Date();
    const minutesRemaining = Math.floor((deadline.getTime() - now.getTime()) / 60000);

    if (minutesRemaining < 0) {
      return { status: 'breached', minutesRemaining: Math.abs(minutesRemaining) };
    } else if (minutesRemaining < 120) {
      return { status: 'critical', minutesRemaining };
    } else {
      return { status: 'ok', minutesRemaining };
    }
  };

  return {
    tickets,
    isLoading,
    createTicket: createTicket.mutateAsync,
    updateTicket: updateTicket.mutateAsync,
    assignTicket: assignTicket.mutateAsync,
    getSLAStatus
  };
}
