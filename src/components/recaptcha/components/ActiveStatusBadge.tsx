
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { StatusBadgeProps } from "../types/statusIndicatorTypes";

interface ActiveStatusBadgeProps extends StatusBadgeProps {}

export const ActiveStatusBadge: React.FC<ActiveStatusBadgeProps> = ({ 
  showDebug, 
  showRefreshButton, 
  context, 
  onRefresh 
}) => {
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
      {showRefreshButton && onRefresh && (
        <button
          onClick={onRefresh}
          className="p-1 hover:bg-gray-100 rounded"
          title="Actualiser le statut"
        >
          <RefreshCw className="w-3 h-3 text-gray-500" />
        </button>
      )}
    </div>
  );
};
