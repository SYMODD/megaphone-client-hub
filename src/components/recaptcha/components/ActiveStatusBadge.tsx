
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { StatusBadgeProps } from "../types/statusIndicatorTypes";

interface ActiveStatusBadgeProps extends StatusBadgeProps {}

export const ActiveStatusBadge: React.FC<ActiveStatusBadgeProps> = ({ 
  showDebug, 
  showRefreshButton, 
  context, 
  userRole,
  onRefresh,
  isRefreshing
}) => {
  console.log('✅ [BADGE] reCAPTCHA requis et CONFIGURÉ:', {
    context,
    userRole,
    status: 'ACTIF'
  });
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-300">
        <ShieldCheck className="w-3 h-3" />
        <span className="text-xs">reCAPTCHA actif</span>
      </Badge>
      {showDebug && (
        <span className="text-xs text-green-600">
          (Contexte: {context}, Rôle: {userRole}, Status: CONFIGURÉ ✅)
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
