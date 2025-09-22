import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import RoleSelect from "./pages/RoleSelect";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import VerifyEmail from "./pages/VerifyEmail";
import AuthCallback from "./pages/AuthCallback";
import QuickStart from "./pages/QuickStart";
import RoleSwitcher from "./pages/RoleSwitcher";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import ProfessionalDashboardPage from "./pages/ProfessionalDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PostJob from "./pages/PostJob";
import ServicePage from "./pages/ServicePage";
import AuthPage from "./pages/AuthPage";
import Services from "./pages/Services";
import Professionals from "./pages/Professionals";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import { useFeature } from "./hooks/useFeature";

export default function App() {
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* New Auth Flow Routes */}
          <Route path="/auth/role-select" element={<RoleSelect />} />
          <Route path="/auth/sign-up" element={<SignUp />} />
          <Route path="/auth/sign-in" element={<SignIn />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/quick-start" element={<QuickStart />} />
          
          {/* Legacy Auth Route */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Role Switcher */}
          <Route path="/role-switcher" element={<RoleSwitcher />} />
          
          {/* Service Pages */}
          <Route path="/service/:slug" element={<ServicePage />} />
          
          {/* Job Wizard - Feature Flagged */}
          {jobWizardEnabled && (
            <Route path="/post" element={
              <ProtectedRoute role="client">
                <PostJob />
              </ProtectedRoute>
            } />
          )}
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/client" element={
            <ProtectedRoute role="client">
              <ClientDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/pro" element={
            <ProtectedRoute role="professional">
              <ProfessionalDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}
