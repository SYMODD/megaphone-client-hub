
import React from 'react';
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
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

  console.log('🎯 [SIMPLE] Indicateur reCAPTCHA:', {
    context,
    isConfigured,
    isLoading,
    error: !!error
  });

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

  if (isConfigured) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-300">
          <ShieldCheck className="w-3 h-3" />
          <span className="text-xs">reCAPTCHA actif</span>
        </Badge>
        {showDebug && (
          <span className="text-xs text-green-600">
            (Contexte: {context}, Status: CONFIGURÉ ✅)
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
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 text-gray-600 border-gray-300">
        <ShieldX className="w-3 h-3" />
        <span className="text-xs">reCAPTCHA inactif</span>
      </Badge>
      {showDebug && (
        <span className="text-xs text-gray-600">
          (Contexte: {context}, Status: NON CONFIGURÉ ❌)
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
