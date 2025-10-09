import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReviewsQueue() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Review Moderation Queue</h1>
          <p className="text-sm text-muted-foreground">
            Moderate and manage user reviews
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Flagged Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Review moderation queue will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
