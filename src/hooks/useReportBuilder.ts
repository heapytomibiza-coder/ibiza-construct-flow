import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReportConfig {
  name: string;
  description?: string;
  report_type: 'revenue' | 'performance' | 'engagement' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  metrics: string[];
  groupBy?: string;
  filters?: Record<string, any>;
  visualizations?: Array<{
    type: 'line' | 'bar' | 'pie' | 'table';
    metric: string;
  }>;
}

export const useReportBuilder = () => {
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const createReport = async (config: ReportConfig) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('analytics_reports')
        .insert({
          name: config.name,
          description: config.description,
          report_type: config.report_type,
          user_id: user.data.user.id,
          config: config,
          schedule: 'none'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Report created successfully'
      });

      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to create report',
        variant: 'destructive'
      });
    }
  };

  const generateReport = async (reportId: string) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { report_id: reportId }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Report generated successfully'
      });

      return data;
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const exportReport = async (
    reportId: string,
    format: 'pdf' | 'csv' | 'excel' | 'json'
  ) => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-report', {
        body: {
          report_id: reportId,
          format
        }
      });

      if (error) throw error;

      // Download the file
      if (data?.file_url) {
        window.open(data.file_url, '_blank');
      }

      toast({
        title: 'Success',
        description: `Report exported as ${format.toUpperCase()}`
      });

      return data;
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const scheduleReport = async (
    reportId: string,
    schedule: 'daily' | 'weekly' | 'monthly'
  ) => {
    try {
      const { error } = await (supabase as any)
        .from('analytics_reports')
        .update({ schedule })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Report scheduled to run ${schedule}`
      });
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule report',
        variant: 'destructive'
      });
    }
  };

  return {
    generating,
    exporting,
    createReport,
    generateReport,
    exportReport,
    scheduleReport
  };
};
