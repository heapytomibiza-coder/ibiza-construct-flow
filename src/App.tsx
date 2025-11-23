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
import MobileAppWrapper from "./components/app/MobileAppWrapper";
import { useFeature } from "./contexts/FeatureFlagsContext";
import { BundleAnalyzer, preloadRoute } from "./components/performance/BundleOptimizer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initRealtime } from "./lib/realtimeSync";
import { ImpersonationBanner } from "./components/admin/ImpersonationBanner";
import { HelmetProvider } from "react-helmet-async";
import { CookieConsent } from "./components/layout/CookieConsent";
import { ErrorBoundary, PageLoader } from "@/components/common";
import { lazyWithRetry } from "@/lib/utils/lazyLoad";
import { ROUTE_PATHS, ROUTE_GROUPS } from "@/config/routes.config";
import DemoSetup from "@/pages/DemoSetup";
const DemoVideoGuide = lazyWithRetry(() => import("./pages/DemoVideoGuide"));

const queryClient = new QueryClient();

// Phase 11: Enhanced route fallback with standardized loading
const RouteFallback = () => <PageLoader />;

// Phase 11: Lazy load components with retry logic for better reliability
const Index = lazyWithRetry(() => import("./pages/Index"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const UnifiedAuth = lazyWithRetry(() => import("./pages/UnifiedAuth"));
const VerifyEmail = lazyWithRetry(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));
const AuthCallback = lazyWithRetry(() => import("./pages/AuthCallback"));
const QuickStart = lazyWithRetry(() => import("./pages/QuickStart"));
const RoleSwitcher = lazyWithRetry(() => import("./pages/RoleSwitcher"));
const RouteGuard = lazyWithRetry(() => import("./components/RouteGuard"));
const UnifiedClientDashboard = lazyWithRetry(() => import("./components/dashboards/UnifiedClientDashboard"));
const UnifiedProfessionalDashboard = lazyWithRetry(() => import("./components/dashboards/UnifiedProfessionalDashboard"));
const AdminDashboard = lazyWithRetry(() => import("./pages/admin/AdminDashboardPage"));

// Client Analytics Pages
const ClientAnalyticsOverview = lazyWithRetry(() => import("./pages/analytics/ClientAnalyticsOverview"));
const ClientJobsAnalytics = lazyWithRetry(() => import("./pages/analytics/ClientJobsAnalytics"));
const ClientHiringAnalytics = lazyWithRetry(() => import("./pages/analytics/ClientHiringAnalytics"));
const ClientPaymentAnalytics = lazyWithRetry(() => import("./pages/analytics/ClientPaymentAnalytics"));
const ClientProfessionalAnalytics = lazyWithRetry(() => import("./pages/analytics/ClientProfessionalAnalytics"));

// Admin Pages
const AdminHome = lazyWithRetry(() => import("./pages/admin/AdminHome"));
const Analytics = lazyWithRetry(() => import("./pages/admin/Analytics"));
const ProfilesQueue = lazyWithRetry(() => import("./pages/admin/ProfilesQueue"));
const JobsQueue = lazyWithRetry(() => import("./pages/admin/JobsQueue"));
const BulkImport = lazyWithRetry(() => import("./pages/admin/BulkImport"));
const ReviewsQueue = lazyWithRetry(() => import("./pages/admin/ReviewsQueue"));
const DisputesQueue = lazyWithRetry(() => import("./pages/admin/DisputesQueue"));
const ServicesPage = lazyWithRetry(() => import("./pages/admin/ServicesPage"));
const HealthMonitor = lazyWithRetry(() => import("./pages/admin/HealthMonitor"));
const AdminSettingsPage = lazyWithRetry(() => import("./pages/admin/AdminSettingsPage"));
const AdminQuestions = lazyWithRetry(() => import("./pages/AdminQuestions"));
const CategoryPackManager = lazyWithRetry(() => import("./pages/admin/CategoryPackManager"));
const PackCompareView = lazyWithRetry(() => import("./components/admin/packs/PackCompareView").then(m => ({ default: m.PackCompareView })));
const WebsiteSettings = lazyWithRetry(() => import("./pages/admin/WebsiteSettings"));
const AdminVerificationsPage = lazyWithRetry(() => import("./pages/AdminVerificationsPage"));
const DisputeAnalyticsPage = lazyWithRetry(() => import("./pages/admin/DisputeAnalyticsPage"));
const AdminDisputeDetailPage = lazyWithRetry(() => import("./pages/admin/AdminDisputeDetailPage"));
const AuditLog = lazyWithRetry(() => import("./pages/admin/AuditLog"));
const AdminUsers = lazyWithRetry(() => import("./pages/admin/Users"));
const AdminServices = lazyWithRetry(() => import("./pages/admin/Services"));
const AdminJobs = lazyWithRetry(() => import("./pages/admin/Jobs"));
const AdminBookings = lazyWithRetry(() => import("./pages/admin/Bookings"));
const AdminDatabaseOverview = lazyWithRetry(() => import("./pages/admin/DatabaseOverview"));
const AdminUserInspector = lazyWithRetry(() => import("./pages/admin/UserInspector"));
const AdminServiceManager = lazyWithRetry(() => import("./pages/admin/ServiceManager"));
const AdminDocumentReview = lazyWithRetry(() => import("./pages/admin/DocumentReview"));
const AdminFeatureFlags = lazyWithRetry(() => import("./pages/admin/FeatureFlags"));
const AdminTestRunner = lazyWithRetry(() => import("./pages/admin/TestRunner"));
const AdminProfileModeration = lazyWithRetry(() => import("./pages/admin/ProfileModeration"));
const QuestionsManager = lazyWithRetry(() => import("./pages/admin/QuestionsManager"));
const AdminHelpdeskPage = lazyWithRetry(() => import("./pages/admin/AdminHelpdeskPage"));
const AdminHelpdeskDetailPage = lazyWithRetry(() => import("./pages/admin/AdminHelpdeskDetailPage"));
const AdminReviewModerationPage = lazyWithRetry(() => import("./pages/admin/AdminReviewModerationPage"));
const AdminReportsPage = lazyWithRetry(() => import("./pages/admin/AdminReportsPage"));
const AdminOverviewPage = lazyWithRetry(() => import("./pages/admin/AdminOverviewPage"));
const SecuritySettingsPage = lazyWithRetry(() => import("./pages/admin/SecuritySettingsPage"));
const IntelligencePage = lazyWithRetry(() => import("./pages/admin/IntelligencePage"));
const IntegrationHubPage = lazyWithRetry(() => import("./pages/admin/IntegrationHubPage"));
const PerformanceMonitorPage = lazyWithRetry(() => import("./pages/admin/PerformanceMonitorPage"));
const CalculatorSettings = lazyWithRetry(() => import("./pages/admin/CalculatorSettings"));
const PricingManager = lazyWithRetry(() => import("./pages/admin/PricingManager"));
const CalculatorAnalytics = lazyWithRetry(() => import("./pages/admin/CalculatorAnalytics"));
const ImportServices = lazyWithRetry(() => import("./pages/admin/ImportServices"));
const QuestionBuilderPage = lazyWithRetry(() => import("./pages/admin/QuestionBuilderPage"));
const AdminUtils = lazyWithRetry(() => import("./pages/AdminUtils"));

// Job & Professional Pages
const PostJob = lazyWithRetry(() => import("./pages/PostJob"));
const JobBoardPage = lazyWithRetry(() => import("./pages/JobBoardPage"));
const PostJobSuccessPage = lazyWithRetry(() => import("./pages/PostJobSuccessPage"));
const Discovery = lazyWithRetry(() => import("./pages/Discovery"));
const DiscoveryPage = lazyWithRetry(() => import("./pages/DiscoveryPage"));
const BrowseProfessionalsPage = lazyWithRetry(() => import("./pages/BrowseProfessionalsPage"));
const ProfessionalProfile = lazyWithRetry(() => import("./pages/ProfessionalProfile"));
const ServiceDetailPage = lazyWithRetry(() => import("./pages/ServiceDetailPage"));
const ProfessionalOnboardingPage = lazyWithRetry(() => import("./pages/ProfessionalOnboardingPage"));
const ProfessionalVerificationPage = lazyWithRetry(() => import("./pages/ProfessionalVerificationPage"));
const ProfessionalServicesPage = lazyWithRetry(() => import("./pages/ProfessionalServicesPage"));
const ProfessionalPortfolioPage = lazyWithRetry(() => import("./pages/ProfessionalPortfolioPage"));
const ProfessionalAvailabilityPage = lazyWithRetry(() => import("./pages/ProfessionalAvailabilityPage"));
const ProfessionalCalendarPage = lazyWithRetry(() => import("./pages/ProfessionalCalendarPage"));
const ProfessionalEarningsPage = lazyWithRetry(() => import("./pages/ProfessionalEarningsPage"));
const ServiceSetupWizard = lazyWithRetry(() => import("./pages/ServiceSetupWizard"));
const ProfessionalPayoutSetup = lazyWithRetry(() => import("./pages/ProfessionalPayoutSetup"));
const CreateService = lazyWithRetry(() => import("./pages/CreateService"));

// Contract & Payment Pages
const BookingPage = lazyWithRetry(() => import("./pages/BookingPage"));
const ContractManagementPage = lazyWithRetry(() => import("./pages/ContractManagementPage"));
const PaymentProcessingPage = lazyWithRetry(() => import("./pages/PaymentProcessingPage"));
const EscrowManagementPage = lazyWithRetry(() => import("./pages/EscrowManagementPage"));
const JobDetailPage = lazyWithRetry(() => import("./pages/JobDetailPage"));
const JobMatchesPage = lazyWithRetry(() => import("./pages/JobMatchesPage"));
const PaymentSuccess = lazyWithRetry(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazyWithRetry(() => import("./pages/PaymentCanceled"));
const SubscriptionSuccess = lazyWithRetry(() => import("./pages/SubscriptionSuccess"));
const SubscriptionCanceled = lazyWithRetry(() => import("./pages/SubscriptionCanceled"));
const PaymentsPage = lazyWithRetry(() => import("./pages/PaymentsPage"));

// Messaging
const MessagingPage = lazyWithRetry(() => import("./pages/MessagingPage"));
const MessagesPage = lazyWithRetry(() => import("./pages/MessagesPage"));
const ConversationPage = lazyWithRetry(() => import("./pages/ConversationPage"));

// Public Pages
const HowItWorks = lazyWithRetry(() => import("./pages/HowItWorks"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const SpecialistCategories = lazyWithRetry(() => import("./pages/SpecialistCategories"));
const Calculator = lazyWithRetry(() => import("./pages/Calculator"));
const Install = lazyWithRetry(() => import("./pages/Install"));
const FairShowcase = lazyWithRetry(() => import("./pages/FairShowcase"));
const FairExhibitorOnboarding = lazyWithRetry(() => import("./components/fair/FairExhibitorOnboarding"));

// Other Pages
const Templates = lazyWithRetry(() => import("./pages/Templates"));
const ColorPreview = lazyWithRetry(() => import("./pages/ColorPreview"));
const DesignTest = lazyWithRetry(() => import("./pages/DesignTest"));
const MicroServicesReference = lazyWithRetry(() => import("./pages/MicroServicesReference"));

// Legal Pages
const TermsOfService = lazyWithRetry(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = lazyWithRetry(() => import("./pages/CookiePolicy"));

// Settings Pages
const SettingsLayout = lazyWithRetry(() => import("./pages/settings/SettingsLayout"));
const ProfileSettings = lazyWithRetry(() => import("./pages/settings/ProfileSettings"));
const AccountSettings = lazyWithRetry(() => import("./pages/settings/AccountSettings"));
const NotificationSettings = lazyWithRetry(() => import("./pages/settings/NotificationSettings"));
const ClientSettings = lazyWithRetry(() => import("./pages/settings/ClientSettings"));
const ProfessionalSettings = lazyWithRetry(() => import("./pages/settings/ProfessionalSettings"));

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
                    <Route path="/services" element={<Navigate to="/discovery" replace />} />
                    <Route path="/install" element={<Install />} />
                    <Route path="/calculator" element={<Calculator />} />
      <Route path="/demo-setup" element={<DemoSetup />} />
      <Route path="/demo-video-guide" element={<DemoVideoGuide />} />
                    <Route path="/micro-services-reference" element={<MicroServicesReference />} />
                    <Route path="/fair" element={<FairShowcase />} />
                    <Route path="/fair/onboarding" element={<FairExhibitorOnboarding />} />
                    <Route path="/fair/:sectorSlug" element={<FairShowcase />} />
                    <Route path="/discovery" element={<Discovery />} />
                    <Route path="/service/:id" element={<ServiceDetailPage />} />
                    <Route path="/jobs-discovery" element={<DiscoveryPage />} />
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
                    <Route path="/services/new" element={
                      <RouteGuard requiredRole="professional">
                        <CreateService />
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
                    {/* Legacy redirect for old payment processing route */}
                    <Route path="/payment-processing/:contractId" element={<Navigate to="/contracts/:contractId/fund" replace />} />
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
                    
                    {/* Client Analytics Routes */}
                    <Route path="/dashboard/client/analytics" element={
                      <RouteGuard requiredRole="client">
                        <ClientAnalyticsOverview />
                      </RouteGuard>
                    } />
                    <Route path="/dashboard/client/analytics/overview" element={
                      <RouteGuard requiredRole="client">
                        <ClientAnalyticsOverview />
                      </RouteGuard>
                    } />
                    <Route path="/dashboard/client/analytics/jobs" element={
                      <RouteGuard requiredRole="client">
                        <ClientJobsAnalytics />
                      </RouteGuard>
                    } />
                    <Route path="/dashboard/client/analytics/hiring" element={
                      <RouteGuard requiredRole="client">
                        <ClientHiringAnalytics />
                      </RouteGuard>
                    } />
                    <Route path="/dashboard/client/analytics/payments" element={
                      <RouteGuard requiredRole="client">
                        <ClientPaymentAnalytics />
                      </RouteGuard>
                    } />
                    <Route path="/dashboard/client/analytics/professionals" element={
                      <RouteGuard requiredRole="client">
                        <ClientProfessionalAnalytics />
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
                      <ErrorBoundary fallback={<div className="p-6 text-center">Client dashboard error. Please refresh or contact support.</div>}>
                        <RouteGuard requiredRole="client">
                          <UnifiedClientDashboard />
                        </RouteGuard>
                      </ErrorBoundary>
                    } />
                    <Route path="/dashboard/pro" element={
                      <ErrorBoundary fallback={<div className="p-6 text-center">Professional dashboard error. Please refresh or contact support.</div>}>
                        <RouteGuard requiredRole="professional">
                          <UnifiedProfessionalDashboard />
                        </RouteGuard>
                      </ErrorBoundary>
                    } />
                    <Route path="/dashboard/admin" element={
                      <RouteGuard requiredRole="admin">
                        <AdminDashboard />
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
                      <Route path="utils" element={<AdminUtils />} />
                      <Route path="user-inspector" element={<AdminUserInspector />} />
                      <Route path="test-runner" element={<AdminTestRunner />} />
                      <Route path="audit-log" element={<AuditLog />} />
                      
                      {/* Content Management */}
                      <Route path="questions" element={<AdminQuestions />} />
                      <Route path="questions/compare/:slug" element={<PackCompareView />} />
                      <Route path="question-packs/:categorySlug" element={<CategoryPackManager />} />
                      <Route path="import-services" element={<ImportServices />} />
                      <Route path="question-builder" element={<QuestionBuilderPage />} />
                      <Route path="bulk-import" element={<BulkImport />} />
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
