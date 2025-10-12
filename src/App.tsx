import React, { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { SafeAreaProvider } from "@/components/mobile/SafeAreaProvider";
import { MobileGestures } from "@/components/mobile/MobileGestures";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { SkipToContent } from "@/components/accessibility/SkipToContent";
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
import { CookieConsent } from "./components/layout/CookieConsent";

const queryClient = new QueryClient();

// Shared route fallback component
const RouteFallback = () => <SkeletonLoader variant="card" count={3} />;

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

// Admin Pages
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
const AdminVerificationsPage = React.lazy(() => import("./pages/AdminVerificationsPage"));
const DisputeAnalyticsPage = React.lazy(() => import("./pages/admin/DisputeAnalyticsPage"));
const AdminDisputeDetailPage = React.lazy(() => import("./pages/admin/AdminDisputeDetailPage"));
const AuditLog = React.lazy(() => import("./pages/admin/AuditLog"));
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = React.lazy(() => import("./pages/admin/Users"));
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
const CalculatorSettings = React.lazy(() => import("./pages/admin/CalculatorSettings"));
const PricingManager = React.lazy(() => import("./pages/admin/PricingManager"));
const CalculatorAnalytics = React.lazy(() => import("./pages/admin/CalculatorAnalytics"));

// Job & Professional Pages
const PostJob = React.lazy(() => import("./pages/PostJob"));
const JobBoardPage = React.lazy(() => import("./pages/JobBoardPage"));
const PostJobSuccessPage = React.lazy(() => import("./pages/PostJobSuccessPage"));
const Discovery = React.lazy(() => import("./pages/Discovery"));
const BrowseProfessionalsPage = React.lazy(() => import("./pages/BrowseProfessionalsPage"));
const ProfessionalProfile = React.lazy(() => import("./pages/ProfessionalProfile"));
const ProfessionalOnboardingPage = React.lazy(() => import("./pages/ProfessionalOnboardingPage"));
const ProfessionalVerificationPage = React.lazy(() => import("./pages/ProfessionalVerificationPage"));
const ProfessionalServicesPage = React.lazy(() => import("./pages/ProfessionalServicesPage"));
const ProfessionalPortfolioPage = React.lazy(() => import("./pages/ProfessionalPortfolioPage"));
const ProfessionalAvailabilityPage = React.lazy(() => import("./pages/ProfessionalAvailabilityPage"));
const ProfessionalCalendarPage = React.lazy(() => import("./pages/ProfessionalCalendarPage"));
const ProfessionalEarningsPage = React.lazy(() => import("./pages/ProfessionalEarningsPage"));
const ServiceSetupWizard = React.lazy(() => import("./pages/ServiceSetupWizard"));
const ProfessionalPayoutSetup = React.lazy(() => import("./pages/ProfessionalPayoutSetup"));

// Contract & Payment Pages
const BookingPage = React.lazy(() => import("./pages/BookingPage"));
const ContractManagementPage = React.lazy(() => import("./pages/ContractManagementPage"));
const PaymentProcessingPage = React.lazy(() => import("./pages/PaymentProcessingPage"));
const EscrowManagementPage = React.lazy(() => import("./pages/EscrowManagementPage"));
const JobDetailPage = React.lazy(() => import("./pages/JobDetailPage"));
const JobMatchesPage = React.lazy(() => import("./pages/JobMatchesPage"));
const PaymentSuccess = React.lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = React.lazy(() => import("./pages/PaymentCanceled"));
const SubscriptionSuccess = React.lazy(() => import("./pages/SubscriptionSuccess"));
const SubscriptionCanceled = React.lazy(() => import("./pages/SubscriptionCanceled"));
const PaymentsPage = React.lazy(() => import("./pages/PaymentsPage"));

// Messaging
const MessagingPage = React.lazy(() => import("./pages/MessagingPage"));
const MessagesPage = React.lazy(() => import("./pages/MessagesPage"));
const ConversationPage = React.lazy(() => import("./pages/ConversationPage"));

// Public Pages
const HowItWorks = React.lazy(() => import("./pages/HowItWorks"));
const Contact = React.lazy(() => import("./pages/Contact"));
const SpecialistCategories = React.lazy(() => import("./pages/SpecialistCategories"));
const Calculator = React.lazy(() => import("./pages/Calculator"));

// Other Pages
const Templates = React.lazy(() => import("./pages/Templates"));
const ColorPreview = React.lazy(() => import("./pages/ColorPreview"));
const DesignTest = React.lazy(() => import("./pages/DesignTest"));

// Legal Pages
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy"));

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
  
  // Feature flag for job wizard control
  const jobWizardEnabled = useFeature('ff.jobWizardV2', true);
  
  // Preload critical routes and initialize realtime on app start
  useEffect(() => {
    // Preload common routes
    preloadRoute('/dashboard/pro');
    preloadRoute('/dashboard/client');
    preloadRoute('/post');
    preloadRoute('/job-board');
    preloadRoute('/discovery');
    
    // Initialize realtime sync for cross-tab updates
    const cleanup = initRealtime(queryClient);
    return cleanup;
  }, []);
  
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <SafeAreaProvider>
          {/* Radix Toaster: For imperative useToast() hook calls */}
          <Toaster />
          {/* Sonner: For declarative toast() function calls */}
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <CookieConsent />
            <MobileGestures enableSwipeNavigation={true} enablePullToRefresh={true}>
              <ImpersonationBanner />
              <SkipToContent />
              <OfflineIndicator />
              <InstallPrompt />
              <MobileAppWrapper>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/calculator" element={<Calculator />} />
                    <Route path="/discovery" element={<Discovery />} />
                    <Route path="/professionals" element={<BrowseProfessionalsPage />} />
                    <Route path="/book" element={<BookingPage />} />
                    <Route path="/specialist-categories" element={<SpecialistCategories />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/contact" element={<Contact />} />
                    
                    {/* Professional Profile Routes - Canonical */}
                    <Route path="/professionals/:id" element={<ProfessionalProfile />} />
                    {/* Legacy redirect for /professional/:id */}
                    <Route path="/professional/:id" element={<Navigate to="/professionals/:id" replace />} />
                    
                    {/* Legacy route redirects */}
                    <Route path="/job/:id" element={<Navigate to="/jobs/:id" replace />} />
                    <Route path="/admin/v2/*" element={<Navigate to="/admin/*" replace />} />
                    <Route path="/bookings" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Legal Pages */}
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/cookie-policy" element={<CookiePolicy />} />
                    
                    {/* Auth Flow Routes */}
                    <Route path="/auth" element={<UnifiedAuth />} />
                    <Route path="/auth/verify-email" element={<VerifyEmail />} />
                    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/auth/quick-start" element={<QuickStart />} />
                    
                    {/* Professional Onboarding - No completion requirement */}
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
                    <Route path="/professional/service-setup" element={
                      <RouteGuard requiredRole="professional">
                        <ServiceSetupWizard />
                      </RouteGuard>
                    } />
                    <Route path="/professional/payout-setup" element={
                      <RouteGuard requiredRole="professional">
                        <ProfessionalPayoutSetup />
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
                    
                    {/* Job Posting - Gated by Feature Flag */}
                    {jobWizardEnabled ? (
                      <Route 
                        path="/post" 
                        element={
                          <RouteGuard requiredRole="client">
                            <Suspense fallback={<RouteFallback />}>
                              <PostJob />
                            </Suspense>
                          </RouteGuard>
                        } 
                      />
                    ) : (
                      <Route path="/post" element={<Navigate to="/dashboard/client" replace />} />
                    )}
                    
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
                    
                    {/* Messaging Routes */}
                    <Route path="/messaging" element={<MessagingPage />} />
                    <Route path="/messaging/:conversationId" element={<MessagingPage />} />
                    
                    {/* Job & Contract Routes */}
                    <Route path="/jobs/:jobId" element={<JobDetailPage />} />
                    <Route path="/jobs/:jobId/matches" element={<JobMatchesPage />} />
                    <Route path="/contracts" element={<ContractManagementPage />} />
                    <Route path="/contracts/:contractId" element={<ContractManagementPage />} />
                    <Route path="/contracts/:contractId/fund" element={<PaymentProcessingPage />} />
                    <Route path="/escrow/:contractId" element={<EscrowManagementPage />} />
                    
                    {/* Professional Routes */}
                    <Route path="/availability" element={<ProfessionalAvailabilityPage />} />
                    <Route path="/calendar" element={<ProfessionalCalendarPage />} />
                    <Route path="/earnings" element={<ProfessionalEarningsPage />} />
                    
                    {/* Payments Page */}
                    <Route path="/payments" element={
                      <RouteGuard>
                        <PaymentsPage />
                      </RouteGuard>
                    } />
                    
                    {/* Test Pages */}
                    <Route path="/color-preview" element={<ColorPreview />} />
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
                      <RouteGuard requiredRole="professional">
                        <UnifiedProfessionalDashboard />
                      </RouteGuard>
                    } />
                    <Route path="/dashboard/admin" element={
                      <RouteGuard requiredRole="admin">
                        <AdminDashboardPage />
                      </RouteGuard>
                    } />
                    
                    {/* Admin Routes - Nested under /admin parent */}
                    <Route path="/admin" element={
                      <ErrorBoundary fallback={<div className="p-6 text-center">Admin section error. Please contact support.</div>}>
                        <RouteGuard requiredRole="admin">
                          <Suspense fallback={<RouteFallback />}>
                            <Outlet />
                          </Suspense>
                        </RouteGuard>
                      </ErrorBoundary>
                    }>
                      {/* Admin Home/Overview */}
                      <Route index element={<AdminDashboard />} />
                      <Route path="home" element={<AdminHome />} />
                      <Route path="overview" element={<AdminOverviewPage />} />
                      
                      {/* Core Management */}
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="profiles" element={<ProfilesQueue />} />
                      <Route path="jobs" element={<AdminJobs />} />
                      <Route path="bookings" element={<AdminBookings />} />
                      <Route path="reviews" element={<ReviewsQueue />} />
                      <Route path="disputes" element={<DisputesQueue />} />
                      <Route path="disputes/:id" element={<AdminDisputeDetailPage />} />
                      <Route path="services" element={<AdminServices />} />
                      
                      {/* Analytics & Monitoring */}
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="analytics/disputes" element={<DisputeAnalyticsPage />} />
                      <Route path="performance" element={<PerformanceMonitorPage />} />
                      <Route path="intelligence" element={<IntelligencePage />} />
                      
                      {/* Configuration */}
                      <Route path="settings" element={<AdminSettingsPage />} />
                      <Route path="security" element={<SecuritySettingsPage />} />
                      <Route path="feature-flags" element={<AdminFeatureFlags />} />
                      <Route path="integrations" element={<IntegrationHubPage />} />
                      
                      {/* Tools */}
                      <Route path="health" element={<HealthMonitor />} />
                      <Route path="database" element={<AdminDatabaseOverview />} />
                      <Route path="user-inspector" element={<AdminUserInspector />} />
                      <Route path="test-runner" element={<AdminTestRunner />} />
                      <Route path="audit-log" element={<AuditLog />} />
                      
                      {/* Content Management */}
                      <Route path="questions" element={<QuestionsManager />} />
                      <Route path="questions/compare/:slug" element={<PackCompareView />} />
                      <Route path="website-settings" element={<WebsiteSettings />} />
                      <Route path="service-manager" element={<AdminServiceManager />} />
                      <Route path="documents" element={<AdminDocumentReview />} />
                      <Route path="profile-moderation" element={<AdminProfileModeration />} />
                      <Route path="moderation/reviews" element={<AdminReviewModerationPage />} />
                      <Route path="verifications" element={<AdminVerificationsPage />} />
                      
                      {/* Support */}
                      <Route path="helpdesk" element={<AdminHelpdeskPage />} />
                      <Route path="helpdesk/:ticketId" element={<AdminHelpdeskDetailPage />} />
                      <Route path="reports" element={<AdminReportsPage />} />
                      
                      {/* Calculator Admin */}
                      <Route path="calculator" element={<CalculatorSettings />} />
                      <Route path="calculator/pricing" element={<PricingManager />} />
                      <Route path="calculator/analytics" element={<CalculatorAnalytics />} />
                    </Route>
                    
                    {/* Legacy admin route for backward compatibility */}
                    <Route path="/admin-questions" element={
                      <RouteGuard requiredRole="admin">
                        <AdminQuestions />
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
                    
                    {/* Catch-all 404 Route - MUST BE LAST */}
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
