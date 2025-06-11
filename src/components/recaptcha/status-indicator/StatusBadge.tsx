
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { StatusDisplayInfo } from './types';

interface StatusBadgeProps {
  displayInfo: StatusDisplayInfo;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
  context?: string;
  userRole?: string;
  decision?: string;
  showDebug?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  displayInfo,
  showRefreshButton,
  onRefresh,
  context,
  userRole,
  decision,
  showDebug
}) => {
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
          (Contexte: {context}, Rôle: {userRole}, Décision: {decision})
        </span>
      )}
      {showRefreshButton && onRefresh && (
        <button
          onClick={onRefresh}
          className="p-1 hover:bg-gray-100 rounded"
          title="Actualiser"
        >
          <RefreshCw className="w-3 h-3 text-gray-500" />
        </button>
      )}
    </div>
  );
};
