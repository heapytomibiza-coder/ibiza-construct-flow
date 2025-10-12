import React from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { MobileOptimizedHeader } from '@/components/mobile/MobileOptimizedHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { BackButton } from '@/components/navigation/BackButton';

interface MobileAppWrapperProps {
  children: React.ReactNode;
}

const MobileAppWrapper = ({ children }: MobileAppWrapperProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const jobWizardEnabled = useFeature('ff.jobWizardV2', true);
  const proInboxEnabled = useFeature('ff.proInboxV1', false);
  
  // For now, assume user is available for mobile nav (will be fixed with proper auth integration)
  const user = true; // Temporary - will integrate auth properly later

  // Define routes that should have mobile navigation
  const dashboardRoutes = ['/dashboard/pro', '/dashboard/client', '/dashboard/admin', '/admin'];
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
    if (location.pathname.startsWith('/admin')) return 'Admin Console';
    if (location.pathname.startsWith('/post')) return 'Post Job';
    if (location.pathname.startsWith('/service')) return 'Service Details';
    return 'CS Ibiza';
  };

  return (
    <>
      <ErrorBoundary>        
        {showMobileHeader && (
          <MobileOptimizedHeader
            jobWizardEnabled={jobWizardEnabled}
            proInboxEnabled={proInboxEnabled}
          />
        )}
        
        <main className={showMobileNav ? 'mb-16' : undefined}>
          {/* Global back button */}
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container max-w-7xl mx-auto px-4 py-3">
              <BackButton />
            </div>
          </div>
          
          {children}
        </main>

        {showMobileNav && <MobileBottomNav />}
        
        {isMobile && <PWAInstallPrompt />}
      </ErrorBoundary>
    </>
  );
};

export default MobileAppWrapper;