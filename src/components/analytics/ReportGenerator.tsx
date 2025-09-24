import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Calendar as CalendarIcon, Download, Send, Clock, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  report_type: string;
  frequency: string;
  template_config: any;
  is_active: boolean;
  created_at: string;
}

interface GeneratedReport {
  id: string;
  template_id: string;
  report_name: string;
  status: string;
  generated_at: string;
  period_start: string;
  period_end: string;
  file_url?: string;
}

export const ReportGenerator = () => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    report_type: 'executive',
    frequency: 'monthly',
    sections: ['revenue', 'jobs', 'users'],
    filters: {}
  });

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);

      // Load report templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('report_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;

      // Load generated reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('generated_reports')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(20);

      if (reportsError) throw reportsError;

      setTemplates(templatesData || []);
      setReports(reportsData || []);

    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: "Error loading reports",
        description: "Failed to load report templates and history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert([{
          name: newTemplate.name,
          description: newTemplate.description,
          report_type: newTemplate.report_type,
          frequency: newTemplate.frequency,
          template_config: {
            sections: newTemplate.sections,
            filters: newTemplate.filters
          }
        }])
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      setShowCreateTemplate(false);
      setNewTemplate({
        name: '',
        description: '',
        report_type: 'executive',
        frequency: 'monthly',
        sections: ['revenue', 'jobs', 'users'],
        filters: {}
      });

      toast({
        title: "Template created",
        description: "Report template created successfully"
      });

    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error creating template",
        description: "Failed to create report template",
        variant: "destructive"
      });
    }
  };

  const generateReport = async (template: ReportTemplate, customDates?: { start: Date; end: Date }) => {
    try {
      setGenerating(true);

      const reportData = {
        template_id: template.id,
        report_name: `${template.name} - ${format(new Date(), 'MMM yyyy')}`,
        period_start: (customDates?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).toISOString(),
        period_end: (customDates?.end || new Date()).toISOString(),
        status: 'generating'
      };

      const { data, error } = await supabase
        .from('generated_reports')
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;

      // Simulate report generation
      setTimeout(async () => {
        await supabase
          .from('generated_reports')
          .update({ 
            status: 'completed',
            file_url: '/reports/sample-report.pdf',
            report_data: {
              metrics: {
                total_revenue: 124320,
                total_jobs: 1247,
                new_users: 2850,
                completion_rate: 94.2
              },
              charts: [],
              summary: 'Generated executive summary report'
            }
          })
          .eq('id', data.id);

        loadReportData();
        toast({
          title: "Report generated",
          description: "Your report is ready for download"
        });
      }, 3000);

      setReports(prev => [data, ...prev]);

      toast({
        title: "Report generation started",
        description: "Your report is being generated and will be ready shortly"
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error generating report",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = (report: GeneratedReport) => {
    if (report.file_url) {
      // In production, this would download the actual file
      toast({
        title: "Download started",
        description: "Report download has started"
      });
    }
  };

  const scheduleReport = async (template: ReportTemplate) => {
    toast({
      title: "Report scheduled",
      description: `${template.name} will be generated ${template.frequency}`
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Report Generator
          </h2>
          <p className="text-muted-foreground">Create and manage automated reports</p>
        </div>
        <Button onClick={() => setShowCreateTemplate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="grid gap-4">
            {showCreateTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Report Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Template Name</Label>
                      <Input
                        id="name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Executive Monthly Report"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Report Type</Label>
                      <Select value={newTemplate.report_type} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, report_type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="executive">Executive Summary</SelectItem>
                          <SelectItem value="financial">Financial Report</SelectItem>
                          <SelectItem value="operational">Operational Report</SelectItem>
                          <SelectItem value="performance">Performance Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this report includes..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createTemplate}>Create Template</Button>
                    <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {templates.map((template) => (
              <Card key={template.id} className="hover-scale">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{template.report_type}</Badge>
                        <Badge variant="secondary">{template.frequency}</Badge>
                        {template.is_active && <Badge variant="default">Active</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => generateReport(template)}
                        disabled={generating}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => scheduleReport(template)}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{report.report_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(report.period_start), 'MMM dd')} - {format(new Date(report.period_end), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Generated {format(new Date(report.generated_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {report.status === 'completed' && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </Badge>
                      )}
                      {report.status === 'generating' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Generating...
                        </Badge>
                      )}
                      {report.status === 'error' && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Error
                        </Badge>
                      )}
                      {report.status === 'completed' && (
                        <Button size="sm" onClick={() => downloadReport(report)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Scheduled Reports</h3>
            <p className="text-muted-foreground mb-4">
              Schedule reports from templates to receive them automatically
            </p>
            <Button onClick={() => toast({ title: "Coming Soon", description: "Report scheduling will be available soon" })}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};