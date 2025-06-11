
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

  console.log('🔍 [RECAPTCHA_VERIFICATION] État actuel:', {
    action,
    isConfigured,
    siteKey: siteKey ? siteKey.substring(0, 20) + '...' : 'null',
    disabled,
    isVerifying,
    shouldBypass: !isConfigured
  });

  // Si reCAPTCHA est en cours de chargement, on rend les enfants directement
  if (isLoading) {
    console.log('⏳ [RECAPTCHA_VERIFICATION] Chargement en cours, rendu direct des enfants');
    return <>{children}</>;
  }

  // CORRECTION MAJEURE : Si reCAPTCHA n'est pas configuré, on rend les enfants directement SANS modification
  if (!isConfigured || !siteKey) {
    console.log('⚡ [RECAPTCHA_VERIFICATION] reCAPTCHA non configuré - Rendu direct des enfants (BYPASS TOTAL)');
    return <>{children}</>;
  }

  const handleVerification = async () => {
    console.log('🔍 [RECAPTCHA_VERIFICATION] Début de la vérification pour:', action);

    if (disabled || isVerifying) {
      console.warn('⚠️ [RECAPTCHA_VERIFICATION] Vérification bloquée:', { disabled, isVerifying });
      return;
    }

    try {
      setIsVerifying(true);
      console.log(`🔍 [RECAPTCHA_VERIFICATION] Démarrage de la vérification pour l'action: ${action}`);
      
      toast.info('🔒 Vérification de sécurité en cours...', {
        duration: 2000,
      });
      
      const token = await recaptchaService.executeRecaptcha(siteKey, action);
      
      console.log(`✅ [RECAPTCHA_VERIFICATION] Vérification réussie pour l'action: ${action}`);
      
      toast.success('✅ Vérification de sécurité réussie', {
        duration: 1500,
      });
      
      onSuccess(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de vérification';
      console.error(`❌ [RECAPTCHA_VERIFICATION] Échec de la vérification pour l'action ${action}:`, error);
      
      toast.error(`❌ Échec de la vérification: ${errorMessage}`, {
        duration: 4000,
      });
      
      onError?.(errorMessage);
    } finally {
      setIsVerifying(false);
      console.log(`🏁 [RECAPTCHA_VERIFICATION] Fin de la vérification pour l'action: ${action}`);
    }
  };

  // CORRECTION MAJEURE : Cloner l'élément enfant et REMPLACER complètement son onClick
  console.log('🔒 [RECAPTCHA_VERIFICATION] Enveloppement actif avec reCAPTCHA pour:', action);
  
  return React.cloneElement(children as React.ReactElement, {
    onClick: handleVerification, // REMPLACE complètement l'onClick original
    disabled: disabled || isVerifying,
    className: `${(children as React.ReactElement).props.className || ''} ${
      isVerifying ? 'opacity-75 cursor-wait' : ''
    }`.trim(),
    children: isVerifying ? (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span>Vérification...</span>
      </div>
    ) : (children as React.ReactElement).props.children
  });
};
