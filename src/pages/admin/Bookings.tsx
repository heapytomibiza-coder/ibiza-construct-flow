import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { BookingsTable } from "@/components/admin/bookings/BookingsTable";

export default function Bookings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground mt-2">
            Manage platform bookings and monitor activity
          </p>
        </div>

        <BookingsTable />
      </div>
    </AdminLayout>
  );
}
