
import { useState } from "react";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { LoginForm } from "./LoginForm";
import { PasswordResetForm } from "./PasswordResetForm";
import { AuthAlert } from "./AuthAlert";
import { AuthCard } from "./AuthCard";

export const AuthStateManager = () => {
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  const {
    error,
    success,
    isLoading,
    setError,
    setSuccess,
    handleLogin,
    handlePasswordReset,
  } = useAuthOperations();

  // Clear errors and success messages when user changes between forms
  const handleShowPasswordReset = () => {
    setShowPasswordReset(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancelPasswordReset = () => {
    setShowPasswordReset(false);
    setError(null);
    setSuccess(null);
  };

  const getCardTitle = () => {
    if (showPasswordReset) return "Réinitialiser le mot de passe";
    return "Connexion";
  };

  const getCardDescription = () => {
    if (showPasswordReset) return "Entrez votre email pour recevoir un lien de réinitialisation";
    return "Connectez-vous à votre compte";
  };

  return (
    <AuthCard title={getCardTitle()} description={getCardDescription()}>
      <AuthAlert error={error} success={success} />

      {showPasswordReset ? (
        <PasswordResetForm
          onPasswordReset={handlePasswordReset}
          onCancel={handleCancelPasswordReset}
          isLoading={isLoading}
        />
      ) : (
        <LoginForm
          onLogin={handleLogin}
          onShowPasswordReset={handleShowPasswordReset}
          isLoading={isLoading}
        />
      )}
    </AuthCard>
  );
};
