
import { useState } from 'react';
import { useRecaptchaSettings } from '@/hooks/useRecaptchaSettings';

export const useRoleLogin = (
  role: string,
  onLogin: (email: string, password: string) => Promise<void>
) => {
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const { isConfigured } = useRecaptchaSettings();

  // LOGIQUE CORRIGÉE : reCAPTCHA requis pour admin/superviseur si configuré
  const requiresRecaptcha = ['admin', 'superviseur'].includes(role) && isConfigured;

  const handleDirectLogin = async () => {
    console.log(`🔓 [ROLE_LOGIN] Login direct pour: ${role}`);
    await onLogin(loginForm.email, loginForm.password);
  };

  const handleLoginWithRecaptcha = async (token: string) => {
    console.log(`🔒 [ROLE_LOGIN] Login avec reCAPTCHA pour: ${role}`, {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...'
    });
    
    // Le token reCAPTCHA est validé côté client, procéder au login normal
    await onLogin(loginForm.email, loginForm.password);
  };

  const handleRecaptchaError = (error: string) => {
    console.error(`❌ [ROLE_LOGIN] Erreur reCAPTCHA pour ${role}:`, error);
    // L'erreur est déjà affichée par le composant reCAPTCHA
  };

  console.log('🎯 [ROLE_LOGIN] Configuration finale:', {
    role,
    isConfigured,
    requiresRecaptcha: requiresRecaptcha ? 'OUI ✅' : 'NON ❌',
    hasCredentials: !!(loginForm.email && loginForm.password),
    loginMethod: requiresRecaptcha ? 'AVEC_RECAPTCHA' : 'DIRECT'
  });

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
