import { useAuth } from '@/hooks/useAuth';
import EnhancedClientDashboard from '@/components/dashboards/EnhancedClientDashboard';

export default function ClientDashboardPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <EnhancedClientDashboard user={user} profile={profile} />;
}