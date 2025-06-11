
import React from 'react';
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bug, Shield, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const RecaptchaDebugInfo: React.FC = () => {
  const { isConfigured, isLoading, error, siteKey, secretKey, refreshSettings } = useRecaptchaSettings();
  const { profile } = useAuth();

  // Seuls les admins peuvent voir les infos de debug
  if (profile?.role !== 'admin') {
    return null;
  }

  const formatKeyPreview = (key: string | null) => {
    if (!key) return 'Non définie';
    if (key.length < 10) return 'Trop courte';
    return `${key.substring(0, 10)}...${key.substring(key.length - 4)}`;
  };

  const getContextRequirements = () => {
    return [
      { 
        context: 'login', 
        roles: ['admin', 'superviseur'], 
        description: 'Connexion Admin/Superviseur',
        isRequired: true,
        status: isConfigured ? 'ACTIF' : 'REQUIS MAIS NON CONFIGURÉ'
      },
      { 
        context: 'document_selection', 
        roles: [], 
        description: 'Sélection de documents',
        isRequired: false,
        status: 'DÉSACTIVÉ VOLONTAIREMENT'
      }
    ];
  };

  return (
    <Card className="mt-4 border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bug className="w-4 h-4" />
          Debug reCAPTCHA UNIFIÉ (Admin uniquement)
        </CardTitle>
        <CardDescription className="text-xs">
          Version simplifiée - Informations de diagnostic unifiées
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* État général unifié */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm flex items-center gap-1">
            <Settings className="w-3 h-3" />
            État de Configuration UNIFIÉ
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Chargement:</span>
              <Badge variant={isLoading ? "default" : "secondary"}>
                {isLoading ? "En cours" : "Terminé"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Configuré:</span>
              <Badge variant={isConfigured ? "default" : "destructive"}>
                {isConfigured ? "OUI ✅" : "NON ❌"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Erreur:</span>
              <Badge variant={error ? "destructive" : "secondary"}>
                {error ? "Oui" : "Non"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Utilisateur:</span>
              <Badge variant="outline">
                {profile?.role || 'Non défini'}
              </Badge>
            </div>
          </div>
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              <strong>Erreur:</strong> {error}
            </div>
          )}
        </div>

        {/* Clés de configuration */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Clés de Configuration
          </h5>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span>Site Key:</span>
              <div className="flex items-center gap-1">
                <code className="bg-slate-100 px-1 rounded text-xs">
                  {formatKeyPreview(siteKey)}
                </code>
                <Badge variant={siteKey ? "default" : "destructive"} className="text-xs">
                  {siteKey ? "✓" : "✗"}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Secret Key:</span>
              <div className="flex items-center gap-1">
                <code className="bg-slate-100 px-1 rounded text-xs">
                  {formatKeyPreview(secretKey)}
                </code>
                <Badge variant={secretKey ? "default" : "destructive"} className="text-xs">
                  {secretKey ? "✓" : "✗"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Règles unifiées par contexte */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm flex items-center gap-1">
            <User className="w-3 h-3" />
            Règles UNIFIÉES par Contexte
          </h5>
          <div className="space-y-1">
            {getContextRequirements().map((req) => (
              <div key={req.context} className="flex justify-between items-center text-xs">
                <span className="flex-1">{req.description}:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 text-xs">
                    {req.isRequired ? 'REQUIS' : 'DÉSACTIVÉ'}
                  </span>
                  <Badge variant={
                    req.isRequired 
                      ? (isConfigured ? "default" : "destructive")
                      : "secondary"
                  } className="text-xs">
                    {req.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-amber-200">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshSettings}
            disabled={isLoading}
            className="text-xs"
          >
            Actualiser
          </Button>
        </div>

        {/* Note technique unifiée */}
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <strong>APPROCHE UNIFIÉE:</strong>
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li><strong>Admin/Superviseur:</strong> reCAPTCHA OBLIGATOIRE pour la connexion</li>
            <li><strong>Sélection documents:</strong> reCAPTCHA DÉSACTIVÉ pour tous (simplicité)</li>
            <li><strong>Agents:</strong> Accès direct sans reCAPTCHA</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
