import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExportRequest {
  export_type: string;
  export_format: 'csv' | 'json' | 'xlsx' | 'pdf';
  filters?: Record<string, any>;
}

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const requestExport = async (request: ExportRequest) => {
    try {
      setIsExporting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('data_exports')
        .insert({
          user_id: user.id,
          export_type: request.export_type,
          export_format: request.export_format,
          filters: request.filters || {},
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger the export processing via edge function
      const { error: functionError } = await supabase.functions.invoke('process-data-export', {
        body: { export_id: data.id }
      });

      if (functionError) throw functionError;

      toast({
        title: 'Export requested',
        description: 'Your export is being processed. You will be notified when it\'s ready.'
      });

      return data;
    } catch (error) {
      console.error('Error requesting export:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to request data export. Please try again.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const getExportStatus = async (exportId: string) => {
    try {
      const { data, error } = await supabase
        .from('data_exports')
        .select('*')
        .eq('id', exportId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching export status:', error);
      return null;
    }
  };

  const downloadExport = async (fileUrl: string) => {
    try {
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading export:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download the export file.',
        variant: 'destructive'
      });
    }
  };

  return {
    isExporting,
    requestExport,
    getExportStatus,
    downloadExport
  };
};
