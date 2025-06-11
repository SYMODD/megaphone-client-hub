
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
    // Si reCAPTCHA n'est pas configuré, bloquer l'action
    if (!isConfigured || !siteKey) {
      const error = 'reCAPTCHA non configuré. Veuillez contacter l\'administrateur.';
      console.error('❌ [PRODUCTION BLOCK]', error);
      onError?.(error);
      toast.error('Service de sécurité non disponible. Contactez l\'administrateur.');
      return;
    }

    if (disabled || isVerifying) {
      return;
    }

    try {
      setIsVerifying(true);
      console.log(`🔍 [PRODUCTION] Starting reCAPTCHA verification for action: ${action}`);
      
      const token = await recaptchaService.executeRecaptcha(siteKey, action);
      
      if (!token || token.length === 0) {
        throw new Error('Token reCAPTCHA invalide ou vide');
      }
      
      console.log(`✅ [PRODUCTION] reCAPTCHA verification successful for action: ${action}, token length:`, token.length);
      onSuccess(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de vérification';
      console.error(`❌ [PRODUCTION] reCAPTCHA verification failed for action ${action}:`, error);
      onError?.(errorMessage);
      toast.error('Échec de la vérification de sécurité. Veuillez réessayer.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Si reCAPTCHA est en cours de chargement, afficher le contenu mais désactivé
  if (isLoading) {
    return React.cloneElement(children as React.ReactElement, {
      disabled: true,
      style: { opacity: 0.6 }
    });
  }

  // Si reCAPTCHA n'est pas configuré, bloquer l'interaction
  if (!isConfigured) {
    console.warn('⚠️ [PRODUCTION] reCAPTCHA not configured, BLOCKING user interaction');
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => {
        toast.error('Service de sécurité non configuré. Contactez l\'administrateur.');
      },
      disabled: true,
      style: { opacity: 0.6 }
    });
  }

  // Cloner l'élément enfant et ajouter le gestionnaire de clic
  return React.cloneElement(children as React.ReactElement, {
    onClick: handleVerification,
    disabled: disabled || isVerifying
  });
};
