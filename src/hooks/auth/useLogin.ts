
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(true); // 🔧 TEMPORAIRE: défini à true pour bypasser

  const handleLogin = async (email: string, password: string, role?: string) => {
    // 🔧 TEMPORAIRE: Désactiver la vérification CAPTCHA pour permettre l'accès admin initial
    // Cette condition est commentée temporairement pour permettre la configuration initiale
    /*
    if ((role === 'admin' || role === 'superviseur') && !isCaptchaVerified) {
      setRequiresCaptcha(true);
      toast({
        title: "Vérification CAPTCHA requise",
        description: "Veuillez compléter la vérification CAPTCHA",
        variant: "destructive",
      });
      return;
    }
    */

    setIsLoading(true);
    
    try {
      console.log('🔐 Tentative de connexion pour:', { email, role });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erreur de connexion:', error);
        
        // 🔧 TEMPORAIRE: Commenté pour permettre l'accès initial
        /*
        if (role === 'admin' || role === 'superviseur') {
          setRequiresCaptcha(true);
        }
        */
        
        toast({
          title: "Erreur de connexion",
          description: error.message === "Invalid login credentials" 
            ? "Email ou mot de passe incorrect" 
            : error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        console.log('✅ Connexion réussie');
        
        // Vérifier le rôle de l'utilisateur
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile && role && profile.role !== role) {
          await supabase.auth.signOut();
          toast({
            title: "Accès refusé",
            description: `Cette page est réservée aux ${role}s`,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Connexion réussie",
          description: "Bienvenue ! 🔧 Mode configuration temporaire activé",
        });
      }
    } catch (error) {
      console.error('🚨 Erreur lors de la connexion:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaVerification = (isVerified: boolean) => {
    setIsCaptchaVerified(isVerified);
    if (isVerified) {
      setRequiresCaptcha(false);
    }
  };

  return {
    handleLogin,
    isLoading,
    requiresCaptcha: false, // 🔧 TEMPORAIRE: toujours false pour bypasser
    isCaptchaVerified: true, // 🔧 TEMPORAIRE: toujours true pour bypasser
    handleCaptchaVerification
  };
};
