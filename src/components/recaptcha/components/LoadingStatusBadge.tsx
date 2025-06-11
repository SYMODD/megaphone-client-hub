
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";
import { StatusBadgeProps } from "../types/statusIndicatorTypes";

interface LoadingStatusBadgeProps extends Pick<StatusBadgeProps, 'showRefreshButton' | 'onRefresh' | 'isRefreshing'> {}

export const LoadingStatusBadge: React.FC<LoadingStatusBadgeProps> = ({ 
  showRefreshButton, 
  onRefresh, 
  isRefreshing 
}) => {
  console.log('⏳ [INDICATOR] État de chargement');
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="flex items-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-xs">
          {isRefreshing ? 'Actualisation...' : 'Vérification...'}
        </span>
      </Badge>
      {showRefreshButton && !isRefreshing && onRefresh && (
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
