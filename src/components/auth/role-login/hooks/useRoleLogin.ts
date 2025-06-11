
import React, { useState } from "react";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { toast } from "sonner";
import { LoginForm } from "../types";

export const useRoleLogin = (
  role: string,
  onLogin: (email: string, password: string) => Promise<void>
) => {
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const { isConfigured } = useRecaptchaSettings();

  // RÈGLES FINALES CORRIGÉES :
  // - Agent : TOUJOURS connexion directe (pas de reCAPTCHA)
  // - Admin/Superviseur : reCAPTCHA uniquement si configuré
  const requiresRecaptcha = role !== 'agent' && isConfigured;

  console.log(`🔐 [CORRECTED_LOGIN] Connexion ${role} avec logique corrigée:`, {
    requiresRecaptcha,
    isConfigured,
    rule: role === 'agent' ? 'BYPASS_AGENT' : (isConfigured ? 'RECAPTCHA_REQUIRED' : 'DIRECT_LOGIN')
  });

  // Gestionnaire avec reCAPTCHA pour Admin/Superviseur (si configuré)
  const handleLoginWithRecaptcha = async (recaptchaToken: string) => {
    console.log('🔒 [CORRECTED_LOGIN] reCAPTCHA validé pour:', role, recaptchaToken.substring(0, 20) + '...');
    
    const tempData = localStorage.getItem('temp_login_data');
    if (!tempData) {
      toast.error('Données de connexion manquantes');
      return;
    }

    try {
      const { email, password } = JSON.parse(tempData);
      console.log(`📝 [CORRECTED_LOGIN] Connexion ${role} après reCAPTCHA:`, email);
      
      await onLogin(email, password);
      localStorage.removeItem('temp_login_data');
    } catch (error) {
      console.error('❌ [CORRECTED_LOGIN] Erreur lors de la connexion:', error);
      toast.error('Erreur lors de la connexion');
      localStorage.removeItem('temp_login_data');
    }
  };

  const handleRecaptchaError = (error: string) => {
    console.error('❌ [CORRECTED_LOGIN] Erreur reCAPTCHA:', error);
    toast.error('Vérification de sécurité échouée');
    localStorage.removeItem('temp_login_data');
  };

  const handleDirectLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // LOGIQUE CORRIGÉE ET CLAIRE
    if (requiresRecaptcha) {
      // Admin/Superviseur avec reCAPTCHA configuré
      console.log(`🔒 [CORRECTED_LOGIN] Stockage temporaire pour reCAPTCHA ${role}`);
      localStorage.setItem('temp_login_data', JSON.stringify({
        email: loginForm.email,
        password: loginForm.password
      }));
      // Le composant RecaptchaVerification s'occupera du reste
    } else {
      // Agent OU Admin/Superviseur sans reCAPTCHA
      console.log(`⚡ [CORRECTED_LOGIN] Connexion directe ${role}`);
      await onLogin(loginForm.email, loginForm.password);
    }
  };

  return {
    loginForm,
    setLoginForm,
    requiresRecaptcha,
    isConfigured,
    handleLoginWithRecaptcha,
    handleRecaptchaError,
    handleDirectLogin
  };
};
