import React, { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SafeAreaProvider } from "@/components/mobile/SafeAreaProvider";
import { MobileGestures } from "@/components/mobile/MobileGestures";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useWebVitals } from "@/hooks/useWebVitals";
import { useLanguage } from "@/hooks/useLanguage";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import MobileAppWrapper from "./components/app/MobileAppWrapper";
import { SkeletonLoader } from "./components/loading/SkeletonLoader";
import { useFeature } from "./contexts/FeatureFlagsContext";
import { BundleAnalyzer, preloadRoute } from "./components/performance/BundleOptimizer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initRealtime } from "./lib/realtimeSync";

const queryClient = new QueryClient();

// Lazy load components for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const UnifiedAuth = React.lazy(() => import("./pages/UnifiedAuth"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));
const AuthCallback = React.lazy(() => import("./pages/AuthCallback"));
const QuickStart = React.lazy(() => import("./pages/QuickStart"));
const RoleSwitcher = React.lazy(() => import("./pages/RoleSwitcher"));
const RouteGuard = React.lazy(() => import("./components/RouteGuard"));
const UnifiedClientDashboard = React.lazy(() => import("./components/dashboards/UnifiedClientDashboard"));
const UnifiedProfessionalDashboard = React.lazy(() => import("./components/dashboards/UnifiedProfessionalDashboard"));
const AdminDashboardPage = React.lazy(() => import("./pages/AdminDashboardPage"));
const AdminQuestions = React.lazy(() => import("./pages/AdminQuestions"));
const PackCompareView = React.lazy(() => import("./components/admin/packs/PackCompareView").then(m => ({ default: m.PackCompareView })));
const WebsiteSettings = React.lazy(() => import("./pages/admin/WebsiteSettings"));
const PostJob = React.lazy(() => import("./pages/PostJob"));
const Discovery = React.lazy(() => import("./pages/Discovery"));
const ProfessionalProfile = React.lazy(() => import("./pages/ProfessionalProfile"));
const ProfessionalOnboardingPage = React.lazy(() => import("./pages/ProfessionalOnboardingPage"));
const BookingPage = React.lazy(() => import("./pages/BookingPage"));
const HowItWorks = React.lazy(() => import("./pages/HowItWorks"));
const Contact = React.lazy(() => import("./pages/Contact"));
const SpecialistCategories = React.lazy(() => import("./pages/SpecialistCategories"));
const PaymentSuccess = React.lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = React.lazy(() => import("./pages/PaymentCanceled"));
const SubscriptionSuccess = React.lazy(() => import("./pages/SubscriptionSuccess"));
const SubscriptionCanceled = React.lazy(() => import("./pages/SubscriptionCanceled"));
const Templates = React.lazy(() => import("./pages/Templates"));
const ColorPreview = React.lazy(() => import("./pages/ColorPreview"));

// Settings Pages
const SettingsLayout = React.lazy(() => import("./pages/settings/SettingsLayout"));
const ProfileSettings = React.lazy(() => import("./pages/settings/ProfileSettings"));
const AccountSettings = React.lazy(() => import("./pages/settings/AccountSettings"));
const NotificationSettings = React.lazy(() => import("./pages/settings/NotificationSettings"));
const ClientSettings = React.lazy(() => import("./pages/settings/ClientSettings"));
const ProfessionalSettings = React.lazy(() => import("./pages/settings/ProfessionalSettings"));

