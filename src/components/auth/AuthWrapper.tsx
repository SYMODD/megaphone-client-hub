// 🔐 Wrapper d'authentification avec validation MFA
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MFAValidationScreen } from './MFAValidationScreen';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, profile, needsMFAValidation, completeMFAValidation } = useAuth();

  // Si l'utilisateur a besoin d'une validation MFA
  if (needsMFAValidation && user && profile) {
    return (
      <MFAValidationScreen
        user={user}
        profile={profile}
        onValidationSuccess={completeMFAValidation}
        onValidationFailure={() => {
          // Gérée dans MFAValidationScreen avec déconnexion
          window.location.reload();
        }}
      />
    );
  }

  // Sinon, afficher l'application normale
  return <>{children}</>;
}; 