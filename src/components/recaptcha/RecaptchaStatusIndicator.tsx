
import React from 'react';
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldX, RefreshCw, Loader2 } from "lucide-react";

interface RecaptchaStatusIndicatorProps {
  context?: string;
  size?: 'sm' | 'md' | 'lg';
  showDebug?: boolean;
  showRefreshButton?: boolean;
}

export const RecaptchaStatusIndicator: React.FC<RecaptchaStatusIndicatorProps> = ({ 
  context = 'general',
  size = 'md',
  showDebug = false,
  showRefreshButton = true
}) => {
  const { isConfigured, isLoading, error, refreshSettings } = useRecaptchaSettings();
  const { profile } = useAuth();

  console.log('🎯 [UNIFIED_INDICATOR] État simple:', {
    context,
    userRole: profile?.role,
    isConfigured,
    isLoading,
    error: !!error
  });

  // LOGIQUE UNIFIÉE SIMPLE
  const getDisplayInfo = () => {
    const userRole = profile?.role || '';
    
    // RÈGLES SIMPLES :
    // - Admin/Superviseur : TOUJOURS besoin de reCAPTCHA
    // - Agent : JAMAIS besoin de reCAPTCHA (désactivé volontairement)
    // - Contexte document_selection : TOUJOURS désactivé
    
    if (context === 'document_selection') {
      return {
        variant: 'secondary' as const,
        icon: ShieldX,
        text: 'reCAPTCHA désactivé',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 border-gray-300'
      };
    }

    if (['admin', 'superviseur'].includes(userRole)) {
      if (isConfigured) {
        return {
          variant: 'default' as const,
          icon: ShieldCheck,
          text: 'reCAPTCHA actif',
          color: 'text-green-800',
          bgColor: 'bg-green-100 border-green-300'
        };
      } else {
        return {
          variant: 'destructive' as const,
          icon: ShieldX,
          text: 'reCAPTCHA requis',
          color: 'text-red-800',
          bgColor: 'bg-red-100 border-red-300'
        };
      }
    }

    // Agent ou autres rôles
    return {
      variant: 'outline' as const,
      icon: ShieldX,
      text: 'reCAPTCHA non requis',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 border-gray-300'
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-xs">Chargement...</span>
        </Badge>
        {showRefreshButton && (
          <button
            onClick={refreshSettings}
            className="p-1 hover:bg-gray-100 rounded"
            title="Actualiser"
          >
            <RefreshCw className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="flex items-center gap-1">
          <ShieldX className="w-3 h-3" />
          <span className="text-xs">Erreur</span>
        </Badge>
        {showRefreshButton && (
          <button
            onClick={refreshSettings}
            className="p-1 hover:bg-gray-100 rounded"
            title="Réessayer"
          >
            <RefreshCw className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>
    );
  }

  const displayInfo = getDisplayInfo();
  const IconComponent = displayInfo.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={displayInfo.variant} 
        className={`flex items-center gap-1 ${displayInfo.bgColor} ${displayInfo.color}`}
      >
        <IconComponent className="w-3 h-3" />
        <span className="text-xs">{displayInfo.text}</span>
      </Badge>
      {showDebug && (
        <span className="text-xs text-gray-600">
          (Contexte: {context}, Rôle: {profile?.role}, Configuré: {isConfigured ? 'OUI' : 'NON'})
        </span>
      )}
      {showRefreshButton && (
        <button
          onClick={refreshSettings}
          className="p-1 hover:bg-gray-100 rounded"
          title="Actualiser"
        >
          <RefreshCw className="w-3 h-3 text-gray-500" />
        </button>
      )}
    </div>
  );
};
