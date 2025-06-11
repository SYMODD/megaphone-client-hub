
import { useState } from 'react';
import { useRecaptchaSettings, notifyRecaptchaSettingsUpdate } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";

export const useRecaptchaStatusLogic = (context: string) => {
  const { isConfigured, isLoading, error, siteKey, secretKey, refreshSettings } = useRecaptchaSettings();
  const { profile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('🎯 [STATUS_LOGIC] Analyse du statut reCAPTCHA:', {
    context,
    userRole: profile?.role,
    isConfigured,
    isLoading,
    error,
    hasSiteKey: !!siteKey,
    hasSecretKey: !!secretKey
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('🔄 [STATUS_LOGIC] REFRESH MANUEL SUPER AGRESSIF');
    
    try {
      // Délai visuel court
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Triple refresh pour garantir la synchronisation
      console.log('🔄 [STATUS_LOGIC] Triple refresh en cours...');
      
      // Refresh 1
      refreshSettings();
      
      // Refresh 2 après 100ms
      setTimeout(() => {
        console.log('🔄 [STATUS_LOGIC] Refresh 2/3');
        refreshSettings();
      }, 100);
      
      // Refresh 3 après 300ms
      setTimeout(() => {
        console.log('🔄 [STATUS_LOGIC] Refresh 3/3');
        refreshSettings();
      }, 300);
      
      // Notification globale en plus
      setTimeout(() => {
        console.log('🔄 [STATUS_LOGIC] Notification globale supplémentaire');
        notifyRecaptchaSettingsUpdate();
      }, 500);
      
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  // Logique d'exigence simplifiée et plus claire
  const isRequiredForContext = () => {
    const userRole = profile?.role || '';
    
    console.log('🔍 [STATUS_LOGIC] Vérification des exigences reCAPTCHA:', {
      context,
      userRole,
      règles: {
        login: 'Admin/Superviseur seulement',
        document_selection: 'Agent seulement', 
        general: 'Aucune exigence'
      }
    });

    switch (context) {
      case 'login':
        return ['admin', 'superviseur'].includes(userRole);
      case 'document_selection':
        return userRole === 'agent';
      default:
        return false;
    }
  };

  const isRequired = isRequiredForContext();
  
  console.log('📋 [STATUS_LOGIC] Résultat final:', {
    context,
    userRole: profile?.role,
    isRequired: isRequired ? 'OUI' : 'NON',
    isConfigured: isConfigured ? 'OUI' : 'NON',
    conclusion: isRequired && isConfigured ? 'ACTIF' : 
                isRequired && !isConfigured ? 'REQUIS MAIS NON CONFIGURÉ' : 
                'NON REQUIS OU BYPASS'
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
