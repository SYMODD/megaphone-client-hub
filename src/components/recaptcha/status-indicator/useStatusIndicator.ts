
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";
import { StatusDecision, StatusDisplayInfo } from './types';
import { ShieldCheck, AlertTriangle, ShieldX } from "lucide-react";

export const useStatusIndicator = (context: string) => {
  const { isConfigured, isLoading, error, refreshSettings } = useRecaptchaSettings();
  const { profile } = useAuth();

  const getStatusDecision = (): StatusDecision => {
    console.log('🎯 [STATUS] Analyse du contexte:', {
      context,
      userRole: profile?.role || 'NON_CONNECTE',
      isConfigured,
      timestamp: new Date().toISOString()
    });
    
    // RÈGLE 1 : Contexte de login (pages de connexion)
    if (context === 'login') {
      console.log('🔑 [STATUS] Page de login détectée, statut basé sur configuration');
      return isConfigured ? 'SECURITE_ACTIVE' : 'SECURITE_RECOMMANDEE';
    }
    
    // RÈGLE 2 : Contexte agent ou utilisateur connecté en tant qu'agent
    if (context.includes('agent') || profile?.role === 'agent') {
      console.log('⚡ [STATUS] Contexte agent - Non applicable');
      return 'NON_APPLICABLE';
    }
    
    // RÈGLE 3 : Utilisateurs admin/superviseur connectés
    if (profile && ['admin', 'superviseur'].includes(profile.role)) {
      console.log('🔒 [STATUS] Admin/Superviseur connecté:', {
        role: profile.role,
        isConfigured
      });
      return isConfigured ? 'SECURITE_ACTIVE' : 'SECURITE_RECOMMANDEE';
    }
    
    // RÈGLE 4 : Contexte général
    if (context === 'general') {
      console.log('🔍 [STATUS] Contexte général');
      return isConfigured ? 'SECURITE_ACTIVE' : 'SECURITE_RECOMMANDEE';
    }
    
    // RÈGLE 5 : Autres cas - non applicable par défaut
    console.log('⚡ [STATUS] Contexte non spécifique - Non applicable');
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
          text: '⚡ reCAPTCHA non requis',
          bgColor: 'bg-gray-100 border-gray-300',
          textColor: 'text-gray-600'
        };
    }
  };

  const decision = getStatusDecision();
  const displayInfo = getDisplayInfo(decision);

  console.log('🎯 [STATUS] Décision finale:', {
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
    shouldHide: decision === 'NON_APPLICABLE' && context.includes('agent')
  };
};
