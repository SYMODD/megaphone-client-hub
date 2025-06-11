
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Info, RefreshCw } from "lucide-react";
import { StatusBadgeProps } from "../types/statusIndicatorTypes";

interface NotRequiredStatusBadgeProps extends StatusBadgeProps {}

export const NotRequiredStatusBadge: React.FC<NotRequiredStatusBadgeProps> = ({ 
  showDebug, 
  showRefreshButton, 
  context, 
  userRole, 
  onRefresh 
}) => {
  console.log('⏭️ [INDICATOR] reCAPTCHA non requis pour ce contexte');
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-1">
        <Info className="w-3 h-3 text-slate-500" />
        <span className="text-xs">reCAPTCHA non requis</span>
      </Badge>
      {showDebug && (
        <span className="text-xs text-slate-500">
          (Contexte: {context}, Rôle: {userRole || 'non défini'})
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
