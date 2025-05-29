
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export const SmartRedirect = () => {
  const { user, profile, loading } = useAuth();

  console.log("SmartRedirect - User:", !!user, "Profile:", profile?.role, "Loading:", loading);

  // Show loading while checking auth state
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

  // If not authenticated, redirect to agent login (default entry point)
  if (!user || !profile) {
    console.log("No user or profile, redirecting to /agent");
    return <Navigate to="/agent" replace />;
  }

  // Redirect based on user role
  switch (profile.role) {
    case "admin":
    case "superviseur":
      console.log(`${profile.role} detected, redirecting to /dashboard`);
      return <Navigate to="/dashboard" replace />;
    case "agent":
      console.log("Agent detected, redirecting to /nouveau-client");
      return <Navigate to="/nouveau-client" replace />;
    default:
      console.log("Unknown role, redirecting to /agent");
      return <Navigate to="/agent" replace />;
  }
};
