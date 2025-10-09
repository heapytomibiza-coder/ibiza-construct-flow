import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { DashboardStats } from "@/components/admin/dashboard/DashboardStats";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { SystemHealth } from "@/components/admin/dashboard/SystemHealth";

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Platform overview and key metrics
          </p>
        </div>

        <DashboardStats />
        
        <div className="grid gap-6 md:grid-cols-2">
          <SystemHealth />
          <QuickActions />
        </div>

        <RecentActivity />
      </div>
    </AdminLayout>
  );
}
