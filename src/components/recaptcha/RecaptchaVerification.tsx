
import React, { useState, useEffect } from 'react';
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
    if (!isConfigured || !siteKey) {
      const error = 'reCAPTCHA non configuré';
      console.error('❌', error);
      onError?.(error);
      toast.error('Service de sécurité non disponible');
      return;
    }

    if (disabled || isVerifying) {
      return;
    }

    try {
      setIsVerifying(true);
      console.log(`🔍 Starting reCAPTCHA verification for action: ${action}`);
      
      const token = await recaptchaService.executeRecaptcha(siteKey, action);
      
      console.log(`✅ reCAPTCHA verification successful for action: ${action}`);
      onSuccess(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de vérification';
      console.error(`❌ reCAPTCHA verification failed for action ${action}:`, error);
      onError?.(errorMessage);
      toast.error('Échec de la vérification de sécurité');
    } finally {
      setIsVerifying(false);
    }
  };

  // Si reCAPTCHA n'est pas configuré, on rend les enfants directement
  if (isLoading) {
    return <>{children}</>;
  }

  if (!isConfigured) {
    console.warn('⚠️ reCAPTCHA not configured, bypassing verification');
    return <>{children}</>;
  }

  // Cloner l'élément enfant et ajouter le gestionnaire de clic
  return React.cloneElement(children as React.ReactElement, {
    onClick: handleVerification,
    disabled: disabled || isVerifying
  });
};
