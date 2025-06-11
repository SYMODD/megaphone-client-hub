
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";
import { StatusDecision, StatusDisplayInfo } from './types';
import { ShieldCheck, AlertTriangle, ShieldX } from "lucide-react";

export const useStatusIndicator = (context: string) => {
  const { isConfigured, isLoading, error, refreshSettings } = useRecaptchaSettings();
  const { profile } = useAuth();

  const getStatusDecision = (): StatusDecision => {
    const userRole = profile?.role || '';
    
    // RÈGLES FINALES ET CLAIRES
    if (context === 'login' && ['admin', 'superviseur'].includes(userRole)) {
      // Login admin/superviseur : statut dépend de la configuration
      return isConfigured ? 'SECURITE_ACTIVE' : 'SECURITE_RECOMMANDEE';
    }
    
    // Autres contextes pour admin/superviseur
    if (['admin', 'superviseur'].includes(userRole)) {
      return isConfigured ? 'SECURITE_ACTIVE' : 'SECURITE_RECOMMANDEE';
    }
    
    // Autres cas
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

  console.log('🎯 [FIXED_INDICATOR] Indicateur avec logique finale:', {
    context,
    userRole: profile?.role,
    isConfigured,
    decision
  });

  return {
    isLoading,
    error,
    decision,
    displayInfo,
    refreshSettings,
    userRole: profile?.role,
    shouldHide: profile?.role === 'agent'
  };
};
