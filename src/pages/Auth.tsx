
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AuthStateManager } from "@/components/auth/AuthStateManager";
import { useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Auth = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [hasCheckedParams, setHasCheckedParams] = useState(false);

  // Check if this is a password recovery link
  useEffect(() => {
    console.log("=== AUTH PAGE RECOVERY CHECK ===");
    console.log("Current URL:", window.location.href);
    console.log("Search params:", searchParams.toString());
    console.log("Location hash:", location.hash);
    
    // Parse URL fragment (hash) for recovery tokens
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.substring(1));
    
    // Get parameters from both search params and hash
    const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');
    const type = searchParams.get('type') || hashParams.get('type');
    const tokenHash = searchParams.get('token_hash') || hashParams.get('token_hash');
    const error = searchParams.get('error') || hashParams.get('error');
    
    console.log("Recovery parameters found:", { 
      type, 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken,
      hasTokenHash: !!tokenHash,
      error
    });
    
    // Simple detection of recovery links - check for any recovery-related parameters
    const isRecoveryLink = !!(type === 'recovery' || tokenHash || (accessToken && refreshToken));
    
    console.log("Recovery link detection result:", isRecoveryLink);
    
    if (isRecoveryLink) {
      console.log("Recovery link detected - redirecting to /reset-password");
      // Redirect immediately to preserve all parameters
      const fullUrl = window.location.href;
      const newUrl = fullUrl.replace('/auth', '/reset-password');
      
      console.log("Redirecting to:", newUrl);
      window.location.replace(newUrl);
      return;
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
