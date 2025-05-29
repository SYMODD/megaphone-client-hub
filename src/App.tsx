
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "./components/auth/RoleProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AgentLogin from "./pages/AgentLogin";
import AdminLogin from "./pages/AdminLogin";
import SuperviseurLogin from "./pages/SuperviseurLogin";
import BaseClients from "./pages/BaseClients";
import NewClient from "./pages/NewClient";
import CINScanner from "./pages/CINScanner";
import PassportMarocainScanner from "./pages/PassportMarocainScanner";
import PassportEtrangerScanner from "./pages/PassportEtrangerScanner";
import CarteSejourScanner from "./pages/CarteSejourScanner";
import UserManagement from "./pages/UserManagement";
import Contracts from "./pages/Contracts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/agent-login" element={<AgentLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/superviseur-login" element={<SuperviseurLogin />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/base-clients" element={
              <ProtectedRoute>
                <BaseClients />
              </ProtectedRoute>
            } />
            
            <Route path="/nouveau-client" element={
              <ProtectedRoute>
                <NewClient />
              </ProtectedRoute>
            } />

            <Route path="/scanner-cin" element={
              <ProtectedRoute>
                <CINScanner />
              </ProtectedRoute>
            } />

            <Route path="/scanner-passeport-marocain" element={
              <ProtectedRoute>
                <PassportMarocainScanner />
              </ProtectedRoute>
            } />

            <Route path="/scanner-passeport-etranger" element={
              <ProtectedRoute>
                <PassportEtrangerScanner />
              </ProtectedRoute>
            } />

            <Route path="/scanner-carte-sejour" element={
              <ProtectedRoute>
                <CarteSejourScanner />
              </ProtectedRoute>
            } />
            
            <Route path="/users" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </RoleProtectedRoute>
            } />
            
            <Route path="/contracts" element={
              <ProtectedRoute>
                <Contracts />
              </ProtectedRoute>
            } />
            
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
