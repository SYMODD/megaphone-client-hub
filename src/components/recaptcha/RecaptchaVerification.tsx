
import React, { useState } from 'react';
import { useRecaptchaSettings } from '@/hooks/useRecaptchaSettings';
import { useAuth } from '@/contexts/AuthContext';
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
  const { profile } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  console.log('🔍 [UNIFIED_VERIFICATION] Vérification unifiée:', {
    action,
    userRole: profile?.role,
    isConfigured,
    decision: determineRequirement()
  });

  function determineRequirement() {
    // RÈGLES UNIFIÉES :
    // - Admin/Superviseur sur login : REQUIS
    // - Tout le reste : BYPASS
    const userRole = profile?.role || '';
    
    if (action === 'login' && ['admin', 'superviseur'].includes(userRole)) {
      return isConfigured ? 'VERIFICATION_REQUISE' : 'ERREUR_NON_CONFIGURE';
    }
    
    return 'BYPASS_TOTAL';
  }

  // Chargement : rendu direct
  if (isLoading) {
    console.log('⏳ [UNIFIED_VERIFICATION] Chargement → Bypass');
    return <>{children}</>;
  }

  const requirement = determineRequirement();

  // BYPASS TOTAL pour tous sauf Admin/Superviseur sur login
  if (requirement === 'BYPASS_TOTAL') {
    console.log('⚡ [UNIFIED_VERIFICATION] BYPASS TOTAL');
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
    console.log('🔒 [UNIFIED_VERIFICATION] Vérification REQUISE pour:', action);

    if (disabled || isVerifying) {
      return;
    }

    try {
      setIsVerifying(true);
      
      toast.info('🔒 Vérification de sécurité...', { duration: 2000 });
      
      const token = await recaptchaService.executeRecaptcha(siteKey!, action);
      
      console.log(`✅ [UNIFIED_VERIFICATION] SUCCÈS: ${action}`);
      toast.success('✅ Vérification réussie', { duration: 1500 });
      
      onSuccess(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de vérification';
      console.error(`❌ [UNIFIED_VERIFICATION] ÉCHEC ${action}:`, error);
      
      toast.error(`❌ ${errorMessage}`, { duration: 4000 });
      onError?.(errorMessage);
    } finally {
      setIsVerifying(false);
    }
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
