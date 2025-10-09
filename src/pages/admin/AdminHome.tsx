import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { KpiSummary } from '@/components/admin/home/KpiSummary';
import { RiskMonitor } from '@/components/admin/home/RiskMonitor';
import { ActionQueues } from '@/components/admin/home/ActionQueues';
import { SystemHealthPanel } from '@/components/admin/home/SystemHealthPanel';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export default function AdminHome() {
  const navigate = useNavigate();

  // Keyboard shortcuts for quick navigation
  useKeyboardShortcut([
    { key: 'p', ctrl: true, callback: () => navigate('/admin/profiles') },
    { key: 'j', ctrl: true, callback: () => navigate('/admin/jobs') },
    { key: 's', ctrl: true, callback: () => navigate('/admin/settings') },
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Platform overview and action center · Press Ctrl+P for profiles, Ctrl+J for jobs
          </p>
        </div>

        <KpiSummary />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskMonitor />
          <ActionQueues />
        </div>

        <SystemHealthPanel />
      </div>
    </AdminLayout>
  );
}
