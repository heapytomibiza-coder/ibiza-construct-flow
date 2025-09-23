import { supabase } from '@/integrations/supabase/client';
import type { Offer, ApiResponse } from './types';

export const offers = {
  async sendOffer(
    jobId: string, 
    amount: number, 
    type: 'fixed' | 'hourly', 
    message?: string
  ): Promise<ApiResponse<Offer>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };

      const offerData = {
        job_id: jobId,
        tasker_id: user.id,
        amount,
        type,
        message,
        status: 'sent' as const
      };

      const { data, error } = await supabase
        .from('offers')
        .insert(offerData)
        .select()
        .single();

      if (error) return { error: error.message };

      const offer: Offer = {
        id: data.id,
        jobId: data.job_id,
        taskerId: data.tasker_id,
        message: data.message,
        amount: data.amount,
        type: data.type as Offer['type'],
        status: data.status as Offer['status'],
        createdAt: data.created_at
      };

      return { data: offer };
    } catch (error) {
      return { error: 'Failed to send offer' };
    }
  },

  async listOffersForJob(jobId: string): Promise<ApiResponse<Offer[]>> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) return { error: error.message };

      const offers: Offer[] = data.map(item => ({
        id: item.id,
        jobId: item.job_id,
        taskerId: item.tasker_id,
        message: item.message,
        amount: item.amount,
        type: item.type as Offer['type'],
        status: item.status as Offer['status'],
        createdAt: item.created_at
      }));

      return { data: offers };
    } catch (error) {
      return { error: 'Failed to fetch offers' };
    }
  },

  async acceptOffer(offerId: string): Promise<ApiResponse<Offer>> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .update({ status: 'accepted' })
        .eq('id', offerId)
        .select()
        .single();

      if (error) return { error: error.message };

      // Decline all other offers for this job
      await supabase
        .from('offers')
        .update({ status: 'declined' })
        .eq('job_id', data.job_id)
        .neq('id', offerId);

      const offer: Offer = {
        id: data.id,
        jobId: data.job_id,
        taskerId: data.tasker_id,
        message: data.message,
        amount: data.amount,
        type: data.type as Offer['type'],
        status: data.status as Offer['status'],
        createdAt: data.created_at
      };

      return { data: offer };
    } catch (error) {
      return { error: 'Failed to accept offer' };
    }
  },

  async declineOffer(offerId: string): Promise<ApiResponse<Offer>> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .update({ status: 'declined' })
        .eq('id', offerId)
        .select()
        .single();

      if (error) return { error: error.message };

      const offer: Offer = {
        id: data.id,
        jobId: data.job_id,
        taskerId: data.tasker_id,
        message: data.message,
        amount: data.amount,
        type: data.type as Offer['type'],
        status: data.status as Offer['status'],
        createdAt: data.created_at
      };

      return { data: offer };
    } catch (error) {
      return { error: 'Failed to decline offer' };
    }
  },

  async getOffersByTasker(taskerId: string): Promise<ApiResponse<Offer[]>> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('tasker_id', taskerId)
        .order('created_at', { ascending: false });

      if (error) return { error: error.message };

      const offers: Offer[] = data.map(item => ({
        id: item.id,
        jobId: item.job_id,
        taskerId: item.tasker_id,
        message: item.message,
        amount: item.amount,
        type: item.type as Offer['type'],
        status: item.status as Offer['status'],
        createdAt: item.created_at
      }));

      return { data: offers };
    } catch (error) {
      return { error: 'Failed to fetch tasker offers' };
    }
  }
};