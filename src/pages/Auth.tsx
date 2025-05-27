
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AuthStateManager } from "@/components/auth/AuthStateManager";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Auth = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const [hasCheckedParams, setHasCheckedParams] = useState(false);

  // Check if this is a password recovery link with improved detection
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    const tokenHash = searchParams.get('token_hash');
    const error = searchParams.get('error');
    
    console.log("Auth page - URL parameters:", { 
      type, 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken,
      hasTokenHash: !!tokenHash,
      error,
      urlParams: searchParams.toString()
    });
    
    // Améliorer la détection des liens de récupération
    const isRecoveryLink = type === 'recovery' || 
                          tokenHash ||
                          (accessToken && refreshToken && !type) ||
                          error;
    
    console.log("Recovery link detection:", { isRecoveryLink, type, hasTokenHash: !!tokenHash, hasTokens: !!(accessToken && refreshToken) });
    
    if (isRecoveryLink) {
      console.log("Recovery link detected - staying on auth page for password reset");
      setIsRecoveryFlow(true);
    }
    
    setHasCheckedParams(true);
  }, [searchParams]);

  // Show loading while checking parameters
  if (loading || !hasCheckedParams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Only redirect authenticated users if this is NOT a recovery flow
  if (user && !isRecoveryFlow) {
    console.log("User authenticated and not in recovery flow - redirecting to dashboard");
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
