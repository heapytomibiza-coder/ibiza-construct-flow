import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlockedUser {
  id: string;
  blocked_id: string;
  reason: string | null;
  created_at: string;
  blocked_user?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface RateLimitStatus {
  allowed: boolean;
  remaining?: number;
  reason?: string;
  retry_after?: number;
}

export function useMessageSafety(userId?: string) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus | null>(null);

  // Fetch blocked users
  const fetchBlockedUsers = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    const client: any = supabase;
    const { data, error } = await client
      .from('user_blocks')
      .select(`
        *,
        blocked_user:profiles!user_blocks_blocked_id_fkey(
          full_name,
          avatar_url
        )
      `)
      .eq('blocker_id', userId);

    if (error) {
      console.error('Error fetching blocked users:', error);
      toast.error('Failed to load blocked users');
    } else {
      setBlockedUsers(data || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  // Block a user
  const blockUser = useCallback(async (targetUserId: string, reason?: string) => {
    if (!userId) {
      toast.error('You must be logged in to block users');
      return false;
    }

    const client: any = supabase;
    const { error } = await client
      .from('user_blocks')
      .insert({
        blocker_id: userId,
        blocked_id: targetUserId,
        reason: reason || null
      });

    if (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
      return false;
    }

    toast.success('User blocked successfully');
    fetchBlockedUsers();
    return true;
  }, [userId, fetchBlockedUsers]);

  // Unblock a user
  const unblockUser = useCallback(async (targetUserId: string) => {
    if (!userId) return false;

    const client: any = supabase;
    const { error } = await client
      .from('user_blocks')
      .delete()
      .eq('blocker_id', userId)
      .eq('blocked_id', targetUserId);

    if (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
      return false;
    }

    toast.success('User unblocked');
    fetchBlockedUsers();
    return true;
  }, [userId, fetchBlockedUsers]);

  // Check if a user is blocked
  const checkIfBlocked = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!userId) return false;

    const client: any = supabase;
    const { data, error } = await client
      .rpc('check_user_blocked', {
        p_sender_id: userId,
        p_recipient_id: targetUserId
      });

    if (error) {
      console.error('Error checking block status:', error);
      return false;
    }

    return data === true;
  }, [userId]);

  // Report a message
  const reportMessage = useCallback(async (messageId: string, reason: string) => {
    if (!userId) {
      toast.error('You must be logged in to report messages');
      return false;
    }

    const client: any = supabase;
    const { error } = await client
      .from('message_reports')
      .insert({
        reporter_id: userId,
        message_id: messageId,
        reason
      });

    if (error) {
      console.error('Error reporting message:', error);
      toast.error('Failed to report message');
      return false;
    }

    toast.success('Message reported. Our team will review it.');
    return true;
  }, [userId]);

  // Check rate limit
  const checkRateLimit = useCallback(async (): Promise<RateLimitStatus> => {
    if (!userId) {
      return { allowed: false, reason: 'not_authenticated' };
    }

    const client: any = supabase;
    const { data, error } = await client
      .rpc('check_rate_limit', { p_user_id: userId });

    if (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true }; // Fail open for better UX
    }

    setRateLimitStatus(data);
    return data;
  }, [userId]);

  // Check spam content (client-side pre-check)
  const checkSpamContent = useCallback(async (content: string) => {
    const client: any = supabase;
    const { data, error } = await client
      .rpc('check_spam_content', { p_content: content });

    if (error) {
      console.error('Error checking spam:', error);
      return { is_spam: false, matched_keywords: [], severity: 'low' };
    }

    return data;
  }, []);

  return {
    blockedUsers,
    loading,
    rateLimitStatus,
    blockUser,
    unblockUser,
    checkIfBlocked,
    reportMessage,
    checkRateLimit,
    checkSpamContent,
    refreshBlockedUsers: fetchBlockedUsers
  };
}
