import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DisputesQueue() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Disputes</h1>
          <p className="text-sm text-muted-foreground">
            Manage dispute resolution timeline
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Dispute management will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
