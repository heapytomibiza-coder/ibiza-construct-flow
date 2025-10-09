import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export function SystemHealth() {
  const { data: health, isLoading } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const [pendingJobs, activeDisputes, pendingVerifications] = await Promise.all([
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("status", "open"),
        supabase
          .from("disputes")
          .select("id", { count: "exact", head: true })
          .in("status", ["open", "in_progress"]),
        supabase
          .from("professional_verifications")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      return {
        openJobs: pendingJobs.count || 0,
        activeDisputes: activeDisputes.count || 0,
        pendingVerifications: pendingVerifications.count || 0,
      };
    },
  });

  const healthItems = [
    {
      label: "Open Jobs",
      value: health?.openJobs || 0,
      status: (health?.openJobs || 0) < 50 ? "healthy" : "warning",
    },
    {
      label: "Active Disputes",
      value: health?.activeDisputes || 0,
      status: (health?.activeDisputes || 0) < 10 ? "healthy" : "warning",
    },
    {
      label: "Pending Verifications",
      value: health?.pendingVerifications || 0,
      status: (health?.pendingVerifications || 0) < 20 ? "healthy" : "warning",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge variant="outline" className="bg-green-50">Healthy</Badge>;
      case "warning":
        return <Badge variant="outline" className="bg-yellow-50">Needs Attention</Badge>;
      default:
        return <Badge variant="destructive">Critical</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {healthItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.value} {item.value === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
                {getStatusBadge(item.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
