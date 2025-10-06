import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Users, Briefcase, Calendar, Shield, AlertTriangle, 
  DollarSign, Ticket, Flag, Clock, TrendingUp, Activity 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function OverviewDashboard() {
  const navigate = useNavigate();

  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_kpis');
      if (error) throw error;
      return data as any;
    }
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const kpiCards = [
    { title: "Total Users", value: kpis?.total_users || 0, icon: Users, color: "text-blue-500", trend: "+12%" },
    { title: "Active Jobs", value: kpis?.active_jobs || 0, icon: Briefcase, color: "text-green-500", trend: "+5%" },
    { title: "Bookings", value: kpis?.total_bookings || 0, icon: Calendar, color: "text-purple-500", trend: "+8%" },
    { title: "Revenue (30d)", value: `$${(kpis?.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-500", trend: "+15%" },
  ];

  const riskCards = [
    { 
      title: "SLA Breaches", 
      count: kpis?.sla_breaches || 0, 
      severity: "high",
      action: () => navigate('/admin/helpdesk'),
      icon: Clock
    },
    { 
      title: "Active Disputes", 
      count: kpis?.active_disputes || 0, 
      severity: "medium",
      action: () => navigate('/admin/disputes'),
      icon: AlertTriangle
    },
    { 
      title: "Flagged Reviews", 
      count: kpis?.flagged_reviews || 0, 
      severity: "low",
      action: () => navigate('/admin/moderation/reviews'),
      icon: Flag
    },
  ];

  const actionQueues = [
    { 
      title: "Pending Verifications", 
      count: kpis?.pending_verifications || 0,
      action: () => navigate('/admin/verifications'),
      icon: Shield
    },
    { 
      title: "Open Tickets", 
      count: kpis?.pending_support_tickets || 0,
      action: () => navigate('/admin/helpdesk'),
      icon: Ticket
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{kpi.trend}</span>
                  <span>vs last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Risk Monitor
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskCards.map((risk) => {
              const Icon = risk.icon;
              const severityColor = 
                risk.severity === 'high' ? 'destructive' :
                risk.severity === 'medium' ? 'default' : 'secondary';
              
              return (
                <div key={risk.title} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{risk.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {risk.count} item{risk.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={severityColor}>{risk.severity}</Badge>
                    <Button size="sm" variant="outline" onClick={risk.action}>
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {riskCards.every(r => r.count === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>All systems operating normally</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Queues */}
        <Card>
          <CardHeader>
            <CardTitle>Action Queues</CardTitle>
            <CardDescription>Tasks awaiting admin review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {actionQueues.map((queue) => {
              const Icon = queue.icon;
              return (
                <div key={queue.title} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{queue.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {queue.count} pending
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={queue.action}>
                    Review
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admin Activity</CardTitle>
          <CardDescription>Latest administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity?.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start justify-between py-2 border-b last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">
                    {activity.action.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.entity_type && `${activity.entity_type}`}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
            
            {!recentActivity?.length && (
              <p className="text-center py-4 text-muted-foreground text-sm">
                No recent activity
              </p>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4" 
            onClick={() => navigate('/admin/audit')}
          >
            View All Activity
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
