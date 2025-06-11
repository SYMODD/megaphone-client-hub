
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldX, Loader2, Info } from "lucide-react";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";

interface RecaptchaStatusIndicatorProps {
  context?: 'login' | 'document_selection' | 'general';
  size?: 'sm' | 'md' | 'lg';
  showDebug?: boolean;
}

export const RecaptchaStatusIndicator: React.FC<RecaptchaStatusIndicatorProps> = ({ 
  context = 'general',
  size = 'md',
  showDebug = false
}) => {
  const { isConfigured, isLoading, error, siteKey, secretKey } = useRecaptchaSettings();
  const { profile } = useAuth();

  // Logs de debug détaillés
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

  if (isLoading) {
    console.log('⏳ [INDICATOR] État de chargement');
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-xs">Vérification...</span>
      </Badge>
    );
  }

  if (error) {
    console.log('❌ [INDICATOR] État d\'erreur:', error);
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <ShieldX className="w-3 h-3" />
        <span className="text-xs">Erreur reCAPTCHA</span>
      </Badge>
    );
  }

  // Détermine si reCAPTCHA est nécessaire pour ce contexte et ce rôle
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

  // Si reCAPTCHA n'est pas requis pour ce contexte/rôle
  if (!isRequired) {
    console.log('⏭️ [INDICATOR] reCAPTCHA non requis pour ce contexte');
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-500" />
          <span className="text-xs">reCAPTCHA non requis</span>
        </Badge>
        {showDebug && (
          <span className="text-xs text-slate-500">
            (Contexte: {context}, Rôle: {profile?.role || 'non défini'})
          </span>
        )}
      </div>
    );
  }

  // Si reCAPTCHA est requis mais non configuré
  if (!isConfigured) {
    console.log('⚠️ [INDICATOR] reCAPTCHA requis mais non configuré');
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-800 border-yellow-300">
          <ShieldX className="w-3 h-3" />
          <span className="text-xs">reCAPTCHA non configuré</span>
        </Badge>
        {showDebug && (
          <span className="text-xs text-yellow-600">
            (Clés manquantes: Site={!siteKey ? '❌' : '✅'}, Secret={!secretKey ? '❌' : '✅'})
          </span>
        )}
      </div>
    );
  }

  // Si reCAPTCHA est requis et configuré
  console.log('✅ [INDICATOR] reCAPTCHA requis et configuré');
  return (
    <div className="flex items-center gap-2">
      <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-300">
        <ShieldCheck className="w-3 h-3" />
        <span className="text-xs">reCAPTCHA actif</span>
      </Badge>
      {showDebug && (
        <span className="text-xs text-green-600">
          (Contexte: {context}, Configuré: ✅)
        </span>
      )}
    </div>
  );
};
