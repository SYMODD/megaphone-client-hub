
import React from 'react';
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldX, RefreshCw, Loader2, AlertTriangle } from "lucide-react";

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

  console.log('🎯 [FIXED_INDICATOR] Indicateur avec logique finale:', {
    context,
    userRole: profile?.role,
    isConfigured,
    decision: getStatusDecision()
  });

  function getStatusDecision() {
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
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-xs">Vérification...</span>
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
          <span className="text-xs">Erreur config</span>
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

  const decision = getStatusDecision();
  
  const getDisplayInfo = () => {
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
