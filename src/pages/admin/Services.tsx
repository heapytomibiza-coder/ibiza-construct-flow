import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { ServicesTable } from "@/components/admin/services/ServicesTable";

export default function Services() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Service Catalog</h1>
          <p className="text-muted-foreground mt-2">
            Manage service offerings, categories, and pricing
          </p>
        </div>

        <ServicesTable />
      </div>
    </AdminLayout>
  );
}
