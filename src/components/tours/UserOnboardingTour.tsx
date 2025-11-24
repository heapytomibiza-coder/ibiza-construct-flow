import { useEffect } from 'react';
import { useTour } from '@/components/common/Tour';
import { useAuth } from '@/hooks/useAuth';

/**
 * User Onboarding Tour
 * Automatically shows new users how to access their profile and dashboard
 */
export function UserOnboardingTour() {
  const { user } = useAuth();

  const tourSteps = [
    {
      target: '[data-tour="user-profile"]',
      title: 'Your Profile Menu',
      content: 'Click here to access your profile, settings, and account options. This is your central hub for managing your account.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="dashboard-menu"]',
      title: 'Access Your Dashboard',
      content: 'Your dashboard is where you can manage your projects, bookings, messages, and all your activity on the platform.',
      position: 'left' as const,
    },
  ];

  const { isActive, TourComponent } = useTour(
    `user_onboarding_${user?.id || 'guest'}`, 
    tourSteps
  );

  // Only show tour for authenticated users
  if (!user) return null;

  return <TourComponent />;
}
