import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "./components/auth/RoleProtectedRoute";
import { SmartRedirect } from "./components/auth/SmartRedirect";
import { Suspense, lazy, useEffect } from "react";
import { SmartNotificationContainer, useSmartNotifications } from "@/components/ui/smart-notification";


const SuspenseFallback = ({ message = "Chargement..." }: { message?: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-slate-600">{message}</p>
    </div>
  </div>
);

const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AgentLogin = lazy(() => import("./pages/AgentLogin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const SuperviseurLogin = lazy(() => import("./pages/SuperviseurLogin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Index = lazy(() => 
  import("./pages/Index").then(module => {
    import("./components/dashboard/DashboardStats");
    import("./components/dashboard/QuickActions");
    return module;
  })
);

const BaseClients = lazy(() => 
  import("./pages/BaseClients").then(module => {
    import("./components/clients/ClientTable");
    import("./components/clients/ClientFilters");
    return module;
  })
);

const UserManagement = lazy(() => import("./pages/UserManagement"));

const NewClient = lazy(() => 
  import("./pages/NewClient").then(module => {
    import("./components/client/ClientForm");
    import("./components/client/DocumentScanner");
    return module;
  })
);

const CINScanner = lazy(() => import("./pages/CINScanner"));
const PassportMarocainScanner = lazy(() => import("./pages/PassportMarocainScanner"));
const PassportEtrangerScanner = lazy(() => import("./pages/PassportEtrangerScanner"));
const CarteSejourScanner = lazy(() => import("./pages/CarteSejourScanner"));

// Workflow pages
const CINWorkflow = lazy(() => import("./pages/workflows/CINWorkflow"));
const PassportMarocainWorkflow = lazy(() => import("./pages/workflows/PassportMarocainWorkflow"));
const PassportEtrangerWorkflow = lazy(() => import("./pages/workflows/PassportEtrangerWorkflow"));
const CarteSejourWorkflow = lazy(() => import("./pages/workflows/CarteSejourWorkflow"));

const Contracts = lazy(() => 
  import("./pages/Contracts").then(module => {
    if (window.location.pathname.includes('contracts')) {
      import("./components/contracts/PDFContractGenerator");
    }
    return module;
  })
);

const ClientAudit = lazy(() => import("./pages/ClientAudit"));

import { queryClient } from "./lib/queryClient";

const App = () => {
  const { notifications } = useSmartNotifications();

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentPath = window.location.pathname;
      
      if (currentPath.includes('/dashboard') || currentPath === '/') {
        import("./pages/BaseClients");
        import("./pages/UserManagement");
      } else if (currentPath.includes('/nouveau-client')) {
        import("./pages/CINScanner");
        import("./pages/PassportMarocainScanner");
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<SmartRedirect />} />
              
              <Route path="/auth" element={
                <Suspense fallback={<SuspenseFallback message="Chargement de la connexion..." />}>
                  <Auth />
                </Suspense>
              } />
              
              <Route path="/reset-password" element={
                <Suspense fallback={<SuspenseFallback message="Chargement..." />}>
                  <ResetPassword />
                </Suspense>
              } />
              
              <Route path="/agent" element={
                <Suspense fallback={<SuspenseFallback message="Chargement de la connexion agent..." />}>
                  <AgentLogin />
                </Suspense>
              } />
              
              <Route path="/admin" element={
                <Suspense fallback={<SuspenseFallback message="Chargement de la connexion admin..." />}>
                  <AdminLogin />
                </Suspense>
              } />
              
              <Route path="/superviseur" element={
                <Suspense fallback={<SuspenseFallback message="Chargement de la connexion superviseur..." />}>
                  <SuperviseurLogin />
                </Suspense>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin', 'superviseur']} redirectTo="/agent">
                    <Suspense fallback={<SuspenseFallback message="Chargement du tableau de bord..." />}>
                      <Index />
                    </Suspense>
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/base-clients" element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin', 'superviseur']} redirectTo="/nouveau-client">
                    <Suspense fallback={<SuspenseFallback message="Chargement de la base clients..." />}>
                      <BaseClients />
                    </Suspense>
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/nouveau-client" element={
                <ProtectedRoute>
                  <Suspense fallback={<SuspenseFallback message="Chargement du formulaire client..." />}>
                    <NewClient />
                  </Suspense>
                </ProtectedRoute>
              } />

              <Route path="/scanner-cin" element={
                <ProtectedRoute>
                  <Suspense fallback={<SuspenseFallback message="Chargement du scanner CIN..." />}>
                    <CINScanner />
                  </Suspense>
                </ProtectedRoute>
              } />

              <Route path="/scanner-passeport-marocain" element={
                <ProtectedRoute>
                  <Suspense fallback={<SuspenseFallback message="Chargement du scanner passeport..." />}>
                    <PassportMarocainScanner />
                  </Suspense>
                </ProtectedRoute>
              } />

              <Route path="/scanner-passeport-etranger" element={
                <ProtectedRoute>
                  <Suspense fallback={<SuspenseFallback message="Chargement du scanner passeport étranger..." />}>
                    <PassportEtrangerScanner />
                  </Suspense>
                </ProtectedRoute>
              } />

              <Route path="/scanner-carte-sejour" element={
                <ProtectedRoute>
                  <Suspense fallback={<SuspenseFallback message="Chargement du scanner carte de séjour..." />}>
                    <CarteSejourScanner />
                  </Suspense>
                </ProtectedRoute>
              } />

              {/* Workflow routes */}
              <Route path="/workflow/cin" element={
                <ProtectedRoute>
                  <Suspense fallback={<SuspenseFallback message="Chargement du workflow CIN..." />}>
                    <CINWorkflow />
                  </Suspense>
                </ProtectedRoute>
              } />

              <Route path="/workflow/passeport-marocain" element={
                <ProtectedRoute>
                  <Suspense fallback={<SuspenseFallback message="Chargement du workflow passeport marocain..." />}>
                    <PassportMarocainWorkflow />
                  </Suspense>
                </ProtectedRoute>
              } />

              <Route path="/workflow/passeport-etranger" element={
                <ProtectedRoute>
                  <Suspense fallback={<SuspenseFallback message="Chargement du workflow passeport étranger..." />}>
                    <PassportEtrangerWorkflow />
                  </Suspense>
                </ProtectedRoute>
              } />

              <Route path="/workflow/carte-sejour" element={
                <ProtectedRoute>
                  <Suspense fallback={<SuspenseFallback message="Chargement du workflow carte de séjour..." />}>
                    <CarteSejourWorkflow />
                  </Suspense>
                </ProtectedRoute>
              } />
              
              <Route path="/users" element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<SuspenseFallback message="Chargement de la gestion utilisateurs..." />}>
                    <UserManagement />
                  </Suspense>
                </RoleProtectedRoute>
              } />
              
              <Route path="/audit-clients" element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin', 'superviseur']} redirectTo="/dashboard">
                    <Suspense fallback={<SuspenseFallback message="Chargement de l'audit des clients..." />}>
                      <ClientAudit />
                    </Suspense>
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/contracts" element={
                <ProtectedRoute>
                  <Suspense fallback={<SuspenseFallback message="Chargement des contrats..." />}>
                    <Contracts />
                  </Suspense>
                </ProtectedRoute>
              } />
              
              <Route path="/contrat" element={<Navigate to="/contracts" replace />} />
              <Route path="/contrats" element={<Navigate to="/contracts" replace />} />
              
              <Route path="/404" element={
                <Suspense fallback={<SuspenseFallback />}>
                  <NotFound />
                </Suspense>
              } />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        
        <Toaster />
        <Sonner />
        <SmartNotificationContainer notifications={notifications} />
  
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
