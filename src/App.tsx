
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NewClient from "./pages/NewClient";
import BaseClients from "./pages/BaseClients";
import UserManagement from "./pages/UserManagement";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import CINScanner from "./pages/CINScanner";
import PassportMarocainScanner from "./pages/PassportMarocainScanner";
import PassportEtrangerScanner from "./pages/PassportEtrangerScanner";
import CarteSejourScanner from "./pages/CarteSejourScanner";
import AutoDocumentScanner from "./pages/AutoDocumentScanner";
import Contracts from "./pages/Contracts";
import AdminLogin from "./pages/AdminLogin";
import SuperviseurLogin from "./pages/SuperviseurLogin";
import AgentLogin from "./pages/AgentLogin";
import AdminRecaptcha from "./pages/AdminRecaptcha";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/login/superviseur" element={<SuperviseurLogin />} />
            <Route path="/login/agent" element={<AgentLogin />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Routes protégées par authentification */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <BaseClients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nouveau-client"
              element={
                <RoleProtectedRoute allowedRoles={["agent"]}>
                  <NewClient />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/scanner-cin"
              element={
                <RoleProtectedRoute allowedRoles={["agent"]}>
                  <CINScanner />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/scanner-passeport-marocain"
              element={
                <RoleProtectedRoute allowedRoles={["agent"]}>
                  <PassportMarocainScanner />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/scanner-passeport-etranger"
              element={
                <RoleProtectedRoute allowedRoles={["agent"]}>
                  <PassportEtrangerScanner />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/scanner-carte-sejour"
              element={
                <RoleProtectedRoute allowedRoles={["agent"]}>
                  <CarteSejourScanner />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/scanner-auto"
              element={
                <RoleProtectedRoute allowedRoles={["agent"]}>
                  <AutoDocumentScanner />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "superviseur"]}>
                  <BaseClients />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/contracts"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "superviseur"]}>
                  <Contracts />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <UserManagement />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/recaptcha"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <AdminRecaptcha />
                </RoleProtectedRoute>
              }
            />

            {/* Route 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
