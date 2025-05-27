
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AuthStateManager } from "@/components/auth/AuthStateManager";
import { useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Auth = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const [hasCheckedParams, setHasCheckedParams] = useState(false);

  // Check if this is a password recovery link with improved detection
  useEffect(() => {
    // Parse URL fragment (hash) for recovery tokens
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.substring(1));
    
    // Get parameters from both search params and hash
    const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');
    const type = searchParams.get('type') || hashParams.get('type');
    const tokenHash = searchParams.get('token_hash') || hashParams.get('token_hash');
    const error = searchParams.get('error') || hashParams.get('error');
    const expiresAt = searchParams.get('expires_at') || hashParams.get('expires_at');
    const expiresIn = searchParams.get('expires_in') || hashParams.get('expires_in');
    
    console.log("Auth page - URL analysis:", { 
      currentUrl: window.location.href,
      hash: hash,
      searchParamsString: searchParams.toString(),
      type, 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken,
      hasTokenHash: !!tokenHash,
      hasExpiresAt: !!expiresAt,
      hasExpiresIn: !!expiresIn,
      error
    });
    
    // Improved recovery link detection - check for multiple indicators
    const isRecoveryLink = type === 'recovery' || 
                          tokenHash ||
                          (accessToken && refreshToken && (expiresAt || expiresIn)) ||
                          (accessToken && type) ||
                          error;
    
    console.log("Recovery link detection:", { 
      isRecoveryLink, 
      type, 
      hasTokenHash: !!tokenHash, 
      hasTokens: !!(accessToken && refreshToken),
      hasExpirationInfo: !!(expiresAt || expiresIn)
    });
    
    if (isRecoveryLink) {
      console.log("Recovery link detected - staying on auth page for password reset");
      setIsRecoveryFlow(true);
      
      // Clean the URL by removing the hash fragment after processing
      if (hash) {
        window.history.replaceState({}, document.title, "/auth");
      }
    }
    
    setHasCheckedParams(true);
  }, [searchParams, location]);

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
