import React from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileOptimizedHeader } from '@/components/mobile/MobileOptimizedHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { OfflineIndicator } from '@/components/mobile/OfflineIndicator';
import { useAuth } from '@/hooks/useAuth';

interface MobileAppWrapperProps {
  children: React.ReactNode;
}

const MobileAppWrapper = ({ children }: MobileAppWrapperProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user } = useAuth();

  // Define routes that should have mobile navigation
  const dashboardRoutes = ['/dashboard/pro', '/dashboard/client', '/dashboard/admin'];
  const showMobileNav = isMobile && user && dashboardRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  // Define routes that should have mobile header
  const showMobileHeader = isMobile && (
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/post') ||
    location.pathname.startsWith('/service')
  );

  // Get page title for mobile header
  const getPageTitle = () => {
    if (location.pathname.startsWith('/dashboard/pro')) return 'Professional Dashboard';
    if (location.pathname.startsWith('/dashboard/client')) return 'Client Dashboard';
    if (location.pathname.startsWith('/dashboard/admin')) return 'Admin Dashboard';
    if (location.pathname.startsWith('/post')) return 'Post Job';
    if (location.pathname.startsWith('/service')) return 'Service Details';
    return 'CS Ibiza';
  };

  return (
    <>
      <ErrorBoundary>
        <OfflineIndicator />
        
        {showMobileHeader && (
          <MobileOptimizedHeader
            title={getPageTitle()}
            showSearch={location.pathname.includes('dashboard')}
            showNotifications={user ? true : false}
          />
        )}
        
        <main className={showMobileNav ? 'mb-16' : undefined}>
          {children}
        </main>

        {showMobileNav && <MobileBottomNav />}
        
        {isMobile && <PWAInstallPrompt />}
      </ErrorBoundary>
    </>
  );
};

export default MobileAppWrapper;