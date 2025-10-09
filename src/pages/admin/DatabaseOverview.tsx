import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import DatabaseStats from "@/components/admin/DatabaseStats";

export default function DatabaseOverview() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Database Overview</h1>
          <p className="text-muted-foreground mt-2">
            Real-time platform statistics and database health metrics
          </p>
        </div>

        <DatabaseStats />
      </div>
    </AdminLayout>
  );
}
