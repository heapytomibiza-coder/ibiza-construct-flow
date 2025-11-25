/**
 * Professional Insights Page
 * Phase 11: Professional Tools & Insights
 */

import { ProfessionalDashboard } from '@/components/professional';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function ProfessionalInsightsPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <ProfessionalDashboard />;
}
