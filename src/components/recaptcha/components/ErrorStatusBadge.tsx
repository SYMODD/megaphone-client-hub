
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ShieldX, RefreshCw } from "lucide-react";
import { StatusBadgeProps } from "../types/statusIndicatorTypes";

interface ErrorStatusBadgeProps extends Pick<StatusBadgeProps, 'showRefreshButton' | 'onRefresh'> {
  error: string;
}

export const ErrorStatusBadge: React.FC<ErrorStatusBadgeProps> = ({ 
  error, 
  showRefreshButton, 
  onRefresh 
}) => {
  console.log('❌ [INDICATOR] État d\'erreur:', error);
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant="destructive" className="flex items-center gap-1">
        <ShieldX className="w-3 h-3" />
        <span className="text-xs">Erreur reCAPTCHA</span>
      </Badge>
      {showRefreshButton && onRefresh && (
        <button
          onClick={onRefresh}
          className="p-1 hover:bg-gray-100 rounded"
          title="Réessayer"
        >
          <RefreshCw className="w-3 h-3 text-gray-500" />
        </button>
      )}
    </div>
  );
};
