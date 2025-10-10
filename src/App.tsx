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
import { ImpersonationBanner } from "./components/admin/ImpersonationBanner";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

// Lazy load components for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const UnifiedAuth = React.lazy(() => import("./pages/UnifiedAuth"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const AuthCallback = React.lazy(() => import("./pages/AuthCallback"));
const QuickStart = React.lazy(() => import("./pages/QuickStart"));
const RoleSwitcher = React.lazy(() => import("./pages/RoleSwitcher"));
const RouteGuard = React.lazy(() => import("./components/RouteGuard"));
const UnifiedClientDashboard = React.lazy(() => import("./components/dashboards/UnifiedClientDashboard"));
const UnifiedProfessionalDashboard = React.lazy(() => import("./components/dashboards/UnifiedProfessionalDashboard"));
const AdminDashboardPage = React.lazy(() => import("./pages/AdminDashboardPage"));
const AdminHome = React.lazy(() => import("./pages/admin/AdminHome"));
const Analytics = React.lazy(() => import("./pages/admin/Analytics"));
const ProfilesQueue = React.lazy(() => import("./pages/admin/ProfilesQueue"));
const JobsQueue = React.lazy(() => import("./pages/admin/JobsQueue"));
const ReviewsQueue = React.lazy(() => import("./pages/admin/ReviewsQueue"));
const DisputesQueue = React.lazy(() => import("./pages/admin/DisputesQueue"));
const ServicesPage = React.lazy(() => import("./pages/admin/ServicesPage"));
const HealthMonitor = React.lazy(() => import("./pages/admin/HealthMonitor"));
const AdminSettingsPage = React.lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminQuestions = React.lazy(() => import("./pages/AdminQuestions"));
const PackCompareView = React.lazy(() => import("./components/admin/packs/PackCompareView").then(m => ({ default: m.PackCompareView })));
const WebsiteSettings = React.lazy(() => import("./pages/admin/WebsiteSettings"));
const PostJob = React.lazy(() => import("./pages/PostJob"));
const JobBoardPage = React.lazy(() => import("./pages/JobBoardPage"));
const PostJobSuccessPage = React.lazy(() => import("./pages/PostJobSuccessPage"));
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
const DesignTest = React.lazy(() => import("./pages/DesignTest"));
const MessagesPage = React.lazy(() => import("./pages/MessagesPage"));
const ConversationPage = React.lazy(() => import("./pages/ConversationPage"));
const JobDetailPage = React.lazy(() => import("./pages/JobDetailPage"));
const PaymentsPage = React.lazy(() => import("./pages/PaymentsPage"));
const ProfessionalVerificationPage = React.lazy(() => import("./pages/ProfessionalVerificationPage"));
const ProfessionalServicesPage = React.lazy(() => import("./pages/ProfessionalServicesPage"));
const ProfessionalPortfolioPage = React.lazy(() => import("./pages/ProfessionalPortfolioPage"));
const AdminVerificationsPage = React.lazy(() => import("./pages/AdminVerificationsPage"));
const DisputeAnalyticsPage = React.lazy(() => import("./pages/admin/DisputeAnalyticsPage"));
const AdminDisputeDetailPage = React.lazy(() => import("./pages/admin/AdminDisputeDetailPage"));
const AuditLog = React.lazy(() => import("./pages/admin/AuditLog"));
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = React.lazy(() => import("./pages/admin/Users"));
const AdminSettings = React.lazy(() => import("./pages/admin/Settings"));
const AdminServices = React.lazy(() => import("./pages/admin/Services"));
const AdminJobs = React.lazy(() => import("./pages/admin/Jobs"));
const AdminBookings = React.lazy(() => import("./pages/admin/Bookings"));
const AdminDatabaseOverview = React.lazy(() => import("./pages/admin/DatabaseOverview"));
const AdminUserInspector = React.lazy(() => import("./pages/admin/UserInspector"));
const AdminServiceManager = React.lazy(() => import("./pages/admin/ServiceManager"));
const AdminDocumentReview = React.lazy(() => import("./pages/admin/DocumentReview"));
const AdminFeatureFlags = React.lazy(() => import("./pages/admin/FeatureFlags"));
const AdminTestRunner = React.lazy(() => import("./pages/admin/TestRunner"));
const AdminProfileModeration = React.lazy(() => import("./pages/admin/ProfileModeration"));
const QuestionsManager = React.lazy(() => import("./pages/admin/QuestionsManager"));
const AdminHelpdeskPage = React.lazy(() => import("./pages/admin/AdminHelpdeskPage"));
const AdminHelpdeskDetailPage = React.lazy(() => import("./pages/admin/AdminHelpdeskDetailPage"));
const AdminReviewModerationPage = React.lazy(() => import("./pages/admin/AdminReviewModerationPage"));
const AdminReportsPage = React.lazy(() => import("./pages/admin/AdminReportsPage"));
const AdminOverviewPage = React.lazy(() => import("./pages/admin/AdminOverviewPage"));
const SecuritySettingsPage = React.lazy(() => import("./pages/admin/SecuritySettingsPage"));
const IntelligencePage = React.lazy(() => import("./pages/admin/IntelligencePage"));
const IntegrationHubPage = React.lazy(() => import("./pages/admin/IntegrationHubPage"));
const PerformanceMonitorPage = React.lazy(() => import("./pages/admin/PerformanceMonitorPage"));
const Calculator = React.lazy(() => import("./pages/Calculator"));
const CalculatorSettings = React.lazy(() => import("./pages/admin/CalculatorSettings"));

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
              <ImpersonationBanner />
              <OfflineIndicator />
              <MobileAppWrapper>
                <Suspense fallback={<SkeletonLoader variant="card" />}>
                  <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/professional/:id" element={<ProfessionalProfile />} />
          <Route path="/professionals/:id" element={<ProfessionalProfile />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/specialist-categories" element={<SpecialistCategories />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth Flow Routes - Consolidated */}
          <Route path="/auth" element={<UnifiedAuth />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/quick-start" element={<QuickStart />} />
          
          {/* Professional Onboarding - No completion requirement here */}
          <Route path="/onboarding/professional" element={
            <RouteGuard requiredRole="professional" requireOnboardingComplete={false}>
              <ProfessionalOnboardingPage />
            </RouteGuard>
          } />
          
          {/* Professional Management Pages */}
          <Route path="/professional/verification" element={
            <RouteGuard requiredRole="professional">
              <ProfessionalVerificationPage />
            </RouteGuard>
          } />
          <Route path="/professional/services" element={
            <RouteGuard requiredRole="professional">
              <ProfessionalServicesPage />
            </RouteGuard>
          } />
          <Route path="/professional/portfolio" element={
            <RouteGuard requiredRole="professional">
              <ProfessionalPortfolioPage />
            </RouteGuard>
          } />
          
          {/* Role Switcher */}
          <Route path="/role-switcher" element={<RoleSwitcher />} />
          
          {/* Payment Pages */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-canceled" element={<PaymentCanceled />} />
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />
          <Route path="/subscription-canceled" element={<SubscriptionCanceled />} />
          
          {/* Job Wizard - Always Registered */}
            <Route 
              path="/post" 
              element={
                <RouteGuard requiredRole="client">
                  <Suspense fallback={<SkeletonLoader variant="card" count={3} />}>
                    <PostJob />
                  </Suspense>
                </RouteGuard>
              } 
            />
        
        {/* Templates Page */}
        <Route path="/templates" element={
          <RouteGuard requiredRole="client">
            <Templates />
          </RouteGuard>
        } />
        
        {/* Job Board - All professionals can see all jobs */}
        <Route path="/job-board" element={
          <RouteGuard requiredRole="professional">
            <JobBoardPage />
          </RouteGuard>
        } />
        
        {/* Post Job Success Page */}
        <Route path="/post/success" element={
          <RouteGuard requiredRole="client">
            <PostJobSuccessPage />
          </RouteGuard>
        } />
        
        {/* Messages Routes */}
        <Route path="/messages" element={
          <RouteGuard>
            <MessagesPage />
          </RouteGuard>
        } />
        <Route path="/messages/:conversationId" element={
          <RouteGuard>
            <ConversationPage />
          </RouteGuard>
        } />
        
        {/* Job Detail Page */}
        <Route path="/job/:id" element={
          <RouteGuard requiredRole="client">
            <JobDetailPage />
          </RouteGuard>
        } />
        
        {/* Payments Page */}
        <Route path="/payments" element={
          <RouteGuard>
            <PaymentsPage />
          </RouteGuard>
        } />
        
        {/* Color Preview Page */}
        <Route path="/color-preview" element={<ColorPreview />} />
        
        {/* Design Test Page */}
        <Route path="/test" element={<DesignTest />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <RouteGuard>
            <Dashboard />
          </RouteGuard>
        } />
        <Route path="/dashboard/client" element={
          <RouteGuard requiredRole="client">
            <UnifiedClientDashboard />
          </RouteGuard>
        } />
        <Route path="/dashboard/pro" element={
          <RouteGuard requiredRole="professional" requireOnboardingComplete>
            <UnifiedProfessionalDashboard />
          </RouteGuard>
        } />
          <Route path="/dashboard/admin" element={
            <RouteGuard requiredRole="admin">
              <AdminDashboardPage />
            </RouteGuard>
          } />
          <Route path="/admin" element={
            <RouteGuard requiredRole="admin">
              <AdminDashboard />
            </RouteGuard>
          } />
          <Route path="/admin/home" element={
            <RouteGuard requiredRole="admin">
              <AdminHome />
            </RouteGuard>
          } />
          <Route path="/admin/analytics" element={
            <RouteGuard requiredRole="admin">
              <Analytics />
            </RouteGuard>
          } />
          <Route path="/admin/users" element={
            <RouteGuard requiredRole="admin">
              <AdminUsers />
            </RouteGuard>
          } />
          <Route path="/admin/profiles" element={
            <RouteGuard requiredRole="admin">
              <ProfilesQueue />
            </RouteGuard>
          } />
          <Route path="/admin/jobs" element={
            <RouteGuard requiredRole="admin">
              <AdminJobs />
            </RouteGuard>
          } />
          <Route path="/admin/reviews" element={
            <RouteGuard requiredRole="admin">
              <ReviewsQueue />
            </RouteGuard>
          } />
          <Route path="/admin/disputes" element={
            <RouteGuard requiredRole="admin">
              <DisputesQueue />
            </RouteGuard>
          } />
          <Route path="/admin/services" element={
            <RouteGuard requiredRole="admin">
              <AdminServices />
            </RouteGuard>
          } />
          <Route path="/admin/health" element={
            <RouteGuard requiredRole="admin">
              <HealthMonitor />
            </RouteGuard>
          } />
          <Route path="/admin/settings" element={
            <RouteGuard requiredRole="admin">
              <AdminSettingsPage />
            </RouteGuard>
          } />
          <Route path="/admin/bookings" element={
            <RouteGuard requiredRole="admin">
              <AdminBookings />
            </RouteGuard>
          } />
          <Route path="/admin/database" element={
            <RouteGuard requiredRole="admin">
              <AdminDatabaseOverview />
            </RouteGuard>
          } />
          <Route path="/admin/user-inspector" element={
            <RouteGuard requiredRole="admin">
              <AdminUserInspector />
            </RouteGuard>
          } />
          <Route path="/admin/service-manager" element={
            <RouteGuard requiredRole="admin">
              <AdminServiceManager />
            </RouteGuard>
          } />
          <Route path="/admin/documents" element={
            <RouteGuard requiredRole="admin">
              <AdminDocumentReview />
            </RouteGuard>
          } />
          <Route path="/admin/feature-flags" element={
            <RouteGuard requiredRole="admin">
              <AdminFeatureFlags />
            </RouteGuard>
          } />
          <Route path="/admin/test-runner" element={
            <RouteGuard requiredRole="admin">
              <AdminTestRunner />
            </RouteGuard>
          } />
          <Route path="/admin/profile-moderation" element={
            <RouteGuard requiredRole="admin">
              <AdminProfileModeration />
            </RouteGuard>
          } />
          <Route path="/admin/questions" element={
            <RouteGuard requiredRole="admin">
              <QuestionsManager />
            </RouteGuard>
          } />
          <Route path="/admin-questions" element={
            <RouteGuard requiredRole="admin">
              <AdminQuestions />
            </RouteGuard>
          } />
          <Route path="/admin/questions/compare/:slug" element={
            <RouteGuard requiredRole="admin">
              <PackCompareView />
            </RouteGuard>
          } />
          <Route path="/admin/website-settings" element={
            <RouteGuard requiredRole="admin">
              <WebsiteSettings />
            </RouteGuard>
          } />
          <Route path="/admin/verifications" element={
            <RouteGuard requiredRole="admin">
              <AdminVerificationsPage />
            </RouteGuard>
          } />
          <Route path="/admin/analytics/disputes" element={
            <RouteGuard requiredRole="admin">
              <DisputeAnalyticsPage />
            </RouteGuard>
          } />
          <Route path="/admin/disputes/:id" element={
            <RouteGuard requiredRole="admin">
              <AdminDisputeDetailPage />
            </RouteGuard>
          } />
          <Route path="/admin/settings" element={
            <RouteGuard requiredRole="admin">
              <AdminSettings />
            </RouteGuard>
          } />
          <Route path="/admin/audit-log" element={
            <RouteGuard requiredRole="admin">
              <AuditLog />
            </RouteGuard>
          } />
          <Route path="/admin/helpdesk" element={
            <RouteGuard requiredRole="admin">
              <AdminHelpdeskPage />
            </RouteGuard>
          } />
          <Route path="/admin/helpdesk/:ticketId" element={
            <RouteGuard requiredRole="admin">
              <AdminHelpdeskDetailPage />
            </RouteGuard>
          } />
          <Route path="/admin/moderation/reviews" element={
            <RouteGuard requiredRole="admin">
              <AdminReviewModerationPage />
            </RouteGuard>
          } />
          <Route path="/admin/reports" element={
            <RouteGuard requiredRole="admin">
              <AdminReportsPage />
            </RouteGuard>
          } />
          <Route path="/admin/overview" element={
            <RouteGuard requiredRole="admin">
              <AdminOverviewPage />
            </RouteGuard>
          } />
          <Route path="/admin/security" element={
            <RouteGuard requiredRole="admin">
              <SecuritySettingsPage />
            </RouteGuard>
          } />
          <Route path="/admin/intelligence" element={
            <RouteGuard requiredRole="admin">
              <IntelligencePage />
            </RouteGuard>
          } />
          <Route path="/admin/integrations" element={
            <RouteGuard requiredRole="admin">
              <IntegrationHubPage />
            </RouteGuard>
          } />
          <Route path="/admin/performance" element={
            <RouteGuard requiredRole="admin">
              <PerformanceMonitorPage />
            </RouteGuard>
          } />
          <Route path="/admin/calculator" element={
            <RouteGuard requiredRole="admin">
              <CalculatorSettings />
            </RouteGuard>
          } />
          
          {/* Settings Routes - Role-Aware */}
          <Route path="/settings" element={
            <RouteGuard>
              <SettingsLayout />
            </RouteGuard>
          }>
            <Route index element={<Navigate to="/settings/profile" replace />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="client" element={
              <RouteGuard requiredRole="client">
                <ClientSettings />
              </RouteGuard>
            } />
            <Route path="professional" element={
              <RouteGuard requiredRole="professional">
                <ProfessionalSettings />
              </RouteGuard>
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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </HelmetProvider>
  );
}
