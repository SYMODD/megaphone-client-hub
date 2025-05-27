
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
      console.log("=== RESET PASSWORD PAGE ===");
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
        currentUrl: window.location.href,
        hash: hash,
        type, 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        hasTokenHash: !!tokenHash,
        error,
        errorDescription
      });

      // Gérer les erreurs d'URL
      if (error) {
        console.error("Recovery error in URL:", error, errorDescription);
        setError("Erreur lors de la récupération : " + (errorDescription || error));
        setIsCheckingToken(false);
        return;
      }

      // Si aucun paramètre de récupération n'est trouvé, rediriger vers auth
      if (!type && !tokenHash && !accessToken && !refreshToken) {
        console.log("No recovery parameters found, redirecting to auth");
        navigate("/auth", { replace: true });
        return;
      }

      try {
        // Méthode 1: Utiliser les tokens d'accès et de refresh si disponibles
        if (accessToken && refreshToken) {
          console.log("Method 1: Setting up session with access/refresh tokens");
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Error setting session:", sessionError);
            setError("Le lien de récupération n'est plus valide ou a expiré.");
          } else {
            console.log("Session configured successfully for password recovery");
            setIsValidToken(true);
            setSuccess("Veuillez définir votre nouveau mot de passe ci-dessous");
          }
        }
        // Méthode 2: Utiliser le token_hash avec verifyOtp
        else if (tokenHash) {
          console.log("Method 2: Verifying recovery token hash...");
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery'
          });

          if (verifyError) {
            console.error("Error verifying recovery token:", verifyError);
            setError("Le lien de récupération n'est plus valide ou a expiré.");
          } else {
            console.log("Recovery token verified successfully");
            setIsValidToken(true);
            setSuccess("Veuillez définir votre nouveau mot de passe ci-dessous");
          }
        }
        // Méthode 3: Utiliser seulement l'access token si disponible
        else if (accessToken && type === 'recovery') {
          console.log("Method 3: Using access token only");
          const { data, error: userError } = await supabase.auth.getUser(accessToken);
          
          if (userError) {
            console.error("Error getting user with access token:", userError);
            setError("Le lien de récupération n'est plus valide ou a expiré.");
          } else {
            // Créer une session temporaire
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '', // refresh token peut être vide
            });
            
            if (sessionError) {
              console.error("Error creating session:", sessionError);
              setError("Erreur lors de la configuration de la session.");
            } else {
              console.log("Session created successfully with access token");
              setIsValidToken(true);
              setSuccess("Veuillez définir votre nouveau mot de passe ci-dessous");
            }
          }
        }
        else {
          console.log("No valid recovery method found");
          setError("Paramètres de récupération manquants ou invalides. Veuillez demander un nouveau lien.");
        }
      } catch (error) {
        console.error("Unexpected error during token verification:", error);
        setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      } finally {
        setIsCheckingToken(false);
        
        // Nettoyer l'URL après traitement
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
