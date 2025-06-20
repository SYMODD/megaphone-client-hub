
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export const useAuthErrorHandling = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuthError = (error: any, defaultMessage: string) => {
    
    let userFriendlyMessage = defaultMessage;
    
    if (error?.code) {
      switch (error.code) {
        case "invalid_credentials":
          userFriendlyMessage = "Les identifiants fournis sont incorrects. Vérifiez votre email et mot de passe.";
          break;
        case "account_inactive":
          userFriendlyMessage = error.message;
          break;
        case "email_not_confirmed":
          userFriendlyMessage = "Veuillez confirmer votre email avant de vous connecter.";
          break;
        case "too_many_requests":
          userFriendlyMessage = "Trop de tentatives de connexion. Veuillez attendre quelques minutes.";
          break;
        case "user_not_found":
          userFriendlyMessage = "Aucun compte trouvé avec cet email.";
          break;
        default:
          userFriendlyMessage = `Erreur: ${error.message}`;
      }
    }
    
    setError(userFriendlyMessage);
    toast({
      title: "Erreur",
      description: userFriendlyMessage,
      variant: "destructive",
    });
  };

  const showSuccess = (message: string, title: string = "Succès") => {
    setSuccess(message);
    toast({
      title,
      description: message,
    });
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    error,
    success,
    setError,
    setSuccess,
    handleAuthError,
    showSuccess,
    clearMessages,
  };
};
