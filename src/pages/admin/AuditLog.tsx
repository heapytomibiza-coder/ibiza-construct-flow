import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";

export default function AuditLog() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground mt-2">
            Track all administrative actions and changes across the platform
          </p>
        </div>

        <AuditLogViewer />
      </div>
    </AdminLayout>
  );
}
