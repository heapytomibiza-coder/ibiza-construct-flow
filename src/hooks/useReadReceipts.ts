import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ReadReceipt {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export const useReadReceipts = (messageIds?: string[]) => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ReadReceipt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!messageIds || messageIds.length === 0) return;

    fetchReceipts();

    // Subscribe to receipt changes
    const channel = supabase
      .channel('read-receipts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'read_receipts'
        },
        (payload) => {
          const receipt = payload.new as ReadReceipt;
          if (messageIds.includes(receipt.message_id)) {
            setReceipts(prev => [...prev, receipt]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageIds?.join(',')]);

  const fetchReceipts = async () => {
    if (!messageIds || messageIds.length === 0) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('read_receipts')
        .select('*')
        .in('message_id', messageIds);

      if (error) throw error;
      setReceipts(data || []);
    } catch (error) {
      console.error('Error fetching read receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      // Check if already marked as read
      const existingReceipt = receipts.find(
        r => r.message_id === messageId && r.user_id === user.id
      );

      if (existingReceipt) return;

      const { error } = await (supabase as any)
        .from('read_receipts')
        .insert({
          message_id: messageId,
          user_id: user.id
        });

      if (error && error.code !== '23505') { // Ignore duplicate errors
        throw error;
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markMultipleAsRead = async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    try {
      const receiptsToInsert = messageIds
        .filter(msgId => !receipts.some(r => r.message_id === msgId && r.user_id === user.id))
        .map(msgId => ({
          message_id: msgId,
          user_id: user.id
        }));

      if (receiptsToInsert.length === 0) return;

      const { error } = await (supabase as any)
        .from('read_receipts')
        .insert(receiptsToInsert);

      if (error && error.code !== '23505') {
        throw error;
      }
    } catch (error) {
      console.error('Error marking multiple as read:', error);
    }
  };

  const getReadByUsers = (messageId: string): string[] => {
    return receipts
      .filter(r => r.message_id === messageId)
      .map(r => r.user_id);
  };

  const isReadByUser = (messageId: string, userId: string): boolean => {
    return receipts.some(r => r.message_id === messageId && r.user_id === userId);
  };

  const getReadCount = (messageId: string): number => {
    return receipts.filter(r => r.message_id === messageId).length;
  };

  return {
    receipts,
    loading,
    markAsRead,
    markMultipleAsRead,
    getReadByUsers,
    isReadByUser,
    getReadCount,
    refresh: fetchReceipts
  };
};
