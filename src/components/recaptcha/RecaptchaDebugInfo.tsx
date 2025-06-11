
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
      { context: 'login', roles: ['admin', 'superviseur'], description: 'Connexion Admin/Superviseur' },
      { context: 'document_selection', roles: ['agent'], description: 'Sélection de document Agent (DÉSACTIVÉ)' },
      { context: 'general', roles: [], description: 'Vérification générale' }
    ];
  };

  return (
    <Card className="mt-4 border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bug className="w-4 h-4" />
          Debug reCAPTCHA (Admin uniquement)
        </CardTitle>
        <CardDescription className="text-xs">
          Informations techniques pour le diagnostic des problèmes reCAPTCHA
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* État général */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm flex items-center gap-1">
            <Settings className="w-3 h-3" />
            État de Configuration
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
                {isConfigured ? "Oui" : "Non"}
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

        {/* Exigences par contexte */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm flex items-center gap-1">
            <User className="w-3 h-3" />
            Exigences par Contexte
          </h5>
          <div className="space-y-1">
            {getContextRequirements().map((req) => (
              <div key={req.context} className="flex justify-between items-center text-xs">
                <span className="flex-1">{req.description}:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">
                    {req.roles.length > 0 ? req.roles.join(', ') : 'Tous'}
                  </span>
                  <Badge variant={
                    req.context === 'document_selection' 
                      ? "secondary" // Toujours grisé pour document_selection
                      : req.roles.length === 0 || req.roles.includes(profile?.role || '') 
                        ? (isConfigured ? "default" : "destructive")
                        : "secondary"
                  } className="text-xs">
                    {req.context === 'document_selection' 
                      ? "DÉSACTIVÉ"
                      : req.roles.length === 0 || req.roles.includes(profile?.role || '') 
                        ? (isConfigured ? "✓" : "✗")
                        : "N/A"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions de debug */}
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

        {/* Note technique */}
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <strong>Note:</strong> Les indicateurs de statut utilisent cette configuration en temps réel. 
          Si vous modifiez les clés, utilisez "Actualiser" pour mettre à jour les indicateurs.
          <br />
          <strong>Approche simplifiée:</strong> reCAPTCHA désactivé pour la sélection de documents.
        </div>
      </CardContent>
    </Card>
  );
};
