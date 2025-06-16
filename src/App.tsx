
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "./components/auth/RoleProtectedRoute";
import { SmartRedirect } from "./components/auth/SmartRedirect";
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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Redirection intelligente selon le rôle */}
              <Route path="/" element={<SmartRedirect />} />
              
              {/* Pages de connexion publiques */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/agent" element={<AgentLogin />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/superviseur" element={<SuperviseurLogin />} />
              
              {/* Dashboard - accessible aux admin et superviseur */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin', 'superviseur']} redirectTo="/agent">
                    <Index />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } />
              
              {/* Base Clients - accessible uniquement aux admin et superviseur */}
              <Route path="/base-clients" element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin', 'superviseur']} redirectTo="/nouveau-client">
                    <BaseClients />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } />
              
              {/* Pages protégées - accessible à tous les utilisateurs authentifiés */}
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
              
              {/* Pages admin uniquement */}
              <Route path="/users" element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </RoleProtectedRoute>
              } />
              
              {/* Routes pour les contrats */}
              <Route path="/contracts" element={
                <ProtectedRoute>
                  <Contracts />
                </ProtectedRoute>
              } />
              <Route path="/contrat" element={<Navigate to="/contracts" replace />} />
              <Route path="/contrats" element={<Navigate to="/contracts" replace />} />
              
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
