import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import FeatureFlagsManager from "@/components/admin/FeatureFlagsManager";

export default function FeatureFlags() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground mt-2">
            Manage feature flags and platform-wide configuration
          </p>
        </div>

        <FeatureFlagsManager />
      </div>
    </AdminLayout>
  );
}
