
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

  // Masquer pour les agents - ils n'ont pas besoin de voir le statut reCAPTCHA
  if (profile?.role === 'agent') {
    return null;
  }

  console.log('🎯 [FIXED_INDICATOR] Indicateur corrigé:', {
    context,
    userRole: profile?.role,
    isConfigured,
    decision: getDecision()
  });

  function getDecision() {
    const userRole = profile?.role || '';
    
    // RÈGLES CORRIGÉES ET CLAIRES
    if (context === 'login' && ['admin', 'superviseur'].includes(userRole)) {
      // Pour login admin/superviseur : si configuré = ACTIF, sinon = REQUIS_NON_CONFIGURÉ
      return isConfigured ? 'RECAPTCHA_ACTIF' : 'REQUIS_MAIS_NON_CONFIGURÉ';
    }
    
    if (context === 'document_selection') {
      // Sélection documents = toujours désactivé pour tous
      return 'DÉSACTIVÉ_POUR_TOUS';
    }
    
    // Général pour admin/superviseur = suit la configuration
    if (['admin', 'superviseur'].includes(userRole)) {
      return isConfigured ? 'RECAPTCHA_ACTIF' : 'REQUIS_MAIS_NON_CONFIGURÉ';
    }
    
    // Autres cas = non requis
    return 'NON_REQUIS';
  }

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

  const decision = getDecision();
  
  const getDisplayInfo = () => {
    switch (decision) {
      case 'RECAPTCHA_ACTIF':
        return {
          variant: 'default' as const,
          icon: ShieldCheck,
          text: 'reCAPTCHA actif',
          bgColor: 'bg-green-100 border-green-300',
          textColor: 'text-green-800'
        };
      
      case 'REQUIS_MAIS_NON_CONFIGURÉ':
        return {
          variant: 'destructive' as const,
          icon: ShieldX,
          text: 'reCAPTCHA requis',
          bgColor: 'bg-red-100 border-red-300',
          textColor: 'text-red-800'
        };
      
      case 'DÉSACTIVÉ_POUR_TOUS':
        return {
          variant: 'secondary' as const,
          icon: ShieldX,
          text: 'reCAPTCHA désactivé',
          bgColor: 'bg-gray-100 border-gray-300',
          textColor: 'text-gray-600'
        };
      
      default: // NON_REQUIS
        return {
          variant: 'outline' as const,
          icon: ShieldX,
          text: 'reCAPTCHA non requis',
          bgColor: 'bg-blue-100 border-blue-300',
          textColor: 'text-blue-800'
        };
    }
  };

  const displayInfo = getDisplayInfo();
  const IconComponent = displayInfo.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={displayInfo.variant} 
        className={`flex items-center gap-1 ${displayInfo.bgColor} ${displayInfo.textColor}`}
      >
        <IconComponent className="w-3 h-3" />
        <span className="text-xs">{displayInfo.text}</span>
      </Badge>
      {showDebug && (
        <span className="text-xs text-gray-600">
          (Contexte: {context}, Rôle: {profile?.role}, Décision: {decision})
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
