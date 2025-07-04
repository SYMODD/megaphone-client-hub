// 🔐 Wrapper d'authentification avec validation MFA
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MFAValidationScreen } from './MFAValidationScreen';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, profile, needsMFAValidation, completeMFAValidation } = useAuth();

  // 🔍 DEBUG: Logs détaillés
  console.log("🔐 AuthWrapper - État actuel:", {
    hasUser: !!user,
    hasProfile: !!profile,
    needsMFAValidation,
    userRole: profile?.role,
    userEmail: user?.email
  });

  // Si l'utilisateur a besoin d'une validation MFA
  if (needsMFAValidation && user && profile) {
    console.log("🚨 AuthWrapper - AFFICHAGE ÉCRAN MFA VALIDATION");
    return (
      <MFAValidationScreen
        user={user}
        profile={profile}
        onValidationSuccess={() => {
          console.log("✅ AuthWrapper - MFA validé avec succès");
          completeMFAValidation();
        }}
        onValidationFailure={() => {
          console.log("❌ AuthWrapper - MFA échec, rechargement page");
          // Gérée dans MFAValidationScreen avec déconnexion
          window.location.reload();
        }}
      />
    );
  }

  // Sinon, afficher l'application normale
  console.log("✅ AuthWrapper - Affichage application normale");
  return <>{children}</>;
}; 