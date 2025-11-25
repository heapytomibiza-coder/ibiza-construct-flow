import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, FileText, FileJson, File, Loader2, Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function ReportExportCenter() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>("jobs");
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [includePII, setIncludePII] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const { data: recentExports } = useQuery({
    queryKey: ['report-exports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_exports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  const generateReport = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert export request
      const { data, error } = await supabase
        .from('report_exports')
        .insert({
          report_type: reportType,
          export_format: exportFormat,
          filters: {
            date_from: dateRange.from.toISOString(),
            date_to: dateRange.to.toISOString()
          },
          include_pii: includePII,
          requested_by: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_action_type: 'report_export',
        p_target_type: 'report',
        p_target_id: data.id,
        p_action_data: {
          report_type: reportType,
          format: exportFormat,
          include_pii: includePII,
          date_range: {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString()
          }
        }
      });

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Export Started",
        description: "Your report is being generated. You'll be notified when it's ready."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return <FileText className="h-4 w-4" />;
      case 'json': return <FileJson className="h-4 w-4" />;
      case 'pdf': return <File className="h-4 w-4" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Exports</h1>
        <p className="text-muted-foreground">Generate and download data reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>Configure your export settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jobs">Jobs</SelectItem>
                  <SelectItem value="bookings">Bookings</SelectItem>
                  <SelectItem value="disputes">Disputes</SelectItem>
                  <SelectItem value="payouts">Payouts</SelectItem>
                  <SelectItem value="reviews">Reviews</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="analytics">Analytics Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel Compatible)</SelectItem>
                  <SelectItem value="json">JSON (Developer)</SelectItem>
                  <SelectItem value="pdf">PDF (Presentation)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.from, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.to, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pii"
                  checked={includePII}
                  onCheckedChange={(checked) => setIncludePII(checked as boolean)}
                />
                <Label htmlFor="pii" className="text-sm font-normal">
                  Include Personally Identifiable Information (PII)
                </Label>
              </div>
              {includePII && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This export will include sensitive user data and will be logged for audit purposes.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button 
              className="w-full" 
              onClick={() => generateReport.mutate()}
              disabled={generateReport.isPending}
            >
              {generateReport.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        {/* Recent Exports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Exports</CardTitle>
            <CardDescription>Your export history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExports?.map((exportItem) => (
                <div key={exportItem.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFormatIcon(exportItem.export_format)}
                      <span className="text-sm font-medium capitalize">
                        {exportItem.report_type}
                      </span>
                    </div>
                    <Badge variant={getStatusColor(exportItem.status)}>
                      {exportItem.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(exportItem.created_at).toLocaleDateString()}
                  </p>
                  {exportItem.status === 'completed' && exportItem.file_path && (
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <a href={exportItem.file_path} download>
                        <Download className="h-3 w-3 mr-2" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              ))}
              
              {!recentExports?.length && (
                <p className="text-center py-4 text-sm text-muted-foreground">
                  No exports yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
