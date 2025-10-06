import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useScheduling(jobId?: string) {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const scheduleJob = async (scheduledAt: string, durationMinutes: number = 60) => {
    if (!jobId) {
      toast({
        title: "Error",
        description: "Job ID is required",
        variant: "destructive",
      });
      return false;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          scheduled_at: scheduledAt,
          duration_minutes: durationMinutes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job scheduled successfully",
      });

      return true;
    } catch (error) {
      console.error('Error scheduling job:', error);
      toast({
        title: "Error",
        description: "Failed to schedule job",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const rescheduleJob = async (scheduledAt: string) => {
    if (!jobId) {
      toast({
        title: "Error",
        description: "Job ID is required",
        variant: "destructive",
      });
      return false;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          scheduled_at: scheduledAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job rescheduled successfully",
      });

      return true;
    } catch (error) {
      console.error('Error rescheduling job:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule job",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const cancelSchedule = async () => {
    if (!jobId) {
      toast({
        title: "Error",
        description: "Job ID is required",
        variant: "destructive",
      });
      return false;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          scheduled_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule cancelled",
      });

      return true;
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      toast({
        title: "Error",
        description: "Failed to cancel schedule",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    scheduleJob,
    rescheduleJob,
    cancelSchedule,
  };
}
