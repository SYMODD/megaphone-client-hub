
import { useState } from 'react';
import { useRecaptchaSettings } from '@/hooks/useRecaptchaSettings';
import { useAuth } from '@/contexts/AuthContext';
import { recaptchaService } from '@/services/recaptchaService';
import { toast } from 'sonner';
import { RequirementDecision } from './types';

export const useRecaptchaVerification = (action: string) => {
  const { siteKey, isConfigured, isLoading } = useRecaptchaSettings();
  const { profile } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  const determineRequirement = (): RequirementDecision => {
    // RÈGLES UNIFIÉES CLAIRES :
    // - Agent : TOUJOURS bypass (même si reCAPTCHA configuré)
    // - Admin/Superviseur sur login : REQUIS si configuré
    // - Tout le reste : BYPASS
    const userRole = profile?.role || '';
    
    // RÈGLE 1 : Les agents sont TOUJOURS en bypass
    if (userRole === 'agent') {
      return 'BYPASS_AGENT';
    }
    
    // RÈGLE 2 : Admin/Superviseur sur login
    if (action.includes('login') && ['admin', 'superviseur'].includes(userRole)) {
      return isConfigured ? 'VERIFICATION_REQUISE' : 'ERREUR_NON_CONFIGURE';
    }
    
    // RÈGLE 3 : Tout le reste en bypass
    return 'BYPASS_GENERAL';
  };

  const executeVerification = async (onSuccess: (token: string) => void, onError?: (error: string) => void) => {
    console.log('🔒 [UNIFIED_VERIFICATION] Vérification REQUISE pour:', action);

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

  console.log('🔍 [UNIFIED_VERIFICATION] Vérification:', {
    action,
    userRole: profile?.role,
    isConfigured,
    decision: determineRequirement()
  });

  return {
    isLoading,
    isVerifying,
    requirement: determineRequirement(),
    executeVerification
  };
};
