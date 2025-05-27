
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AuthStateManager } from "@/components/auth/AuthStateManager";
import { useSearchParams } from "react-router-dom";

const Auth = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();

  // Check if this is a password recovery link
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');
  const tokenHash = searchParams.get('token_hash');
  const token = searchParams.get('token');
  
  const isRecoveryLink = type === 'recovery' || 
                        (accessToken && refreshToken) ||
                        (tokenHash && type === 'recovery') ||
                        (token && type === 'recovery');

  // If user is authenticated but this is NOT a recovery link, redirect to dashboard
  if (user && !loading && !isRecoveryLink) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
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
