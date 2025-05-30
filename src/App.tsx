
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import AdminLogin from "@/pages/AdminLogin";
import AgentLogin from "@/pages/AgentLogin";
import SuperviseurLogin from "@/pages/SuperviseurLogin";
import ResetPassword from "@/pages/ResetPassword";
import NewClient from "@/pages/NewClient";
import BaseClients from "@/pages/BaseClients";
import UserManagement from "@/pages/UserManagement";
import Contracts from "@/pages/Contracts";
import PassportMarocainScanner from "@/pages/PassportMarocainScanner";
import PassportEtrangerScanner from "@/pages/PassportEtrangerScanner";
import CINScanner from "@/pages/CINScanner";
import CarteSejourScanner from "@/pages/CarteSejourScanner";
import AutoDocumentScanner from "@/pages/AutoDocumentScanner";
import NotFound from "@/pages/NotFound";
import { ScrollbarForce } from "@/components/ui/scrollbar-force";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollbarForce />
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/agent-login" element={<AgentLogin />} />
              <Route path="/superviseur-login" element={<SuperviseurLogin />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/nouveau-client" element={
                <ProtectedRoute>
                  <NewClient />
                </ProtectedRoute>
              } />
              
              <Route path="/clients" element={
                <ProtectedRoute>
                  <BaseClients />
                </ProtectedRoute>
              } />
              
              <Route path="/users" element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <UserManagement />
                </RoleProtectedRoute>
              } />
              
              <Route path="/contracts" element={
                <ProtectedRoute>
                  <Contracts />
                </ProtectedRoute>
              } />
              
              <Route path="/scanner/passport-marocain" element={
                <ProtectedRoute>
                  <PassportMarocainScanner />
                </ProtectedRoute>
              } />
              
              <Route path="/scanner/passport-etranger" element={
                <ProtectedRoute>
                  <PassportEtrangerScanner />
                </ProtectedRoute>
              } />
              
              <Route path="/scanner/cin" element={
                <ProtectedRoute>
                  <CINScanner />
                </ProtectedRoute>
              } />
              
              <Route path="/scanner/carte-sejour" element={
                <ProtectedRoute>
                  <CarteSejourScanner />
                </ProtectedRoute>
              } />
              
              <Route path="/scanner/auto" element={
                <ProtectedRoute>
                  <AutoDocumentScanner />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
