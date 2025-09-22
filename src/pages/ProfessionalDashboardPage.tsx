import { useAuth } from '@/hooks/useAuth';
import ProfessionalDashboard from '@/components/dashboards/ProfessionalDashboard';

export default function ProfessionalDashboardPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <ProfessionalDashboard user={user} profile={profile} />;
}