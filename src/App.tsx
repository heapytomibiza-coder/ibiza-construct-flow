import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SafeAreaProvider } from "@/components/mobile/SafeAreaProvider";
import { MobileGestures } from "@/components/mobile/MobileGestures";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useWebVitals } from "@/hooks/useWebVitals";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import MobileAppWrapper from "./components/app/MobileAppWrapper";
import { SkeletonLoader } from "./components/loading/SkeletonLoader";
import { useFeature } from "./contexts/FeatureFlagsContext";
import { BundleAnalyzer, preloadRoute } from "./components/performance/BundleOptimizer";

// Lazy load components for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const RoleSelect = React.lazy(() => import("./pages/RoleSelect"));
const SignUp = React.lazy(() => import("./pages/SignUp"));
const SignIn = React.lazy(() => import("./pages/SignIn"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));
const AuthCallback = React.lazy(() => import("./pages/AuthCallback"));
const QuickStart = React.lazy(() => import("./pages/QuickStart"));
const RoleSwitcher = React.lazy(() => import("./pages/RoleSwitcher"));
const RouteGuard = React.lazy(() => import("./components/RouteGuard"));
const ClientDashboardPage = React.lazy(() => import("./pages/ClientDashboardPage"));
const ProfessionalDashboardPage = React.lazy(() => import("./pages/ProfessionalDashboardPage"));
const AdminDashboardPage = React.lazy(() => import("./pages/AdminDashboardPage"));
const PostJob = React.lazy(() => import("./pages/PostJob"));
const ServicePage = React.lazy(() => import("./pages/ServicePage"));
const ServiceDetailPage = React.lazy(() => import("./pages/ServiceDetailPage").then(module => ({ default: module.ServiceDetailPage })));
const Services = React.lazy(() => import("./pages/Services"));
const Professionals = React.lazy(() => import("./pages/Professionals"));
const ProfessionalProfile = React.lazy(() => import("./pages/ProfessionalProfile"));
const HowItWorks = React.lazy(() => import("./pages/HowItWorks"));
const Contact = React.lazy(() => import("./pages/Contact"));
const SpecialistCategories = React.lazy(() => import("./pages/SpecialistCategories"));
const PaymentSuccess = React.lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = React.lazy(() => import("./pages/PaymentCanceled"));
const Templates = React.lazy(() => import("./pages/Templates"));

export default function App() {
  // Initialize Web Vitals monitoring
  useWebVitals();
  
  // Enable auth for production
  const DISABLE_AUTH_FOR_WIREFRAME = true;
  
  // Enable job wizard for implementation
  const jobWizardEnabled = useFeature('ff.jobWizardV2', true);
  
  // Preload critical routes on app start
  React.useEffect(() => {
    preloadRoute('/dashboard/pro');
    preloadRoute('/post');
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
          <Route path="/services" element={<Services />} />
          <Route path="/specialist-categories" element={<SpecialistCategories />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/professional/:id" element={<ProfessionalProfile />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* New Auth Flow Routes */}
          <Route path="/auth/role-select" element={<RoleSelect />} />
          <Route path="/auth/sign-up" element={<SignUp />} />
          <Route path="/auth/sign-in" element={<SignIn />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/quick-start" element={<QuickStart />} />
          
          
          {/* Role Switcher */}
          <Route path="/role-switcher" element={<RoleSwitcher />} />
          
          {/* Service Pages */}
          <Route path="/service/:slug" element={<ServicePage />} />
          <Route path="/service/:micro/:slug" element={<ServiceDetailPage />} />
          
          {/* Payment Pages */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-canceled" element={<PaymentCanceled />} />
          
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
              <ClientDashboardPage />
            ) : (
              <RouteGuard requiredRole="client">
                <ClientDashboardPage />
              </RouteGuard>
            )
          } />
          <Route path="/dashboard/pro" element={
            DISABLE_AUTH_FOR_WIREFRAME ? (
              <ProfessionalDashboardPage />
            ) : (
              <RouteGuard requiredRole="professional">
                <ProfessionalDashboardPage />
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
