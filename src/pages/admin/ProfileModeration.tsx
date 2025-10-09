import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import ProfileModerationQueue from "@/components/admin/ProfileModerationQueue";

export default function ProfileModeration() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Moderation</h1>
          <p className="text-muted-foreground mt-2">
            Review and moderate pending profile verifications
          </p>
        </div>

        <ProfileModerationQueue />
      </div>
    </AdminLayout>
  );
}
