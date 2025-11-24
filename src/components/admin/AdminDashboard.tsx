import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { 
  Users, 
  Briefcase, 
  Euro, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Star,
  FileText,
  Shield,
  CheckCircle
} from 'lucide-react';
import { 
  AdminMetricCard, 
  RevenueChart, 
  SystemHealthMonitor, 
  QuickActionsPanel 
} from './dashboard';

export const AdminDashboard: React.FC = () => {
  const { stats, loading } = useAdminDashboard();

  if (loading || !stats) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Command Center</h1>
          <p className="text-muted-foreground">Real-time platform oversight and management</p>
        </div>
      </div>

      {/* Premium Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard
          title="Total Users"
          value={stats.total_users.toLocaleString()}
          subtitle="Registered accounts"
          icon={Users}
          trend={{ value: 12, label: 'vs last month', direction: 'up' }}
          gradient="from-blue-500/10 to-blue-500/5"
          onDrillDown={() => console.log('View users')}
        />
        
        <AdminMetricCard
          title="Professionals"
          value={stats.total_professionals.toLocaleString()}
          subtitle="Active service providers"
          icon={Briefcase}
          trend={{ value: 8, label: 'vs last month', direction: 'up' }}
          gradient="from-emerald-500/10 to-emerald-500/5"
          onDrillDown={() => console.log('View professionals')}
        />
        
        <AdminMetricCard
          title="Active Jobs"
          value={stats.active_jobs}
          subtitle={`${stats.total_jobs} total projects`}
          icon={FileText}
          gradient="from-purple-500/10 to-purple-500/5"
          onDrillDown={() => console.log('View jobs')}
        />
        
        <AdminMetricCard
          title="Pending Disputes"
          value={stats.pending_disputes}
          subtitle="Require immediate action"
          icon={AlertCircle}
          alert={stats.pending_disputes > 0 ? {
            level: stats.pending_disputes > 5 ? 'critical' : 'warning',
            message: `${stats.pending_disputes} disputes need resolution`
          } : undefined}
          gradient="from-rose-500/10 to-rose-500/5"
          onDrillDown={() => console.log('View disputes')}
          actionLabel="Resolve Now"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard
          title="Total Bookings"
          value={stats.total_bookings.toLocaleString()}
          subtitle="All-time bookings"
          icon={Calendar}
          gradient="from-amber-500/10 to-amber-500/5"
        />
        
        <AdminMetricCard
          title="Reviews"
          value={stats.total_reviews.toLocaleString()}
          subtitle="Platform feedback"
          icon={Star}
          gradient="from-yellow-500/10 to-yellow-500/5"
        />
        
        <AdminMetricCard
          title="Total Revenue"
          value={`€${(stats.total_revenue / 100).toLocaleString()}`}
          subtitle="Platform earnings"
          icon={Euro}
          trend={{ value: 15, label: 'vs last month', direction: 'up' }}
          gradient="from-emerald-500/10 to-emerald-500/5"
        />
        
        <AdminMetricCard
          title="Pending Payments"
          value={`€${(stats.pending_payments / 100).toLocaleString()}`}
          subtitle="Awaiting processing"
          icon={TrendingUp}
          gradient="from-blue-500/10 to-blue-500/5"
          onDrillDown={() => console.log('View payments')}
        />
      </div>

      {/* Analytics & System Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart 
          totalRevenue={stats.total_revenue / 100}
          growth={15}
        />
        
        <SystemHealthMonitor />
      </div>

      {/* Quick Actions */}
      <QuickActionsPanel />
    </div>
  );
};
