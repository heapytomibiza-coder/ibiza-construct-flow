import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface ReactionSummary {
  reaction: string;
  count: number;
  userIds: string[];
  hasReacted: boolean;
}

export const useMessageReactions = (messageId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!messageId) return;

    fetchReactions();

    // Subscribe to reaction changes
    const channel = supabase
      .channel(`reactions-${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReactions(prev => [...prev, payload.new as MessageReaction]);
          } else if (payload.eventType === 'DELETE') {
            setReactions(prev => prev.filter(r => r.id !== (payload.old as MessageReaction).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  const fetchReactions = async () => {
    if (!messageId) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReactions(data || []);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReaction = async (reaction: string) => {
    if (!messageId || !user) return;

    try {
      const { error } = await (supabase as any)
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction
        });

      if (error) {
        // If duplicate, remove the reaction instead
        if (error.code === '23505') {
          await removeReaction(reaction);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error adding reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reaction',
        variant: 'destructive'
      });
    }
  };

  const removeReaction = async (reaction: string) => {
    if (!messageId || !user) return;

    try {
      const { error } = await (supabase as any)
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('reaction', reaction);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove reaction',
        variant: 'destructive'
      });
    }
  };

  const toggleReaction = async (reaction: string) => {
    if (!messageId || !user) return;

    const hasReacted = reactions.some(
      r => r.user_id === user.id && r.reaction === reaction
    );

    if (hasReacted) {
      await removeReaction(reaction);
    } else {
      await addReaction(reaction);
    }
  };

  const getReactionSummary = (): ReactionSummary[] => {
    const summaryMap = new Map<string, ReactionSummary>();

    reactions.forEach(r => {
      if (!summaryMap.has(r.reaction)) {
        summaryMap.set(r.reaction, {
          reaction: r.reaction,
          count: 0,
          userIds: [],
          hasReacted: false
        });
      }

      const summary = summaryMap.get(r.reaction)!;
      summary.count++;
      summary.userIds.push(r.user_id);
      if (user && r.user_id === user.id) {
        summary.hasReacted = true;
      }
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.count - a.count);
  };

  return {
    reactions,
    loading,
    addReaction,
    removeReaction,
    toggleReaction,
    getReactionSummary,
    refresh: fetchReactions
  };
};
