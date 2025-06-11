
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, RefreshCw, Info } from "lucide-react";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";

export const RecaptchaDebugInfo: React.FC = () => {
  const { profile } = useAuth();
  const { isConfigured, isLoading, siteKey, secretKey, refreshSettings } = useRecaptchaSettings();

  // Afficher uniquement pour les admins
  if (!profile || profile.role !== 'admin') {
    return null;
  }

  console.log('🐛 [DEBUG_INFO] Affichage informations de debug unifiées:', {
    userRole: profile.role,
    isConfigured,
    hasSiteKey: !!siteKey,
    hasSecretKey: !!secretKey
  });

  const getStatusInfo = () => {
    if (isLoading) {
      return {
        variant: 'outline' as const,
        text: 'Chargement...',
        color: 'text-gray-600'
      };
    }

    if (isConfigured) {
      return {
        variant: 'default' as const,
        text: '✅ reCAPTCHA configuré',
        color: 'text-green-800'
      };
    }

    return {
      variant: 'destructive' as const,
      text: '❌ reCAPTCHA non configuré',
      color: 'text-red-800'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Info className="w-4 h-4" />
          Debug reCAPTCHA (Admin uniquement)
          <button
            onClick={refreshSettings}
            className="ml-auto p-1 hover:bg-blue-100 rounded"
            title="Actualiser"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Statut de configuration unifié */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Configuration :</span>
          <Badge variant={statusInfo.variant} className={statusInfo.color}>
            {statusInfo.text}
          </Badge>
        </div>

        {/* Règles unifiées appliquées */}
        <div className="p-3 bg-white border border-blue-200 rounded">
          <h5 className="text-xs font-medium text-blue-800 mb-2">Règles Unifiées :</h5>
          <div className="text-xs text-blue-700 space-y-1">
            <div>• <strong>Agent :</strong> Bypass total (pas de reCAPTCHA)</div>
            <div>• <strong>Admin/Superviseur :</strong> reCAPTCHA requis au login</div>
            <div>• <strong>Sélection documents :</strong> Désactivé pour tous les rôles</div>
          </div>
        </div>

        {/* Détails techniques (si configuré) */}
        {isConfigured && (
          <div className="p-2 bg-white border border-blue-200 rounded text-xs">
            <div>Clé publique : {siteKey ? siteKey.substring(0, 20) + '...' : 'Non définie'}</div>
            <div>Clé secrète : {secretKey ? 'Configurée' : 'Non définie'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
