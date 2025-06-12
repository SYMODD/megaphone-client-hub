
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
    
    // RÈGLE 1 : Masquer complètement pour les agents (contexte agent OU utilisateur agent)
    if (context.includes('agent') || context === 'document_selection' || profile?.role === 'agent') {
      console.log('⚡ [STATUS] Agent détecté - Masquage complet');
      return 'NON_APPLICABLE';
    }
    
    // RÈGLE 2 : Contexte de login (pages de connexion admin/superviseur)
    if (context === 'login') {
      console.log('🔑 [STATUS] Page de login détectée, statut basé sur configuration');
      return isConfigured ? 'SECURITE_ACTIVE' : 'SECURITE_RECOMMANDEE';
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
          text: 'reCAPTCHA actif',
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-700'
        };
      
      case 'SECURITE_RECOMMANDEE':
        return {
          variant: 'outline' as const,
          icon: AlertTriangle,
          text: 'reCAPTCHA recommandé',
          bgColor: 'bg-amber-50 border-amber-200',
          textColor: 'text-amber-700'
        };
      
      default: // NON_APPLICABLE
        return {
          variant: 'outline' as const,
          icon: ShieldX,
          text: 'reCAPTCHA non requis',
          bgColor: 'bg-gray-50 border-gray-200',
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
    statusText: displayInfo.text,
    shouldHide: decision === 'NON_APPLICABLE'
  });

  return {
    isLoading,
    error,
    decision,
    displayInfo,
    refreshSettings,
    userRole: profile?.role || 'NON_CONNECTE',
    shouldHide: decision === 'NON_APPLICABLE'
  };
};
