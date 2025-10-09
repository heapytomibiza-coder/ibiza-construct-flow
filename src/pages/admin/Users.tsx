import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { UsersTable } from "@/components/admin/users/UsersTable";

export default function Users() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-2">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <UsersTable />
      </div>
    </AdminLayout>
  );
}
