
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
    // RÈGLES CORRIGÉES : Analyser l'ACTION au lieu du rôle utilisateur
    // Car pendant le login, l'utilisateur n'est pas encore connecté
    
    // RÈGLE 1 : Actions d'agents - TOUJOURS bypass
    if (action.includes('agent') || action.includes('document_selection')) {
      return 'BYPASS_AGENT';
    }
    
    // RÈGLE 2 : Actions de login admin/superviseur
    if (action.includes('login') && (action.includes('admin') || action.includes('superviseur'))) {
      return isConfigured ? 'VERIFICATION_REQUISE' : 'ERREUR_NON_CONFIGURE';
    }
    
    // RÈGLE 3 : Pour les utilisateurs déjà connectés, vérifier leur rôle
    if (profile) {
      const userRole = profile.role || '';
      
      // Agents connectés : toujours bypass
      if (userRole === 'agent') {
        return 'BYPASS_AGENT';
      }
      
      // Admin/Superviseur connectés : vérification si configuré
      if (['admin', 'superviseur'].includes(userRole)) {
        return isConfigured ? 'VERIFICATION_REQUISE' : 'ERREUR_NON_CONFIGURE';
      }
    }
    
    // RÈGLE 4 : Tout le reste en bypass
    return 'BYPASS_GENERAL';
  };

  const executeVerification = async (onSuccess: (token: string) => void, onError?: (error: string) => void) => {
    console.log('🔒 [CORRECTED_VERIFICATION] Vérification REQUISE pour:', action);

    try {
      setIsVerifying(true);
      
      toast.info('🔒 Vérification de sécurité...', { duration: 2000 });
      
      const token = await recaptchaService.executeRecaptcha(siteKey!, action);
      
      console.log(`✅ [CORRECTED_VERIFICATION] SUCCÈS: ${action}`);
      toast.success('✅ Vérification réussie', { duration: 1500 });
      
      onSuccess(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de vérification';
      console.error(`❌ [CORRECTED_VERIFICATION] ÉCHEC ${action}:`, error);
      
      toast.error(`❌ ${errorMessage}`, { duration: 4000 });
      onError?.(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const requirement = determineRequirement();

  console.log('🔍 [CORRECTED_VERIFICATION] Analyse corrigée:', {
    action,
    userRole: profile?.role || 'NON_CONNECTE',
    isConfigured,
    decision: requirement,
    actionType: action.includes('login') ? 'LOGIN' : 
                action.includes('agent') ? 'AGENT_ACTION' : 
                'OTHER_ACTION'
  });

  return {
    isLoading,
    isVerifying,
    requirement,
    executeVerification
  };
};
