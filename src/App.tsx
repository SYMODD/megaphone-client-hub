
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { SignupRedirect } from "@/components/auth/SignupRedirect";
import Index from "./pages/Index";
import NewClient from "./pages/NewClient";
import BaseClients from "./pages/BaseClients";
import Contracts from "./pages/Contracts";
import AdminLogin from "./pages/AdminLogin";
import SuperviseurLogin from "./pages/SuperviseurLogin";
import AgentLogin from "./pages/AgentLogin";
import ResetPassword from "./pages/ResetPassword";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import { memo } from "react";

// Configuration optimisée du QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = memo(() => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/agent" replace />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/superviseur" element={<SuperviseurLogin />} />
            <Route path="/agent" element={<AgentLogin />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/signup" element={<SignupRedirect />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/nouveau-client" element={
              <ProtectedRoute>
                <NewClient />
              </ProtectedRoute>
            } />
            <Route path="/base-clients" element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["admin", "superviseur"]}>
                  <BaseClients />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/contrats" element={
              <ProtectedRoute>
                <Contracts />
              </ProtectedRoute>
            } />
            <Route path="/gestion-utilisateurs" element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <UserManagement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
));

App.displayName = "App";

export default App;
