import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { AdminDocumentReview } from "@/components/admin/AdminDocumentReview";

export default function DocumentReview() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Document Review</h1>
          <p className="text-muted-foreground mt-2">
            Review and verify professional documents and certifications
          </p>
        </div>

        <AdminDocumentReview />
      </div>
    </AdminLayout>
  );
}
