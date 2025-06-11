
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
      const error = 'reCAPTCHA non configuré en production';
      console.error('❌ [PRODUCTION]', error);
      onError?.(error);
      toast.error('Service de sécurité non disponible');
      return;
    }

    if (disabled || isVerifying) {
      return;
    }

    try {
      setIsVerifying(true);
      console.log(`🔍 [PRODUCTION] Starting reCAPTCHA verification for action: ${action}`);
      
      // Afficher un toast de début de vérification
      toast.info('🔒 Vérification de sécurité en cours...', {
        duration: 2000,
      });
      
      const token = await recaptchaService.executeRecaptcha(siteKey, action);
      
      console.log(`✅ [PRODUCTION] reCAPTCHA verification successful for action: ${action}`);
      
      // Afficher un toast de succès
      toast.success('✅ Vérification de sécurité réussie', {
        duration: 1500,
      });
      
      onSuccess(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de vérification';
      console.error(`❌ [PRODUCTION] reCAPTCHA verification failed for action ${action}:`, error);
      
      // Afficher un toast d'erreur détaillé
      toast.error(`❌ Échec de la vérification: ${errorMessage}`, {
        duration: 4000,
      });
      
      onError?.(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  // Si reCAPTCHA n'est pas configuré, on rend les enfants directement
  if (isLoading) {
    return <>{children}</>;
  }

  if (!isConfigured) {
    console.warn('⚠️ [PRODUCTION] reCAPTCHA not configured, bypassing verification');
    return <>{children}</>;
  }

  // Cloner l'élément enfant et ajouter le gestionnaire de clic avec indication visuelle
  return React.cloneElement(children as React.ReactElement, {
    onClick: handleVerification,
    disabled: disabled || isVerifying,
    className: `${(children as React.ReactElement).props.className || ''} ${
      isVerifying ? 'opacity-75 cursor-wait' : ''
    }`.trim(),
    children: isVerifying ? (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Vérification...
      </div>
    ) : (children as React.ReactElement).props.children
  });
};
