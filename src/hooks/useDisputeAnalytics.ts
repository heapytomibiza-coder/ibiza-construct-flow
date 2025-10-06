import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KPISummary {
  resolved: number;
  avgResolutionHrs: number;
  adminForced: number;
  expired: number;
}

interface Warning {
  id: number;
  dispute_id: string;
  offender_id?: string;
  level: 'info' | 'warning' | 'urgent';
  kind: string;
  details: any;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export function useDisputeAnalytics() {
  const [kpis, setKpis] = useState<KPISummary>();
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);

      const { data: kpiData, error: kpiError } = await supabase.rpc('get_dispute_kpis', {
        p_from: weekAgo.toISOString().slice(0, 10),
        p_to: today.toISOString().slice(0, 10),
      });

      if (kpiError) throw kpiError;

      const { data: warningData, error: warningError } = await supabase.rpc('list_early_warnings', {
        p_level: null,
        p_resolved: false,
      });

      if (warningError) throw warningError;

      // Aggregate KPIs
      const resolved = (kpiData || []).reduce((sum: number, row: any) => sum + (row.resolved_count || 0), 0);
      const avgHours = (kpiData || []).length > 0
        ? (kpiData || []).reduce((sum: number, row: any) => sum + (row.avg_resolution_hours || 0), 0) / (kpiData || []).length
        : 0;
      const adminForced = (kpiData || []).reduce((sum: number, row: any) => sum + (row.admin_forced_count || 0), 0);
      const expired = (kpiData || []).reduce((sum: number, row: any) => sum + (row.expired_count || 0), 0);

      setKpis({
        resolved,
        avgResolutionHrs: Math.round(avgHours * 10) / 10,
        adminForced,
        expired,
      });

      setWarnings(warningData || []);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function resolveWarning(id: number) {
    try {
      const { error } = await supabase.rpc('resolve_warning', { p_id: id });
      if (error) throw error;

      toast({
        title: "Warning resolved",
        description: "The warning has been marked as resolved.",
      });

      await load();
    } catch (error: any) {
      toast({
        title: "Error resolving warning",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function exportCSV() {
    if (!kpis) return;

    const rows = [
      ["Metric", "Value"],
      ["Resolved (7d)", kpis.resolved.toString()],
      ["Avg Resolution (hrs)", kpis.avgResolutionHrs.toString()],
      ["Admin-Forced", kpis.adminForced.toString()],
      ["Expired", kpis.expired.toString()],
    ];

    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dispute-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exported",
      description: "Analytics data has been exported to CSV.",
    });
  }

  async function exportPDF() {
    try {
      const payload = {
        kpis,
        warnings: warnings.length,
        generatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase.functions.invoke('export-report', {
        body: payload,
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Report generated",
          description: "Opening report in new tab.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error generating report",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  function refresh() {
    load();
  }

  useEffect(() => {
    load();

    // Set up real-time subscription for warnings
    const channel = supabase
      .channel('early_warnings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'early_warnings',
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    kpis,
    warnings,
    loading,
    refresh,
    resolveWarning,
    exportCSV,
    exportPDF,
  };
}
