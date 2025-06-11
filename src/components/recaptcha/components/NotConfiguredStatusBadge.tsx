
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ShieldX, RefreshCw } from "lucide-react";
import { StatusBadgeProps } from "../types/statusIndicatorTypes";

interface NotConfiguredStatusBadgeProps extends StatusBadgeProps {
  siteKey: string | null;
  secretKey: string | null;
}

export const NotConfiguredStatusBadge: React.FC<NotConfiguredStatusBadgeProps> = ({ 
  showDebug, 
  showRefreshButton, 
  siteKey, 
  secretKey, 
  onRefresh 
}) => {
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
