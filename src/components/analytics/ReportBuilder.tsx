import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useReportBuilder } from '@/hooks/useReportBuilder';
import { useDataExport } from '@/hooks/useDataExport';
import { Loader2, Download, Calendar, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ReportBuilder() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState<'revenue' | 'performance' | 'engagement' | 'custom'>('revenue');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue', 'transactions']);
  const [schedule, setSchedule] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  const { createReport, generateReport, generating } = useReportBuilder();
  const { exportData, exporting } = useDataExport();

  const availableMetrics = {
    revenue: ['total_revenue', 'transactions', 'average_value', 'growth_rate'],
    performance: ['completion_rate', 'response_time', 'ratings', 'reviews'],
    engagement: ['active_users', 'sessions', 'messages', 'bookings'],
    custom: ['all_metrics'],
  };

  const handleCreate = async () => {
    if (!name) return;

    const report = await createReport({
      name,
      description,
      report_type: reportType,
      dateRange: {
        start: dateRange.start,
        end: dateRange.end,
      },
      metrics: selectedMetrics,
    });

    if (report && schedule !== 'none') {
      console.log('Scheduling report:', schedule);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    await exportData(reportType, format, {
      from: new Date(dateRange.start),
      to: new Date(dateRange.end),
    });
  };

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configure" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="schedule">Schedule & Export</TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Report Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Monthly Revenue Report"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed revenue analysis for the month"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Report Type *</Label>
                <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Revenue Analytics
                      </div>
                    </SelectItem>
                    <SelectItem value="performance">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Performance Metrics
                      </div>
                    </SelectItem>
                    <SelectItem value="engagement">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        User Engagement
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Custom Report
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Start Date *
                  </Label>
                  <Input
                    id="start"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    End Date *
                  </Label>
                  <Input
                    id="end"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="space-y-3">
                <Label>Select Metrics to Include</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableMetrics[reportType].map((metric) => (
                    <div key={metric} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric}
                        checked={selectedMetrics.includes(metric)}
                        onCheckedChange={() => toggleMetric(metric)}
                      />
                      <label
                        htmlFor={metric}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        {metric.replace(/_/g, ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMetrics.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Select at least one metric to include in the report.
                </p>
              )}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schedule">Report Schedule</Label>
                <Select value={schedule} onValueChange={(value: any) => setSchedule(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">One-time Report</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <Label className="mb-3 block">Export Options</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('csv')}
                    disabled={exporting}
                  >
                    {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('json')}
                    disabled={exporting}
                  >
                    {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('excel')}
                    disabled={exporting}
                  >
                    {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    disabled={exporting}
                  >
                    {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                    PDF
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={() => {
              setName('');
              setDescription('');
              setReportType('revenue');
              setSelectedMetrics(['revenue', 'transactions']);
              setSchedule('none');
            }}>
              Reset
            </Button>
            <Button onClick={handleCreate} disabled={generating || !name || selectedMetrics.length === 0}>
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {schedule === 'none' ? 'Generate Report' : 'Create & Schedule'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
