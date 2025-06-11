
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

  console.log('🔍 [RECAPTCHA_VERIFICATION] ÉTAT UNIFIÉ:', {
    action,
    isConfigured: isConfigured ? 'OUI' : 'NON',
    siteKey: siteKey ? siteKey.substring(0, 20) + '...' : 'AUCUNE',
    disabled,
    isVerifying,
    isLoading,
    decision: isConfigured ? 'ENVELOPPEMENT ACTIF' : 'BYPASS TOTAL',
    timestamp: new Date().toISOString()
  });

  // Chargement : rendu direct
  if (isLoading) {
    console.log('⏳ [RECAPTCHA_VERIFICATION] Chargement → Rendu direct');
    return <>{children}</>;
  }

  // LOGIQUE UNIFIÉE : Si pas configuré → BYPASS TOTAL
  if (!isConfigured || !siteKey) {
    console.log('⚡ [RECAPTCHA_VERIFICATION] NON CONFIGURÉ → BYPASS TOTAL');
    return <>{children}</>;
  }

  // Configuré → Enveloppement actif avec reCAPTCHA
  const handleVerification = async () => {
    console.log('🔒 [RECAPTCHA_VERIFICATION] DÉMARRAGE vérification:', action);

    if (disabled || isVerifying) {
      console.warn('⚠️ [RECAPTCHA_VERIFICATION] Bloqué:', { disabled, isVerifying });
      return;
    }

    try {
      setIsVerifying(true);
      
      toast.info('🔒 Vérification de sécurité...', { duration: 2000 });
      
      const token = await recaptchaService.executeRecaptcha(siteKey, action);
      
      console.log(`✅ [RECAPTCHA_VERIFICATION] SUCCÈS pour: ${action}`);
      toast.success('✅ Vérification réussie', { duration: 1500 });
      
      onSuccess(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de vérification';
      console.error(`❌ [RECAPTCHA_VERIFICATION] ÉCHEC ${action}:`, error);
      
      toast.error(`❌ Échec: ${errorMessage}`, { duration: 4000 });
      onError?.(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  console.log('🔒 [RECAPTCHA_VERIFICATION] ENVELOPPEMENT ACTIF pour:', action);
  
  return React.cloneElement(children as React.ReactElement, {
    onClick: handleVerification,
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
