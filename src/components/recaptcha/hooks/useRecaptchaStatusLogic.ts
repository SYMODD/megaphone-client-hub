
import { useState } from 'react';
import { useRecaptchaSettings, notifyRecaptchaSettingsUpdate } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";

export const useRecaptchaStatusLogic = (context: string) => {
  const { isConfigured, isLoading, error, siteKey, secretKey, refreshSettings } = useRecaptchaSettings();
  const { profile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('🎯 [STATUS_LOGIC] État reCAPTCHA unifié:', {
    context,
    userRole: profile?.role,
    isConfigured,
    isLoading,
    error,
    hasSiteKey: !!siteKey,
    hasSecretKey: !!secretKey,
    timestamp: new Date().toISOString()
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('🔄 [STATUS_LOGIC] REFRESH MANUEL DÉCLENCHÉ');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Triple refresh pour garantir la synchronisation
      refreshSettings();
      setTimeout(() => refreshSettings(), 100);
      setTimeout(() => refreshSettings(), 300);
      
      // Notification globale
      setTimeout(() => notifyRecaptchaSettingsUpdate(), 500);
      
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  // LOGIQUE UNIFIÉE : Simple et claire
  const getRequiredStatus = () => {
    const userRole = profile?.role || '';
    
    // Règles d'exigence reCAPTCHA claires
    const requirementRules = {
      login: ['admin', 'superviseur'],
      document_selection: ['agent'],
      general: []
    };

    const requiredRoles = requirementRules[context as keyof typeof requirementRules] || [];
    const isRequired = requiredRoles.includes(userRole);
    
    console.log('📋 [STATUS_LOGIC] LOGIQUE UNIFIÉE:', {
      context,
      userRole,
      requiredRoles,
      isRequired: isRequired ? 'OUI' : 'NON',
      isConfigured: isConfigured ? 'OUI' : 'NON',
      finalStatus: isRequired && isConfigured ? 'ACTIF ✅' : 
                   isRequired && !isConfigured ? 'REQUIS MAIS NON CONFIGURÉ ⚠️' : 
                   'NON REQUIS (BYPASS) ⚡'
    });

    return isRequired;
  };

  const isRequired = getRequiredStatus();

  return {
    isConfigured,
    isLoading,
    error,
    siteKey,
    secretKey,
    profile,
    isRefreshing,
    isRequired,
    handleRefresh
  };
};
