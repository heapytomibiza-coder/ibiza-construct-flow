import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      return data || [];
    },
  });

  const getActionBadge = (action: string) => {
    if (action.includes("create") || action.includes("approve")) {
      return <Badge variant="outline" className="bg-green-50">Success</Badge>;
    }
    if (action.includes("delete") || action.includes("reject")) {
      return <Badge variant="outline" className="bg-red-50">Action</Badge>;
    }
    return <Badge variant="outline">Update</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{activity.action}</p>
                    {getActionBadge(activity.action)}
                  </div>
                  {activity.entity_type && (
                    <p className="text-xs text-muted-foreground">
                      {activity.entity_type}
                      {activity.entity_id && ` • ${activity.entity_id.slice(0, 8)}`}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity
          </p>
        )}
      </CardContent>
    </Card>
  );
}
