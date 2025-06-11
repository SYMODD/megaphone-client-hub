
import React, { useState } from 'react';
import { useRecaptchaSettings } from '@/hooks/useRecaptchaSettings';
import { recaptchaService } from '@/services/recaptchaService';
import { toast } from 'sonner';

interface RecaptchaVerificationProps {
  action: string;
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const RecaptchaVerification: React.FC<RecaptchaVerificationProps> = ({
  action,
  onSuccess,
  onError,
  children,
  disabled = false
}) => {
  const { siteKey, isConfigured, isLoading } = useRecaptchaSettings();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerification = async () => {
    // CORRECTION CRITIQUE : Vérification stricte de la configuration
    if (!isConfigured || !siteKey) {
      const error = 'reCAPTCHA non configuré. Accès bloqué pour des raisons de sécurité.';
      console.error('❌ [PRODUCTION SECURITY BLOCK]', error);
      onError?.(error);
      toast.error('Service de sécurité non disponible. Contactez l\'administrateur.');
      return;
    }

    if (disabled || isVerifying) {
      return;
    }

    try {
      setIsVerifying(true);
      console.log(`🔒 [PRODUCTION] Démarrage vérification reCAPTCHA obligatoire pour: ${action}`);
      
      const token = await recaptchaService.executeRecaptcha(siteKey, action);
      
      if (!token || token.length === 0) {
        throw new Error('Token reCAPTCHA invalide - Sécurité compromise');
      }
      
      console.log(`✅ [PRODUCTION] reCAPTCHA validé avec succès pour: ${action}, token length:`, token.length);
      onSuccess(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Échec de la vérification de sécurité';
      console.error(`❌ [PRODUCTION SECURITY] Échec reCAPTCHA pour ${action}:`, error);
      onError?.(errorMessage);
      toast.error('Vérification de sécurité échouée. Accès refusé.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Si reCAPTCHA est en cours de chargement
  if (isLoading) {
    return React.cloneElement(children as React.ReactElement, {
      disabled: true,
      style: { opacity: 0.6 }
    });
  }

  // SÉCURITÉ RENFORCÉE : Si reCAPTCHA n'est pas configuré, bloquer complètement
  if (!isConfigured) {
    console.warn('⚠️ [PRODUCTION SECURITY] reCAPTCHA non configuré - BLOCAGE TOTAL');
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => {
        toast.error('Service de sécurité non configuré. Accès refusé.');
      },
      disabled: true,
      style: { opacity: 0.6, cursor: 'not-allowed' }
    });
  }

  // Cloner l'élément enfant et ajouter le gestionnaire de clic
  return React.cloneElement(children as React.ReactElement, {
    onClick: handleVerification,
    disabled: disabled || isVerifying
  });
};
