
import React from 'react';
import { toast } from 'sonner';
import { useRecaptchaVerification } from './verification/useRecaptchaVerification';
import { RecaptchaVerificationProps } from './verification/types';

export const RecaptchaVerification: React.FC<RecaptchaVerificationProps> = ({
  action,
  onSuccess,
  onError,
  children,
  disabled = false
}) => {
  const {
    isLoading,
    isVerifying,
    requirement,
    executeVerification
  } = useRecaptchaVerification(action);

  // Chargement : rendu direct
  if (isLoading) {
    console.log('⏳ [UNIFIED_VERIFICATION] Chargement → Bypass temporaire');
    return <>{children}</>;
  }

  // BYPASS pour agents et autres cas
  if (requirement === 'BYPASS_AGENT' || requirement === 'BYPASS_GENERAL') {
    console.log(`⚡ [UNIFIED_VERIFICATION] ${requirement} - Rendu direct`);
    return <>{children}</>;
  }

  // Erreur de configuration pour Admin/Superviseur
  if (requirement === 'ERREUR_NON_CONFIGURE') {
    console.error('❌ [UNIFIED_VERIFICATION] Admin/Superviseur sans reCAPTCHA configuré');
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => {
        toast.error('❌ reCAPTCHA non configuré pour votre rôle');
        onError?.('reCAPTCHA non configuré');
      },
      disabled: true
    });
  }

  // VERIFICATION_REQUISE : Enveloppement actif
  const handleVerification = async () => {
    if (disabled || isVerifying) {
      return;
    }

    await executeVerification(onSuccess, onError);
  };

  console.log('🔒 [UNIFIED_VERIFICATION] ENVELOPPEMENT ACTIF pour:', action);
  
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
