
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
      
      // Parse URL fragment (hash) for recovery tokens
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      
      // Get parameters from both search params and hash
      const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');
      const type = searchParams.get('type') || hashParams.get('type');
      const tokenHash = searchParams.get('token_hash') || hashParams.get('token_hash');
      const error = searchParams.get('error') || hashParams.get('error');
      const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
      
      console.log("Recovery token parameters:", { 
        type, 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        hasTokenHash: !!tokenHash,
        error,
        errorDescription
      });

      // Handle URL errors first
      if (error) {
        console.error("Recovery error in URL:", error, errorDescription);
        setError("Erreur lors de la récupération : " + (errorDescription || error));
        setIsCheckingToken(false);
        return;
      }

      // If no recovery parameters found, redirect to auth
      if (!type && !tokenHash && !accessToken) {
        console.log("No recovery parameters found, redirecting to auth");
        navigate("/auth", { replace: true });
        return;
      }

      try {
        // Method 1: Use token_hash with verifyOtp (most reliable for recovery links)
        if (tokenHash) {
          console.log("Method 1: Verifying recovery token hash...");
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery'
          });

          if (verifyError) {
            console.error("Error verifying recovery token:", verifyError);
            setError("Le lien de récupération n'est plus valide ou a expiré. Veuillez demander un nouveau lien.");
          } else {
            console.log("Recovery token verified successfully");
            setIsValidToken(true);
            setSuccess("Veuillez définir votre nouveau mot de passe ci-dessous");
          }
        }
        // Method 2: Use access/refresh tokens if available
        else if (accessToken && refreshToken && type === 'recovery') {
          console.log("Method 2: Setting up session with access/refresh tokens");
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Error setting session:", sessionError);
            setError("Le lien de récupération n'est plus valide ou a expiré. Veuillez demander un nouveau lien.");
          } else {
            console.log("Session configured successfully for password recovery");
            setIsValidToken(true);
            setSuccess("Veuillez définir votre nouveau mot de passe ci-dessous");
          }
        }
        else {
          console.log("No valid recovery method found");
          setError("Paramètres de récupération manquants ou invalides. Veuillez demander un nouveau lien de récupération.");
        }
      } catch (error) {
        console.error("Unexpected error during token verification:", error);
        setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      } finally {
        setIsCheckingToken(false);
        
        // Clean up URL after processing
        if (hash || searchParams.toString()) {
          window.history.replaceState({}, document.title, "/reset-password");
        }
      }
    };

    verifyRecoveryToken();
  }, [searchParams, setError, setSuccess, navigate]);

  return {
    isValidToken,
    isCheckingToken,
    error,
    success
  };
};
