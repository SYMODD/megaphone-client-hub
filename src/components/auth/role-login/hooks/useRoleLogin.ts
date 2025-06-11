
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

  // RÈGLES FINALES SIMPLIFIÉES ET CLAIRES :
  // - Agent : TOUJOURS connexion directe (pas de reCAPTCHA jamais)
  // - Admin/Superviseur : reCAPTCHA UNIQUEMENT si configuré
  const requiresRecaptcha = role !== 'agent' && isConfigured;

  console.log(`🔐 [FIXED_LOGIN] Logique de connexion clarifiée pour ${role}:`, {
    role,
    isConfigured,
    requiresRecaptcha,
    decision: role === 'agent' ? 'BYPASS_TOTAL_AGENT' : 
              (isConfigured ? 'RECAPTCHA_OBLIGATOIRE' : 'CONNEXION_DIRECTE_AUTORISÉE')
  });

  // Gestionnaire avec reCAPTCHA pour Admin/Superviseur configuré
  const handleLoginWithRecaptcha = async (recaptchaToken: string) => {
    console.log('🔒 [FIXED_LOGIN] Connexion avec reCAPTCHA validé:', role, recaptchaToken.substring(0, 20) + '...');
    
    const tempData = localStorage.getItem('temp_login_data');
    if (!tempData) {
      toast.error('Données de connexion manquantes');
      return;
    }

    try {
      const { email, password } = JSON.parse(tempData);
      console.log(`📝 [FIXED_LOGIN] Connexion ${role} après validation reCAPTCHA:`, email);
      
      await onLogin(email, password);
      localStorage.removeItem('temp_login_data');
      
      toast.success(`✅ Connexion ${role} réussie avec sécurité renforcée`);
    } catch (error) {
      console.error('❌ [FIXED_LOGIN] Erreur lors de la connexion:', error);
      toast.error('Erreur lors de la connexion');
      localStorage.removeItem('temp_login_data');
    }
  };

  const handleRecaptchaError = (error: string) => {
    console.error('❌ [FIXED_LOGIN] Erreur reCAPTCHA:', error);
    toast.error('Vérification de sécurité échouée');
    localStorage.removeItem('temp_login_data');
  };

  const handleDirectLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // LOGIQUE CLAIRE ET DÉFINITIVE
    if (requiresRecaptcha) {
      // Admin/Superviseur avec reCAPTCHA configuré → Stockage temporaire
      console.log(`🔒 [FIXED_LOGIN] ${role} avec reCAPTCHA configuré - stockage temporaire`);
      localStorage.setItem('temp_login_data', JSON.stringify({
        email: loginForm.email,
        password: loginForm.password
      }));
      toast.info('🔒 Préparation de la vérification de sécurité...');
      // Le composant RecaptchaVerification prendra le relais
    } else {
      // Agent OU Admin/Superviseur sans reCAPTCHA → Connexion directe
      const connectionType = role === 'agent' ? 'Agent (bypass automatique)' : `${role} (reCAPTCHA non configuré)`;
      console.log(`⚡ [FIXED_LOGIN] Connexion directe: ${connectionType}`);
      
      try {
        await onLogin(loginForm.email, loginForm.password);
        toast.success(`✅ Connexion ${role} réussie`);
      } catch (error) {
        console.error('❌ [FIXED_LOGIN] Erreur connexion directe:', error);
      }
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
