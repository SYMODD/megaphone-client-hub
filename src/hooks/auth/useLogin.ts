
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  const handleLogin = async (email: string, password: string, role?: string) => {
    // Ne pas exiger CAPTCHA pour l'admin principal
    const isMainAdmin = email === "essbane.salim@gmail.com";
    
    // Vérification CAPTCHA pour admin et superviseur (sauf admin principal)
    if ((role === 'admin' || role === 'superviseur') && !isCaptchaVerified && !isMainAdmin) {
      setRequiresCaptcha(true);
      toast({
        title: "Vérification CAPTCHA requise",
        description: "Veuillez compléter la vérification CAPTCHA",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔐 Tentative de connexion pour:', { email, role });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erreur de connexion:', error);
        
        // Demander CAPTCHA en cas d'erreur pour admin/superviseur (sauf admin principal)
        if ((role === 'admin' || role === 'superviseur') && !isMainAdmin) {
          setRequiresCaptcha(true);
        }
        
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

        if (profile && role && profile.role !== role && !isMainAdmin) {
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
          description: "Bienvenue !",
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
    requiresCaptcha,
    isCaptchaVerified,
    handleCaptchaVerification
  };
};
