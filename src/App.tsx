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

export default function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* New Auth Flow Routes */}
          <Route path="/auth/role-select" element={<RoleSelect />} />
          <Route path="/auth/sign-up" element={<SignUp />} />
          <Route path="/auth/sign-in" element={<SignIn />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/quick-start" element={<QuickStart />} />
          
          {/* Legacy Auth Route */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Role Switcher */}
          <Route path="/role-switcher" element={<RoleSwitcher />} />
          
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
