import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  report_type: string;
  template_config?: any;
  created_by?: string;
  is_active?: boolean;
  frequency?: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedReport {
  id: string;
  template_id?: string;
  generated_by?: string;
  report_name: string;
  report_data: any;
  file_url?: string;
  generated_at: string;
  period_start?: string;
  period_end?: string;
  status?: string;
  metadata?: any;
}

export const useReportGeneration = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Partial<ReportTemplate>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert({
          name: template.name || 'Untitled',
          description: template.description,
          report_type: template.report_type || 'custom',
          config: template.template_config || {},
          created_by: userId,
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Report template created successfully',
      });

      await fetchTemplates();
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (
    templateId: string,
    reportName: string,
    config?: any
  ) => {
    setLoading(true);
    try {
      // Fetch data based on template configuration
      const template = templates.find((t) => t.id === templateId);
      if (!template) throw new Error('Template not found');

      // Generate report data (this would be more sophisticated in production)
      const reportData = {
        generated_by: userId,
        template: template.name,
        timestamp: new Date().toISOString(),
        config: config || template.template_config,
        // Add actual report data here based on template type
      };

      const now = new Date();
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('generated_reports')
        .insert({
          template_id: templateId,
          generated_by: userId,
          report_name: reportName,
          report_data: reportData,
          period_start: now.toISOString(),
          period_end: thirtyDaysLater.toISOString(),
          status: 'completed',
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Report generated successfully',
      });

      await fetchGeneratedReports();
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneratedReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('generated_by', userId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setGeneratedReports((data || []) as any);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('generated_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Report deleted successfully',
      });

      await fetchGeneratedReports();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (reportId: string, format: 'pdf' | 'csv' | 'json') => {
    try {
      const report = generatedReports.find((r) => r.id === reportId);
      if (!report) throw new Error('Report not found');

      // In production, this would call an edge function to generate the export
      const dataStr = JSON.stringify(report.report_data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.report_name}.${format}`;
      link.click();
      
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Report exported successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    loading,
    templates,
    generatedReports,
    fetchTemplates,
    createTemplate,
    generateReport,
    fetchGeneratedReports,
    deleteReport,
    exportReport,
  };
};
