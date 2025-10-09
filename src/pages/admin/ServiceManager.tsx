import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import ServiceMicroManager from "@/components/admin/ServiceMicroManager";

export default function ServiceManager() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Service Manager</h1>
          <p className="text-muted-foreground mt-2">
            Manage the micro services catalog and configuration
          </p>
        </div>

        <ServiceMicroManager />
      </div>
    </AdminLayout>
  );
}
