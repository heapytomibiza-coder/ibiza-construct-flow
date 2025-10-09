import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { TestRunner as TestRunnerComponent } from "@/components/admin/TestRunner";

export default function TestRunner() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Test Runner</h1>
          <p className="text-muted-foreground mt-2">
            Execute comprehensive tests on AI edge functions and integration flows
          </p>
        </div>

        <TestRunnerComponent />
      </div>
    </AdminLayout>
  );
}
