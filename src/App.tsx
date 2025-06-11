
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NewClient from "./pages/NewClient";
import BaseClients from "./pages/BaseClients";
import UserManagement from "./pages/UserManagement";
import RecaptchaSettings from "./pages/RecaptchaSettings";
import AutoDocumentScanner from "./pages/AutoDocumentScanner";
import CINScanner from "./pages/CINScanner";
import PassportMarocainScanner from "./pages/PassportMarocainScanner";
import PassportEtrangerScanner from "./pages/PassportEtrangerScanner";
import CarteSejourScanner from "./pages/CarteSejourScanner";
import Contracts from "./pages/Contracts";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/AdminLogin";
import SuperviseurLogin from "./pages/SuperviseurLogin";
import AgentLogin from "./pages/AgentLogin";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/superviseur-login" element={<SuperviseurLogin />} />
              <Route path="/agent-login" element={<AgentLogin />} />
              
              {/* Protected routes requiring authentication */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nouveau-client"
                element={
                  <ProtectedRoute>
                    <NewClient />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/base-clients"
                element={
                  <ProtectedRoute>
                    <BaseClients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contrats"
                element={
                  <ProtectedRoute>
                    <Contracts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scanner-auto"
                element={
                  <ProtectedRoute>
                    <AutoDocumentScanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scanner-cin"
                element={
                  <ProtectedRoute>
                    <CINScanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scanner-passeport-marocain"
                element={
                  <ProtectedRoute>
                    <PassportMarocainScanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scanner-passeport-etranger"
                element={
                  <ProtectedRoute>
                    <PassportEtrangerScanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scanner-carte-sejour"
                element={
                  <ProtectedRoute>
                    <CarteSejourScanner />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin/Supervisor only routes */}
              <Route
                path="/gestion-utilisateurs"
                element={
                  <ProtectedRoute>
                    <RoleProtectedRoute allowedRoles={['admin', 'superviseur']}>
                      <UserManagement />
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                }
              />
              
              {/* Admin only routes */}
              <Route
                path="/recaptcha-settings"
                element={
                  <ProtectedRoute>
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <RecaptchaSettings />
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                }
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
