
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";
import { StatusDecision, StatusDisplayInfo } from './types';
import { ShieldCheck, AlertTriangle, ShieldX } from "lucide-react";

export const useStatusIndicator = (context: string) => {
  const { isConfigured, isLoading, error, refreshSettings } = useRecaptchaSettings();
  const { profile } = useAuth();

  const getStatusDecision = (): StatusDecision => {
    // LOGIQUE CORRIGÉE : Analyser le CONTEXTE au lieu du rôle uniquement
    // Car pour les pages de login, l'utilisateur n'est pas encore connecté
    
    console.log('🎯 [CORRECTED_STATUS] Analyse du contexte:', {
      context,
      userRole: profile?.role || 'NON_CONNECTE',
      isConfigured
    });
    
    // RÈGLE 1 : Contexte de login (admin/superviseur)
    if (context === 'login') {
      // Sur les pages de login, le statut dépend de la configuration
      return isConfigured ? 'SECURITE_ACTIVE' : 'SECURITE_RECOMMANDEE';
    }
    
    // RÈGLE 2 : Contexte agent ou utilisateur connecté en tant qu'agent
    if (context.includes('agent') || profile?.role === 'agent') {
      return 'NON_APPLICABLE';
    }
    
    // RÈGLE 3 : Autres contextes pour admin/superviseur connectés
    if (profile && ['admin', 'superviseur'].includes(profile.role)) {
      return isConfigured ? 'SECURITE_ACTIVE' : 'SECURITE_RECOMMANDEE';
    }
    
    // RÈGLE 4 : Contextes généraux
    if (context === 'general') {
      return isConfigured ? 'SECURITE_ACTIVE' : 'SECURITE_RECOMMANDEE';
    }
    
    // RÈGLE 5 : Autres cas
    return 'NON_APPLICABLE';
  };

  const getDisplayInfo = (decision: StatusDecision): StatusDisplayInfo => {
    switch (decision) {
      case 'SECURITE_ACTIVE':
        return {
          variant: 'default' as const,
          icon: ShieldCheck,
          text: '🔒 reCAPTCHA actif',
          bgColor: 'bg-green-100 border-green-300',
          textColor: 'text-green-800'
        };
      
      case 'SECURITE_RECOMMANDEE':
        return {
          variant: 'outline' as const,
          icon: AlertTriangle,
          text: '⚠️ reCAPTCHA recommandé',
          bgColor: 'bg-amber-100 border-amber-300',
          textColor: 'text-amber-800'
        };
      
      default: // NON_APPLICABLE
        return {
          variant: 'outline' as const,
          icon: ShieldX,
          text: 'Non applicable',
          bgColor: 'bg-gray-100 border-gray-300',
          textColor: 'text-gray-600'
        };
    }
  };

  const decision = getStatusDecision();
  const displayInfo = getDisplayInfo(decision);

  console.log('🎯 [CORRECTED_STATUS] Décision finale:', {
    context,
    userRole: profile?.role || 'NON_CONNECTE',
    isConfigured,
    decision,
    statusText: displayInfo.text
  });

  return {
    isLoading,
    error,
    decision,
    displayInfo,
    refreshSettings,
    userRole: profile?.role || 'NON_CONNECTE',
    shouldHide: false // Ne plus masquer pour permettre le diagnostic
  };
};
