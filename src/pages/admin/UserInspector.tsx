import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import UserInspectorComponent from "@/components/admin/UserInspector";

export default function UserInspectorPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Inspector</h1>
          <p className="text-muted-foreground mt-2">
            Search, inspect, and manage user profiles and permissions
          </p>
        </div>

        <UserInspectorComponent />
      </div>
    </AdminLayout>
  );
}
