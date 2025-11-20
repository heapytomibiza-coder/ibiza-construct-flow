import { supabase } from '@/integrations/supabase/client';
import type { DraftJob, Job, ApiResponse } from './types';

export const jobs = {
  async saveDraft(draft: DraftJob): Promise<ApiResponse<string>> {
    try {
      // For now, save as draft in localStorage until job is published
      const draftKey = `job_draft_${draft.microId}_${Date.now()}`;
      localStorage.setItem(draftKey, JSON.stringify(draft));
      
      return { data: draftKey };
    } catch (error) {
      return { error: 'Failed to save draft' };
    }
  },

  async publishJob(draft: DraftJob): Promise<ApiResponse<Job>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };

      // Create a job from the draft
      const jobData = {
        client_id: user.id,
        micro_id: draft.microId,
        micro_uuid: draft.microUuid || null, // UUID from micro_services lookup
        title: `${draft.microId} Service Request`, // Generate from micro service
        description: JSON.stringify(draft.answers), // Store answers as description for now
        answers: draft.answers,
        budget_type: 'fixed' as const,
        budget_value: draft.priceEstimate || null,
        status: 'open' as const
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) return { error: error.message };

      const job: Job = {
        id: data.id,
        status: data.status as Job['status'],
        clientId: data.client_id,
        microId: data.micro_id,
        title: data.title,
        description: data.description || '',
        answers: (data.answers as Record<string, any>) || {},
        budgetType: data.budget_type as Job['budgetType'],
        budgetValue: data.budget_value,
        location: data.location ? {
          lat: (data.location as any).lat,
          lng: (data.location as any).lng,
          address: (data.location as any).address
        } : undefined,
        createdAt: data.created_at
      };

      return { data: job };
    } catch (error) {
      return { error: 'Failed to publish job' };
    }
  },

  async getJob(jobId: string): Promise<ApiResponse<Job>> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) return { error: error.message };

      const job: Job = {
        id: data.id,
        status: data.status as Job['status'],
        clientId: data.client_id,
        microId: data.micro_id,
        title: data.title,
        description: data.description || '',
        answers: (data.answers as Record<string, any>) || {},
        budgetType: data.budget_type as Job['budgetType'],
        budgetValue: data.budget_value,
        location: data.location ? {
          lat: (data.location as any).lat,
          lng: (data.location as any).lng,
          address: (data.location as any).address
        } : undefined,
        createdAt: data.created_at
      };

      return { data: job };
    } catch (error) {
      return { error: 'Failed to fetch job' };
    }
  },

  async getJobsByClient(clientId: string): Promise<ApiResponse<Job[]>> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) return { error: error.message };

      const jobs: Job[] = data.map(item => ({
        id: item.id,
        status: item.status as Job['status'],
        clientId: item.client_id,
        microId: item.micro_id,
        title: item.title,
        description: item.description || '',
        answers: (item.answers as Record<string, any>) || {},
        budgetType: item.budget_type as Job['budgetType'],
        budgetValue: item.budget_value,
        location: item.location ? {
          lat: (item.location as any).lat,
          lng: (item.location as any).lng,
          address: (item.location as any).address
        } : undefined,
        createdAt: item.created_at
      }));

      return { data: jobs };
    } catch (error) {
      return { error: 'Failed to fetch client jobs' };
    }
  },

  async getOpenJobs(): Promise<ApiResponse<Job[]>> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) return { error: error.message };

      const jobs: Job[] = data.map(item => ({
        id: item.id,
        status: item.status as Job['status'],
        clientId: item.client_id,
        microId: item.micro_id,
        title: item.title,
        description: item.description || '',
        answers: (item.answers as Record<string, any>) || {},
        budgetType: item.budget_type as Job['budgetType'],
        budgetValue: item.budget_value,
        location: item.location ? {
          lat: (item.location as any).lat,
          lng: (item.location as any).lng,
          address: (item.location as any).address
        } : undefined,
        createdAt: item.created_at
      }));

      return { data: jobs };
    } catch (error) {
      return { error: 'Failed to fetch open jobs' };
    }
  }
};