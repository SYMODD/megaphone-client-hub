
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthErrorHandling } from "./useAuthErrorHandling";

export const useRecoveryTokenVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const { error, success, setError, setSuccess } = useAuthErrorHandling();

  useEffect(() => {
    const verifyRecoveryToken = async () => {
      console.log("=== RESET PASSWORD TOKEN VERIFICATION ===");
      console.log("Current URL:", window.location.href);
      
      // Parse URL fragment (hash) for recovery tokens - this is where Supabase puts them
      const hash = window.location.hash;
      
      if (!hash) {
        console.log("No hash fragment found, redirecting to auth");
        navigate("/auth", { replace: true });
        return;
      }

      // Remove the # and parse the parameters
      const hashParams = new URLSearchParams(hash.substring(1));
      
      // Get the essential parameters from the hash
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');
      
      console.log("Hash parameters:", { 
        type, 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        error,
        errorDescription
      });

      // Handle errors from the URL
      if (error) {
        console.error("Recovery error in URL:", error, errorDescription);
        setError("Le lien de récupération n'est plus valide ou a expiré. Veuillez demander un nouveau lien.");
        setIsCheckingToken(false);
        return;
      }

      // Verify we have the required tokens for password recovery
      if (!accessToken || !refreshToken || type !== 'recovery') {
        console.log("Missing required recovery tokens or wrong type");
        setError("Lien de récupération invalide. Veuillez demander un nouveau lien de récupération.");
        setIsCheckingToken(false);
        return;
      }

      try {
        console.log("Setting up session with recovery tokens...");
        
        // Set the session using the tokens from the URL
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error("Error setting session:", sessionError);
          setError("Le lien de récupération n'est plus valide ou a expiré. Veuillez demander un nouveau lien.");
        } else {
          console.log("Session configured successfully for password recovery:", data);
          setIsValidToken(true);
          setSuccess("Vous pouvez maintenant définir votre nouveau mot de passe.");
        }
      } catch (error) {
        console.error("Unexpected error during token verification:", error);
        setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      } finally {
        setIsCheckingToken(false);
        
        // Clean up URL after processing
        window.history.replaceState({}, document.title, "/reset-password");
      }
    };

    verifyRecoveryToken();
  }, [setError, setSuccess, navigate]);

  return {
    isValidToken,
    isCheckingToken,
    error,
    success
  };
};