function AppContent() {
  // Initialize Web Vitals monitoring
  useWebVitals();
  
  // Initialize language management for SEO
  useLanguage();
  
  // Enable auth for production (set to false to enforce authentication)
  const DISABLE_AUTH_FOR_WIREFRAME = false;
  
  // Enable job wizard for implementation
  const jobWizardEnabled = useFeature('ff.jobWizardV2', true);
  
  // Preload critical routes and initialize realtime on app start
  useEffect(() => {
    preloadRoute('/dashboard/pro');
    preloadRoute('/post');
    
    // Initialize realtime sync for cross-tab updates
    const cleanup = initRealtime(queryClient);
    return cleanup;
  }, []);
  
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <SafeAreaProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
            <MobileGestures enableSwipeNavigation={true} enablePullToRefresh={true}>
              <OfflineIndicator />
              <MobileAppWrapper>
                <Suspense fallback={<SkeletonLoader variant="card" />}>
                  <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/professional/:id" element={<ProfessionalProfile />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/specialist-categories" element={<SpecialistCategories />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth Flow Routes */}
          <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />
          <Route path="/auth/role-select" element={<Navigate to="/auth?tab=signup" replace />} />
          <Route path="/auth/sign-up" element={<Navigate to="/auth?tab=signup" replace />} />
          <Route path="/auth/sign-in" element={<Navigate to="/auth?tab=signin" replace />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/quick-start" element={<QuickStart />} />
          
          {/* Professional Onboarding */}
          <Route path="/onboarding/professional" element={
            <RouteGuard requiredRole="professional">
              <ProfessionalOnboardingPage />
            </RouteGuard>
          } />
          
          {/* Role Switcher */}
          <Route path="/role-switcher" element={<RoleSwitcher />} />
          
          {/* Payment Pages */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-canceled" element={<PaymentCanceled />} />
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />
          <Route path="/subscription-canceled" element={<SubscriptionCanceled />} />
          
          {/* Job Wizard - Feature Flagged */}
          {jobWizardEnabled && (
            <Route path="/post" element={
              DISABLE_AUTH_FOR_WIREFRAME ? (
              <PostJob />
            ) : (
              <RouteGuard requiredRole="client">
                <PostJob />
              </RouteGuard>
            )
          } />
        )}
        
        {/* Templates Page */}
        <Route path="/templates" element={
          DISABLE_AUTH_FOR_WIREFRAME ? (
            <Templates />
          ) : (
            <RouteGuard requiredRole="client">
              <Templates />
            </RouteGuard>
          )
        } />
        
        {/* Color Preview Page */}
        <Route path="/color-preview" element={<ColorPreview />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          DISABLE_AUTH_FOR_WIREFRAME ? (
            <Dashboard />
          ) : (
            <RouteGuard>
              <Dashboard />
            </RouteGuard>
          )
        } />
        <Route path="/dashboard/client" element={
          DISABLE_AUTH_FOR_WIREFRAME ? (
            <UnifiedClientDashboard />
          ) : (
            <RouteGuard requiredRole="client">
              <UnifiedClientDashboard />
            </RouteGuard>
          )
        } />
        <Route path="/dashboard/pro" element={
          DISABLE_AUTH_FOR_WIREFRAME ? (
            <UnifiedProfessionalDashboard />
          ) : (
            <RouteGuard requiredRole="professional">
              <UnifiedProfessionalDashboard />
            </RouteGuard>
          )
        } />
          <Route path="/dashboard/admin" element={
            DISABLE_AUTH_FOR_WIREFRAME ? (
              <AdminDashboardPage />
            ) : (
              <RouteGuard requiredRole="admin">
                <AdminDashboardPage />
              </RouteGuard>
            )
          } />
          <Route path="/admin/questions" element={
            DISABLE_AUTH_FOR_WIREFRAME ? (
              <AdminQuestions />
            ) : (
              <RouteGuard requiredRole="admin">
                <AdminQuestions />
              </RouteGuard>
            )
          } />
          <Route path="/admin/questions/compare/:slug" element={
            DISABLE_AUTH_FOR_WIREFRAME ? (
              <PackCompareView />
            ) : (
              <RouteGuard requiredRole="admin">
                <PackCompareView />
              </RouteGuard>
            )
          } />
          <Route path="/admin/website-settings" element={
            DISABLE_AUTH_FOR_WIREFRAME ? (
              <WebsiteSettings />
            ) : (
              <RouteGuard requiredRole="admin">
                <WebsiteSettings />
              </RouteGuard>
            )
          } />
          
          {/* Settings Routes - Role-Aware */}
          <Route path="/settings" element={
            DISABLE_AUTH_FOR_WIREFRAME ? (
              <SettingsLayout />
            ) : (
              <RouteGuard>
                <SettingsLayout />
              </RouteGuard>
            )
          }>
            <Route index element={<Navigate to="/settings/profile" replace />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="client" element={
              DISABLE_AUTH_FOR_WIREFRAME ? (
                <ClientSettings />
              ) : (
                <RouteGuard requiredRole="client">
                  <ClientSettings />
                </RouteGuard>
              )
            } />
            <Route path="professional" element={
              DISABLE_AUTH_FOR_WIREFRAME ? (
                <ProfessionalSettings />
              ) : (
                <RouteGuard requiredRole="professional">
                  <ProfessionalSettings />
                </RouteGuard>
              )
            } />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </MobileAppWrapper>
            </MobileGestures>
            <BundleAnalyzer />
          </BrowserRouter>
        </SafeAreaProvider>
      </TooltipProvider>
      </ErrorBoundary>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
