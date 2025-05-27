
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AuthStateManager } from "@/components/auth/AuthStateManager";
import { useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Auth = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simple check - if we're on /auth and have recovery-related parameters,
    // let Supabase handle the flow naturally by redirecting to /reset-password
    const hash = window.location.hash;
    const hasRecoveryParams = 
      searchParams.get('type') === 'recovery' ||
      hash.includes('type=recovery') ||
      hash.includes('access_token') ||
      searchParams.get('access_token');

    if (hasRecoveryParams) {
      console.log("Recovery parameters detected, redirecting to reset password page");
      window.location.replace('/reset-password' + window.location.search + window.location.hash);
      return;
    }

    setIsReady(true);
  }, [searchParams]);

  // Show loading while checking for recovery parameters or auth state
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (user) {
    console.log("User authenticated - redirecting to dashboard");
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Sud Megaphone</h1>
          <p className="text-slate-600 mt-2">Gestion des clients</p>
        </div>

        <AuthStateManager />
      </div>
    </div>
  );
};

export default Auth;
