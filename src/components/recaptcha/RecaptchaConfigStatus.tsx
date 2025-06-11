
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface RecaptchaConfigStatusProps {
  isConfigured: boolean;
}

export const RecaptchaConfigStatus: React.FC<RecaptchaConfigStatusProps> = ({ 
  isConfigured 
}) => {
  return (
    <div className="p-3 bg-blue-50 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-800">
          Statut de configuration
        </span>
        <span className={`text-sm px-2 py-1 rounded ${
          isConfigured 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isConfigured ? '✅ Configuré' : '❌ Non configuré'}
        </span>
      </div>
    </div>
  );
};
