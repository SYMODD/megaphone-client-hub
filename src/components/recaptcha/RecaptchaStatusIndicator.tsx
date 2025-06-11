
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ShieldX, RefreshCw, Loader2 } from "lucide-react";
import { useStatusIndicator } from './status-indicator/useStatusIndicator';
import { StatusBadge } from './status-indicator/StatusBadge';

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
  const {
    isLoading,
    error,
    decision,
    displayInfo,
    refreshSettings,
    userRole,
    shouldHide
  } = useStatusIndicator(context);

  // Masquer pour les agents - ils n'ont pas besoin de voir le statut reCAPTCHA
  if (shouldHide) {
    return null;
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

  return (
    <StatusBadge
      displayInfo={displayInfo}
      showRefreshButton={showRefreshButton}
      onRefresh={refreshSettings}
      context={context}
      userRole={userRole}
      decision={decision}
      showDebug={showDebug}
    />
  );
};
