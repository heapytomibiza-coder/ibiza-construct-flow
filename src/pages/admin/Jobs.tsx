import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { JobsTable } from "@/components/admin/jobs/JobsTable";

export default function Jobs() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground mt-2">
            Manage platform jobs and monitor activity
          </p>
        </div>

        <JobsTable />
      </div>
    </AdminLayout>
  );
}
