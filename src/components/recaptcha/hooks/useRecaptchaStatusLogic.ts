
import { useState } from 'react';
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";

export const useRecaptchaStatusLogic = (context: string) => {
  const { isConfigured, isLoading, error, siteKey, secretKey, refreshSettings } = useRecaptchaSettings();
  const { profile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('🎯 [INDICATOR] Rendu RecaptchaStatusIndicator:', {
    context,
    userRole: profile?.role,
    isConfigured,
    isLoading,
    error,
    hasSiteKey: !!siteKey,
    hasSecretKey: !!secretKey,
    siteKeyPreview: siteKey ? siteKey.substring(0, 20) + '...' : 'null',
    secretKeyPreview: secretKey ? secretKey.substring(0, 20) + '...' : 'null'
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('🔄 [INDICATOR] Refresh manuel déclenché');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Délai visuel
      refreshSettings();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const isRequiredForContext = () => {
    const userRole = profile?.role || '';
    console.log('🔍 [INDICATOR] Vérification des exigences:', {
      context,
      userRole,
      isAdminOrSuperviseur: ['admin', 'superviseur'].includes(userRole),
      isAgent: userRole === 'agent'
    });

    switch (context) {
      case 'login':
        return ['admin', 'superviseur'].includes(userRole);
      case 'document_selection':
        return userRole === 'agent';
      default:
        return false; // Pour le contexte général, on vérifie juste la configuration
    }
  };

  const isRequired = isRequiredForContext();
  
  console.log('📋 [INDICATOR] Analyse finale:', {
    isRequired,
    isConfigured,
    context,
    userRole: profile?.role
  });

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
