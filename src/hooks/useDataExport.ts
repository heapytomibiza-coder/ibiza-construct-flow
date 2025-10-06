import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

export function useDataExport() {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportData = async (
    reportType: string,
    format: ExportFormat,
    dateRange?: { from: Date; to: Date }
  ) => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-data-export', {
        body: {
          report_type: reportType,
          format,
          date_range: dateRange ? {
            start: dateRange.from.toISOString(),
            end: dateRange.to.toISOString(),
          } : undefined,
        },
      });

      if (error) throw error;

      if (data?.download_url) {
        // Download the file
        window.open(data.download_url, '_blank');
        toast({
          title: 'Export Complete',
          description: `Your ${format.toUpperCase()} export is ready.`,
        });
      } else if (data?.file_url) {
        window.open(data.file_url, '_blank');
        toast({
          title: 'Export Complete',
          description: `Your ${format.toUpperCase()} export is ready.`,
        });
      }

      return data;
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return { exportData, exporting };
}
