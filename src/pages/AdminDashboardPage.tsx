import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

export default function AdminDashboardPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if user or profile is missing
  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load admin dashboard</p>
          <p className="text-sm text-muted-foreground mt-2">Profile data not found</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard user={user} profile={profile} />;
}