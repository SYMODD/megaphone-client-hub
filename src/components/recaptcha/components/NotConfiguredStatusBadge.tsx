
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
  context,
  userRole,
  siteKey, 
  secretKey, 
  onRefresh,
  isRefreshing
}) => {
  console.log('⚠️ [BADGE] reCAPTCHA requis mais NON CONFIGURÉ:', {
    context,
    userRole,
    siteKey: siteKey ? 'PRÉSENTE' : 'MANQUANTE',
    secretKey: secretKey ? 'PRÉSENTE' : 'MANQUANTE'
  });
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-800 border-yellow-300">
        <ShieldX className="w-3 h-3" />
        <span className="text-xs">reCAPTCHA non configuré</span>
      </Badge>
      {showDebug && (
        <span className="text-xs text-yellow-600">
          (Contexte: {context}, Rôle: {userRole}, Site: {siteKey ? '✅' : '❌'}, Secret: {secretKey ? '✅' : '❌'})
        </span>
      )}
      {showRefreshButton && onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
          title="Actualiser le statut"
        >
          <RefreshCw className={`w-3 h-3 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};
