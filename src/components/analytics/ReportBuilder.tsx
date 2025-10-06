import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReportBuilder } from '@/hooks/useReportBuilder';
import { FileText, Download, Calendar } from 'lucide-react';

export const ReportBuilder = () => {
  const { generating, createReport, generateReport, exportReport, scheduleReport } = useReportBuilder();
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportType, setReportType] = useState<'revenue' | 'performance' | 'engagement' | 'custom'>('revenue');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleCreate = async () => {
    const config = {
      name: reportName,
      description: reportDescription,
      report_type: reportType,
      dateRange,
      metrics: [],
      filters: {}
    };

    const report = await createReport(config);
    if (report) {
      setReportName('');
      setReportDescription('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create Custom Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="report-name">Report Name</Label>
          <Input
            id="report-name"
            placeholder="Monthly Revenue Report"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-description">Description (Optional)</Label>
          <Textarea
            id="report-description"
            placeholder="Detailed analysis of monthly revenue trends..."
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-type">Report Type</Label>
          <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
            <SelectTrigger id="report-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue Analysis</SelectItem>
              <SelectItem value="performance">Performance Metrics</SelectItem>
              <SelectItem value="engagement">User Engagement</SelectItem>
              <SelectItem value="custom">Custom Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleCreate} disabled={!reportName || generating} className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Create Report
          </Button>
          <Button variant="outline" disabled>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Reports can be exported as PDF, CSV, or Excel files</p>
          <p>Schedule reports to be automatically generated daily, weekly, or monthly</p>
        </div>
      </CardContent>
    </Card>
  );
};
