
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
    console.log('🔍 [VERIFICATION] Analyse de l\'action:', {
      action,
      userRole: profile?.role || 'NON_CONNECTE',
      isConfigured,
      timestamp: new Date().toISOString()
    });

    // RÈGLE 1 : Actions d'agents - TOUJOURS bypass (aucune vérification)
    if (action.includes('agent') || action.includes('document_selection')) {
      console.log('⚡ [VERIFICATION] BYPASS_AGENT détecté - Aucune vérification');
      return 'BYPASS_AGENT';
    }
    
    // RÈGLE 2 : Actions de login admin/superviseur - NÉCESSITE CONFIGURATION STRICTE
    if (action.includes('login') && (action.includes('admin') || action.includes('superviseur'))) {
      console.log('🔒 [VERIFICATION] Login admin/superviseur détecté:', {
        isConfigured,
        siteKey: siteKey ? 'PRESENT' : 'ABSENT',
        decision: isConfigured && siteKey ? 'VERIFICATION_REQUISE' : 'ERREUR_NON_CONFIGURE'
      });
      
      // VALIDATION STRICTE : il faut isConfigured ET siteKey présente
      return (isConfigured && siteKey) ? 'VERIFICATION_REQUISE' : 'ERREUR_NON_CONFIGURE';
    }
    
    // RÈGLE 3 : Pour les utilisateurs déjà connectés, vérifier leur rôle
    if (profile) {
      const userRole = profile.role || '';
      
      // Agents connectés : toujours bypass
      if (userRole === 'agent') {
        console.log('⚡ [VERIFICATION] Utilisateur agent connecté - BYPASS');
        return 'BYPASS_AGENT';
      }
      
      // Admin/Superviseur connectés : vérification obligatoire si configuré
      if (['admin', 'superviseur'].includes(userRole)) {
        console.log('🔒 [VERIFICATION] Utilisateur admin/superviseur connecté:', {
          userRole,
          isConfigured,
          siteKey: siteKey ? 'PRESENT' : 'ABSENT',
          decision: (isConfigured && siteKey) ? 'VERIFICATION_REQUISE' : 'ERREUR_NON_CONFIGURE'
        });
        return (isConfigured && siteKey) ? 'VERIFICATION_REQUISE' : 'ERREUR_NON_CONFIGURE';
      }
    }
    
    // RÈGLE 4 : Tout le reste en bypass par défaut
    console.log('⚡ [VERIFICATION] BYPASS_GENERAL par défaut');
    return 'BYPASS_GENERAL';
  };

  const executeVerification = async (onSuccess: (token: string) => void, onError?: (error: string) => void) => {
    console.log('🔒 [VERIFICATION] Démarrage vérification pour:', action);

    try {
      setIsVerifying(true);
      
      // VALIDATION STRICTE des prérequis
      if (!siteKey || siteKey.trim() === '') {
        throw new Error('Configuration reCAPTCHA incomplète - clé publique manquante');
      }
      
      if (!isConfigured) {
        throw new Error('reCAPTCHA non configuré - veuillez configurer les clés');
      }
      
      toast.info('🔒 Vérification de sécurité en cours...', { duration: 2000 });
      
      console.log('🔍 [VERIFICATION] Exécution reCAPTCHA avec validation stricte:', {
        siteKey: siteKey.substring(0, 15) + '...',
        action,
        isConfigured
      });
      
      const token = await recaptchaService.executeRecaptcha(siteKey, action);
      
      console.log('✅ [VERIFICATION] Token reCAPTCHA généré avec succès:', {
        action,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...'
      });
      
      toast.success('✅ Vérification réussie', { duration: 1500 });
      onSuccess(token);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de vérification';
      console.error('❌ [VERIFICATION] Échec avec détails:', {
        action,
        error: errorMessage,
        siteKey: siteKey ? 'PRESENT' : 'ABSENT',
        isConfigured,
        fullError: error
      });
      
      toast.error(`❌ ${errorMessage}`, { duration: 4000 });
      onError?.(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const requirement = determineRequirement();

  console.log('🎯 [VERIFICATION] Décision finale avec validation stricte:', {
    action,
    userRole: profile?.role || 'NON_CONNECTE',
    isConfigured,
    siteKeyPresent: !!siteKey,
    requirement,
    willVerify: requirement === 'VERIFICATION_REQUISE'
  });

  return {
    isLoading,
    isVerifying,
    requirement,
    executeVerification
  };
};
